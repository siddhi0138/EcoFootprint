import { api } from './api';

export interface CarbonEstimate {
  category: string;
  amount: number;
  explanation: string;
}

export interface CarbonEstimateResponse {
  estimate: CarbonEstimate;
  is_estimated: boolean;
}

export function estimateCarbon(description: string) {
  return api.post<CarbonEstimateResponse>('/api/carbon/estimate', { description });
}
