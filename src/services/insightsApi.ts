import { api } from './api';

export interface InsightTip {
  category: string;
  tip: string;
  confidence: number;
  explanation: string;
}

export interface InsightsResult {
  shopping_pattern_title: string;
  shopping_pattern_description: string;
  tips: InsightTip[];
}

export interface InsightsResponse {
  result: InsightsResult;
  is_estimated: boolean;
}

export function explainInsights(
  scannedProducts: readonly unknown[],
  carbonEntries: readonly unknown[],
  scoreTrend: number,
  carbonProgress: number
) {
  return api.post<InsightsResponse>('/api/insights/explain', {
    scannedProducts,
    carbonEntries,
    scoreTrend,
    carbonProgress,
  });
}
