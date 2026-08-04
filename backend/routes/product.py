import base64
import logging
import uuid
from pathlib import Path

from fastapi import APIRouter, File, HTTPException, UploadFile
from pydantic import BaseModel, field_validator

from prompts.compare_prompt import build_compare_prompt
from prompts.eco_prompt import build_eco_analysis_prompt
from prompts.general_eco_prompt import build_general_eco_analysis_prompt
from prompts.lifecycle_prompt import build_lifecycle_prompt
from prompts.vision_prompt import IMAGE_IDENTIFY_PROMPT
from services.barcode import browse_openfoodfacts_products, fetch_openfoodfacts_product, search_openfoodfacts_products
from services.marketplace_catalog import browse_catalog, lookup_catalog_product, CATALOG_CATEGORIES
from services.ebay import has_ebay_credentials, search_ebay_products
from services.llm import generate_json, generate_json_with_image, has_llm_key
from services.gemini_stub import _grade_to_score, build_stub_analysis, build_stub_lifecycle
from services.scoring import compute_sustainability_score

logger = logging.getLogger(__name__)


class CarbonFootprint(BaseModel):
    score: int
    explanation: str
    estimated_kg_co2e: float | None = None


class PackagingInfo(BaseModel):
    score: int
    explanation: str
    materials: list[str] | None = None
    recyclable: bool | None = None


class HealthImpact(BaseModel):
    score: int
    explanation: str
    considerations: list[str] | None = None


class Alternative(BaseModel):
    name: str
    reason: str
    estimated_score: int | None = None


class EcoAnalysis(BaseModel):
    carbon_footprint: CarbonFootprint
    packaging: PackagingInfo
    health_impact: HealthImpact
    sustainability_score: int
    alternatives: list[Alternative]
    is_estimated: bool = False


class AnalyzeRequest(BaseModel):
    barcode: str


class AnalyzeResponse(BaseModel):
    product: dict
    analysis: EcoAnalysis


class ImageIdentification(BaseModel):
    item_name: str
    material_guess: str
    recyclable: bool
    disposal_guidance: str
    environmental_impact: str
    confidence: str

    @field_validator("confidence", mode="before")
    @classmethod
    def _coerce_confidence(cls, value):
        # Some models return a 0-1 probability or percentage instead of the requested
        # "high"/"medium"/"low" string - normalize defensively rather than failing.
        if isinstance(value, (int, float)):
            pct = value * 100 if value <= 1 else value
            return "high" if pct >= 70 else "medium" if pct >= 40 else "low"
        return value


class IdentifyImageRequest(BaseModel):
    image_base64: str
    mime_type: str = "image/jpeg"


class IdentifyImageResponse(BaseModel):
    identification: ImageIdentification | None
    is_estimated: bool = False
    message: str | None = None


class ProductNote(BaseModel):
    name: str
    packaging: str
    carbon: str
    price: str
    health: str
    recyclability: str


class CompareResult(BaseModel):
    best_product_name: str
    best_reason: str
    notes: list[ProductNote]
    overall_recommendation: str


class CompareRequest(BaseModel):
    products: list[dict]


class CompareResponse(BaseModel):
    result: CompareResult
    is_estimated: bool = False


class ProductSearchResult(BaseModel):
    # OpenFoodFacts results are barcode-identified and can go through analyze_product() below.
    # eBay results have no barcode - they're identified by external_id and go through
    # analyze_general_product() instead, which reasons from name/category/description text.
    barcode: str | None = None
    external_id: str | None = None
    source: str = "openfoodfacts"
    name: str
    brand: str | None = None
    category: str | None = None
    ecoscore_grade: str | None = None
    nutriscore_grade: str | None = None
    image_url: str | None = None
    price: float | None = None
    price_currency: str | None = None
    item_url: str | None = None


class ProductSearchResponse(BaseModel):
    query: str
    results: list[ProductSearchResult]


class NutritionFacts(BaseModel):
    energy_kcal_100g: float | None = None
    sugars_100g: float | None = None
    fat_100g: float | None = None
    salt_100g: float | None = None


