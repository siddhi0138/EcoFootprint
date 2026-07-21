import base64
import json

from openai import OpenAI, RateLimitError

from utils.config import get_settings

# Google's Gemini API exposes an OpenAI-compatible endpoint, so it can use the exact same
# OpenAI SDK calls as OpenRouter below - just a different base_url/key/model names. Gemini is
# tried first when configured, but its free tier caps out at a low fixed requests-per-day count
# (observed: 20/day for gemini-2.5-flash) - lower than OpenRouter's shared free-models-per-day
# quota in practice. Both are tried in order so one exhausted provider doesn't block every AI
# feature in the app; see _with_fallback.
_PROVIDERS = {
    "gemini": {
        "base_url": "https://generativelanguage.googleapis.com/v1beta/openai/",
        "text_model": "gemini-2.5-flash",
        "vision_model": "gemini-2.5-flash",
    },
    "openrouter": {
        "base_url": "https://openrouter.ai/api/v1",
        "text_model": "nvidia/nemotron-3-super-120b-a12b:free",
        "vision_model": "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free",
    },
}

_clients: dict[str, OpenAI] = {}


def _provider_order() -> list[str]:
    settings = get_settings()
    order = []
    if settings.gemini_api_key:
        order.append("gemini")
    if settings.openrouter_api_key:
        order.append("openrouter")
    return order


def has_llm_key() -> bool:
    return len(_provider_order()) > 0


def _client_for(provider: str) -> OpenAI:
    if provider not in _clients:
        settings = get_settings()
        api_key = settings.gemini_api_key if provider == "gemini" else settings.openrouter_api_key
        _clients[provider] = OpenAI(
            base_url=_PROVIDERS[provider]["base_url"],
            api_key=api_key,
            # Free-tier models occasionally hang instead of erroring - without a timeout the
            # request (and the frontend spinner waiting on it) would hang for the SDK's 10min default.
            # max_retries=1 keeps the worst case bounded (~2x timeout) instead of the SDK's default of 2 retries.
            timeout=40.0,
            max_retries=1,
        )
    return _clients[provider]


def _with_fallback(call_fn):
    """call_fn(provider: str) -> result. Tries each configured provider in order, moving to
    the next only on a rate-limit/quota error (not on other failures, which would just waste
    a second call) - re-raises the last error if every provider is exhausted."""
    providers = _provider_order()
    if not providers:
        raise RuntimeError("No LLM API key configured (set GEMINI_API_KEY or OPENROUTER_API_KEY)")
    last_err: Exception | None = None
    for i, provider in enumerate(providers):
        try:
            return call_fn(provider)
        except RateLimitError as e:
            last_err = e
            if i < len(providers) - 1:
                continue
            # Gemini's quota-exceeded message doesn't contain the words "rate limit" the way
            # OpenRouter's does, and the frontend pattern-matches on that phrase to show a
            # friendly "AI service is rate limited" message instead of a generic failure -
            # normalize here so that works regardless of which provider ultimately failed.
            raise RuntimeError(f"AI service rate limit exceeded on all configured providers ({', '.join(providers)}): {e}") from e
    raise last_err  # pragma: no cover - unreachable, loop always returns or raises


def _strip_json_fence(text: str) -> str:
    text = text.strip()
    if text.startswith("```"):
        text = text.split("\n", 1)[1] if "\n" in text else text
        if text.endswith("```"):
            text = text.rsplit("```", 1)[0]
    return text.strip()


_JSON_INSTRUCTION = (
    "\n\nRespond with ONLY a single JSON object containing real values for the fields "
    "described above - not a JSON schema, not markdown, not an explanation. Just the raw "
    "JSON object itself, e.g. {\"field\": \"actual value\"} not {\"properties\": {...}}."
)


def _parse_json_response(content: str, response_schema):
    content = _strip_json_fence(content)
    try:
        return response_schema.model_validate_json(content)
    except Exception:
        # Some models (observed with Gemini) return a bare JSON array for schemas that are
        # really "an object wrapping one list field", ignoring the wrapper key entirely even
        # when the prompt lists field names. If that's the shape mismatch, wrap and retry
        # before giving up - this affects any endpoint with a single list field, not just one.
        parsed = json.loads(content)
        if isinstance(parsed, list):
            fields = response_schema.model_fields
            list_fields = [name for name, info in fields.items() if getattr(info.annotation, "__origin__", None) is list]
            if len(fields) == 1 and len(list_fields) == 1:
                return response_schema.model_validate({list_fields[0]: parsed})
        raise


