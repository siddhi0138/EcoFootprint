import React, { useState, useEffect, useCallback } from 'react';
import { collection, getDocs, setDoc, deleteDoc, doc } from 'firebase/firestore';
import { useNotificationHelperNew } from '../hooks/useNotificationHelperNew';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Search, ShoppingCart, Heart, Share2, Eye, ArrowLeftRight, Sparkles, Package } from 'lucide-react';
import { browseProducts, lookupProduct, analyzeProduct, analyzeGeneralProduct, type MarketplaceProduct, type EcoAnalysis } from '@/services/productApi';
import ProductComparison from './ProductComparison';
import { useUserData } from '@/contexts/UserDataContext';
import { useProductComparison } from '@/contexts/ProductComparisonContext';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/firebase';
import { useAuth } from '@/contexts/AuthContext';

// Real product catalog from DummyJSON (see backend services/marketplace_catalog.py). The tab id
// IS the category slug the backend understands; `query` mirrors it so a tab click browses that
// category. These come with complete shopping data (price, rating, stock, images, description).
const CATEGORIES = [
  { id: 'all', label: 'All Products', query: 'all' },
  { id: 'groceries', label: 'Groceries', query: 'groceries' },
  { id: 'home-decoration', label: 'Home Decor', query: 'home-decoration' },
  { id: 'furniture', label: 'Furniture', query: 'furniture' },
  { id: 'kitchen-accessories', label: 'Kitchen', query: 'kitchen-accessories' },
  { id: 'beauty', label: 'Beauty', query: 'beauty' },
  { id: 'skin-care', label: 'Skin Care', query: 'skin-care' },
  { id: 'fragrances', label: 'Fragrances', query: 'fragrances' },
  { id: 'sports-accessories', label: 'Sports', query: 'sports-accessories' },
];

const PAGE_SIZE = 24;

