"""eBay Browse API - general-merchandise product source (electronics, clothing, home, etc.)
to complement OpenFoodFacts, which only covers food/grocery. Uses the Client Credentials OAuth
flow (app-only token, no eBay user login required) to search public listings.

Requires EBAY_CLIENT_ID / EBAY_CLIENT_SECRET from a free eBay Developer account
(https://developer.ebay.com/) - unlike Amazon's Product Advertising API or Walmart's partner
APIs, this doesn't require an approved affiliate account with existing sales history.
"""

import base64
import time

import httpx

from utils.config import get_settings

_OAUTH_URL = "https://api.ebay.com/identity/v1/oauth2/token"
_SEARCH_URL = "https://api.ebay.com/buy/browse/v1/item_summary/search"
_SCOPE = "https://api.ebay.com/oauth/api_scope"

_token_cache: dict[str, float | str] = {"token": "", "expires_at": 0.0}


def has_ebay_credentials() -> bool:
    settings = get_settings()
    return bool(settings.ebay_client_id and settings.ebay_client_secret)


def _get_access_token() -> str:
    now = time.time()
    if _token_cache["token"] and now < float(_token_cache["expires_at"]):
        return str(_token_cache["token"])

    settings = get_settings()
    if not (settings.ebay_client_id and settings.ebay_client_secret):
        raise RuntimeError("eBay API not configured (set EBAY_CLIENT_ID and EBAY_CLIENT_SECRET)")

    basic = base64.b64encode(f"{settings.ebay_client_id}:{settings.ebay_client_secret}".encode()).decode()
    resp = httpx.post(
        _OAUTH_URL,
        headers={
            "Authorization": f"Basic {basic}",
            "Content-Type": "application/x-www-form-urlencoded",
        },
        data={"grant_type": "client_credentials", "scope": _SCOPE},
        timeout=10,
    )
    resp.raise_for_status()
    data = resp.json()
    token = data["access_token"]
    # Refresh a couple minutes early rather than cutting it exactly at expiry.
    _token_cache["token"] = token
    _token_cache["expires_at"] = now + int(data.get("expires_in", 7200)) - 120
    return token


def search_ebay_products(query: str, limit: int = 24, offset: int = 0) -> tuple[list[dict], int]:
    token = _get_access_token()
    resp = httpx.get(
        _SEARCH_URL,
        headers={
            "Authorization": f"Bearer {token}",
            "X-EBAY-C-MARKETPLACE-ID": "EBAY_US",
        },
        params={"q": query, "limit": limit, "offset": offset},
        timeout=10,
    )
    resp.raise_for_status()
    data = resp.json()
    return data.get("itemSummaries", []), int(data.get("total", 0))