def generate_json(prompt: str, response_schema, model: str | None = None):
    def _call(provider: str):
        client = _client_for(provider)
        resolved_model = model or _PROVIDERS[provider]["text_model"]
        response = client.chat.completions.create(
            model=resolved_model,
            messages=[{"role": "user", "content": prompt + _JSON_INSTRUCTION}],
            response_format={"type": "json_object"},
        )
        message_content = response.choices[0].message.content if response.choices else None
        if not message_content:
            raise RuntimeError(f"LLM returned an empty completion for model '{resolved_model}' (likely upstream congestion)")
        return _parse_json_response(message_content, response_schema)
    return _with_fallback(_call)


def generate_text(prompt: str, model: str | None = None) -> str:
    def _call(provider: str):
        client = _client_for(provider)
        response = client.chat.completions.create(
            model=model or _PROVIDERS[provider]["text_model"],
            messages=[{"role": "user", "content": prompt}],
        )
        return response.choices[0].message.content
    return _with_fallback(_call)


def generate_text_stream(prompt: str, model: str | None = None):
    def _create(provider: str):
        client = _client_for(provider)
        return client.chat.completions.create(
            model=model or _PROVIDERS[provider]["text_model"],
            messages=[{"role": "user", "content": prompt}],
            stream=True,
        )
    stream = _with_fallback(_create)
    for chunk in stream:
        delta = chunk.choices[0].delta.content
        if delta:
            yield delta


def generate_text_with_tools(prompt: str, tool_schemas: list, tool_functions: dict, model: str | None = None) -> str:
    def _call(provider: str):
        client = _client_for(provider)
        resolved_model = model or _PROVIDERS[provider]["text_model"]
        messages = [{"role": "user", "content": prompt}]

        response = client.chat.completions.create(model=resolved_model, messages=messages, tools=tool_schemas)
        message = response.choices[0].message

        if not message.tool_calls:
            return message.content

        messages.append(message.model_dump(exclude_none=True))
        for tool_call in message.tool_calls:
            fn = tool_functions.get(tool_call.function.name)
            args = json.loads(tool_call.function.arguments)
            result = fn(**args) if fn else {"error": f"Unknown tool '{tool_call.function.name}'"}
            messages.append({
                "role": "tool",
                "tool_call_id": tool_call.id,
                "content": json.dumps(result),
            })

        followup = client.chat.completions.create(model=resolved_model, messages=messages)
        return followup.choices[0].message.content
    return _with_fallback(_call)


def generate_text_stream_with_tools(prompt: str, tool_schemas: list, tool_functions: dict, model: str | None = None):
    """Streams the final answer, running a non-streaming tool-call pass first if needed.

    Streaming responses can't be inspected for tool_calls until fully received, so this makes
    one quick non-streaming call to check whether the model wants to call a tool. If it does,
    the tool runs and the real natural-language answer is streamed from the follow-up call. If
    not, that first response is already the final answer and is yielded as a single chunk.
    """
    def _first_pass(provider: str):
        client = _client_for(provider)
        resolved_model = model or _PROVIDERS[provider]["text_model"]
        messages = [{"role": "user", "content": prompt}]
        response = client.chat.completions.create(model=resolved_model, messages=messages, tools=tool_schemas)
        return provider, client, resolved_model, messages, response.choices[0].message

    provider, client, resolved_model, messages, message = _with_fallback(_first_pass)

    if not message.tool_calls:
        if message.content:
            yield message.content
        return

    messages.append(message.model_dump(exclude_none=True))
    for tool_call in message.tool_calls:
        fn = tool_functions.get(tool_call.function.name)
        args = json.loads(tool_call.function.arguments)
        result = fn(**args) if fn else {"error": f"Unknown tool '{tool_call.function.name}'"}
        messages.append({
            "role": "tool",
            "tool_call_id": tool_call.id,
            "content": json.dumps(result),
        })

    # Sticks with the same provider that handled the tool-call pass, for a consistent
    # conversation - falling back mid-conversation to a different provider isn't worth the
    # complexity here since the first pass already proved that provider is reachable.
    stream = client.chat.completions.create(model=resolved_model, messages=messages, stream=True)
    for chunk in stream:
        delta = chunk.choices[0].delta.content
        if delta:
            yield delta


def generate_json_with_image(
    prompt: str,
    image_bytes: bytes,
    mime_type: str,
    response_schema,
    model: str | None = None,
):
    def _call(provider: str):
        client = _client_for(provider)
        b64 = base64.b64encode(image_bytes).decode()
        response = client.chat.completions.create(
            model=model or _PROVIDERS[provider]["vision_model"],
            messages=[{
                "role": "user",
                "content": [
                    {"type": "text", "text": prompt + _JSON_INSTRUCTION},
                    {"type": "image_url", "image_url": {"url": f"data:{mime_type};base64,{b64}"}},
                ],
            }],
            response_format={"type": "json_object"},
        )
        return _parse_json_response(response.choices[0].message.content, response_schema)
    return _with_fallback(_call)
