
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
import { getRandomProducts, searchProducts } from '@/data/productsData';
import { useUserData } from '@/contexts/UserDataContext';
import { toast } from '@/hooks/use-toast';

// Define the type for a product used in comparison
interface ScannedProduct {
  id: string; // Add id
  date: string; // Add date
  name: string;
  brand: string;
  sustainabilityScore: number;
  category: string;
  price?: number;
  metrics?: { // Add metrics property
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
import { useProductComparison } from '../contexts/ProductComparisonContext';

const ProductComparison = () => {
  const { addScannedProduct, addPoints } = useUserData();
  const { comparisonProducts, addProductToComparison, clearComparison } = useProductComparison();

  // Explicitly type comparisonProducts as ScannedProduct[]
  const typedComparisonProducts = comparisonProducts as ScannedProduct[];

  const [searchQuery, setSearchQuery] = useState('');
  const [availableProducts, setAvailableProducts] = useState(() => getRandomProducts(8));
  const [isLoading, setIsLoading] = useState(false);
  const [sortBy, setSortBy] = useState('score'); // score, price, rating

  const removeProduct = (productId) => {
    const updated = comparisonProducts.filter(p => p.id !== productId);
    clearComparison();
    updated.forEach(p => addProductToComparison(p));
    toast({
      title: "Product Removed",
      description: "Product has been removed from comparison.",
    });
  };

  const addProduct = (product) => {
    if (comparisonProducts.length >= 10) {
      toast({
        title: "Maximum Reached",
        description: "You can compare up to 10 products at a time.",
        variant: "destructive"
      });
      return;
    }

    // Check if product already exists
    if (comparisonProducts.find(cp => cp.id === String(product.id))) {
      toast({
        title: "Already Added",
        description: "This product is already in your comparison.",
        variant: "destructive"
      });
      return;
    }

    const score = typeof product.sustainabilityScore === 'number' ? product.sustainabilityScore : 0;

    const fullProduct = {
      id: product.id,
      name: product.name,
      brand: product.brand,
      price: product.price,
      sustainabilityScore: score,
      metrics: {
        carbon: Math.floor(score * 0.9 + Math.random() * 10 - 5),
        water: Math.floor(score * 0.95 + Math.random() * 10 - 5),
        waste: Math.floor(score * 0.85 + Math.random() * 10 - 5),
        energy: Math.floor(score * 0.92 + Math.random() * 10 - 5),
        ethics: Math.floor(score * 1.05 + Math.random() * 10 - 5)
      },
      image: product.image,
      certifications: product.certifications.slice(0, 3),
      pros: [
        product.vegan ? 'Vegan friendly' : 'Quality materials',
        product.packaging.recyclable ? 'Recyclable packaging' : 'Durable design',
        'Good sustainability score'
      ],
      cons: [
        product.price > 50 ? 'Higher price point' : 'Limited color options',
        'Consider shipping impact'
      ],
      rating: product.rating,
      reviews: product.reviews,
      inStock: product.inStock,
      features: product.features,
      category: product.category
    };
    
    addProductToComparison(fullProduct);
    
    // Add to user data for tracking
    // Ensure the object conforms to the ScannedProduct type

    addScannedProduct({
      id: product.id, // Provide a unique ID
      date: new Date().toISOString(), // Provide the current date
      name: product.name,
      brand: product.brand,
      sustainabilityScore: score, // Use local score variable
      category: product.category,
      price: product.price,
      metrics: {
        carbon: Math.floor(score * 0.9 + Math.random() * 10 - 5),
        water: Math.floor(score * 0.95 + Math.random() * 10 - 5),
        waste: Math.floor(score * 0.85 + Math.random() * 10 - 5),
        energy: Math.floor(score * 0.92 + Math.random() * 10 - 5),
        ethics: Math.floor(score * 1.05 + Math.random() * 10 - 5)
      },
      image: product.image,
      certifications: product.certifications.slice(0, 3),
      pros: [
        product.vegan ? 'Vegan friendly' : 'Quality materials',
        product.packaging.recyclable ? 'Recyclable packaging' : 'Durable design',
        'Good sustainability score'
      ],
      cons: [
        product.price > 50 ? 'Higher price point' : 'Limited color options',
        'Consider shipping impact'
      ],
      rating: product.rating,
      reviews: product.reviews,
      inStock: product.inStock,
      features: product.features,
      source: 'ProductComparison'
    });
    
    addPoints(5); // Award points for adding products to comparison
    
    toast({
      title: "Product Added",
      description: `${product.name} has been added to comparison (+5 points!)`,
    });
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setAvailableProducts(getRandomProducts(8));
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      const results = searchProducts(searchQuery);
      setAvailableProducts(results.slice(0, 12));
      
      toast({
        title: "Search Complete",
        description: `Found ${results.length} products matching "${searchQuery}"`,
      });
    } catch (error) {
      toast({
        title: "Search Failed",
        description: "Unable to search products. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Remove local clearComparison function to avoid redeclaration error
  // Use clearComparison from context instead

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
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBg = (score) => {
    if (score >= 80) return 'bg-green-100 border-green-200';
    if (score >= 60) return 'bg-yellow-100 border-yellow-200';
    return 'bg-red-100 border-red-200';
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
      <Card className="bg-white/95 backdrop-blur-sm border-purple-200/50 shadow-xl rounded-3xl overflow-hidden">
        <CardHeader className="pb-6 bg-gradient-to-r from-purple-50 to-blue-50">
          <CardTitle className="flex items-center space-x-4 text-gray-800">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl shadow-lg">
              <ArrowUpDown className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <span className="text-2xl font-bold">Smart Product Comparison</span>
              <p className="text-sm text-gray-600 mt-1 font-normal">Compare sustainability scores and make informed choices</p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="bg-purple-100 text-purple-700 px-3 py-1 rounded-xl">
                <Sparkles className="w-4 h-4 mr-1" />
                AI Enhanced
              </Badge>
              {comparisonProducts.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearComparison}
                  className="rounded-xl border-red-300 text-red-600 hover:bg-red-50"
                >
                  Clear All
                </Button>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <Tabs defaultValue="compare" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-gray-100 rounded-2xl p-1">
              <TabsTrigger value="compare" className="rounded-xl">Compare</TabsTrigger>
              <TabsTrigger value="search" className="rounded-xl">Add Products</TabsTrigger>
              <TabsTrigger value="insights" className="rounded-xl">AI Insights</TabsTrigger>
            </TabsList>

            <TabsContent value="compare" className="mt-6">
              {comparisonProducts.length > 0 ? (
                <div className="space-y-6">
                  {/* Comparison Overview */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="text-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-200/50">
                      <div className="text-2xl font-bold text-green-700">
                        {bestProduct?.sustainabilityScore || 0}
                      </div>
                      <div className="text-sm text-green-600">Highest Score</div>
                      {bestProduct && (
                        <div className="text-xs text-green-500 mt-1">{bestProduct.name}</div>
                      )}
                    </div>
                    <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200/50">
                      <div className="text-2xl font-bold text-blue-700">
                        {comparisonProducts.length}
                      </div>
                      <div className="text-sm text-blue-600">Products</div>
                      <div className="text-xs text-blue-500 mt-1">Compared</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-200/50">
                      <div className="text-2xl font-bold text-purple-700">
                        {avgScore}
                      </div>
                      <div className="text-sm text-purple-600">Average Score</div>
                      <div className="text-xs text-purple-500 mt-1">Sustainability</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl border border-orange-200/50">
                      <div className="text-2xl font-bold text-orange-700">
                        ${priceRange.min}-${priceRange.max}
                      </div>
                      <div className="text-sm text-orange-600">Price Range</div>
                      <div className="text-xs text-orange-500 mt-1">USD</div>
                    </div>
                  </div>

                  {/* Sort Options */}
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">Product Comparison</h3>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">Sort by:</span>
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="score">Sustainability Score</option>
                        <option value="price">Price</option>
                        <option value="rating">Rating</option>
                      </select>
                    </div>
                  </div>

                  {/* Product Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sortProducts(comparisonProducts).map((product, index) => (
                      <Card key={product.id} className={`relative border-2 hover:border-purple-300 transition-all duration-200 rounded-2xl overflow-hidden shadow-lg ${
                        bestProduct?.id === product.id ? 'border-green-400 ring-2 ring-green-200' : 'border-gray-200'
                      }`}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute top-2 right-2 h-8 w-8 p-0 rounded-full bg-white/80 hover:bg-red-100 z-10"
                          onClick={() => removeProduct(product.id)}
                        >
                          <X className="w-4 h-4 text-gray-600 hover:text-red-600" />
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
                            <Badge className={`${getScoreBg(product.sustainabilityScore)} text-gray-800 border-0 font-bold`}>
                              {product.sustainabilityScore}
                            </Badge>
                          </div>
                        </div>

                        <CardContent className="p-6 space-y-4">
                          <div className="text-center">
                            <h3 className="font-bold text-lg text-gray-800">{product.name}</h3>
                            <p className="text-sm text-gray-600">{product.brand}</p>
                            <p className="text-xl font-bold text-purple-600 mt-2">${product.price}</p>
                            <div className="flex items-center justify-center space-x-2 mt-1">
                              <div className="flex text-yellow-400">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'fill-current' : 'fill-gray-200'}`}
                                  />
                                ))}
                              </div>
                              <span className="text-sm text-gray-500">({product.reviews})</span>
                            </div>
                          </div>

                          <div className="text-center">
                            <div className={`text-4xl font-bold mb-2 ${getScoreColor(product.sustainabilityScore)}`}>
                              {product.sustainabilityScore}
                            </div>
                            <Badge className={`${getScoreBg(product.sustainabilityScore)} text-gray-800 border-0`}>
                              {product.sustainabilityScore >= 80 ? 'Excellent' : product.sustainabilityScore >= 60 ? 'Good' : 'Poor'}
                            </Badge>
                          </div>

                          {/* Enhanced Metrics */}
                          <div className="space-y-3">
                            {Object.entries(product.metrics || {}).map(([key, value]) => {
                              const Icon = metricIcons[key];
                              const numericValue = typeof value === 'number' ? value : 0;
                              const clampedValue = Math.max(0, Math.min(100, numericValue));
                              return (
                                <div key={key} className="flex items-center justify-between">
                                  <div className="flex items-center space-x-2">
                                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                                      <Icon className="w-4 h-4 text-gray-600" />
                                    </div>
                                    <span className="text-sm font-medium">{metricLabels[key]}</span>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <div className="w-20 bg-gray-200 rounded-full h-2">
                                      <div 
                                        className={`h-2 rounded-full ${clampedValue >= 80 ? 'bg-green-500' : clampedValue >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                        style={{ width: `${clampedValue}%` }}
                                      ></div>
                                    </div>
                                    <span className="text-sm font-bold w-8 text-right">{clampedValue}</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {/* Certifications */}
                          {product.certifications && product.certifications.length > 0 && (
                            <div>
                              <p className="text-sm font-medium mb-2">Certifications</p>
                              <div className="flex flex-wrap gap-1">
                                {product.certifications.map((cert, index) => (
                                  <Badge key={index} variant="outline" className="text-xs border-gray-300">
                                    {cert}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Pros and Cons */}
                          <div className="space-y-3">
                            <div>
                              <p className="text-sm font-medium text-green-700 mb-2 flex items-center">
                                <CheckCircle className="w-4 h-4 mr-1 min-w-[1rem]" />
                                Pros
                              </p>
                              {product.pros?.slice(0, 2).map((pro, index) => (
                                <div key={index} className="flex items-start space-x-2 mb-1">
                                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2"></div>
                                  <span className="text-xs text-gray-600">{pro}</span>
                                </div>
                              ))}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-red-700 mb-2 flex items-center">
                                <AlertCircle className="w-4 h-4 mr-1 min-w-[1rem]" />
                                Cons
                              </p>
                              {product.cons?.slice(0, 2).map((con, index) => (
                                <div key={index} className="flex items-start space-x-2 mb-1">
                                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2"></div>
                                  <span className="text-xs text-gray-600">{con}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Removed View Details button as per user request */}
                          {/* <div className="flex space-x-2 pt-2">
                            <Button className="flex-1 bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 rounded-xl">
                              <ShoppingCart className="w-4 h-4 mr-2" />
                              View Details
                            </Button>
                          </div> */}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ) : (
                <Card className="border-dashed border-2 border-gray-300 rounded-2xl">
                  <CardContent className="text-center py-12">
                    <ArrowUpDown className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-600 mb-2">No Products to Compare</h3>
                    <p className="text-gray-500 mb-6">Add products to start comparing their sustainability scores</p>
                    <Button 
                      onClick={() => {
                        const randomProducts = getRandomProducts(2);
                        randomProducts.forEach(product => addProduct(product));
                      }}
                      className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 rounded-xl"
                    >
                      Add Sample Products
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="search" className="mt-6">
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search for products to compare..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                      className="pl-10 border-gray-300 focus:border-purple-400 h-12 rounded-2xl"
                      disabled={isLoading}
                    />
                  </div>
                  <Button 
                    onClick={handleSearch} 
                    disabled={isLoading}
                    className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 rounded-xl px-6"
                  >
                    {isLoading ? 'Searching...' : 'Search'}
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    {availableProducts.length} products available • {comparisonProducts.length}/4 selected
                  </p>
                  {comparisonProducts.length >= 4 && (
                    <Badge variant="outline" className="text-amber-600 border-amber-300">
                      Maximum reached
                    </Badge>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {availableProducts
 .filter(product => !comparisonProducts.find(cp => cp.id === String(product.id))) // Ensure product.id is a string for comparison
                    .slice(0, 9)
                    .map((product) => (
                      <Card key={product.id} className="hover:shadow-lg transition-all duration-200 border border-gray-200 rounded-2xl overflow-hidden">
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-4">
                            <img 
                              src={product.image} 
                              alt={product.name}
                              className="w-16 h-16 object-cover rounded-xl"
                            />
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-gray-800 truncate">{product.name}</h3>
                              <p className="text-sm text-gray-600 truncate">{product.brand} • ${product.price}</p>
                              <div className="flex items-center space-x-2 mt-2">
                                <Badge className={`${getScoreBg(product.sustainabilityScore)} text-gray-800 border-0 text-xs`}>
                                  {product.sustainabilityScore}
                                </Badge>
                                <span className="text-xs text-gray-500">Score</span>
                                <div className="flex text-yellow-400">
                                  {[...Array(Math.floor(product.rating))].map((_, i) => (
                                    <Star key={i} className="w-3 h-3 fill-current" />
                                  ))}
                                </div>
                              </div>
                            </div>
                            <Button 
                              size="sm" 
                              onClick={() => addProduct(product)}
                              disabled={comparisonProducts.length >= 10}
                              className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 rounded-xl disabled:opacity-50"
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>

                {availableProducts.filter(product => !comparisonProducts.find(cp => cp.id === String(product.id))).length === 0 && (
                  <div className="text-center py-8">
                    <Search className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">No new products to add. All available products are already in your comparison.</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="insights" className="mt-6">
              <div className="space-y-6">
                <Card className="border-purple-200 rounded-2xl">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Lightbulb className="w-5 h-5 text-amber-500" />
                      <span>AI Comparison Insights</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {comparisonProducts.length > 1 ? (
                      <>
                        <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                          <div className="flex items-start space-x-3">
                            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                            <div>
                              <p className="font-medium text-green-800">Best Overall Choice</p>
                              <p className="text-sm text-green-700 mt-1">
                        {bestProduct?.name} scores highest with {bestProduct?.sustainabilityScore}/100, offering the best balance of sustainability and value.
                        {bestProduct && Number(bestProduct.price ?? 0) <= Number(avgScore) && " Plus, it's competitively priced!"}
                      </p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                          <div className="flex items-start space-x-3">
                            <TrendingUp className="w-5 h-5 text-blue-600 mt-0.5" />
                            <div>
                              <p className="font-medium text-blue-800">Market Analysis</p>
                              <p className="text-sm text-blue-700 mt-1">
                                Price range: ${priceRange.min} - ${priceRange.max}. 
                                Average sustainability score: {avgScore}/100. 
                                {(avgScore >= 75) ? "You're comparing high-quality sustainable products!" : "Consider looking for higher-rated alternatives."}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl">
                          <div className="flex items-start space-x-3">
                            <Star className="w-5 h-5 text-purple-600 mt-0.5" />
                            <div>
                              <p className="font-medium text-purple-800">Personalized Recommendation</p>
                              <p className="text-sm text-purple-700 mt-1">
                                Based on your comparison pattern, you value sustainability over price. 
                                {bestProduct && `${bestProduct.name} aligns perfectly with your preferences.`}
                                Consider checking for local availability to reduce shipping impact.
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Category breakdown */}
                        {comparisonProducts.length > 2 && (
                          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                            <div className="flex items-start space-x-3">
                              <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                              <div>
                                <p className="font-medium text-amber-800">Key Differences</p>
                                <div className="text-sm text-amber-700 mt-1 space-y-1">
                          <p>• Highest carbon efficiency: {
                          typedComparisonProducts.reduce((max, p) => 
                              (p.metrics?.carbon ?? 0) > (max.metrics?.carbon ?? 0) ? p : max
                            , typedComparisonProducts[0]).name
                          }</p>
                          <p>• Best water conservation: {
                          typedComparisonProducts.reduce((max, p) => 
                              (p.metrics?.water ?? 0) > (max.metrics?.water ?? 0) ? p : max
                            , typedComparisonProducts[0]).name
                          }</p>
                                <p>• Most affordable: {
                          typedComparisonProducts.length > 0 ? typedComparisonProducts.reduce((min, p) => Number(p.price ?? 0) < Number(min.price ?? 0) ? p : min, typedComparisonProducts[0]).name : 'N/A'
                          } (${typedComparisonProducts.length > 0 ? typedComparisonProducts.reduce((min, p) => Number(p.price ?? 0) < Number(min.price ?? 0) ? p : min, typedComparisonProducts[0]).price : 'N/A'})</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-center py-8">
                        <Lightbulb className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-500">Add more products to see AI-powered comparison insights.</p>
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
