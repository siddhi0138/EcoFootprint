import logging
import re

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from prompts.carbon_prompt import build_carbon_estimate_prompt
from services.llm import generate_json, has_llm_key

logger = logging.getLogger(__name__)
router = APIRouter()

VALID_CATEGORIES = {"transport", "energy", "food", "shopping", "travel"}

# Rough kg CO2e heuristics used only when the LLM is unavailable.
_KEYWORD_FACTORS = [
    (r"\bflight|flew|flying|plane\b", "travel", 250.0, "Average short/medium-haul flight estimate"),
    (r"\bdrove|driving|drive|car|commute\b", "transport", 5.0, "Average short car trip estimate"),
    (r"\bbus|train|transit\b", "transport", 2.0, "Average public transit trip estimate"),
    (r"\bmeat|beef|burger|steak\b", "food", 6.0, "Average meat meal estimate"),
    (r"\bvegetarian|vegan|salad|plant\b", "food", 1.5, "Average plant-based meal estimate"),
    (r"\belectric|energy|power|electricity\b", "energy", 3.0, "Average daily household energy estimate"),
    (r"\bshop|bought|purchase|clothes\b", "shopping", 4.0, "Average small purchase estimate"),
]


class CarbonEstimateRequest(BaseModel):
    description: str


class CarbonEstimate(BaseModel):
    category: str
    amount: float
    explanation: str


class CarbonEstimateResponse(BaseModel):
    estimate: CarbonEstimate
    is_estimated: bool = False


def _heuristic_estimate(description: str) -> CarbonEstimate:
    lower = description.lower()
    for pattern, category, amount, note in _KEYWORD_FACTORS:
        if re.search(pattern, lower):
            return CarbonEstimate(
                category=category,
                amount=amount,
                explanation=f"{note} (AI unavailable - rough keyword-based estimate, not calculated for your specific input).",
            )
    return CarbonEstimate(
        category="shopping",
        amount=2.0,
        explanation="Could not confidently categorize this activity without the AI - using a small generic estimate.",
    )


@router.post("/estimate", response_model=CarbonEstimateResponse)
def estimate_carbon(req: CarbonEstimateRequest):
    if not has_llm_key():
        logger.warning("No OPENROUTER_API_KEY configured, falling back to keyword-based carbon estimate")
        return CarbonEstimateResponse(estimate=_heuristic_estimate(req.description), is_estimated=True)

    try:
        prompt = build_carbon_estimate_prompt(req.description)
        estimate = generate_json(prompt, response_schema=CarbonEstimate)
        if estimate.category not in VALID_CATEGORIES:
            estimate.category = "shopping"
        return CarbonEstimateResponse(estimate=estimate, is_estimated=False)
    except Exception as e:
        logger.error(f"LLM API call failed: {e}")
        raise HTTPException(status_code=502, detail=f"LLM API error: {e}")