class MarketplaceProduct(BaseModel):
    barcode: str
    name: str
    brand: str | None
    image_url: str | None
    category: str | None
    ecoscore_grade: str | None
    nutriscore_grade: str | None
    sustainability_score: int
    labels: list[str] = []
    ingredients_text: str | None = None
    packaging: str | None = None
    # Populated for /lookup (full OFF record) - browse/search results omit these to keep list
    # fetches lean, since OFF's legacy search endpoint doesn't return them regardless.
    quantity: str | None = None
    allergens: str | None = None
    countries: str | None = None
    nutrition: NutritionFacts | None = None
    # Shopping fields - populated from the DummyJSON catalog (OFF lookups leave these null).
    price: float | None = None
    price_currency: str | None = None
    rating: float | None = None
    stock: int | None = None
    description: str | None = None
    source: str = "openfoodfacts"


class BrowseResponse(BaseModel):
    query: str
    products: list[MarketplaceProduct]
    total: int
    page: int
    has_more: bool


class StageImpact(BaseModel):
    co2: float
    water: float
    energy: float


class LifecycleStage(BaseModel):
    name: str
    iconName: str
    location: str
    duration: str
    status: str
    impact: StageImpact
    details: str


class LifecycleResponse(BaseModel):
    stages: list[LifecycleStage]


class LifecycleRequest(BaseModel):
    name: str
    brand: str | None = None
    category: str | None = None
    sustainability_score: int | None = None


def _as_display_string(value) -> str | None:
    """OpenFoodFacts' search API returns some fields (e.g. brands) as a list instead of the
    comma-separated string the legacy product API uses - normalize to a string either way."""
    if isinstance(value, list):
        return ", ".join(str(v) for v in value) if value else None
    return value


router = APIRouter()

UPLOAD_DIR = Path(__file__).resolve().parent.parent / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)

ALLOWED_UPLOAD_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
MAX_UPLOAD_BYTES = 10 * 1024 * 1024


class UploadImageResponse(BaseModel):
    image_id: str
    url: str


@router.post("/upload-image", response_model=UploadImageResponse)
async def upload_image(file: UploadFile = File(...)):
    if file.content_type not in ALLOWED_UPLOAD_CONTENT_TYPES:
        raise HTTPException(status_code=400, detail="Unsupported image type")

    contents = await file.read()
    if len(contents) > MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=413, detail="Image too large (max 10MB)")

    ext = {"image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp", "image/gif": ".gif"}[file.content_type]
    image_id = f"{uuid.uuid4().hex}{ext}"
    (UPLOAD_DIR / image_id).write_bytes(contents)
    return UploadImageResponse(image_id=image_id, url=f"/uploads/{image_id}")


@router.delete("/upload-image/{image_id}")
def delete_uploaded_image(image_id: str):
    # image_id is used to build a filesystem path below, so guard against path traversal
    # (e.g. "../../etc/passwd") by rejecting anything that isn't a bare filename.
    safe_name = Path(image_id).name
    if safe_name != image_id:
        raise HTTPException(status_code=400, detail="Invalid image id")

    dest = UPLOAD_DIR / safe_name
    if not dest.is_file():
        raise HTTPException(status_code=404, detail="Image not found")
    dest.unlink()
    return {"status": "deleted"}


