import { api } from './api';

export interface RecommendationItem {
  title: string;
  description: string;
  category: string;
  impact: string;
  priority: string;
  difficulty: string;
  timeToImplement: string;
  carbonSaving: string;
  confidence: number;
}

export interface RecommendationsResponse {
  recommendations: RecommendationItem[];
  is_estimated: boolean;
}

export function fetchRecommendations(
  scannedProducts: readonly unknown[],
  carbonEntries: readonly unknown[],
  userStats: unknown
) {
  return api.post<RecommendationsResponse>('/api/recommendations', {
    scannedProducts,
    carbonEntries,
    userStats,
  });
}
