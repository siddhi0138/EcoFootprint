"""Deterministic sustainability score computed from an analysis's three category scores,
rather than trusting whatever overall number the LLM produced - keeps the score defensible
and consistent regardless of which path (LLM or heuristic stub) generated the analysis."""

CARBON_WEIGHT = 0.4
PACKAGING_WEIGHT = 0.3
HEALTH_WEIGHT = 0.3


def compute_sustainability_score(carbon_score: int, packaging_score: int, health_score: int) -> int:
    return round(
        CARBON_WEIGHT * carbon_score + PACKAGING_WEIGHT * packaging_score + HEALTH_WEIGHT * health_score
    )
