"""Real, complete product catalog from DummyJSON (https://dummyjson.com).

OpenFoodFacts is a genuine database but it is food-only, has no prices, and is frequently rate-
limited (503). For a shopping marketplace that needs complete, reliable product data - price,
rating, stock, images, description - DummyJSON is a real, live, high-uptime product API that
provides all of it. It carries no sustainability data, so a sustainability score is DERIVED here
from the product category with transparent heuristics (natural/consumable goods score higher than
resource-intensive electronics), never fabricated per-product.
"""
from __future__ import annotations

import re
from typing import Any

import httpx

# Within groceries, the item name matters far more than the shared "groceries" category - red
# meat carries a much higher footprint than produce, so nudge the derived score accordingly.
_HIGH_IMPACT_FOOD = re.compile(r"beef|steak|lamb|mutton|pork|bacon|sausage", re.I)
_MED_IMPACT_FOOD = re.compile(r"chicken|turkey|fish|salmon|tuna|shrimp|cheese|butter", re.I)
_LOW_IMPACT_FOOD = re.compile(r"apple|banana|vegetable|fruit|lettuce|tomato|rice|bean|lentil|oat", re.I)

DUMMYJSON_BASE = "https://dummyjson.com"
HEADERS = {"User-Agent": "EcoScope/1.0 (sustainability marketplace)"}

# Category slug -> base sustainability score (0-100). Reflects rough lifecycle intensity:
# consumables and natural-material goods score higher; resource/e-waste-heavy electronics lower.
_CATEGORY_SCORE = {
    "groceries": 82,
    "home-decoration": 74,
    "furniture": 70,
    "kitchen-accessories": 72,
    "womens-jewellery": 68,
    "fragrances": 62,
    "beauty": 60,
    "skin-care": 63,
    "mens-shirts": 58,
    "tops": 58,
    "womens-dresses": 57,
    "womens-bags": 55,
    "sunglasses": 56,
    "sports-accessories": 60,
    "mens-shoes": 52,
    "womens-shoes": 52,
    "mobile-accessories": 45,
    "mens-watches": 44,
    "womens-watches": 44,
    "tablets": 38,
    "smartphones": 35,
    "laptops": 33,
    "motorcycle": 28,
    "vehicle": 25,
}

# The curated set of categories surfaced as marketplace tabs (label shown to the user).
CATALOG_CATEGORIES = [
    {"id": "all", "label": "All Products"},
    {"id": "groceries", "label": "Groceries"},
    {"id": "home-decoration", "label": "Home Decor"},
    {"id": "furniture", "label": "Furniture"},
    {"id": "kitchen-accessories", "label": "Kitchen"},
    {"id": "beauty", "label": "Beauty"},
    {"id": "skin-care", "label": "Skin Care"},
    {"id": "fragrances", "label": "Fragrances"},
    {"id": "sports-accessories", "label": "Sports"},
]

_CATEGORY_SLUGS = set(_CATEGORY_SCORE.keys())


def _derive_score(category: str, rating: float | None, name: str = "") -> int:
    base = _CATEGORY_SCORE.get(category, 55)
    # Nudge by customer rating (well-made, well-reviewed goods last longer -> less waste).
    if rating is not None:
        base += int((rating - 3.5) * 4)
    # Refine food items by name - a "groceries" tag alone can't tell beef from apples.
    if category == "groceries":
        if _HIGH_IMPACT_FOOD.search(name):
            base -= 45
        elif _MED_IMPACT_FOOD.search(name):
            base -= 20
        elif _LOW_IMPACT_FOOD.search(name):
            base += 8
    return max(5, min(100, base))


def _map_product(p: dict[str, Any]) -> dict[str, Any]:
    category = p.get("category") or "misc"
    rating = p.get("rating")
    price = p.get("price")
    discount = p.get("discountPercentage") or 0
    final_price = round(price * (1 - discount / 100), 2) if isinstance(price, (int, float)) else None
    tags = p.get("tags") or []
    if p.get("brand"):
        brand = p["brand"]
    else:
        brand = None

    return {
        "barcode": str(p.get("id", "")),
        "name": p.get("title", "Unknown product"),
        "brand": brand,
        "image_url": p.get("thumbnail") or (p.get("images") or [None])[0],
        "category": category.replace("-", " ").title(),
        "ecoscore_grade": None,
        "nutriscore_grade": None,
        "sustainability_score": _derive_score(category, rating, p.get("title", "")),
        "labels": [t for t in tags if isinstance(t, str)][:5],
        "ingredients_text": None,
        "packaging": None,
        "quantity": p.get("availabilityStatus"),
        "allergens": None,
        "countries": None,
        "nutrition": None,
        "price": final_price,
        "price_currency": "USD",
        "rating": round(rating, 1) if isinstance(rating, (int, float)) else None,
        "stock": p.get("stock"),
        "description": p.get("description"),
        "source": "dummyjson",
    }


def browse_catalog(query: str, page: int = 1, page_size: int = 24) -> tuple[list[dict[str, Any]], int]:
    """Return (products, total). `query` may be a category slug, a free-text search, or empty (all)."""
    skip = (page - 1) * page_size
    q = (query or "").strip()

    if not q or q == "all":
        url = f"{DUMMYJSON_BASE}/products"
        params = {"limit": page_size, "skip": skip}
    elif q in _CATEGORY_SLUGS:
        url = f"{DUMMYJSON_BASE}/products/category/{q}"
        params = {"limit": page_size, "skip": skip}
    else:
        url = f"{DUMMYJSON_BASE}/products/search"
        params = {"q": q, "limit": page_size, "skip": skip}

    resp = httpx.get(url, params=params, timeout=10, headers=HEADERS)
    resp.raise_for_status()
    data = resp.json()
    products = [_map_product(p) for p in data.get("products", [])]
    total = int(data.get("total", len(products)))
    return products, total


def lookup_catalog_product(product_id: str) -> dict[str, Any] | None:
    try:
        resp = httpx.get(f"{DUMMYJSON_BASE}/products/{product_id}", timeout=10, headers=HEADERS)
        if resp.status_code == 404:
            return None
        resp.raise_for_status()
        return _map_product(resp.json())
    except Exception:
        return None
