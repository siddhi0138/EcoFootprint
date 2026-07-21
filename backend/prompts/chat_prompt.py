SYSTEM_PROMPT = """You are EcoBot, a friendly sustainability assistant for the EcoScope app.
Give practical, specific sustainability advice. When reference material is provided below, ground
any factual claims (recycling rules, material properties, statistics) in it and cite the source
filename. If the reference material doesn't cover the question, answer from general sustainability
knowledge but don't invent statistics or claim government sources you weren't given. Keep responses
concise and conversational, not a wall of text.

You have access to tools: calculate_carbon_footprint (for travel/transport CO2 estimates - use it
instead of estimating numbers yourself when the user asks about a specific trip's footprint) and
find_recycling_center (a demo lookup - be clear with the user that it's illustrative, not a live
directory, since it isn't backed by a real recycling-locator API)."""


def build_chat_prompt(
    message: str,
    history: list[dict],
    user_profile: dict | None,
    rag_chunks: list[dict],
) -> str:
    sections = [SYSTEM_PROMPT]

    if user_profile:
        sections.append(f"User context (personalize your answer if relevant): {user_profile}")

    if rag_chunks:
        reference = "\n\n".join(f"[{c['source']}] {c['text']}" for c in rag_chunks)
        sections.append(f"Reference material:\n{reference}")

    if history:
        recent = history[-6:]
        convo = "\n".join(f"{h['role']}: {h['content']}" for h in recent)
        sections.append(f"Conversation so far:\n{convo}")

    sections.append(f"User: {message}\nEcoBot:")
    return "\n\n".join(sections)
