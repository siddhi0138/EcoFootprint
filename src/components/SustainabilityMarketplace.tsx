import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Search, ShoppingCart, Star, Leaf, Award, Filter, Heart, Share2, Eye, TrendingUp, Download, BarChart3 } from 'lucide-react';
import { productsData, searchProducts, getProductsByCategory } from '@/data/productsData';
import { useUserData } from '@/contexts/UserDataContext';
import { useToast } from '@/hooks/use-toast';

const SustainabilityMarketplace = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('score');
  const [favorites, setFavorites] = useState([]);
  const [cart, setCart] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const { addPoints } = useUserData();
  const { toast } = useToast();

  // Get products based on search and filters
  const getFilteredProducts = () => {
    let products = productsData.slice(0, 100); // Show first 100 for performance
    
    if (searchQuery) {
      products = searchProducts(searchQuery).slice(0, 100);
    }
    
    if (selectedCategory !== 'all') {
      products = products.filter(product => product.category === selectedCategory);
    }
    
    return products.sort((a, b) => {
      switch (sortBy) {
        case 'price-low': return a.price - b.price;
        case 'price-high': return b.price - a.price;
        case 'rating': return b.rating - a.rating;
        case 'score': return b.sustainabilityScore - a.sustainabilityScore;
        default: return 0;
      }
    });
  };

  const filteredProducts = getFilteredProducts();

  const categories = [
    { id: 'all', label: 'All Products', icon: ShoppingCart, count: productsData.length },
    { id: 'personal-care', label: 'Personal Care', icon: Star, count: getProductsByCategory('personal-care').length },
    { id: 'food-beverage', label: 'Food & Beverage', icon: Award, count: getProductsByCategory('food-beverage').length },
    { id: 'electronics', label: 'Electronics', icon: Leaf, count: getProductsByCategory('electronics').length },
    { id: 'clothing', label: 'Clothing', icon: Search, count: getProductsByCategory('clothing').length },
    { id: 'home-garden', label: 'Home & Garden', icon: Heart, count: getProductsByCategory('home-garden').length }
  ];

  const toggleFavorite = (productId) => {
    setFavorites(prev => {
      const newFavorites = prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId];
      
      if (!prev.includes(productId)) {
        addPoints(5);
        toast({
          title: "Product Favorited!",
          description: "You earned 5 points for favoriting a product!",
        });
      }
      
      return newFavorites;
    });
  };

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      let newCart;
      if (existing) {
        newCart = prev.map(item => 
          item.id === product.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        newCart = [...prev, { ...product, quantity: 1 }];
        addPoints(10);
        toast({
          title: "Added to Cart!",
          description: `${product.name} added to cart. You earned 10 points!`,
        });
      }
      return newCart;
    });
  };

  const shareProduct = (product) => {
    const shareText = `Check out this sustainable product: ${product.name} by ${product.brand} - Sustainability Score: ${product.sustainabilityScore}`;
    
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: shareText,
        url: window.location.href
      }).then(() => {
        addPoints(5);
        toast({
          title: "Product Shared!",
          description: "You earned 5 points for sharing!",
        });
      }).catch(() => {
        fallbackShare(shareText);
      });
    } else {
      fallbackShare(shareText);
    }
  };

  const fallbackShare = (text) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        addPoints(5);
        toast({
          title: "Product Shared!",
          description: "Product link copied to clipboard! You earned 5 points!",
        });
      });
    }
  };

  const downloadReport = (product) => {
    const report = `
SUSTAINABILITY REPORT
Product: ${product.name}
Brand: ${product.brand}
Sustainability Score: ${product.sustainabilityScore}/100

ENVIRONMENTAL IMPACT:
${product.detailedAnalysis?.environmentalImpact || 'No detailed analysis available'}

SOCIAL IMPACT:
${product.detailedAnalysis?.socialImpact || 'No detailed analysis available'}

ECONOMIC IMPACT:
${product.detailedAnalysis?.economicImpact || 'No detailed analysis available'}

Carbon Footprint: ${product.carbonFootprint?.total || 'N/A'}
Water Usage: ${product.waterUsage || 'N/A'}
Energy Source: ${product.energySource || 'N/A'}
Materials: ${product.materials?.join(', ') || 'N/A'}
Certifications: ${product.certifications?.join(', ') || 'N/A'}
    `;
    
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${product.name.replace(/[^a-zA-Z0-9]/g, '_')}_sustainability_report.txt`;
    a.click();
    URL.revokeObjectURL(url);
    
    addPoints(15);
    toast({
      title: "Report Downloaded!",
      description: "You earned 15 points for downloading a sustainability report!",
    });
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'bg-emerald-500 text-white';
    if (score >= 80) return 'bg-green-500 text-white';
    if (score >= 70) return 'bg-yellow-500 text-white';
    return 'bg-orange-500 text-white';
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ShoppingCart className="w-6 h-6 text-green-600" />
              <span>Sustainability Marketplace</span>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className="bg-green-600 text-white">
                {filteredProducts.length} Products
              </Badge>
              <Badge variant="outline" className="border-blue-300 text-blue-700">
                {cart.length} in Cart
              </Badge>
            </div>
          </CardTitle>
          <p className="text-gray-600">Discover and purchase eco-friendly alternatives that make a difference</p>
        </CardHeader>
        <CardContent>
          {/* Search and Filters */}
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search sustainable products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm"
              >
                <option value="score">Best Score</option>
                <option value="rating">Highest Rated</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
              <Button variant="outline" className="flex items-center space-x-2">
                <Filter className="w-4 h-4" />
                <span>More Filters</span>
              </Button>
            </div>
          </div>

          {/* Category Tabs */}
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="mb-6">
            <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
              {categories.map((category) => (
                <TabsTrigger key={category.id} value={category.id} className="flex flex-col items-center space-y-1 text-xs">
                  <category.icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{category.label}</span>
                  <Badge variant="outline" className="text-xs px-1">{category.count}</Badge>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden">
                {/* Product Image */}
                <div className="relative overflow-hidden h-48 bg-gray-100">
                  <img 
                    src={`https://images.unsplash.com/${product.image}?w=400&h=300&fit=crop`}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop';
                    }}
                  />
                  
                  {/* Badges */}
                  <div className="absolute top-2 left-2 flex flex-col gap-1">
                    <Badge className={getScoreColor(product.sustainabilityScore)}>
                      {product.sustainabilityScore}
                    </Badge>
                    {!product.inStock && (
                      <Badge variant="destructive" className="text-xs">Out of Stock</Badge>
                    )}
                    {product.fastShipping && product.inStock && (
                      <Badge className="bg-blue-500 text-white text-xs">Fast Ship</Badge>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="absolute top-2 right-2 flex flex-col gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-8 h-8 p-0 bg-white/90 hover:bg-white"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(product.id);
                      }}
                    >
                      <Heart className={`w-4 h-4 ${favorites.includes(product.id) ? 'fill-red-500 text-red-500' : 'text-gray-500'}`} />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-8 h-8 p-0 bg-white/90 hover:bg-white"
                      onClick={(e) => {
                        e.stopPropagation();
                        shareProduct(product);
                      }}
                    >
                      <Share2 className="w-4 h-4 text-gray-500" />
                    </Button>
                  </div>
                </div>

                <CardContent className="p-4">
                  <div className="space-y-3">
                    {/* Product Info */}
                    <div>
                      <h3 className="font-semibold text-lg group-hover:text-green-600 transition-colors line-clamp-2">
                        {product.name}
                      </h3>
                      <p className="text-sm text-gray-600">{product.brand}</p>
                      <p className="text-xs text-gray-500 mt-1">Made in {product.origin}</p>
                    </div>

                    {/* Rating */}
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-600">({product.reviews})</span>
                    </div>

                    {/* Features */}
                    <div className="flex flex-wrap gap-1">
                      {product.features?.slice(0, 3).map((feature, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                      {product.features?.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{product.features.length - 3} more
                        </Badge>
                      )}
                    </div>

                    {/* Environmental Impact */}
                    <div className="bg-green-50 p-2 rounded-lg">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-green-700 font-medium">Environmental Impact:</span>
                        <span className="text-green-600">{product.co2Saved} CO₂ saved</span>
                      </div>
                    </div>

                    {/* Pricing */}
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-lg font-bold text-green-600">${product.price}</span>
                        {product.originalPrice > product.price && (
                          <span className="text-sm text-gray-500 line-through ml-2">${product.originalPrice}</span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">
                        {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% off
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                      <Button 
                        className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                        onClick={() => addToCart(product)}
                        disabled={!product.inStock}
                      >
                        {product.inStock ? (
                          <>
                            <ShoppingCart className="w-4 h-4 mr-2" />
                            Add to Cart
                          </>
                        ) : (
                          'Out of Stock'
                        )}
                      </Button>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" className="px-3" onClick={() => setSelectedProduct(product)}>
                            <Eye className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>{product.name}</DialogTitle>
                            <DialogDescription>
                              Detailed sustainability analysis and product information
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <img 
                                src={`https://images.unsplash.com/${product.image}?w=600&h=400&fit=crop`}
                                alt={product.name} 
                                className="w-full h-64 object-cover rounded-lg"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600&h=400&fit=crop';
                                }}
                              />
                              <div className="space-y-4">
                                <div>
                                  <h3 className="text-xl font-bold">{product.name}</h3>
                                  <p className="text-gray-600">{product.brand}</p>
                                  <Badge className={getScoreColor(product.sustainabilityScore)}>
                                    Score: {product.sustainabilityScore}
                                  </Badge>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <span className="text-2xl font-bold text-green-600">${product.price}</span>
                                  {product.originalPrice > product.price && (
                                    <span className="text-lg text-gray-500 line-through">${product.originalPrice}</span>
                                  )}
                                </div>
                                <p className="text-gray-700">{product.description}</p>
                              </div>
                            </div>
                            
                            {product.detailedAnalysis && (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                  <h4 className="font-semibold mb-2">Environmental Impact</h4>
                                  <p className="text-sm text-gray-600">{product.detailedAnalysis.environmentalImpact}</p>
                                </div>
                                <div>
                                  <h4 className="font-semibold mb-2">Social Impact</h4>
                                  <p className="text-sm text-gray-600">{product.detailedAnalysis.socialImpact}</p>
                                </div>
                              </div>
                            )}
                            
                            {product.carbonFootprint && (
                              <div>
                                <h4 className="font-semibold mb-2">Carbon Footprint</h4>
                                <div className="grid grid-cols-3 gap-4 text-sm">
                                  <div>Production: {product.carbonFootprint.production}</div>
                                  <div>Transport: {product.carbonFootprint.transport}</div>
                                  <div>Total: {product.carbonFootprint.total}</div>
                                </div>
                              </div>
                            )}
                            
                            <div className="flex gap-2">
                              <Button 
                                className="flex-1"
                                onClick={() => addToCart(product)}
                                disabled={!product.inStock}
                              >
                                <ShoppingCart className="w-4 h-4 mr-2" />
                                Add to Cart
                              </Button>
                              <Button variant="outline" onClick={() => downloadReport(product)}>
                                <Download className="w-4 h-4 mr-2" />
                                Report
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <Search className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No products found</h3>
              <p className="text-gray-500">Try adjusting your search or filters</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SustainabilityMarketplace;
