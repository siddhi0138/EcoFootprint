import logging

from fastapi import APIRouter, HTTPException

from services.recipes import search_recipes

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/search")
def recipes_search(q: str = ""):
    """Return real recipes from TheMealDB with derived sustainability estimates."""
    try:
        recipes = search_recipes(q)
        return {"recipes": recipes}
    except Exception as e:
        logger.error(f"Recipe search failed: {e}")
        raise HTTPException(status_code=502, detail=f"Recipe provider error: {e}")
