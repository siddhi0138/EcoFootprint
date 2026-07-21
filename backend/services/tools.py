"""LLM function-calling tools for the chat endpoint.

The OpenAI-compatible API (OpenRouter) doesn't support passing raw Python functions like
the old google-genai SDK did - tool schemas must be declared explicitly (TOOL_SCHEMAS below)
and the call/result loop is handled manually in services/llm.py's generate_text_with_tools().

save_user_history's `uid` is deliberately NOT an LLM-fillable parameter - it's bound server-side
per-request in routes/chat.py from the authenticated session, so the model/user can never choose
which user's Firestore document gets written to.
"""

import logging

from services.barcode import search_openfoodfacts_products

logger = logging.getLogger(__name__)

CO2_FACTORS_KG_PER_KM = {
    "car": 0.17,
    "bus": 0.10,
    "train": 0.04,
    "flight_short": 0.15,
    "flight_long": 0.11,
}


def calculate_carbon_footprint(activity_type: str, distance_km: float) -> dict:
    """Calculates estimated kg CO2e for a travel activity using standard emission factors.

    Args:
        activity_type: one of "car", "bus", "train", "flight_short", "flight_long"
        distance_km: distance travelled in kilometers
    """
    factor = CO2_FACTORS_KG_PER_KM.get(activity_type)
    if factor is None:
        return {"error": f"Unknown activity_type '{activity_type}'. Use one of: {list(CO2_FACTORS_KG_PER_KM)}"}
    kg_co2e = round(distance_km * factor, 2)
    return {
        "activity_type": activity_type,
        "distance_km": distance_km,
        "kg_co2e": kg_co2e,
        "emission_factor_kg_per_km": factor,
    }


def find_recycling_center(material: str, city: str) -> dict:
    """Looks up where to recycle a given material near a city.

    NOTE: this is a demo/placeholder implementation, not backed by a real recycling-locator
    API (e.g. Earth911, Google Places). It returns generic guidance rather than a live address.

    Args:
        material: the material to recycle, e.g. "electronics", "batteries", "plastic"
        city: the user's city
    """
    return {
        "material": material,
        "city": city,
        "guidance": (
            f"This is a demo response (no live recycling-locator API is connected). "
            f"For real drop-off locations for {material} near {city}, check Earth911.com "
            f"or your city's waste management website."
        ),
        "is_demo": True,
    }


def search_product(query: str) -> dict:
    """Searches OpenFoodFacts for real products matching a name or description.

    Args:
        query: product name or keywords to search for, e.g. "peanut butter" or "Nutella"
    """
    try:
        hits = search_openfoodfacts_products(query, limit=5)
    except Exception as e:
        logger.error(f"OpenFoodFacts search failed: {e}")
        return {"error": f"Product search is temporarily unavailable: {e}"}

    if not hits:
        return {"query": query, "results": [], "message": "No matching products found on OpenFoodFacts."}

    return {
        "query": query,
        "results": [
            {
                "name": h.get("product_name") or "Unknown",
                "brand": h.get("brands"),
                "ecoscore_grade": h.get("ecoscore_grade"),
                "nutriscore_grade": h.get("nutriscore_grade"),
                "packaging": h.get("packaging"),
            }
            for h in hits
        ],
    }


def compare_products(product_names: list[str]) -> dict:
    """Looks up real data for 2 or more named products from OpenFoodFacts so they can be compared.

    Args:
        product_names: names of the products to compare, e.g. ["Nutella", "peanut butter"]
    """
    if len(product_names) < 2:
        return {"error": "Need at least 2 product names to compare."}

    results = []
    for name in product_names:
        try:
            hits = search_openfoodfacts_products(name, limit=1)
        except Exception as e:
            logger.error(f"OpenFoodFacts search failed for '{name}': {e}")
            results.append({"queried_name": name, "error": "lookup failed"})
            continue

        if not hits:
            results.append({"queried_name": name, "found": False})
            continue

        h = hits[0]
        results.append({
            "queried_name": name,
            "found": True,
            "matched_name": h.get("product_name"),
            "brand": h.get("brands"),
            "ecoscore_grade": h.get("ecoscore_grade"),
            "nutriscore_grade": h.get("nutriscore_grade"),
            "packaging": h.get("packaging"),
        })

    return {"products": results}


def save_user_history(note: str, uid: str | None = None) -> dict:
    """Saves a short note to the user's persistent memory for future conversations
    (e.g. a stated preference, goal, or habit worth remembering).

    Args:
        note: what to remember about this user, in plain language
    """
    if not uid:
        return {"saved": False, "error": "No authenticated user for this session - nothing to save against."}

    try:
        from database.firestore import get_firestore_client
        from firebase_admin import firestore as admin_firestore

        client = get_firestore_client()
        client.collection("users").document(uid).collection("aiMemory").add({
            "note": note,
            "timestamp": admin_firestore.SERVER_TIMESTAMP,
        })
        return {"saved": True, "note": note}
    except Exception as e:
        logger.error(f"save_user_history failed: {e}")
        return {"saved": False, "error": f"Could not save (Firestore not configured?): {e}"}


TOOL_SCHEMAS = [
    {
        "type": "function",
        "function": {
            "name": "calculate_carbon_footprint",
            "description": "Calculates estimated kg CO2e for a travel activity using standard emission factors.",
            "parameters": {
                "type": "object",
                "properties": {
                    "activity_type": {
                        "type": "string",
                        "enum": list(CO2_FACTORS_KG_PER_KM.keys()),
                        "description": "The mode of travel",
                    },
                    "distance_km": {"type": "number", "description": "Distance travelled in kilometers"},
                },
                "required": ["activity_type", "distance_km"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "find_recycling_center",
            "description": "Looks up where to recycle a given material near a city. Demo/placeholder, not a live directory.",
            "parameters": {
                "type": "object",
                "properties": {
                    "material": {"type": "string", "description": "The material to recycle, e.g. electronics, batteries, plastic"},
                    "city": {"type": "string", "description": "The user's city"},
                },
                "required": ["material", "city"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "search_product",
            "description": "Searches OpenFoodFacts for real products matching a name or description.",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {"type": "string", "description": "Product name or keywords, e.g. 'peanut butter' or 'Nutella'"},
                },
                "required": ["query"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "compare_products",
            "description": "Looks up real data for 2 or more named products from OpenFoodFacts so they can be compared.",
            "parameters": {
                "type": "object",
                "properties": {
                    "product_names": {
                        "type": "array",
                        "items": {"type": "string"},
                        "description": "Names of the products to compare, e.g. ['Nutella', 'peanut butter']",
                    },
                },
                "required": ["product_names"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "save_user_history",
            "description": "Saves a short note to the user's persistent memory for future conversations (e.g. a stated preference, goal, or habit worth remembering).",
            "parameters": {
                "type": "object",
                "properties": {
                    "note": {"type": "string", "description": "What to remember about this user, in plain language"},
                },
                "required": ["note"],
            },
        },
    },
]

TOOL_FUNCTIONS = {
    "calculate_carbon_footprint": calculate_carbon_footprint,
    "find_recycling_center": find_recycling_center,
    "search_product": search_product,
    "compare_products": compare_products,
    "save_user_history": save_user_history,
}
