def build_eco_analysis_prompt(product: dict) -> str:
    name = product.get("product_name") or "Unknown product"
    brands = product.get("brands") or "Unknown brand"
    categories = product.get("categories") or "Unknown category"
    ingredients = product.get("ingredients_text") or "Not listed"
    packaging = product.get("packaging") or "Not listed"
    labels = product.get("labels_tags") or []
    ecoscore = product.get("ecoscore_grade") or "unknown"
    nutriscore = product.get("nutriscore_grade") or "unknown"
    countries = product.get("countries") or "Unknown"

    return f"""You are EcoGuide, a sustainability analysis assistant. Analyze the following product
using only the structured data provided. Never invent recycling laws or certifications that
aren't implied by the data. If information is missing, reason conservatively and say so in the
explanation text rather than fabricating specifics.

Product: {name}
Brand: {brands}
Categories: {categories}
Ingredients: {ingredients}
Packaging: {packaging}
Labels/certifications: {', '.join(labels) if labels else 'None listed'}
OpenFoodFacts Eco-Score: {ecoscore}
OpenFoodFacts Nutri-Score: {nutriscore}
Country/countries sold: {countries}

Return a JSON object with:
- carbon_footprint: {{score (0-100, higher is better), explanation, estimated_kg_co2e (optional numeric estimate)}}
- packaging: {{score (0-100, higher is better), explanation, materials (list of strings if inferable), recyclable (boolean if inferable)}}
- health_impact: {{score (0-100, higher is better), explanation, considerations (list of strings)}}
- sustainability_score: overall score 0-100 combining the above
- alternatives: list of 2-3 objects {{name, reason, estimated_score}} suggesting more sustainable
  alternatives in the same product category

Ground every explanation in the specific data given above (ingredients, packaging, labels, scores).
"""
