import logging
from collections import Counter

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from prompts.insights_prompt import build_insights_prompt
from services.llm import generate_json, has_llm_key

logger = logging.getLogger(__name__)
router = APIRouter()


class InsightTip(BaseModel):
    category: str
    tip: str
    confidence: int
    explanation: str


class InsightsRequest(BaseModel):
    scannedProducts: list[dict] = []
    carbonEntries: list[dict] = []
    scoreTrend: int = 0
    carbonProgress: int = 0


class InsightsResult(BaseModel):
    shopping_pattern_title: str
    shopping_pattern_description: str
    tips: list[InsightTip]


class InsightsResponse(BaseModel):
    result: InsightsResult
    is_estimated: bool = False


def _heuristic_insights(req: InsightsRequest) -> InsightsResult:
    categories = [p.get("category") for p in req.scannedProducts if p.get("category")]

    if len(req.scannedProducts) < 5:
        pattern_title = "Not enough data yet"
        pattern_desc = f"You've scanned {len(req.scannedProducts)} product(s) so far - scan a few more to unlock real shopping pattern insights."
    else:
        counts = Counter(categories)
        top_category, top_count = counts.most_common(1)[0]
        pattern_title = f"{top_category} is your most-scanned category"
        pattern_desc = f"{top_count} of your {len(req.scannedProducts)} scans ({round(top_count / len(req.scannedProducts) * 100)}%) are in {top_category}."

    tips: list[InsightTip] = []
    if categories:
        counts = Counter(categories)
        top_category = counts.most_common(1)[0][0]
        tips.append(InsightTip(
            category="Categories",
            tip=f"You scan {top_category} products most often - look for higher-scoring alternatives here first for the biggest impact.",
            confidence=min(90, 40 + len(req.scannedProducts) * 3),
            explanation=f"Based on {len(req.scannedProducts)} real scans.",
        ))

    carbon_categories = [e.get("category") for e in req.carbonEntries if e.get("category")]
    if carbon_categories:
        counts = Counter(carbon_categories)
        top_carbon_category = counts.most_common(1)[0][0]
        tips.append(InsightTip(
            category="Carbon",
            tip=f"Most of your carbon entries are in '{top_carbon_category}' - that's likely your best lever for reduction.",
            confidence=min(85, 40 + len(req.carbonEntries) * 4),
            explanation=f"Based on {len(req.carbonEntries)} real carbon entries.",
        ))

    if not tips:
        tips.append(InsightTip(
            category="Getting Started",
            tip="Scan a few products and log a carbon entry to unlock personalized tips based on your real activity.",
            confidence=95,
            explanation="No activity data yet.",
        ))

    return InsightsResult(
        shopping_pattern_title=pattern_title,
        shopping_pattern_description=pattern_desc,
        tips=tips,
    )


@router.post("/explain", response_model=InsightsResponse)
def explain_insights(req: InsightsRequest):
    stats = {
        "totalScans": len(req.scannedProducts),
        "categories": [p.get("category") for p in req.scannedProducts[:20] if p.get("category")],
        "scoreTrendPercent": req.scoreTrend,
        "carbonEntryCount": len(req.carbonEntries),
        "carbonCategories": [e.get("category") for e in req.carbonEntries[:20] if e.get("category")],
        "carbonProgressPercent": req.carbonProgress,
    }

    if not has_llm_key():
        logger.warning("No OPENROUTER_API_KEY configured, falling back to heuristic insights")
        return InsightsResponse(result=_heuristic_insights(req), is_estimated=True)

    try:
        prompt = build_insights_prompt(stats)
        result = generate_json(prompt, response_schema=InsightsResult)
        return InsightsResponse(result=result, is_estimated=False)
    except Exception as e:
        logger.error(f"LLM API call failed: {e}")
        raise HTTPException(status_code=502, detail=f"LLM API error: {e}")