@router.get("/search", response_model=ProductSearchResponse)
def search_products(query: str):
    if not query.strip():
        return ProductSearchResponse(query=query, results=[])

    results: list[ProductSearchResult] = []
    off_error: Exception | None = None
    ebay_error: Exception | None = None

    def _to_results(hits: list[dict]) -> list[ProductSearchResult]:
        return [
            ProductSearchResult(
                barcode=h.get("code"),
                source="openfoodfacts",
                name=h.get("product_name") or "Unknown product",
                brand=_as_display_string(h.get("brands")),
                ecoscore_grade=h.get("ecoscore_grade"),
                nutriscore_grade=h.get("nutriscore_grade"),
                image_url=h.get("image_url") or h.get("image_front_url"),
            )
            for h in hits
            if h.get("code")  # a result with no barcode can't be analyzed later, so skip it
        ]

    # Two independent OpenFoodFacts search backends (the legacy search.pl endpoint and the
    # newer search-a-licious API) have each shown intermittent outages at different times, so
    # try one and fall back to the other rather than depending on either alone.
    try:
        hits, _ = browse_openfoodfacts_products(query, page=1, page_size=10)
        results.extend(_to_results(hits))
    except Exception as e:
        logger.warning(f"OpenFoodFacts legacy search failed, trying search-a-licious fallback: {e}")
        try:
            hits = search_openfoodfacts_products(query, limit=10)
            results.extend(_to_results(hits))
        except Exception as e2:
            logger.error(f"OpenFoodFacts search-a-licious fallback also failed: {e2}")
            off_error = e2

    # General merchandise (electronics, clothing, home goods, etc.) - OpenFoodFacts only covers
    # food/grocery, so this is the only source for everything else. Only searched if the caller
    # has configured EBAY_CLIENT_ID/EBAY_CLIENT_SECRET (see services/ebay.py).
    if has_ebay_credentials():
        try:
            items, _ = search_ebay_products(query, limit=10)
            for item in items:
                price = item.get("price") or {}
                categories = item.get("categories") or []
                results.append(ProductSearchResult(
                    external_id=item.get("itemId"),
                    source="ebay",
                    name=item.get("title") or "Unknown product",
                    category=categories[0].get("categoryName") if categories else None,
                    image_url=(item.get("image") or {}).get("imageUrl"),
                    price=float(price["value"]) if price.get("value") else None,
                    price_currency=price.get("currency"),
                    item_url=item.get("itemWebUrl"),
                ))
        except Exception as e:
            logger.error(f"eBay search failed: {e}")
            ebay_error = e

    if not results and off_error is not None and (ebay_error is not None or not has_ebay_credentials()):
        raise HTTPException(status_code=502, detail=f"Product search failed: {off_error}")

    return ProductSearchResponse(query=query, results=results)


class GeneralAnalyzeRequest(BaseModel):
    name: str
    brand: str | None = None
    category: str | None = None
    description: str | None = None
    condition: str | None = None


@router.post("/analyze-general", response_model=EcoAnalysis)
def analyze_general_product(req: GeneralAnalyzeRequest):
    # Unlike analyze_product() below, there's no OpenFoodFacts eco-score to build a heuristic
    # fallback from for general merchandise, so this genuinely requires a working LLM call -
    # fail honestly rather than fabricate a score with no real signal behind it.
    if not has_llm_key():
        raise HTTPException(status_code=503, detail="AI analysis requires an LLM API key, which isn't configured.")
    prompt = build_general_eco_analysis_prompt(req.model_dump())
    try:
        analysis = generate_json(prompt, response_schema=EcoAnalysis)
        analysis.sustainability_score = compute_sustainability_score(
            analysis.carbon_footprint.score, analysis.packaging.score, analysis.health_impact.score
        )
        return analysis
    except Exception as e:
        logger.error(f"LLM API call failed: {e}")
        raise HTTPException(status_code=502, detail=f"LLM API error: {e}")


def _to_marketplace_product(raw: dict, fallback_category: str | None = None) -> MarketplaceProduct | None:
    code = raw.get("code")
    name = raw.get("product_name")
    if not code or not name:
        # Products missing a barcode or name aren't worth showing/linking to in the marketplace.
        return None
    categories = _as_display_string(raw.get("categories"))
    category = (categories.split(",")[0].strip() if categories else None) or fallback_category
    labels = [l.replace("en:", "").replace("-", " ") for l in (raw.get("labels_tags") or []) if isinstance(l, str)]

    nutriments = raw.get("nutriments") or {}
    nutrition = NutritionFacts(
        energy_kcal_100g=nutriments.get("energy-kcal_100g"),
        sugars_100g=nutriments.get("sugars_100g"),
        fat_100g=nutriments.get("fat_100g"),
        salt_100g=nutriments.get("salt_100g"),
    )
    has_nutrition = any(v is not None for v in nutrition.model_dump().values())

    return MarketplaceProduct(
        barcode=code,
        name=name,
        brand=_as_display_string(raw.get("brands")),
        image_url=raw.get("image_front_url") or raw.get("image_url"),
        category=category,
        ecoscore_grade=raw.get("ecoscore_grade"),
        nutriscore_grade=raw.get("nutriscore_grade"),
        sustainability_score=_grade_to_score(raw.get("ecoscore_grade")),
        labels=labels[:6],
        ingredients_text=raw.get("ingredients_text") or None,
        packaging=raw.get("packaging") or None,
        quantity=raw.get("quantity") or None,
        allergens=_as_display_string(raw.get("allergens")) or None,
        countries=_as_display_string(raw.get("countries")) or None,
        nutrition=nutrition if has_nutrition else None,
    )


