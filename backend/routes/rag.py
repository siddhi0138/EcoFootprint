import logging

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from prompts.rag_prompt import build_rag_prompt
from rag.retriever import retrieve
from services.llm import generate_text, has_llm_key

logger = logging.getLogger(__name__)
router = APIRouter()


class RagQueryRequest(BaseModel):
    question: str


class RagSource(BaseModel):
    source: str
    text: str


class RagQueryResponse(BaseModel):
    answer: str
    sources: list[RagSource]
    is_estimated: bool = False


@router.post("/query", response_model=RagQueryResponse)
def rag_query(req: RagQueryRequest):
    chunks = retrieve(req.question, top_k=4)

    if not has_llm_key():
        logger.warning("No OPENROUTER_API_KEY configured, falling back to raw retrieved excerpt")
        if chunks:
            top = chunks[0]
            answer = (
                f"(Estimated - no LLM API key configured) Closest matching excerpt "
                f"from {top['source']}: {top['text'][:400]}"
            )
        else:
            answer = "No relevant information found, and no LLM API key is configured."
        return RagQueryResponse(
            answer=answer,
            sources=[RagSource(source=c["source"], text=c["text"][:300]) for c in chunks],
            is_estimated=True,
        )

    prompt = build_rag_prompt(req.question, chunks)
    try:
        answer = generate_text(prompt)
    except Exception as e:
        logger.error(f"LLM API call failed: {e}")
        raise HTTPException(status_code=502, detail=f"LLM API error: {e}")

    return RagQueryResponse(
        answer=answer,
        sources=[RagSource(source=c["source"], text=c["text"][:300]) for c in chunks],
        is_estimated=False,
    )
