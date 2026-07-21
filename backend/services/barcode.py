import json

import httpx

OFF_BASE = "https://world.openfoodfacts.org/api/v2/product"
OFF_SEARCH_BASE = "https://search.openfoodfacts.org/search"
OFF_LEGACY_SEARCH_BASE = "https://world.openfoodfacts.org/cgi/search.pl"

# OpenFoodFacts' API usage guidelines ask integrators to identify themselves via User-Agent
# instead of the generic "python-httpx/x.x" default - unidentified traffic is more likely to
# get rate-limited.
HEADERS = {"User-Agent": "EcoScope-Sustainability-App/1.0 (non-commercial student project)"}


def fetch_openfoodfacts_product(barcode: str) -> dict | None:
    resp = httpx.get(f"{OFF_BASE}/{barcode}.json", timeout=10, headers=HEADERS)
    if resp.status_code == 404:
        # OFF returns a genuine 404 (not a 200 with status:0) for barcodes it has no record of at
        # all, as opposed to ones it recognizes but has no data for - raise_for_status() would
        # turn this into an unhandled 500 instead of the "not found" result callers expect.
        return None
    resp.raise_for_status()
    data = resp.json()
    if data.get("status") != 1:
        return None
    return data["product"]


def search_openfoodfacts_products(query: str, limit: int = 10) -> list[dict]:
    resp = httpx.get(
        OFF_SEARCH_BASE,
        params={
            "q": query,
            "page_size": limit,
            "fields": "code,product_name,brands,ecoscore_grade,nutriscore_grade,packaging,categories,image_url,image_front_url",
        },
        timeout=10,
        headers=HEADERS,
    )
    resp.raise_for_status()
    return resp.json().get("hits", [])


def browse_openfoodfacts_products(query: str, page: int = 1, page_size: int = 24) -> tuple[list[dict], int]:
    """Category/keyword browse for the marketplace, backed by OFF's older search.pl endpoint
    rather than the newer search-a-licious API (search_openfoodfacts_products above) - that
    API has been intermittently returning 502s, while this legacy one has stayed reliable."""
    resp = httpx.get(
        OFF_LEGACY_SEARCH_BASE,
        params={
            "search_terms": query,
            "page": page,
            "page_size": page_size,
            "json": 1,
            "fields": "code,product_name,brands,ecoscore_grade,nutriscore_grade,packaging,categories,"
                      "image_url,image_front_url,labels_tags,ingredients_text",
        },
        timeout=10,
        headers=HEADERS,
    )
    resp.raise_for_status()
    # This endpoint mislabels its response as Content-Type: text/html with no charset, which
    # makes httpx's automatic encoding guess wrong and mangles non-ASCII names (e.g. "Goût" ->
    # "Goût" mojibake) - decode as UTF-8 explicitly instead of trusting resp.json().
    data = json.loads(resp.content.decode("utf-8"))
    return data.get("products", []), int(data.get("count", 0))