@router.get("/browse", response_model=BrowseResponse)
def browse_products(query: str, page: int = 1, page_size: int = 24):
    if page < 1:
        raise HTTPException(status_code=400, detail="page must be >= 1")
    if not (1 <= page_size <= 50):
        raise HTTPException(status_code=400, detail="page_size must be between 1 and 50")

    # The marketplace catalog comes from DummyJSON - a reliable, complete product API (price,
    # rating, stock, images, description) - rather than OpenFoodFacts, which has no prices and is
    # frequently rate-limited. Sustainability scores are derived by category in the service.
    try:
        raw_products, total = browse_catalog(query, page=page, page_size=page_size)
    except Exception as e:
        logger.error(f"Catalog browse failed: {e}")
        raise HTTPException(status_code=502, detail=f"Product browse failed: {e}")

    products = [MarketplaceProduct(**raw) for raw in raw_products]
    return BrowseResponse(query=query, products=products, total=total, page=page, has_more=page * page_size < total)


@router.get("/categories")
def catalog_categories():
    return {"categories": CATALOG_CATEGORIES}


@router.get("/lookup", response_model=MarketplaceProduct)
def lookup_product(barcode: str):
    # `barcode` here is the catalog product id. Fall back to OpenFoodFacts for real barcodes
    # (the scanner still uses OFF), otherwise resolve against the DummyJSON catalog.
    catalog_product = lookup_catalog_product(barcode)
    if catalog_product is not None:
        return MarketplaceProduct(**catalog_product)
    off_product = fetch_openfoodfacts_product(barcode)
    if off_product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    product = _to_marketplace_product(off_product)
    if product is None:
        raise HTTPException(status_code=404, detail="Product is missing required fields")
    return product


@router.post("/analyze", response_model=AnalyzeResponse)
def analyze_product(req: AnalyzeRequest):
    off_product = fetch_openfoodfacts_product(req.barcode)
    if off_product is None:
        raise HTTPException(status_code=404, detail="Product not found in OpenFoodFacts")

    if not has_llm_key():
        logger.warning("No OPENROUTER_API_KEY configured, falling back to heuristic stub analysis")
        analysis = EcoAnalysis(**build_stub_analysis(off_product))
        return AnalyzeResponse(product=off_product, analysis=analysis)

    prompt = build_eco_analysis_prompt(off_product)
    try:
        analysis = generate_json(prompt, response_schema=EcoAnalysis)
        analysis.sustainability_score = compute_sustainability_score(
            analysis.carbon_footprint.score, analysis.packaging.score, analysis.health_impact.score
        )
        # A rate-limited/degraded LLM sometimes returns a valid-shaped but all-zero result,
        # which surfaced in the UI as a product scoring 0 across the board. Treat that as a
        # miss and use the OpenFoodFacts-derived heuristic (Eco-Score/Nutri-Score) instead, so
        # a scan always shows meaningful non-zero values.
        if not analysis.sustainability_score:
            logger.warning("LLM returned a zero sustainability_score; using heuristic estimate")
            analysis = EcoAnalysis(**build_stub_analysis(off_product))
    except Exception as e:
        # Don't hard-fail the scan when the AI is rate-limited/unavailable - fall back to the
        # real OpenFoodFacts-derived heuristic estimate rather than returning 502/zeros.
        logger.warning(f"LLM analyze failed ({e}); falling back to heuristic stub analysis")
        analysis = EcoAnalysis(**build_stub_analysis(off_product))
    return AnalyzeResponse(product=off_product, analysis=analysis)


