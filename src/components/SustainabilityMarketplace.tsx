import React, { useState, useEffect } from 'react';
import { collection, getDocs, setDoc, query, where, deleteDoc, doc } from 'firebase/firestore';
import { useCart } from '../contexts/CartContext'; // Import useCart for cart context
import { useNotificationHelperNew } from '../hooks/useNotificationHelperNew';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Search, ShoppingCart, Star, Leaf, Award, Filter, Heart, Share2, Eye, TrendingUp, Download, BarChart3 } from 'lucide-react';
import { productsData, searchProducts, getProductsByCategory } from '@/data/productsData';
import { useUserData } from '/home/user/EcoFootprint/src/contexts/UserDataContext.tsx'; // Use absolute path
import { useToast } from '@/hooks/use-toast';
import { db } from '@/firebase'; // Import Firestore instance
import { useAuth } from '@/contexts/AuthContext'; // Import AuthContext

interface Product {
  id: number;
  name: string;
  brand: string;
  category: string;
  description: string;
  price: number;
  originalPrice: number;
  sustainabilityScore: number;
  rating: number;
  reviews: number;
  inStock: boolean;
  fastShipping: boolean;
  origin: string;
  features?: string[];
  co2Saved?: string;
  detailedAnalysis?: {
    environmentalImpact?: string;
    socialImpact?: string;
    economicImpact?: string;
  };
  carbonFootprint?: {
    production?: string;
    transport?: string;
    total?: string;
  };
  waterUsage?: string;
  energySource?: string;
  materials?: string[];
  certifications?: string[];
}

