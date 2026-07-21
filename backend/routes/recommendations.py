import logging

from fastapi import APIRouter
from pydantic import BaseModel

from prompts.recommendations_prompt import build_recommendations_prompt
from services.llm import generate_json, has_llm_key

logger = logging.getLogger(__name__)
router = APIRouter()


class RecommendationItem(BaseModel):
    title: str
    description: str
    category: str
    impact: str
    priority: str
    difficulty: str
    timeToImplement: str
    carbonSaving: str
    confidence: int


class RecommendationsRequest(BaseModel):
    scannedProducts: list[dict] = []
    carbonEntries: list[dict] = []
    userStats: dict = {}


class RecommendationsResponse(BaseModel):
    recommendations: list[RecommendationItem]
    is_estimated: bool = False


class _RecommendationsSchema(BaseModel):
    recommendations: list[RecommendationItem]


def _heuristic_fallback(req: RecommendationsRequest) -> list[RecommendationItem]:
    recs: list[RecommendationItem] = []
    avg_score = req.userStats.get("avgScore", 0)
    total_scans = req.userStats.get("totalScans", len(req.scannedProducts))

    if req.scannedProducts and avg_score and avg_score < 70:
        recs.append(RecommendationItem(
            title="Improve Product Choices",
            description=f"Your average sustainability score is {avg_score}/100 across {total_scans} scans - look for higher-scoring alternatives in categories you buy often.",
            category="Products",
            impact="High",
            priority="high",
            difficulty="Medium",
            timeToImplement="2 weeks",
            carbonSaving="Varies",
            confidence=70,
        ))

    if req.scannedProducts:
        categories = [p.get("category") for p in req.scannedProducts if p.get("category")]
        if categories:
            top_category = max(set(categories), key=categories.count)
            recs.append(RecommendationItem(
                title=f"Optimize {top_category} Choices",
                description=f"{top_category} is your most-scanned category - small swaps here compound over time.",
                category="Habits",
                impact="Medium",
                priority="medium",
                difficulty="Easy",
                timeToImplement="Ongoing",
                carbonSaving="Varies",
                confidence=60,
            ))

    if not req.carbonEntries:
        recs.append(RecommendationItem(
            title="Start Carbon Tracking",
            description="You haven't logged any carbon entries yet - tracking is the first step to reducing your footprint.",
            category="Carbon",
            impact="Medium",
            priority="medium",
            difficulty="Easy",
            timeToImplement="5 minutes",
            carbonSaving="N/A",
            confidence=90,
        ))

    if not recs:
        recs.append(RecommendationItem(
            title="Scan Your First Product",
            description="Start scanning products to get personalized sustainability recommendations based on your real habits.",
            category="Products",
            impact="Medium",
            priority="medium",
            difficulty="Easy",
            timeToImplement="1 minute",
            carbonSaving="N/A",
            confidence=95,
        ))

    return recs


@router.post("", response_model=RecommendationsResponse)
def get_recommendations(req: RecommendationsRequest):
    user_summary = {
        "totalScans": req.userStats.get("totalScans", len(req.scannedProducts)),
        "avgScore": req.userStats.get("avgScore"),
        "streakDays": req.userStats.get("streakDays"),
        "co2Saved": req.userStats.get("co2Saved"),
        "recentProducts": [
            {"name": p.get("name"), "category": p.get("category"), "score": p.get("sustainabilityScore")}
            for p in req.scannedProducts[:10]
        ],
        "carbonEntryCount": len(req.carbonEntries),
    }

    if not has_llm_key():
        logger.warning("No OPENROUTER_API_KEY configured, falling back to heuristic recommendations")
        return RecommendationsResponse(recommendations=_heuristic_fallback(req), is_estimated=True)

    try:
        prompt = build_recommendations_prompt(user_summary)
        result = generate_json(prompt, response_schema=_RecommendationsSchema)
        return RecommendationsResponse(recommendations=result.recommendations, is_estimated=False)
    except Exception as e:
        # Falls back to the real heuristic (derived from the user's own stats) rather than a
        # hard error - this keeps the Smart Recommendations tab usable during transient LLM
        # failures (e.g. the shared free-tier key hitting its daily rate limit).
        logger.error(f"LLM API call failed, falling back to heuristic recommendations: {e}")
        return RecommendationsResponse(recommendations=_heuristic_fallback(req), is_estimated=True)
