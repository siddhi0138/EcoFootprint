import functools
import json
import logging

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from prompts.chat_prompt import build_chat_prompt
from rag.retriever import retrieve
from services.llm import generate_text_stream_with_tools, generate_text_with_tools, has_llm_key
from services.tools import TOOL_FUNCTIONS, TOOL_SCHEMAS, save_user_history

logger = logging.getLogger(__name__)
router = APIRouter()

RELEVANCE_THRESHOLD = 1.0


class ChatMessage(BaseModel):
    role: str  # 'user' or 'bot'
    content: str


class ChatRequest(BaseModel):
    message: str
    history: list[ChatMessage] = []
    userProfile: dict | None = None
    uid: str | None = None


def _tool_functions_for(req: "ChatRequest") -> dict:
    # save_user_history's uid is bound here from the authenticated request, never taken from
    # the LLM/user - see services/tools.py docstring for why.
    return {**TOOL_FUNCTIONS, "save_user_history": functools.partial(save_user_history, uid=req.uid)}


class ChatResponse(BaseModel):
    reply: str
    sources: list[str] = []
    is_estimated: bool = False


def _fallback_reply(rag_chunks: list[dict]) -> str:
    if rag_chunks:
        top = rag_chunks[0]
        return (
            f"(Estimated - the AI service is temporarily unavailable) Based on {top['source']}: "
            f"{top['text'][:350]}"
        )
    return (
        "(Estimated - the AI service is temporarily unavailable) I don't have a grounded "
        "answer for that right now, but I'm happy to help once my AI backend is back online."
    )


def _build_prompt(req: "ChatRequest", rag_chunks: list[dict]) -> str:
    return build_chat_prompt(
        req.message,
        [h.model_dump() for h in req.history],
        req.userProfile,
        rag_chunks,
    )


@router.post("/message", response_model=ChatResponse)
def chat_message(req: ChatRequest):
    rag_chunks = retrieve(req.message, top_k=3, max_distance=RELEVANCE_THRESHOLD)
    prompt = _build_prompt(req, rag_chunks)

    if not has_llm_key():
        logger.warning("No OPENROUTER_API_KEY configured, falling back to canned/retrieved response")
        return ChatResponse(
            reply=_fallback_reply(rag_chunks),
            sources=sorted({c["source"] for c in rag_chunks}),
            is_estimated=True,
        )

    try:
        reply = generate_text_with_tools(prompt, tool_schemas=TOOL_SCHEMAS, tool_functions=_tool_functions_for(req))
    except Exception as e:
        logger.error(f"LLM API call failed: {e}")
        raise HTTPException(status_code=502, detail=f"LLM API error: {e}")

    return ChatResponse(
        reply=reply,
        sources=sorted({c["source"] for c in rag_chunks}),
        is_estimated=False,
    )


def _stream_ndjson(prompt: str, rag_chunks: list[dict], tool_functions: dict):
    if not has_llm_key():
        logger.warning("No OPENROUTER_API_KEY configured, falling back during stream")
        yield json.dumps({"token": _fallback_reply(rag_chunks)}) + "\n"
        yield json.dumps({
            "done": True,
            "sources": sorted({c["source"] for c in rag_chunks}),
            "is_estimated": True,
        }) + "\n"
        return

    try:
        for token in generate_text_stream_with_tools(prompt, tool_schemas=TOOL_SCHEMAS, tool_functions=tool_functions):
            yield json.dumps({"token": token}) + "\n"
    except Exception as e:
        logger.error(f"LLM API call failed during stream: {e}")
        yield json.dumps({"error": f"LLM API error: {e}"}) + "\n"
        return

    yield json.dumps({
        "done": True,
        "sources": sorted({c["source"] for c in rag_chunks}),
        "is_estimated": False,
    }) + "\n"


@router.post("/message/stream")
def chat_message_stream(req: ChatRequest):
    rag_chunks = retrieve(req.message, top_k=3, max_distance=RELEVANCE_THRESHOLD)
    prompt = _build_prompt(req, rag_chunks)
    return StreamingResponse(
        _stream_ndjson(prompt, rag_chunks, _tool_functions_for(req)), media_type="application/x-ndjson"
    )
