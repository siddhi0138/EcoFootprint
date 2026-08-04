def build_lifecycle_prompt(product: dict, rag_chunks: list[dict] | None = None) -> str:
    name = product.get("name") or "Unknown product"
    brand = product.get("brand") or "Unknown brand"
    category = product.get("category") or "Unknown category"
    score = product.get("sustainability_score")
    score_line = f"Known overall sustainability score: {score}/100\n" if score is not None else ""

    reference_section = ""
    if rag_chunks:
        reference = "\n\n".join(f"[{c['source']}] {c['text']}" for c in rag_chunks)
        reference_section = f"""
Reference material (published LCA studies - ground your per-stage numbers and proportions in this
where it's relevant to the product's category, and cite the source filename in the relevant stage's
`details` text; where it doesn't cover this category, fall back to a reasoned category-level
estimate and say so explicitly rather than implying it's study-backed):
{reference}
"""

    return f"""You are EcoGuide, a product lifecycle analyst. Produce a realistic cradle-to-grave
lifecycle assessment for the product below, broken into its standard stages. Reason from what is
typically true for this product category and its likely materials - you do NOT have this exact
manufacturer's supply-chain data, so keep figures as honest category-level ESTIMATES and make the
`details` text say so rather than inventing specific factories, suppliers, or certifications.

Product: {name}
Brand: {brand}
Category: {category}
{score_line}{reference_section}
Return a JSON object with a single key "stages": a list of 5 stage objects covering, in order:
Raw Materials, Manufacturing, Transportation, Use Phase, and End of Life. Each stage object must have:
- name: the stage name (e.g. "Raw Materials")
- iconName: one of exactly ["Leaf","Factory","Truck","Zap","Recycle"] matching the stage
  (Raw Materials->Leaf, Manufacturing->Factory, Transportation->Truck, Use Phase->Zap, End of Life->Recycle)
- location: a plausible general region for that stage (e.g. "Global supply chain", "Southeast Asia",
  "Regional distribution", "Consumer home", "Local recycling") - general, not a fabricated exact address
- duration: rough time the stage spans (e.g. "Extraction phase", "2-4 weeks", "3-5 years", "Ongoing")
- status: "completed" for pre-purchase stages (Raw Materials, Manufacturing, Transportation),
  "active" for Use Phase, "pending" for End of Life
- impact: an object with numeric ESTIMATES for that single stage:
    - co2: kilograms of CO2e (number)
    - water: litres of water (number)
    - energy: kWh of energy (number)
- details: 1-2 sentences on the stage's environmental considerations for THIS product category,
  explicitly framed as a category-level estimate

Make the per-stage numbers realistic and proportionate for the category (e.g. a smartphone's
Manufacturing stage dominates CO2; a cotton T-shirt's Raw Materials/Use phases dominate water).
Return ONLY the JSON object.
"""