@router.post("/lifecycle", response_model=LifecycleResponse)
def product_lifecycle(req: LifecycleRequest):
    """Generate a cradle-to-grave lifecycle assessment (5 stages with per-stage CO2/water/energy
    estimates) for a product. Uses the LLM when available, and falls back to a category-scaled
    heuristic when it's unavailable/rate-limited so the view never shows all zeros."""
    if not has_llm_key():
        return LifecycleResponse(**build_stub_lifecycle(req.model_dump()))
    prompt = build_lifecycle_prompt(req.model_dump())
    try:
        result = generate_json(prompt, response_schema=LifecycleResponse)
        if not result.stages:
            return LifecycleResponse(**build_stub_lifecycle(req.model_dump()))
        return result
    except Exception as e:
        logger.warning(f"Lifecycle LLM call failed ({e}); falling back to heuristic estimate")
        return LifecycleResponse(**build_stub_lifecycle(req.model_dump()))


@router.post("/identify-image", response_model=IdentifyImageResponse)
def identify_image(req: IdentifyImageRequest):
    try:
        image_bytes = base64.b64decode(req.image_base64)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid base64 image data")

    if not has_llm_key():
        logger.warning("No OPENROUTER_API_KEY configured, cannot identify image without a vision-capable LLM key")
        return IdentifyImageResponse(
            identification=None,
            is_estimated=True,
            message="Image analysis needs an OpenRouter API key, which isn''t configured. Try describing the item in EcoBot chat instead, or scan its barcode if it has one.",
        )

    try:
        identification = generate_json_with_image(
            IMAGE_IDENTIFY_PROMPT, image_bytes, req.mime_type, response_schema=ImageIdentification
        )
        return IdentifyImageResponse(identification=identification, is_estimated=False)
    except Exception as e:
        logger.error(f"Vision API call failed: {e}")
        raise HTTPException(status_code=502, detail=f"LLM API error: {e}")


def _heuristic_compare(products: list[dict]) -> CompareResult:
    scored = [p for p in products if p.get("sustainabilityScore") is not None]
    best = max(scored, key=lambda p: p["sustainabilityScore"]) if scored else products[0]
    avg_score = round(sum(p.get("sustainabilityScore", 0) for p in products) / len(products)) if products else 0
    prices = [p["price"] for p in products if isinstance(p.get("price"), (int, float))]

    notes = []
    for p in products:
        metrics = p.get("metrics") or {}
        certs = [str(c).lower() for c in (p.get("certifications") or [])]
        recyclable = any("recycl" in c for c in certs)

        carbon_val = metrics.get("carbon")
        carbon_note = f"Carbon score: {carbon_val}/100" if carbon_val is not None else "No carbon data available"

        price_val = p.get("price")
        if isinstance(price_val, (int, float)) and prices:
            price_note = "Lowest price in this comparison" if price_val == min(prices) else f"Priced at {price_val}"
        else:
            price_note = "No price data available"

        health_val = metrics.get("ethics")
        health_note = f"Ethics/health proxy score: {health_val}/100" if health_val is not None else "No health data available"

        notes.append(ProductNote(
            name=p.get("name", "Unknown"),
            packaging=f"Certifications: {', '.join(certs) if certs else 'none listed'}",
            carbon=carbon_note,
            price=price_note,
            health=health_note,
            recyclability="Recyclability certification found" if recyclable else "No recyclability certification listed",
        ))

    return CompareResult(
        best_product_name=best.get("name", "Unknown"),
        best_reason=f"Highest sustainability score in this comparison at {best.get('sustainabilityScore', 'N/A')}/100.",
        notes=notes,
        overall_recommendation=f"Average sustainability score across compared products is {avg_score}/100.",
    )


@router.post("/compare", response_model=CompareResponse)
def compare_products(req: CompareRequest):
    if len(req.products) < 2:
        raise HTTPException(status_code=400, detail="Need at least 2 products to compare")

    if not has_llm_key():
        logger.warning("No OPENROUTER_API_KEY configured, falling back to heuristic comparison")
        return CompareResponse(result=_heuristic_compare(req.products), is_estimated=True)

    prompt = build_compare_prompt(req.products)
    try:
        result = generate_json(prompt, response_schema=CompareResult)
        return CompareResponse(result=result, is_estimated=False)
    except Exception as e:
        logger.error(f"LLM API call failed: {e}")
        raise HTTPException(status_code=502, detail=f"LLM API error: {e}")