const SustainabilityMarketplace = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('score');
  const [favorites, setFavorites] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const { addPoints } = useUserData();
  const { toast } = useToast();
  const { currentUser } = useAuth(); // Get current user from AuthContext
  const { addToCart } = useCart();
  const { addPurchaseNotification } = useNotificationHelperNew();

  // Fetch marketplace data from Firestore on component mount
      useEffect(() => {
        const fetchMarketplaceData = async () => {
          if (currentUser) {
            const favoritesRef = collection(db, 'users', currentUser.uid, 'favorites'); // Corrected path
            const favoritesSnapshot = await getDocs(favoritesRef);
            const userFavorites = favoritesSnapshot.docs.map(doc => {
              console.log('Favorite doc id:', doc.id, 'productId:', doc.data().productId);
              return doc.data().productId;
            });
            setFavorites(userFavorites);
          }
        };

    fetchMarketplaceData();
  }, [currentUser]);

  // More specific image mapping based on product names and categories
  const getProductImage = (product: Product, size = '400x300') => {
    const imageMap = {
      // Personal Care
      'toothbrush': 'photo-1607613009820-a29f7bb81c04', // bamboo toothbrush
      'shampoo': 'photo-1571019613454-1cb2f99b2d8b', // shampoo bottles
      'body wash': 'photo-1596462502278-27bfdc403348', // body care products
      'deodorant': 'photo-1522335789203-aabd1fc54bc9', // bathroom products
      'comb': 'photo-1559056199-641a0ac8b55e', // personal care items
      
      // Food & Beverage
      'almonds': 'photo-1445282768818-cdb21eab8176', // nuts
      'milk': 'photo-1563636619-e9143da7973b', // milk carton
      'coffee': 'photo-1497935586351-b67a49e012bf', // coffee beans
      'granola': 'photo-1571091718767-18b5b1457add', // granola bowl
      'energy bar': 'photo-1542838132-92c53300491e', // energy bars
      
      // Electronics
      'charger': 'photo-1593642632823-8f785ba67e45', // phone charger
      'phone case': 'photo-1511707171634-5f897ff02aa9', // phone accessories
      'speaker': 'photo-1558618666-fcd25c85cd64', // wireless speaker
      'monitor': 'photo-1527443224154-c4a3942d3acf', // computer monitor
      'laptop stand': 'photo-1587829138453-6d7ac2bec001', // laptop setup
      
      // Clothing
      't-shirt': 'photo-1521572163474-6864f9cf17ab', // t-shirt
      'jeans': 'photo-1542272604-787c3835535d', // jeans
      'jacket': 'photo-1551028719-00167b16eac5', // jacket
      'hoodie': 'photo-1556821840-3a9c6fcc9e5d', // hoodie
      'sneakers': 'photo-1549298916-b41d501d3772', // sneakers
      
      // Home & Garden
      'furniture': 'photo-1586023492125-27b2c045efd7', // furniture
      'garden light': 'photo-1493663284031-b7e3aefcae8e', // garden lighting
      'seeds': 'photo-1416879595882-3373a0480b5b', // seeds
      'compost bin': 'photo-1560448204-e02f11c3d0e2', // composting
      'plant pot': 'photo-1485955900006-10f4d324d411', // plant pots
      
      // Beauty & Cosmetics
      'lipstick': 'photo-1596462502278-27bfdc403348', // lipstick
      'foundation': 'photo-1522335789203-aabd1fc54bc9', // makeup
      'mascara': 'photo-1571019613454-1cb2f99b2d8b', // mascara
      'brush set': 'photo-1559056199-641a0ac8b55e', // makeup brushes
      'cleanser': 'photo-1556228720-195a672e8a03', // skincare
      
      // Sports & Outdoor
      'yoga mat': 'photo-1544367567-0f2fcb009e0b', // yoga mat
      'water bottle': 'photo-1523362628745-0c100150b504', // water bottle
      'activewear': 'photo-1506629905877-c8cd2259f81c', // workout clothes
      'backpack': 'photo-1553062407-98eeb64c6a62', // backpack
      'ball': 'photo-1571019613454-1cb2f99b2d8b', // sports ball
      
      // Baby & Kids
      'baby food': 'photo-1560472354-b33ff0c44a43', // baby food
      'toys': 'photo-1558618666-fcd25c85cd64', // toys
      'diapers': 'photo-1522335789203-aabd1fc54bc9', // baby care
      'baby wash': 'photo-1596462502278-27bfdc403348', // baby products
      'blocks': 'photo-1572021335469-31706a17aaef', // wooden blocks
      
      // Automotive
      'car wash': 'photo-1558618666-fcd25c85cd64', // car care
      'car charger': 'photo-1593642632823-8f785ba67e45', // car electronics
      'floor mats': 'photo-1511707171634-5f897ff02aa9', // car accessories
      'air freshener': 'photo-1559056199-641a0ac8b55e', // car interior
      'car cover': 'photo-1522335789203-aabd1fc54bc9', // car protection
      
      // Books & Media
      'notebook': 'photo-1544716278-ca5e3f4abd8c', // notebook
      'pen set': 'photo-1455390582262-044cdead277a', // pens
      'calendar': 'photo-1506905925346-21bda4d32df4', // calendar
      'bookmark': 'photo-1507003211169-0a1dd7228f2d', // bookmark
      'journal': 'photo-1544716278-ca5e3f4abd8c', // journal
      
      // Health & Wellness
      'vitamins': 'photo-1559757148-5c350d0d3c56', // vitamins
      'protein powder': 'photo-1571019613454-1cb2f99b2d8b', // protein powder
      'yoga block': 'photo-1544367567-0f2fcb009e0b', // yoga accessories
      'pill case': 'photo-1559056199-641a0ac8b55e', // pill organizer
      'tea': 'photo-1558618666-fcd25c85cd64', // herbal tea
      
      // Kitchen & Dining
      'cutting board': 'photo-1556909114-f6e7ad7d3136', // cutting board
      'food storage': 'photo-1558618666-fcd25c85cd64', // food containers
      'dish soap': 'photo-1596462502278-27bfdc403348', // dish soap
      'utensils': 'photo-1556909114-f6e7ad7d3136', // kitchen utensils
      'containers': 'photo-1558618666-fcd25c85cd64', // glass containers
      
      // Office Supplies
      'paper': 'photo-1544716278-ca5e3f4abd8c', // paper
      'pen': 'photo-1455390582262-044cdead277a', // pens
      'organizer': 'photo-1506905925346-21bda4d32df4', // desk organizer
      'eraser': 'photo-1507003211169-0a1dd7228f2d', // eraser
      'folders': 'photo-1544716278-ca5e3f4abd8c', // folders
      
      // Pet Supplies
      'pet food': 'photo-1548199973-03cce0bbc87b', // pet food
      'pet toys': 'photo-1601758228041-f3b2795255f1', // pet toys
      'pet shampoo': 'photo-1596462502278-27bfdc403348', // pet care
      'pet bed': 'photo-1548199973-03cce0bbc87b', // pet bed
      'leash': 'photo-1601758228041-f3b2795255f1', // pet leash
      
      // Toys & Games
      'puzzle': 'photo-1572021335469-31706a17aaef', // wooden puzzle
      'building blocks': 'photo-1572021335469-31706a17aaef', // building blocks
      'playdough': 'photo-1558618666-fcd25c85cd64', // playdough
      'board game': 'photo-1606092195730-5d7b9af1efc5', // board game
      'stuffed animal': 'photo-1558618666-fcd25c85cd64' // stuffed toy
    };

    // Find matching image based on product name
    const productNameLower = product.name.toLowerCase();
    let selectedImageId = null;

    // Check for exact matches first
    for (const [key, imageId] of Object.entries(imageMap)) {
      if (productNameLower.includes(key)) {
        selectedImageId = imageId;
        break;
      }
    }

    // Fallback to category-based images if no specific match found
    if (!selectedImageId) {
      const categoryImages = {
        'personal-care': 'photo-1596462502278-27bfdc403348',
        'food-beverage': 'photo-1571091718767-18b5b1457add',
        'electronics': 'photo-1593642632823-8f785ba67e45',
        'clothing': 'photo-1521572163474-6864f9cf17ab',
        'home-garden': 'photo-1586023492125-27b2c045efd7',
        'beauty-cosmetics': 'photo-1556228720-195a672e8a03',
        'sports-outdoor': 'photo-1544367567-0f2fcb009e0b',
        'baby-kids': 'photo-1560472354-b33ff0c44a43',
        'automotive': 'photo-1558618666-fcd25c85cd64',
        'books-media': 'photo-1544716278-ca5e3f4abd8c',
        'health-wellness': 'photo-1559757148-5c350d0d3c56',
        'kitchen-dining': 'photo-1556909114-f6e7ad7d3136',
        'office-supplies': 'photo-1544716278-ca5e3f4abd8c',
        'pet-supplies': 'photo-1548199973-03cce0bbc87b',
        'toys-games': 'photo-1572021335469-31706a17aaef'
      };
      selectedImageId = categoryImages[product.category] || 'photo-1560472354-b33ff0c44a43';
    }
    
    return `https://images.unsplash.com/${selectedImageId}?w=${size}&fit=crop`;
  };

  // Get products based on search and filters
  const getFilteredProducts = (): Product[] => {
    let products = productsData.slice(0, 100); // Show first 100 for performance
    
    if (searchQuery) {
      products = searchProducts(searchQuery).slice(0, 100);
    }
    
      if (selectedCategory === 'favorites') {
        products = products.filter(product => favorites.includes(product.id.toString()));
      } else if (selectedCategory !== 'all') {
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
    { id: 'favorites', label: 'Favorites', icon: Heart, count: favorites.length },
    { id: 'personal-care', label: 'Personal Care', icon: Star, count: getProductsByCategory('personal-care').length },
    { id: 'food-beverage', label: 'Food & Beverage', icon: Award, count: getProductsByCategory('food-beverage').length },
    { id: 'electronics', label: 'Electronics', icon: Leaf, count: getProductsByCategory('electronics').length },
    { id: 'clothing', label: 'Clothing', icon: Search, count: getProductsByCategory('clothing').length },
    { id: 'home-garden', label: 'Home & Garden', icon: Heart, count: getProductsByCategory('home-garden').length }
  ];

  const toggleFavorite = async (productId: number) => {
    if (!currentUser) {
      toast({
        title: "Login Required",
        description: "Please log in to favorite products.",
        variant: "destructive",
      });
      return;
    }

    // Corrected: Get reference to the 'favorites' subcollection
    const favoritesCollectionRef = collection(db, 'users', currentUser.uid, 'favorites');
    const favoriteDocRef = doc(db, 'users', currentUser.uid, 'favorites', productId.toString());

    const productIdString = productId.toString();

    if (favorites.includes(productIdString)) {
      // Remove from favorites (Firestore)
      await deleteDoc(favoriteDocRef);
      setFavorites(prev => prev.filter(id => id !== productIdString));
      // Removed redundant toast notification
      // toast({ title: "Product Unfavorited", description: "This product has been removed from your favorites." });
    } else {
      // Add to favorites (Firestore)
      await setDoc(favoriteDocRef, { productId: productIdString });
      setFavorites(prev => [...prev, productIdString]);
      addPoints(5);
      toast({
        title: "Product Favorited!",
        description: "You earned 5 points for favoriting a product!",
      });
      addPurchaseNotification('Product Favorited');
    }
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
      <Card className="bg-white border border-gray-200 shadow-lg rounded-2xl dark:bg-gray-900 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ShoppingCart className="w-6 h-6 text-green-600 dark:text-foreground" />
              <span className="dark:text-foreground">Sustainability Marketplace</span>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className="bg-green-600 text-white dark:bg-primary dark:text-primary-foreground">
                {filteredProducts.length} Products
              </Badge>
            </div>
          </CardTitle>
          <p className="text-gray-600 dark:text-muted-foreground">Discover and purchase eco-friendly alternatives that make a difference</p>
        </CardHeader>
        <CardContent>
          {/* Search and Filters */}
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search sustainable products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 dark:bg-background dark:text-foreground"
              />
            </div>
            <div className="flex gap-2">
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm dark:bg-background dark:border-border dark:text-foreground"
              >
                <option value="score">Best Score</option>
                <option value="rating">Highest Rated</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
              <Button variant="outline" className="flex items-center space-x-2">
                <Filter className="w-4 h-4 dark:text-foreground" />
                <span className="dark:text-foreground">More Filters</span>
              </Button>
            </div>
          </div>

          {/* Category Tabs */}
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="mb-6">
            <TabsList className="inline-flex h-10 items-center justify-start gap-x-4 rounded-md bg-muted p-1 text-muted-foreground dark:bg-muted dark:text-muted-foreground w-full">
              {categories.map((category) => (
                <TabsTrigger key={category.id} value={category.id} className="flex items-center space-x-1 text-xs px-3 py-1.5 dark:text-foreground">
                  <category.icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{category.label}</span>
                  <Badge variant="outline" className="text-xs px-1 dark:text-foreground">{category.count}</Badge>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden dark:bg-card dark:border-border">
                {/* Product Image */}
                <div className="relative overflow-hidden h-48 bg-gray-100 dark:bg-muted">
                  <img 
                    src={getProductImage(product)}
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
                      className="w-8 h-8 p-0 bg-white/90 hover:bg-white dark:bg-background dark:hover:bg-muted"
                      onClick={async (e) => {
                        e.stopPropagation(); // Prevent opening dialog
                        toggleFavorite(product.id);
                      }}
                    >
                      <Heart className={`w-4 h-4 ${favorites.includes(product.id.toString()) ? 'fill-red-500 text-red-500' : 'text-gray-500 dark:text-muted-foreground'}`} />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-8 h-8 p-0 bg-white/90 hover:bg-white dark:bg-background dark:hover:bg-muted"
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        shareProduct(product);
                      }}
                    >
                      <Share2 className="w-4 h-4 text-gray-500 dark:text-muted-foreground" />
                    </Button>
                  </div>
                </div>

                <CardContent className="p-4">
                  <div className="space-y-3">
                    {/* Product Info */}
                    <div>
                      <h3 className="font-semibold text-lg group-hover:text-green-600 dark:group-hover:text-primary transition-colors line-clamp-2 dark:text-foreground">
                        {product.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-muted-foreground">{product.brand}</p>
                      <p className="text-xs text-gray-500 mt-1 dark:text-muted-foreground">Made in {product.origin}</p>
                    </div>

                    {/* Rating */}
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300 dark:text-muted-foreground'}`} 
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-600 dark:text-muted-foreground">({product.reviews})</span>
                    </div>

                    {/* Features */}
                    <div className="flex flex-wrap gap-1">
                      {product.features?.slice(0, 3).map((feature, index) => (
                        <Badge key={index} variant="outline" className="text-xs dark:text-foreground">
                          {feature}
                        </Badge>
                      ))}
                      {product.features?.length > 3 && (
                        <Badge variant="outline" className="text-xs dark:text-foreground">
                          +{product.features.length - 3} more
                        </Badge>
                      )}
                    </div>

                    {/* Environmental Impact */}
                    <div className="bg-green-50 p-2 rounded-lg dark:bg-muted">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-green-700 font-medium dark:text-foreground">Environmental Impact:</span>
                        <span className="text-green-600 dark:text-foreground">{product.co2Saved} CO₂ saved</span>
                      </div>
                    </div>

                    {/* Pricing */}
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-lg font-bold text-green-600 dark:text-primary">${product.price}</span>
                        {product.originalPrice > product.price && (
                          <span className="text-sm text-gray-500 dark:text-muted-foreground line-through ml-2">${product.originalPrice}</span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-muted-foreground">
                        {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% off
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                      {/* Removed Add to Cart button as part of removing incart feature */}
                      <Button 
                        className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 dark:from-primary dark:to-primary/90 dark:hover:from-primary/90 dark:hover:to-primary"
                        onClick={() => {
                          addToCart({
                            id: product.id.toString(),
                            name: product.name,
                            price: product.price,
                            image: getProductImage(product),
                            brand: product.brand
                          });
                          addPurchaseNotification(product.name);
                        }}
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
                            <Eye className="w-4 h-4 dark:text-foreground" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto dark:bg-background dark:text-foreground">
                          <DialogHeader>
                            <DialogTitle className="dark:text-foreground">{product.name}</DialogTitle>
                            <DialogDescription className="dark:text-muted-foreground">
                              Detailed sustainability analysis and product information
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <img 
                                src={getProductImage(product, '600x400')}
                                alt={product.name} 
                                className="w-full h-64 object-cover rounded-lg"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600&h=400&fit=crop';
                                }}
                              />
                              <div className="space-y-4">
                                <div>
                                  <h3 className="text-xl font-bold dark:text-foreground">{product.name}</h3>
                                  <p className="text-gray-600 dark:text-muted-foreground">{product.brand}</p>
                                  <Badge className={getScoreColor(product.sustainabilityScore)}>
                                    Score: {product.sustainabilityScore}
                                  </Badge>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <span className="text-2xl font-bold text-green-600 dark:text-primary">${product.price}</span>
                                  {product.originalPrice > product.price && (
                                    <span className="text-lg text-gray-500 dark:text-muted-foreground line-through">${product.originalPrice}</span>
                                  )}
                                </div>
                                <p className="text-gray-700 dark:text-foreground">{product.description}</p>
                              </div>
                            </div>
                            
                            {product.detailedAnalysis && (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                  <h4 className="font-semibold mb-2 dark:text-foreground">Environmental Impact</h4>
                                  <p className="text-sm text-gray-600 dark:text-muted-foreground">{product.detailedAnalysis.environmentalImpact}</p>
                                </div>
                                <div>
                                  <h4 className="font-semibold mb-2 dark:text-foreground">Social Impact</h4>
                                  <p className="text-sm text-gray-600 dark:text-muted-foreground">{product.detailedAnalysis.socialImpact}</p>
                                </div>
                              </div>
                            )}
                            
                            {product.carbonFootprint && (
                              <div>
                                <h4 className="font-semibold mb-2 dark:text-foreground">Carbon Footprint</h4>
                                <div className="grid grid-cols-3 gap-4 text-sm dark:text-muted-foreground">
                                  <div>Production: {product.carbonFootprint.production}</div>
                                  <div>Transport: {product.carbonFootprint.transport}</div>
                                  <div>Total: {product.carbonFootprint.total}</div>
                                </div>
                              </div>
                            )}
                            
                            <div className="flex gap-2">
                              {/* Removed Add to Cart button in dialog as part of removing incart feature */}
                              <Button 
                                className="flex-1"
                                onClick={() => addToCart({
                                  id: product.id.toString(),
                                  name: product.name,
                                  price: product.price,
                                  image: getProductImage(product),
                                  brand: product.brand
                                })}
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
              <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center dark:bg-muted">
                <Search className="w-12 h-12 text-gray-400 dark:text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-gray-600 dark:text-muted-foreground mb-2">No products found</h3>
              <p className="text-gray-500 dark:text-muted-foreground">Try adjusting your search or filters</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SustainabilityMarketplace;
