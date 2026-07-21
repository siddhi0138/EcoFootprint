import { api } from './api';

export interface ProductNote {
  name: string;
  packaging: string;
  carbon: string;
  price: string;
  health: string;
  recyclability: string;
}

export interface CompareResult {
  best_product_name: string;
  best_reason: string;
  notes: ProductNote[];
  overall_recommendation: string;
}

export interface CompareResponse {
  result: CompareResult;
  is_estimated: boolean;
}

export function compareProducts(products: unknown[]) {
  return api.post<CompareResponse>('/api/product/compare', { products });
}