const SustainabilityMarketplace = () => {
  const [searchInput, setSearchInput] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0].id);
  const [activeQuery, setActiveQuery] = useState(CATEGORIES[0].query);
  const [sortBy, setSortBy] = useState<'score' | 'name'>('score');

  const [products, setProducts] = useState<MarketplaceProduct[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [favorites, setFavorites] = useState<string[]>([]);
  const [favoriteProducts, setFavoriteProducts] = useState<MarketplaceProduct[]>([]);
  const [isLoadingFavorites, setIsLoadingFavorites] = useState(false);

  const [selectedProduct, setSelectedProduct] = useState<MarketplaceProduct | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [fullAnalysis, setFullAnalysis] = useState<EcoAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isComparing, setIsComparing] = useState<string | null>(null);

  const { addPoints } = useUserData();
  const { addProductToComparison, comparisonProducts } = useProductComparison();
  const { addToCart } = useCart();
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const { addPurchaseNotification } = useNotificationHelperNew();

  // Load the user's favorited barcodes on mount / login
  useEffect(() => {
    const fetchFavorites = async () => {
      if (!currentUser) {
        setFavorites([]);
        return;
      }
      const favoritesRef = collection(db, 'users', currentUser.uid, 'favorites');
      const snapshot = await getDocs(favoritesRef);
      setFavorites(snapshot.docs.map((d) => d.data().productId));
    };
    fetchFavorites();
  }, [currentUser]);

  // Browse/search real OpenFoodFacts products for the active category or search query
  const loadProducts = useCallback((query: string, pageNum: number, append: boolean) => {
    const setBusy = append ? setIsLoadingMore : setIsLoading;
    setBusy(true);
    setLoadError(null);
    browseProducts(query, pageNum, PAGE_SIZE)
      .then(({ products: fetched, has_more }) => {
        setProducts((prev) => (append ? [...prev, ...fetched] : fetched));
        setHasMore(has_more);
        setPage(pageNum);
      })
      .catch((err) => {
        console.error('Failed to browse products:', err);
        setLoadError("Couldn't load products right now. Please try again.");
      })
      .finally(() => setBusy(false));
  }, []);

  useEffect(() => {
    if (selectedCategory === 'favorites') return;
    loadProducts(activeQuery, 1, false);
  }, [activeQuery, selectedCategory, loadProducts]);

  // Favorites tab shows real products looked up by their saved barcodes
  useEffect(() => {
    if (selectedCategory !== 'favorites') return;
    if (favorites.length === 0) {
      setFavoriteProducts([]);
      return;
    }
    setIsLoadingFavorites(true);
    Promise.all(favorites.map((barcode) => lookupProduct(barcode).catch(() => null)))
      .then((results) => setFavoriteProducts(results.filter((p): p is MarketplaceProduct => p !== null)))
      .finally(() => setIsLoadingFavorites(false));
  }, [selectedCategory, favorites]);

  const handleSearch = () => {
    if (!searchInput.trim()) return;
    setSelectedCategory('search');
    setActiveQuery(searchInput.trim());
  };

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    if (categoryId === 'favorites') return;
    const category = CATEGORIES.find((c) => c.id === categoryId);
    if (category) {
      setSearchInput('');
      setActiveQuery(category.query);
    }
  };

  const displayedProducts = selectedCategory === 'favorites' ? favoriteProducts : products;
  const sortedProducts = [...displayedProducts].sort((a, b) =>
    sortBy === 'name' ? a.name.localeCompare(b.name) : b.sustainability_score - a.sustainability_score
  );

  const toggleFavorite = async (product: MarketplaceProduct) => {
    if (!currentUser) {
      toast({ title: 'Login Required', description: 'Please log in to favorite products.', variant: 'destructive' });
      return;
    }
    const favoriteDocRef = doc(db, 'users', currentUser.uid, 'favorites', product.barcode);
    if (favorites.includes(product.barcode)) {
      await deleteDoc(favoriteDocRef);
      setFavorites((prev) => prev.filter((b) => b !== product.barcode));
    } else {
      await setDoc(favoriteDocRef, { productId: product.barcode });
      setFavorites((prev) => [...prev, product.barcode]);
      addPoints(5);
      toast({ title: 'Product Favorited!', description: 'You earned 5 points for favoriting a product!' });
      addPurchaseNotification('Product Favorited');
    }
  };

  const shareProduct = (product: MarketplaceProduct) => {
    const shareText = `Check out ${product.name}${product.brand ? ` by ${product.brand}` : ''} - Eco-Score: ${(product.ecoscore_grade || '?').toUpperCase()}`;
    if (navigator.share) {
      navigator.share({ title: product.name, text: shareText, url: window.location.href })
        .then(() => {
          addPoints(5);
          toast({ title: 'Product Shared!', description: 'You earned 5 points for sharing!' });
        })
        .catch(() => fallbackShare(shareText));
    } else {
      fallbackShare(shareText);
    }
  };

  const fallbackShare = (text: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        addPoints(5);
        toast({ title: 'Product Shared!', description: 'Product info copied to clipboard! You earned 5 points!' });
      });
    }
  };

  // Fetches a real AI (or honestly-labeled heuristic) sustainability breakdown for this barcode -
  // the same backend call the scanner uses - instead of fabricating carbon/water/waste numbers.
  const addToComparison = async (product: MarketplaceProduct) => {
    if (comparisonProducts.find((p) => p.id === product.barcode)) {
      toast({ title: 'Already Added', description: 'This product is already in your comparison.', variant: 'destructive' });
      return;
    }
    setIsComparing(product.barcode);
    try {
      const analysis = await getProductAnalysis(product);
      const overall = analysis.sustainability_score;
      addProductToComparison({
        id: product.barcode,
        date: new Date().toISOString(),
        name: product.name,
        brand: product.brand || 'Unknown',
        category: product.category || undefined,
        sustainabilityScore: overall,
        image: product.image_url || undefined,
        metrics: {
          carbon: analysis.carbon_footprint.score,
          water: overall,
          waste: analysis.packaging.score,
          energy: overall,
          ethics: analysis.health_impact.score,
        },
        certifications: product.labels,
      });
      addPoints(5);
      toast({ title: 'Added to Comparison', description: `${product.name} has been added (+5 points!) Switching to Compare...` });
      setSelectedCategory('compare');
    } catch (err) {
      console.error('Failed to analyze product for comparison:', err);
      toast({ title: 'Analysis Failed', description: "Couldn't fetch a sustainability analysis for this product.", variant: 'destructive' });
    } finally {
      setIsComparing(null);
    }
  };

  // Browse-list results are field-limited for performance, so re-fetch the full record via
  // /lookup when a product's details are actually opened - this surfaces extra real fields
  // (quantity, allergens, countries, nutrition) that the list view doesn't carry.
  const openDetails = (product: MarketplaceProduct) => {
    setSelectedProduct(product);
    setFullAnalysis(null);
    setIsLoadingDetails(true);
    // Fire the AI analysis in parallel with the detail lookup (instead of waiting for a manual
    // "Get Full Analysis" click afterwards) so it's ready - or already loading - the instant the
    // dialog opens.
    runFullAnalysis(product);
    lookupProduct(product.barcode)
      .then((full) => setSelectedProduct(full))
      .catch((err) => console.error('Failed to load full product details:', err))
      .finally(() => setIsLoadingDetails(false));
  };

  // Catalog products (DummyJSON) have no OpenFoodFacts barcode record, so their sustainability
  // breakdown comes from the text-based general analyzer; genuine OFF barcodes still use the
  // barcode analyzer. Either way the numbers are real/estimated by the backend, not fabricated.
  const getProductAnalysis = (product: MarketplaceProduct) => {
    if (product.source === 'dummyjson' || !/^\d{8,}$/.test(product.barcode)) {
      return analyzeGeneralProduct({
        name: product.name,
        brand: product.brand,
        category: product.category,
        description: product.description,
      });
    }
    return analyzeProduct(product.barcode).then((r) => r.analysis);
  };

  const addProductToCart = (product: MarketplaceProduct) => {
    addToCart({
      id: product.barcode,
      name: product.name,
      price: product.price ?? null,
      image: product.image_url || undefined,
      brand: product.brand,
    });
    addPurchaseNotification(product.name);
    toast({ title: 'Added to Cart', description: `${product.name} has been added to your cart.` });
  };

  const runFullAnalysis = async (product: MarketplaceProduct) => {
    setIsAnalyzing(true);
    try {
      const analysis = await getProductAnalysis(product);
      setFullAnalysis(analysis);
    } catch (err) {
      console.error('Failed to run full analysis:', err);
      toast({ title: 'Analysis Failed', description: "Couldn't reach the AI analysis service.", variant: 'destructive' });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'bg-emerald-500 text-white';
    if (score >= 70) return 'bg-green-500 text-white';
    if (score >= 50) return 'bg-yellow-500 text-white';
    return 'bg-orange-500 text-white';
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white border border-gray-200 shadow-lg rounded-2xl dark:bg-gray-900 dark:border-gray-700">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center justify-between text-slate-800 dark:text-slate-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center">
                <ShoppingCart className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold">Sustainability Marketplace</span>
                <p className="text-sm text-slate-600 dark:text-slate-400 font-normal">
                  Real products with live pricing, ratings and eco scores
                </p>
              </div>
            </div>
            <Badge className="bg-green-600 text-white dark:bg-primary dark:text-primary-foreground">
              {selectedCategory === 'favorites' ? favoriteProducts.length : products.length} Products
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Search and Filters */}
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search real products..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10 dark:bg-background dark:text-foreground"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSearch} variant="outline">
                <Search className="w-4 h-4 dark:text-foreground" />
              </Button>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'score' | 'name')}
                className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm dark:bg-background dark:border-border dark:text-foreground"
              >
                <option value="score">Best Eco-Score</option>
                <option value="name">Name (A-Z)</option>
              </select>
            </div>
          </div>

          {/* Category Tabs */}
          <Tabs value={selectedCategory} onValueChange={handleCategoryChange} className="mb-6">
            <TabsList className="inline-flex h-auto flex-wrap items-center justify-start gap-x-2 gap-y-2 rounded-md bg-muted p-1 text-muted-foreground dark:bg-muted dark:text-muted-foreground w-full">
              {CATEGORIES.map((category) => (
                <TabsTrigger key={category.id} value={category.id} className="text-sm px-4 py-2 dark:text-foreground">
                  {category.label}
                </TabsTrigger>
              ))}
              <TabsTrigger value="favorites" className="flex items-center gap-1 text-sm px-4 py-2 dark:text-foreground">
                <Heart className="w-4 h-4" />
                Favorites
                <Badge variant="outline" className="text-xs px-1 dark:text-foreground">{favorites.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="compare" className="flex items-center gap-1 text-sm px-4 py-2 dark:text-foreground">
                <ArrowLeftRight className="w-4 h-4" />
                Compare
                <Badge variant="outline" className="text-xs px-1 dark:text-foreground">{comparisonProducts.length}</Badge>
              </TabsTrigger>
              {selectedCategory === 'search' && (
                <TabsTrigger value="search" className="text-sm px-4 py-2 dark:text-foreground">
                  "{activeQuery}"
                </TabsTrigger>
              )}
            </TabsList>
          </Tabs>

          {/* Compare view - the product comparison lives here (reached via each product's
              "Compare" button) instead of as a separate top-level page, so there's one place
              to shop and one place to compare with no duplicate navigation. */}
          {selectedCategory === 'compare' && <ProductComparison />}

          {/* Loading / Error states */}
          {selectedCategory !== 'compare' && (isLoading || isLoadingFavorites) && (
            <div className="text-center py-12 text-gray-500 dark:text-muted-foreground">
              Loading real products...
            </div>
          )}
          {selectedCategory !== 'compare' && loadError && !isLoading && (
            <div className="text-center py-8 px-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-xl mb-6">
              <p className="text-red-600 dark:text-red-400 text-sm">{loadError}</p>
            </div>
          )}

          {/* Products Grid */}
          {selectedCategory !== 'compare' && !isLoading && !isLoadingFavorites && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedProducts.map((product) => (
                <Card key={product.barcode} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden dark:bg-card dark:border-border">
                  <div className="relative overflow-hidden h-48 bg-gray-100 dark:bg-muted flex items-center justify-center">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                    ) : (
                      <Package className="w-12 h-12 text-gray-300 dark:text-muted-foreground" />
                    )}

                    <div className="absolute top-2 left-2 flex flex-col gap-1">
                      <Badge className={getScoreColor(product.sustainability_score)}>
                        {product.sustainability_score}
                      </Badge>
                      {product.ecoscore_grade && product.ecoscore_grade !== 'unknown' && (
                        <Badge variant="outline" className="text-xs bg-white/90 dark:bg-background">
                          Eco {product.ecoscore_grade.toUpperCase()}
                        </Badge>
                      )}
                    </div>

                    <div className="absolute top-2 right-2 flex flex-col gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-8 h-8 p-0 bg-white/90 hover:bg-emerald-700 hover:border-emerald-700 hover:text-white dark:bg-background dark:hover:bg-emerald-700"
                        onClick={(e) => { e.stopPropagation(); toggleFavorite(product); }}
                      >
                        <Heart className={`w-4 h-4 ${favorites.includes(product.barcode) ? 'fill-red-500 text-red-500' : 'text-gray-500 dark:text-muted-foreground'}`} />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-8 h-8 p-0 bg-white/90 hover:bg-emerald-700 hover:border-emerald-700 dark:bg-background dark:hover:bg-emerald-700"
                        onClick={(e) => { e.stopPropagation(); shareProduct(product); }}
                      >
                        <Share2 className="w-4 h-4 text-gray-500 dark:text-muted-foreground hover:text-white" />
                      </Button>
                    </div>
                  </div>

                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div>
                        <h3 className="font-semibold text-lg group-hover:text-green-600 dark:group-hover:text-primary transition-colors line-clamp-2 dark:text-foreground">
                          {product.name}
                        </h3>
                        {product.brand && <p className="text-sm text-gray-600 dark:text-muted-foreground">{product.brand}</p>}
                        {product.category && <p className="text-xs text-gray-500 mt-1 dark:text-muted-foreground">{product.category}</p>}
                      </div>

                      <div className="flex items-center justify-between">
                        {product.price != null && (
                          <span className="text-xl font-bold text-emerald-700 dark:text-emerald-400">
                            ${product.price.toFixed(2)}
                          </span>
                        )}
                        <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-muted-foreground">
                          {product.rating != null && (
                            <span className="flex items-center gap-1">
                              <span className="text-amber-500">★</span>{product.rating.toFixed(1)}
                            </span>
                          )}
                          {product.stock != null && (
                            <span className={product.stock > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-500'}>
                              {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                            </span>
                          )}
                        </div>
                      </div>

                      {product.labels.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {product.labels.slice(0, 3).map((label, index) => (
                            <Badge key={index} variant="outline" className="text-xs capitalize dark:text-foreground">
                              {label}
                            </Badge>
                          ))}
                        </div>
                      )}

                      <Button
                        className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 dark:from-primary dark:to-primary/90 dark:hover:from-primary/90 dark:hover:to-primary"
                        onClick={() => addProductToCart(product)}
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Add to Cart
                      </Button>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() => addToComparison(product)}
                          disabled={isComparing === product.barcode}
                        >
                          <ArrowLeftRight className="w-4 h-4 mr-2" />
                          {isComparing === product.barcode ? 'Analyzing...' : 'Compare'}
                        </Button>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" className="px-3" onClick={() => openDetails(product)}>
                              <Eye className="w-4 h-4 dark:text-foreground" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto dark:bg-background dark:text-foreground">
                            {(() => {
                              const displayProduct = selectedProduct?.barcode === product.barcode ? selectedProduct : product;
                              return (
                                <>
                                  <DialogHeader>
                                    <DialogTitle className="dark:text-foreground">{displayProduct.name}</DialogTitle>
                                    <DialogDescription className="dark:text-muted-foreground">
                                      Real product data{displayProduct.quantity ? ` • ${displayProduct.quantity}` : ''}
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                      <div className="h-48 bg-gray-100 dark:bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                                        {displayProduct.image_url ? (
                                          <img src={displayProduct.image_url} alt={displayProduct.name} className="w-full h-full object-cover" />
                                        ) : (
                                          <Package className="w-12 h-12 text-gray-300" />
                                        )}
                                      </div>
                                      <div className="space-y-2">
                                        {displayProduct.brand && <p className="text-gray-600 dark:text-muted-foreground">{displayProduct.brand}</p>}
                                        <div className="flex items-center gap-3 flex-wrap">
                                          {displayProduct.price != null && (
                                            <span className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">${displayProduct.price.toFixed(2)}</span>
                                          )}
                                          {displayProduct.rating != null && (
                                            <span className="text-sm text-gray-600 dark:text-muted-foreground"><span className="text-amber-500">★</span> {displayProduct.rating.toFixed(1)}</span>
                                          )}
                                          {displayProduct.stock != null && (
                                            <span className={`text-sm ${displayProduct.stock > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-500'}`}>
                                              {displayProduct.stock > 0 ? `${displayProduct.stock} in stock` : 'Out of stock'}
                                            </span>
                                          )}
                                        </div>
                                        <div className="flex items-center gap-2 flex-wrap">
                                          <Badge className={getScoreColor(displayProduct.sustainability_score)}>
                                            Sustainability: {displayProduct.sustainability_score}
                                          </Badge>
                                          {displayProduct.nutriscore_grade && displayProduct.nutriscore_grade !== 'unknown' && (
                                            <Badge variant="outline">Nutri-Score {displayProduct.nutriscore_grade.toUpperCase()}</Badge>
                                          )}
                                        </div>
                                        {displayProduct.description && (
                                          <p className="text-sm text-gray-600 dark:text-muted-foreground">{displayProduct.description}</p>
                                        )}
                                        {displayProduct.category && (
                                          <p className="text-sm text-gray-600 dark:text-muted-foreground"><span className="font-medium">Category:</span> {displayProduct.category}</p>
                                        )}
                                        {displayProduct.packaging && (
                                          <p className="text-sm text-gray-600 dark:text-muted-foreground"><span className="font-medium">Packaging:</span> {displayProduct.packaging}</p>
                                        )}
                                        {displayProduct.countries && (
                                          <p className="text-sm text-gray-600 dark:text-muted-foreground"><span className="font-medium">Sold in:</span> {displayProduct.countries}</p>
                                        )}
                                        {displayProduct.allergens && (
                                          <p className="text-sm text-amber-700 dark:text-amber-400"><span className="font-medium">Allergens:</span> {displayProduct.allergens}</p>
                                        )}
                                      </div>
                                    </div>

                                    {isLoadingDetails && (
                                      <p className="text-xs text-gray-400 dark:text-muted-foreground">Loading full product details...</p>
                                    )}

                                    {displayProduct.ingredients_text && (
                                      <div>
                                        <h4 className="font-semibold mb-1 dark:text-foreground">Ingredients</h4>
                                        <p className="text-sm text-gray-600 dark:text-muted-foreground">{displayProduct.ingredients_text}</p>
                                      </div>
                                    )}

                                    {displayProduct.nutrition && (
                                      <div>
                                        <h4 className="font-semibold mb-2 dark:text-foreground">Nutrition (per 100g)</h4>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                                          {displayProduct.nutrition.energy_kcal_100g != null && (
                                            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-2 text-center">
                                              <div className="font-semibold dark:text-foreground">{Math.round(displayProduct.nutrition.energy_kcal_100g)}</div>
                                              <div className="text-xs text-gray-500 dark:text-muted-foreground">kcal</div>
                                            </div>
                                          )}
                                          {displayProduct.nutrition.sugars_100g != null && (
                                            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-2 text-center">
                                              <div className="font-semibold dark:text-foreground">{displayProduct.nutrition.sugars_100g}g</div>
                                              <div className="text-xs text-gray-500 dark:text-muted-foreground">Sugars</div>
                                            </div>
                                          )}
                                          {displayProduct.nutrition.fat_100g != null && (
                                            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-2 text-center">
                                              <div className="font-semibold dark:text-foreground">{displayProduct.nutrition.fat_100g}g</div>
                                              <div className="text-xs text-gray-500 dark:text-muted-foreground">Fat</div>
                                            </div>
                                          )}
                                          {displayProduct.nutrition.salt_100g != null && (
                                            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-2 text-center">
                                              <div className="font-semibold dark:text-foreground">{displayProduct.nutrition.salt_100g}g</div>
                                              <div className="text-xs text-gray-500 dark:text-muted-foreground">Salt</div>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    )}

                                    <div>
                                      <div className="flex items-center justify-between mb-2">
                                        <h4 className="font-semibold dark:text-foreground">AI Sustainability Analysis</h4>
                                        {!fullAnalysis && (
                                          <Button size="sm" variant="outline" onClick={() => runFullAnalysis(displayProduct)} disabled={isAnalyzing}>
                                            <Sparkles className="w-3.5 h-3.5 mr-1" />
                                            {isAnalyzing ? 'Analyzing...' : 'Get Full Analysis'}
                                          </Button>
                                        )}
                                      </div>
                                      {fullAnalysis && (
                                        <div className="space-y-2 text-sm text-gray-600 dark:text-muted-foreground">
                                          {fullAnalysis.is_estimated && (
                                            <p className="font-medium text-amber-600 dark:text-amber-400">
                                              [Estimated - no AI key configured, using heuristic fallback]
                                            </p>
                                          )}
                                          <p><span className="font-medium">Carbon:</span> {fullAnalysis.carbon_footprint.explanation}</p>
                                          <p><span className="font-medium">Packaging:</span> {fullAnalysis.packaging.explanation}</p>
                                          <p><span className="font-medium">Health:</span> {fullAnalysis.health_impact.explanation}</p>
                                        </div>
                                      )}
                                    </div>

                                    <div className="flex gap-2">
                                      <Button className="flex-1" onClick={() => addProductToCart(displayProduct)}>
                                        <ShoppingCart className="w-4 h-4 mr-2" />
                                        Add to Cart
                                      </Button>
                                      <Button variant="outline" className="flex-1" onClick={() => addToComparison(displayProduct)} disabled={isComparing === displayProduct.barcode}>
                                        <ArrowLeftRight className="w-4 h-4 mr-2" />
                                        Compare
                                      </Button>
                                      <Button variant="outline" onClick={() => toggleFavorite(displayProduct)}>
                                        <Heart className={`w-4 h-4 ${favorites.includes(displayProduct.barcode) ? 'fill-red-500 text-red-500' : ''}`} />
                                      </Button>
                                    </div>
                                  </div>
                                </>
                              );
                            })()}
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {selectedCategory !== 'compare' && !isLoading && !isLoadingFavorites && sortedProducts.length === 0 && !loadError && (
            <div className="text-center py-12">
              <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center dark:bg-muted">
                <Search className="w-12 h-12 text-gray-400 dark:text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-gray-600 dark:text-muted-foreground mb-2">
                {selectedCategory === 'favorites' ? 'No favorites yet' : 'No products found'}
              </h3>
              <p className="text-gray-500 dark:text-muted-foreground">
                {selectedCategory === 'favorites' ? 'Favorite products to see them here' : 'Try a different search or category'}
              </p>
            </div>
          )}

          {selectedCategory !== 'compare' && selectedCategory !== 'favorites' && hasMore && !isLoading && sortedProducts.length > 0 && (
            <div className="text-center mt-6">
              <Button variant="outline" onClick={() => loadProducts(activeQuery, page + 1, true)} disabled={isLoadingMore}>
                {isLoadingMore ? 'Loading...' : 'Load More'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SustainabilityMarketplace;
