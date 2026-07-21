import { api } from './api';

// Shape returned by the backend /api/recipes/search endpoint (real recipes from TheMealDB,
// with sustainability values derived from the ingredient list).
export interface ApiRecipe {
  id: number;
  name: string;
  image: string;
  sustainabilityScore: number;
  carbonFootprint: string;
  waterUsage: string;
  cookTime: string;
  servings: number;
  difficulty: string;
  tags: string[];
  ingredients: string[];
  instructions: string[];
  nutrition: { calories: number; protein: string; carbs: string; fat: string };
  category?: string;
  area?: string;
  youtube?: string;
  sustainability: { seasonal: boolean; local: boolean; organic: boolean; lowWaste: boolean };
}

interface RecipeSearchResponse {
  recipes: ApiRecipe[];
}

export function fetchRecipes(query = '') {
  const q = query.trim() ? `?q=${encodeURIComponent(query.trim())}` : '';
  return api.get<RecipeSearchResponse>(`/api/recipes/search${q}`);
}
