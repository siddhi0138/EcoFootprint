def build_compare_prompt(products: list[dict]) -> str:
    listing = "\n\n".join(
        f"Product: {p.get('name')}\n"
        f"Brand: {p.get('brand', 'Unknown')}\n"
        f"Category: {p.get('category', 'Unknown')}\n"
        f"Price: {p.get('price', 'Unknown')}\n"
        f"Sustainability score: {p.get('sustainabilityScore', 'Unknown')}/100\n"
        f"Metrics (0-100, higher is better): {p.get('metrics', {})}\n"
        f"Certifications: {p.get('certifications', [])}"
        for p in products
    )

    return f"""You are EcoGuide, a sustainability assistant. Compare these products using ONLY the
data given below - never invent specifications, prices, or certifications not listed. Reason about
packaging/recyclability from the certifications and metrics given.

{listing}

Return a comparison with:
- best_product_name: the name of the product you'd recommend overall, and why (grounded in the data)
- best_reason: 1-2 sentences explaining the pick using the actual numbers given
- notes: a JSON ARRAY with one object per product (same order as listed above), each object having
  exactly these string fields: name, packaging, carbon, price, health, recyclability - one short
  sentence per field, grounded in the metrics/certifications given, not invented. Example shape:
  "notes": [{{"name": "...", "packaging": "...", "carbon": "...", "price": "...", "health": "...", "recyclability": "..."}}, ...]
- overall_recommendation: 1-2 sentence summary comparing the tradeoffs across all products
"""
