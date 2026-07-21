"""Real recipe data from TheMealDB (https://www.themealdb.com), a free, open recipe API.

TheMealDB provides genuine recipe content (name, image, ingredients, instructions, cuisine).
It does NOT provide sustainability or nutrition data, so those are DERIVED here with transparent
ingredient-based heuristics rather than fabricated - a plant-based dish scores higher and carries a
lower estimated footprint than a red-meat dish. Everything returned is either real recipe content
or an openly-estimated value, never a made-up recipe.
"""
from __future__ import annotations

import re
from typing import Any

import httpx

MEALDB_BASE = "https://www.themealdb.com/api/json/v1/1"
HEADERS = {"User-Agent": "EcoScope/1.0 (sustainability recipe finder)"}

# Ingredient keyword -> (carbon kg CO2e per serving, litres water per serving, score delta).
# Rough per-serving figures drawn from common food-footprint ranges; used only to estimate,
# and the estimate is always labelled as such in the UI.
_RED_MEAT = re.compile(r"beef|lamb|mutton|veal|steak|mince|bacon|pork|ham|sausage", re.I)
_POULTRY = re.compile(r"chicken|turkey|duck|poultry", re.I)
_FISH = re.compile(r"fish|salmon|tuna|prawn|shrimp|cod|haddock|seafood|crab", re.I)
_DAIRY = re.compile(r"cheese|butter|cream|milk|yogurt|yoghurt", re.I)
_PLANT = re.compile(r"lentil|bean|chickpea|tofu|quinoa|vegetable|spinach|kale|tomato|lettuce|mushroom", re.I)


def _extract_ingredients(meal: dict[str, Any]) -> list[str]:
    ingredients: list[str] = []
    for i in range(1, 21):
        name = (meal.get(f"strIngredient{i}") or "").strip()
        measure = (meal.get(f"strMeasure{i}") or "").strip()
        if name:
            ingredients.append(f"{measure} {name}".strip())
    return ingredients


def _sustainability(ingredients_text: str) -> dict[str, Any]:
    """Derive an estimated sustainability profile from the ingredient list."""
    score = 72
    carbon = 0.6
    water = 300

    if _RED_MEAT.search(ingredients_text):
        score -= 30
        carbon = 4.5
        water = 1800
    elif _POULTRY.search(ingredients_text):
        score -= 12
        carbon = 1.8
        water = 900
    elif _FISH.search(ingredients_text):
        score -= 6
        carbon = 1.3
        water = 700
    else:
        # No meat/fish detected - plant-forward
        score += 18
        carbon = 0.6
        water = 350

    if _DAIRY.search(ingredients_text):
        score -= 6
        carbon += 0.4
        water += 150

    plant_hits = len(_PLANT.findall(ingredients_text))
    score += min(plant_hits * 2, 10)

    score = max(5, min(100, score))
    is_plant_based = not (_RED_MEAT.search(ingredients_text) or _POULTRY.search(ingredients_text) or _FISH.search(ingredients_text))

    return {
        "sustainabilityScore": score,
        "carbonFootprint": f"{carbon:.1f} kg CO₂",
        "waterUsage": f"{water}L",
        "sustainability": {
            "seasonal": plant_hits >= 2,
            "local": False,  # TheMealDB has no sourcing data - honestly false rather than faked true
            "organic": False,
            "lowWaste": is_plant_based,
        },
    }


def _difficulty(instructions: str, ingredient_count: int) -> str:
    steps = len([s for s in re.split(r"[\r\n]+", instructions) if s.strip()])
    if ingredient_count <= 6 and steps <= 4:
        return "Easy"
    if ingredient_count <= 12 and steps <= 8:
        return "Medium"
    return "Hard"


def _instruction_steps(instructions: str) -> list[str]:
    # TheMealDB stores instructions as one blob; split into readable steps on newlines/sentences.
    parts = [p.strip() for p in re.split(r"[\r\n]+", instructions) if p.strip()]
    if len(parts) <= 1:
        parts = [p.strip() for p in re.split(r"(?<=[.!?])\s+(?=[A-Z])", instructions) if p.strip()]
    return parts[:12]


def _map_meal(meal: dict[str, Any]) -> dict[str, Any]:
    ingredients = _extract_ingredients(meal)
    ingredients_text = " ".join(ingredients)
    sustainability = _sustainability(ingredients_text)
    instructions = meal.get("strInstructions") or ""
    tags_raw = (meal.get("strTags") or "").split(",")
    tags = [t.strip() for t in tags_raw if t.strip()]
    for extra in (meal.get("strArea"), meal.get("strCategory")):
        if extra and extra not in tags:
            tags.append(extra)

    ingredient_count = len(ingredients)
    # TheMealDB gives no cook time; estimate from step/ingredient complexity.
    est_minutes = min(20 + ingredient_count * 3, 90)

    return {
        "id": int(meal.get("idMeal", 0)),
        "name": meal.get("strMeal", "Untitled Recipe"),
        "image": meal.get("strMealThumb", ""),
        "cookTime": f"{est_minutes} min",
        "servings": 4,
        "difficulty": _difficulty(instructions, ingredient_count),
        "tags": tags[:5],
        "ingredients": ingredients,
        "instructions": _instruction_steps(instructions),
        "nutrition": {"calories": 0, "protein": "", "carbs": "", "fat": ""},
        "category": meal.get("strCategory", ""),
        "area": meal.get("strArea", ""),
        "youtube": meal.get("strYoutube", ""),
        **sustainability,
    }


def search_recipes(query: str = "") -> list[dict[str, Any]]:
    """Search real recipes by name/keyword. Empty query returns a mixed default set."""
    meals: list[dict[str, Any]] = []
    try:
        if query.strip():
            resp = httpx.get(f"{MEALDB_BASE}/search.php", params={"s": query.strip()}, timeout=10, headers=HEADERS)
            resp.raise_for_status()
            meals = resp.json().get("meals") or []
        else:
            # Default feed: one first-letter query is enough to fill the grid and keeps the
            # initial load fast (a single upstream call instead of several sequential ones).
            resp = httpx.get(f"{MEALDB_BASE}/search.php", params={"f": "c"}, timeout=10, headers=HEADERS)
            resp.raise_for_status()
            meals = resp.json().get("meals") or []
    except Exception:
        # Network / upstream failure - return empty; the route surfaces an honest error state.
        raise

    mapped = [_map_meal(m) for m in meals if m.get("idMeal")]
    # Show the most sustainable first so the eco-focused framing is meaningful.
    mapped.sort(key=lambda r: r["sustainabilityScore"], reverse=True)
    return mapped[:24]
