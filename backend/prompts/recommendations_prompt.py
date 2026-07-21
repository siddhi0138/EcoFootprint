def build_recommendations_prompt(user_summary: dict) -> str:
    return f"""You are EcoGuide, a sustainability coaching assistant. Based on this real user activity
summary, generate 3-5 personalized, actionable sustainability recommendations. Ground each
recommendation in the specific data given (their scan history, categories, carbon tracking habits) -
never invent statistics about the user that aren't implied by this data.

User activity summary:
{user_summary}

For each recommendation return:
- title: short actionable title
- description: 1-2 sentence explanation grounded in their actual activity
- category: one of "Products", "Habits", "Carbon", "Goals"
- impact: "High", "Medium", or "Low"
- priority: "high", "medium", or "low"
- difficulty: "Easy", "Medium", or "Hard"
- timeToImplement: short estimate like "1 week"
- carbonSaving: short estimate like "~2 kg CO2/month" (say "Varies" if you can't estimate honestly)
- confidence: 0-100, how confident you are this recommendation fits this specific user
"""
