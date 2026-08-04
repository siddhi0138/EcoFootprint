"""Heuristic stand-in for services.llm.generate_json while the OpenRouter key is missing.

Derives an EcoAnalysis-shaped result from real OpenFoodFacts fields (ecoscore_grade,
nutriscore_grade, packaging, labels) instead of random data, and marks it
is_estimated=True so callers never present it as a real AI analysis.
Remove the fallback in routes/product.py once a real OpenRouter key is configured.
"""

from services.scoring import compute_sustainability_score

_GRADE_SCORES = {"a": 90, "b": 72, "c": 55, "d": 38, "e": 20}


def _grade_to_score(grade: str | None, default: int = 50) -> int:
    if not grade:
        return default
    return _GRADE_SCORES.get(grade.lower(), default)


def build_stub_analysis(product: dict) -> dict:
    ecoscore = product.get("ecoscore_grade")
    nutriscore = product.get("nutriscore_grade")
    labels = [l.lower() for l in (product.get("labels_tags") or [])]
    packaging_text = (product.get("packaging") or "").lower()
    name = product.get("product_name") or "This product"

    carbon_score = _grade_to_score(ecoscore)
    recyclable = any(k in packaging_text for k in ("recycl", "carton", "glass", "paper")) or any(
        "recycl" in l for l in labels
    )
    packaging_score = 70 if recyclable else 45
    health_score = _grade_to_score(nutriscore)
    overall = compute_sustainability_score(carbon_score, packaging_score, health_score)

    return {
        "carbon_footprint": {
            "score": carbon_score,
            "explanation": (
                f"Estimated from OpenFoodFacts' Eco-Score ({ecoscore or 'not provided'}) for {name}. "
                "This is a heuristic placeholder, not an AI-generated analysis."
            ),
            "estimated_kg_co2e": None,
        },
        "packaging": {
            "score": packaging_score,
            "explanation": (
                f"Packaging listed as '{product.get('packaging') or 'unspecified'}'. "
                f"{'Appears recyclable based on material/labels.' if recyclable else 'Recyclability could not be confirmed from available data.'}"
            ),
            "materials": None,
            "recyclable": recyclable,
        },
        "health_impact": {
            "score": health_score,
            "explanation": (
                f"Estimated from OpenFoodFacts' Nutri-Score ({nutriscore or 'not provided'})."
            ),
            "considerations": None,
        },
        "sustainability_score": overall,
        "alternatives": [
            {
                "name": "A higher Eco-Score alternative in the same category",
                "reason": "Placeholder suggestion - real alternatives require a working AI analysis.",
                "estimated_score": None,
            }
        ],
        "is_estimated": True,
    }


def build_stub_lifecycle(product: dict) -> dict:
    """Heuristic cradle-to-grave lifecycle used when the LLM is unavailable/rate-limited, so the
    Product Lifecycle view always shows meaningful non-zero, category-scaled estimates instead of
    zeros. Impact scales inversely with the product's sustainability score."""
    category = (product.get("category") or "").lower()
    score = product.get("sustainability_score") or 50
    # Lower sustainability score -> higher estimated footprint.
    factor = max(0.5, (100 - score) / 50.0)
    if any(k in category for k in ("phone", "laptop", "tablet", "electronic", "watch", "vehicle", "motorcycle")):
        factor *= 3.0  # resource/e-waste heavy categories

    def stage(name, icon, loc, dur, status, co2, water, energy, details):
        return {
            "name": name, "iconName": icon, "location": loc, "duration": dur, "status": status,
            "impact": {"co2": round(co2 * factor, 2), "water": round(water * factor), "energy": round(energy * factor, 2)},
            "details": details,
        }

    note = "Category-level estimate - this specific product's supply-chain data isn't disclosed."
    return {"stages": [
        stage("Raw Materials", "Leaf", "Global supply chain", "Extraction phase", "completed", 0.6, 130, 0.4,
              f"Estimated raw-material sourcing impact. {note}"),
        stage("Manufacturing", "Factory", "Regional facility", "Production", "completed", 1.0, 90, 1.3,
              f"Estimated production/processing impact. {note}"),
        stage("Transportation", "Truck", "Distribution network", "1-3 weeks", "completed", 0.3, 6, 0.3,
              f"Estimated distribution footprint; varies with distance and mode. {note}"),
        stage("Use Phase", "Zap", "Consumer home", "Product lifetime", "active", 0.2, 22, 0.5,
              f"Estimated in-use impact for this product category. {note}"),
        stage("End of Life", "Recycle", "Local waste stream", "Disposal", "pending", 0.1, 3, 0.1,
              f"Estimated disposal/recycling impact; depends on local facilities. {note}"),
    ]}
