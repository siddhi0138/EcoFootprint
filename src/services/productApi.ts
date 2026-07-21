import { api } from './api';

export interface EcoAnalysis {
  carbon_footprint: { score: number; explanation: string; estimated_kg_co2e?: number | null };
  packaging: { score: number; explanation: string; materials?: string[] | null; recyclable?: boolean | null };
  health_impact: { score: number; explanation: string; considerations?: string[] | null };
  sustainability_score: number;
  alternatives: { name: string; reason: string; estimated_score?: number | null }[];
  is_estimated: boolean;
}

export interface AnalyzeProductResponse {
  product: Record<string, any>;
  analysis: EcoAnalysis;
}

export function analyzeProduct(barcode: string) {
  return api.post<AnalyzeProductResponse>('/api/product/analyze', { barcode });
}

export interface ProductSearchResult {
  barcode: string | null;
  external_id: string | null;
  source: 'openfoodfacts' | 'ebay';
  name: string;
  brand: string | null;
  category: string | null;
  ecoscore_grade: string | null;
  nutriscore_grade: string | null;
  image_url: string | null;
  price: number | null;
  price_currency: string | null;
  item_url: string | null;
}

export interface ProductSearchResponse {
  query: string;
  results: ProductSearchResult[];
}

export function searchProducts(query: string) {
  return api.get<ProductSearchResponse>(`/api/product/search?query=${encodeURIComponent(query)}`);
}

export interface GeneralAnalyzeRequest {
  name: string;
  brand?: string | null;
  category?: string | null;
  description?: string | null;
  condition?: string | null;
}

// For non-food products (electronics, clothing, etc.) with no OpenFoodFacts barcode record -
// reasons from the product's text description instead of a database lookup.
export function analyzeGeneralProduct(req: GeneralAnalyzeRequest) {
  return api.post<EcoAnalysis>('/api/product/analyze-general', req);
}

export interface NutritionFacts {
  energy_kcal_100g: number | null;
  sugars_100g: number | null;
  fat_100g: number | null;
  salt_100g: number | null;
}

export interface MarketplaceProduct {
  barcode: string;
  name: string;
  brand: string | null;
  image_url: string | null;
  category: string | null;
  ecoscore_grade: string | null;
  nutriscore_grade: string | null;
  sustainability_score: number;
  labels: string[];
  ingredients_text: string | null;
  packaging: string | null;
  quantity: string | null;
  allergens: string | null;
  countries: string | null;
  nutrition: NutritionFacts | null;
  // Shopping fields from the DummyJSON catalog.
  price: number | null;
  price_currency: string | null;
  rating: number | null;
  stock: number | null;
  description: string | null;
  source?: string;
}

export interface CatalogCategory {
  id: string;
  label: string;
}

export function fetchCatalogCategories() {
  return api.get<{ categories: CatalogCategory[] }>('/api/product/categories');
}

export interface LifecycleStage {
  name: string;
  iconName: string;
  location: string;
  duration: string;
  status: string;
  impact: { co2: number; water: number; energy: number };
  details: string;
}

export function fetchProductLifecycle(req: {
  name: string;
  brand?: string | null;
  category?: string | null;
  sustainability_score?: number | null;
}) {
  return api.post<{ stages: LifecycleStage[] }>('/api/product/lifecycle', req);
}

export interface BrowseProductsResponse {
  query: string;
  products: MarketplaceProduct[];
  total: number;
  page: number;
  has_more: boolean;
}

export function browseProducts(query: string, page = 1, pageSize = 24) {
  return api.get<BrowseProductsResponse>(
    `/api/product/browse?query=${encodeURIComponent(query)}&page=${page}&page_size=${pageSize}`
  );
}

export function lookupProduct(barcode: string) {
  return api.get<MarketplaceProduct>(`/api/product/lookup?barcode=${encodeURIComponent(barcode)}`);
}
