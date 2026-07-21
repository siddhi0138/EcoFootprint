import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  X, 
  Search, 
  ArrowUpDown, 
  CheckCircle, 
  AlertCircle,
  Zap,
  Droplets,
  Leaf,
  Trash2,
  Heart,
  Sparkles,
  Lightbulb,
  Star,
  ShoppingCart,
  TrendingUp,
  Award
} from 'lucide-react';
import { useUserData } from '@/contexts/UserDataContext';
import { toast } from '@/hooks/use-toast';
import { useProductComparison } from '../contexts/ProductComparisonContext';
import { useNotificationHelperNew } from '@/hooks/useNotificationHelperNew';
import { compareProducts, type CompareResult } from '../services/compareApi';

interface ScannedProduct {
  id: string;
  date: string;
  name: string;
  brand: string;
  sustainabilityScore: number;
  category: string;
  price?: number;
  metrics?: {
    carbon: number;
    water: number;
    waste: number;
    energy: number;
    ethics: number;
  };
  image?: string;
  certifications?: string[];
  pros?: string[];
  cons?: string[];
  rating?: number;
  reviews?: number;
  inStock?: boolean;
  features?: string[];
}

const ProductComparison = () => {
  const { addScannedProduct, addPoints } = useUserData();
  const { comparisonProducts, addProductToComparison, removeProductFromComparison, clearComparison } = useProductComparison();
  const { addPurchaseNotification } = useNotificationHelperNew();

  const typedComparisonProducts = comparisonProducts as ScannedProduct[];

  const [isLoading, setIsLoading] = useState(false);
  const [sortBy, setSortBy] = useState('score');
  const [compareResult, setCompareResult] = useState<CompareResult | null>(null);
  const [isLoadingCompare, setIsLoadingCompare] = useState(false);
  const [compareEstimated, setCompareEstimated] = useState(false);

  useEffect(() => {
    if (typedComparisonProducts.length < 2) {
      setCompareResult(null);
      return;
    }
    let cancelled = false;
    setIsLoadingCompare(true);
    compareProducts(typedComparisonProducts.map(p => ({
      name: p.name,
      brand: p.brand,
      sustainabilityScore: p.sustainabilityScore,
      price: p.price,
      category: p.category,
      metrics: p.metrics,
      certifications: p.certifications,
    })))
      .then(({ result, is_estimated }) => {
        if (cancelled) return;
        setCompareResult(result);
        setCompareEstimated(is_estimated);
      })
      .catch((err) => {
        console.error('Failed to fetch AI comparison:', err);
      })
      .finally(() => {
        if (!cancelled) setIsLoadingCompare(false);
      });
    return () => { cancelled = true; };
  }, [typedComparisonProducts]);

  const removeProduct = (productId) => {
    removeProductFromComparison(productId);
    toast({
      title: "Product Removed",
      description: "Product has been removed from comparison.",
    });
  };

  const sortProducts = (products) => {
    switch (sortBy) {
      case 'price':
        return [...products].sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
      case 'rating':
        return [...products].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
      case 'score':
      default:
        return [...products].sort((a, b) => (b.sustainabilityScore ?? 0) - (a.sustainabilityScore ?? 0));
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  // Products added from the Marketplace/Scanner carry real per-metric scores but usually no
  // explicit pros/cons list - derive them from the strongest/weakest metrics so the Pros/Cons
  // sections always have real, product-specific content instead of empty headers.
  const METRIC_LABELS: Record<string, string> = {
    carbon: 'carbon footprint',
    water: 'water usage',
    waste: 'waste & packaging',
    energy: 'energy use',
    ethics: 'ethics & sourcing',
  };
  // Per-metric context so pros/cons read as real explanations instead of a bare "72/100" score.
  const METRIC_STRONG_DETAIL: Record<string, string> = {
    carbon: 'Low emissions across production and transport compared to typical products in this category.',
    water: 'Efficient water use in sourcing and manufacturing.',
    waste: 'Minimal, recyclable, or reduced packaging.',
    energy: 'Manufactured or powered using efficient/renewable energy.',
    ethics: 'Verified ethical sourcing and fair labor practices.',
  };
  const METRIC_WEAK_DETAIL: Record<string, string> = {
    carbon: 'Higher-than-average carbon footprint from production or shipping.',
    water: 'Water-intensive sourcing or manufacturing process.',
    waste: 'Packaging is heavy, non-recyclable, or excessive.',
    energy: 'Relies on energy-intensive manufacturing with limited renewable input.',
    ethics: 'Sourcing/labor practices are not well verified or documented.',
  };
  const getPros = (product) => {
    if (product.pros?.length) return product.pros;
    const m = product.metrics || {};
    const pros = Object.entries(m)
      .filter(([, v]) => typeof v === 'number' && (v as number) >= 60)
      .sort((a, b) => (b[1] as number) - (a[1] as number))
      .slice(0, 3)
      .map(([k, v]) => `Strong ${METRIC_LABELS[k] || k} (${v}/100) — ${METRIC_STRONG_DETAIL[k] || 'Performs well on this metric.'}`);
    if (product.certifications?.length) {
      pros.push(`Certified: ${product.certifications.slice(0, 3).join(', ')} — third-party verified sustainability claims.`);
    }
    if ((product.sustainabilityScore ?? 0) >= 80) {
      pros.push(`Top-tier overall sustainability score (${product.sustainabilityScore}/100), ranking among the most eco-friendly options compared.`);
    }
    return pros;
  };
  const getCons = (product) => {
    if (product.cons?.length) return product.cons;
    const m = product.metrics || {};
    const cons = Object.entries(m)
      .filter(([, v]) => typeof v === 'number' && (v as number) < 50)
      .sort((a, b) => (a[1] as number) - (b[1] as number))
      .slice(0, 3)
      .map(([k, v]) => `Weak ${METRIC_LABELS[k] || k} (${v}/100) — ${METRIC_WEAK_DETAIL[k] || 'Underperforms on this metric.'}`);
    if (!product.certifications?.length) {
      cons.push('No recognized sustainability certifications found for this product.');
    }
    if ((product.sustainabilityScore ?? 0) < 50) {
      cons.push(`Below-average overall sustainability score (${product.sustainabilityScore}/100) — consider one of the alternatives above.`);
    }
    return cons;
  };

  const getScoreBg = (score) => {
    if (score >= 80) return 'bg-green-100 dark:bg-green-900 border-green-200 dark:border-green-700';
    if (score >= 60) return 'bg-yellow-100 dark:bg-yellow-900 border-yellow-200 dark:border-yellow-700';
    return 'bg-red-100 dark:bg-red-900 border-red-200 dark:border-red-700';
  };

  const metricIcons = {
    carbon: Leaf,
    water: Droplets,
    waste: Trash2,
    energy: Zap,
    ethics: Heart
  };

  const metricLabels = {
    carbon: 'Carbon',
    water: 'Water',
    waste: 'Waste',
    energy: 'Energy',
    ethics: 'Ethics'
  };

  const bestProduct = typedComparisonProducts.reduce((best, current) => 
    (current.sustainabilityScore ?? 0) > (best?.sustainabilityScore ?? 0) ? current : best, null
  );

  const avgScore: number = typedComparisonProducts.length > 0 
    ? Math.round(typedComparisonProducts.reduce((acc, p) => acc + (p.sustainabilityScore ?? 0), 0) / typedComparisonProducts.length)
    : 0;

  const priceRange: {min: number, max: number} = typedComparisonProducts.length > 0 
    ? {
        min: Math.min(...typedComparisonProducts.map(p => Number(p.price ?? 0))),
        max: Math.max(...typedComparisonProducts.map(p => Number(p.price ?? 0)))
      }
    : { min: 0, max: 0 };

  return (
    <div className="space-y-6">
      <Card className="bg-white border border-slate-200 shadow-lg rounded-2xl dark:bg-slate-900 dark:border-slate-700">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center space-x-3 text-slate-800 dark:text-slate-200">
            <div className="w-10 h-10 bg-emerald-600 dark:bg-emerald-600 rounded-xl flex items-center justify-center">
              <ArrowUpDown className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <span className="text-xl font-bold">Smart Product Comparison</span>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 font-normal">Compare sustainability scores and make informed choices</p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="border-slate-300 text-slate-700 bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:bg-slate-800">
                <Sparkles className="w-4 h-4 mr-1" />
                AI Enhanced
              </Badge>
              {comparisonProducts.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearComparison}
                  className="rounded-xl border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900"
                >
                  Clear All
                </Button>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <Tabs defaultValue="compare" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-slate-100 dark:bg-slate-800 rounded-2xl p-1">
              <TabsTrigger value="compare" className="rounded-xl">Compare</TabsTrigger>
              <TabsTrigger value="insights" className="rounded-xl">AI Insights</TabsTrigger>
            </TabsList>

            <TabsContent value="compare" className="mt-6">
              {comparisonProducts.length > 0 ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="text-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900 dark:to-green-800 rounded-2xl border border-green-200/50 dark:border-green-700/50">
                      <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                        {bestProduct?.sustainabilityScore || 0}
                      </div>
                      <div className="text-sm text-green-600 dark:text-green-400">Highest Score</div>
                      {bestProduct && (
                        <div className="text-xs text-green-500 dark:text-green-400 mt-1">{bestProduct.name}</div>
                      )}
                    </div>
                    <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900 dark:to-blue-800 rounded-2xl border border-blue-200/50 dark:border-blue-700/50">
                      <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                        {comparisonProducts.length}
                      </div>
                      <div className="text-sm text-blue-600 dark:text-blue-400">Products</div>
                      <div className="text-xs text-blue-500 dark:text-blue-400 mt-1">Compared</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900 dark:to-pink-900 rounded-2xl border border-purple-200/50 dark:border-purple-700/50">
                      <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                        {avgScore}
                      </div>
                      <div className="text-sm text-purple-600 dark:text-purple-400">Average Score</div>
                      <div className="text-xs text-purple-500 dark:text-purple-400 mt-1">Sustainability</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900 dark:to-red-900 rounded-2xl border border-orange-200/50 dark:border-orange-700/50">
                      <div className="text-2xl font-bold text-orange-700 dark:text-orange-300">
                        ${priceRange.min}-${priceRange.max}
                      </div>
                      <div className="text-sm text-orange-600 dark:text-orange-400">Price Range</div>
                      <div className="text-xs text-orange-500 dark:text-orange-400 mt-1">USD</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Product Comparison</h3>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Sort by:</span>
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="px-3 py-1 border border-slate-300 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200"
                      >
                        <option value="score">Sustainability Score</option>
                        <option value="price">Price</option>
                        <option value="rating">Rating</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sortProducts(comparisonProducts).map((product) => (
                      <Card key={product.id} className={`relative border-2 hover:border-purple-300 transition-all duration-200 rounded-2xl overflow-hidden shadow-lg ${
                        bestProduct?.id === product.id ? 'border-green-400 ring-2 ring-green-200' : 'border-slate-200 dark:border-slate-700'
                      }`}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute top-2 right-2 h-8 w-8 p-0 rounded-full bg-white/80 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-900 z-10"
                          onClick={() => removeProduct(product.id)}
                        >
                          <X className="w-4 h-4 text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400" />
                        </Button>

                        {bestProduct?.id === product.id && (
                          <div className="absolute top-2 left-2 z-10">
                            <Badge className="bg-green-600 text-white">
                              <Award className="w-3 h-3 mr-1" />
                              Best Choice
                            </Badge>
                          </div>
                        )}

                        <div className="aspect-video relative overflow-hidden">
                          <img 
                            src={product.image} 
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                          {product.inStock && (
                            <Badge className="absolute bottom-2 left-2 bg-green-600 text-white">
                              In Stock
                            </Badge>
                          )}
                          <div className="absolute bottom-2 right-2">
                            <Badge className={`${getScoreBg(product.sustainabilityScore)} text-slate-800 dark:text-slate-200 border-0 font-bold`}>
                              {product.sustainabilityScore}
                            </Badge>
                          </div>
                        </div>

                        <CardContent className="p-6 space-y-4">
                          <div className="text-center">
                            <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200">{product.name}</h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400">{product.brand}</p>
                            <p className="text-xl font-bold text-purple-600 dark:text-purple-400 mt-2">${product.price}</p>
                            <div className="flex items-center justify-center space-x-2 mt-1">
                              <div className="flex text-yellow-400">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'fill-current' : 'fill-slate-200'}`}
                                  />
                                ))}
                              </div>
                              <span className="text-sm text-slate-500 dark:text-slate-400">({product.reviews})</span>
                            </div>
                          </div>

                          <div className="text-center">
                            <div className={`text-4xl font-bold mb-2 ${getScoreColor(product.sustainabilityScore)}`}>
                              {product.sustainabilityScore}
                            </div>
                            <Badge className={`${getScoreBg(product.sustainabilityScore)} text-slate-800 dark:text-slate-200 border-0`}>
                              {product.sustainabilityScore >= 80 ? 'Excellent' : product.sustainabilityScore >= 60 ? 'Good' : 'Poor'}
                            </Badge>
                          </div>

                          <div className="space-y-3">
                            {Object.entries(product.metrics || {}).map(([key, value]) => {
                              const Icon = metricIcons[key];
                              const numericValue = typeof value === 'number' ? value : 0;
                              const clampedValue = Math.max(0, Math.min(100, numericValue));
                              return (
                                <div key={key} className="flex items-center justify-between">
                                  <div className="flex items-center space-x-2">
                                    <div className="w-8 h-8 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center">
                                      <Icon className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                                    </div>
                                    <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{metricLabels[key]}</span>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <div className="w-20 bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                                      <div 
                                        className={`h-2 rounded-full ${clampedValue >= 80 ? 'bg-green-500' : clampedValue >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                        style={{ width: `${clampedValue}%` }}
                                      ></div>
                                    </div>
                                    <span className="text-sm font-bold w-8 text-right text-slate-800 dark:text-slate-200">{clampedValue}</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {product.certifications && product.certifications.length > 0 && (
                            <div>
                              <p className="text-sm font-medium mb-2 text-slate-800 dark:text-slate-200">Certifications</p>
                              <div className="flex flex-wrap gap-1">
                                {product.certifications.map((cert, index) => (
                                  <Badge key={index} variant="outline" className="text-xs border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-200">
                                    {cert}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="space-y-3">
                            <div>
                              <p className="text-sm font-medium text-green-700 dark:text-green-400 mb-2 flex items-center">
                                <CheckCircle className="w-4 h-4 mr-1 min-w-[1rem]" />
                                Pros
                              </p>
                              {getPros(product).slice(0, 5).map((pro, index) => (
                                <div key={index} className="flex items-start space-x-2 mb-1 text-slate-700 dark:text-slate-300">
                                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2"></div>
                                  <span className="text-xs">{pro}</span>
                                </div>
                              ))}
                              {getPros(product).length === 0 && (
                                <span className="text-xs text-slate-400 dark:text-slate-500">No standout strengths</span>
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-red-700 dark:text-red-400 mb-2 flex items-center">
                                <AlertCircle className="w-4 h-4 mr-1 min-w-[1rem]" />
                                Cons
                              </p>
                              {getCons(product).slice(0, 5).map((con, index) => (
                                <div key={index} className="flex items-start space-x-2 mb-1 text-slate-700 dark:text-slate-300">
                                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2"></div>
                                  <span className="text-xs">{con}</span>
                                </div>
                              ))}
                              {getCons(product).length === 0 && (
                                <span className="text-xs text-slate-400 dark:text-slate-500">No major weaknesses</span>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ) : (
                <Card className="border-dashed border-2 border-slate-300 dark:border-slate-700 rounded-2xl">
                  <CardContent className="text-center py-12">
                    <ArrowUpDown className="w-16 h-16 text-slate-400 dark:text-slate-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-slate-600 dark:text-slate-400 mb-2">No Products to Compare</h3>
                    <p className="text-slate-500 dark:text-slate-400 mb-2">
                      Browse the Marketplace and tap <span className="font-semibold">Compare</span> on any product to add it here.
                    </p>
                    <p className="text-slate-500 dark:text-slate-400">
                      You can also compare items straight from the AI Scanner after a scan.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="insights" className="mt-6">
              <div className="space-y-6">
                <Card className="border-purple-200 dark:border-purple-700 rounded-2xl">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between text-slate-800 dark:text-slate-200">
                      <div className="flex items-center space-x-2">
                        <Lightbulb className="w-5 h-5 text-amber-500 dark:text-amber-400" />
                        <span>AI Comparison Insights</span>
                      </div>
                      {compareResult && (
                        <Badge variant="outline" className="text-xs">
                          {compareEstimated ? 'Estimated' : 'Live Data'}
                        </Badge>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {typedComparisonProducts.length > 1 ? (
                      isLoadingCompare && !compareResult ? (
                        <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                          Generating AI comparison...
                        </div>
                      ) : compareResult ? (
                        <>
                          <div className="p-4 bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-xl">
                            <div className="flex items-start space-x-3">
                              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
                              <div>
                                <p className="font-medium text-green-800 dark:text-green-300">Best Overall Choice: {compareResult.best_product_name}</p>
                                <p className="text-sm text-green-700 dark:text-green-400 mt-1">{compareResult.best_reason}</p>
                              </div>
                            </div>
                          </div>

                          <div className="p-4 bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-xl">
                            <div className="flex items-start space-x-3">
                              <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                              <div>
                                <p className="font-medium text-blue-800 dark:text-blue-300">Overall Recommendation</p>
                                <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">{compareResult.overall_recommendation}</p>
                              </div>
                            </div>
                          </div>

                          <div className="p-4 bg-purple-50 dark:bg-purple-900 border border-purple-200 dark:border-purple-700 rounded-xl space-y-3">
                            <p className="font-medium text-purple-800 dark:text-purple-300 flex items-center space-x-2">
                              <Star className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                              <span>Per-Product Breakdown</span>
                            </p>
                            {compareResult.notes.map((note) => (
                              <div key={note.name} className="text-sm text-purple-700 dark:text-purple-400 border-t border-purple-200 dark:border-purple-700 pt-2 first:border-t-0 first:pt-0">
                                <p className="font-medium">{note.name}</p>
                                <p>Packaging: {note.packaging}</p>
                                <p>Carbon: {note.carbon}</p>
                                <p>Price: {note.price}</p>
                                <p>Health: {note.health}</p>
                                <p>Recyclability: {note.recyclability}</p>
                              </div>
                            ))}
                          </div>
                        </>
                      ) : (
                        <div className="text-center py-8">
                          <Lightbulb className="w-12 h-12 text-slate-400 dark:text-slate-500 mx-auto mb-3" />
                          <p className="text-slate-500 dark:text-slate-400">Couldn't load AI comparison insights. Please try again.</p>
                        </div>
                      )
                    ) : (
                      <div className="text-center py-8">
                        <Lightbulb className="w-12 h-12 text-slate-400 dark:text-slate-500 mx-auto mb-3" />
                        <p className="text-slate-500 dark:text-slate-400">Add more products to see AI-powered comparison insights.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductComparison;
