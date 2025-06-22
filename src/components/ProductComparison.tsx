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
} from 'lucide-react';
import { getRandomProducts, searchProducts } from '@/data/productsData'; // Assuming this data is static for now
import type { Product } from '@/data/productsData'; // Import Product type from data
import { collection, doc, onSnapshot,
  setDoc,
  updateDoc,
  arrayUnion,
  getDoc,
  arrayRemove,
} from 'firebase/firestore';
import { deleteDoc, getDocs } from 'firebase/firestore';

import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';


interface ComparisonProduct extends Product {
    metrics?: { // Metrics are optional based on data structure
      carbon: number;
      water: number;
      waste: number;
      energy: number;
      ethics: number;
    };
    reviews: number;
    inStock: boolean;
    packaging: { // Match the required structure from Product
        type: string;
        recyclable: boolean;
        biodegradable: boolean;
        plasticFree: boolean;
    };

    pros?: string[]; // Optional pros for comparison
    cons?: string[]; // Optional cons for comparison
}

const ProductComparison = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]); // Initialize with Product[] type
  const [firebaseComparisonProductIds, setFirebaseComparisonProductIds] = useState<number[]>([]); // Store product IDs from Firebase
  const [comparisonProducts, setComparisonProducts] = useState<ComparisonProduct[]>([]); // State to hold full product objects for display
  const [selectedCategory, setSelectedCategory] = useState('all');


  // Fetch user's product comparison list
  useEffect(() => {
    if (!user) {
      setFirebaseComparisonProductIds([]);
      return;
    }

    const userComparisonRef = doc(db, 'users', user.uid, 'productComparison', 'list');
    const unsubscribeComparisonList = onSnapshot(userComparisonRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setFirebaseComparisonProductIds(data.productIds || []);
        // Fetch full product data for each ID
        const productPromises = (data.productIds || []).map(async (productId: number) => {
            const productDocRef = doc(db, 'users', user.uid, 'productComparison', 'list', 'products', productId.toString());
            const productDocSnap = await getDoc(productDocRef);
            if (productDocSnap.exists()) { // Cast to ComparisonProduct to include potential metrics
                return productDocSnap.data() as ComparisonProduct; // Cast to ComparisonProduct
            }
            return undefined; // Product not found in subcollection
        });

        Promise.all(productPromises).then(products => {
            setComparisonProducts(products.filter(product => product !== undefined) as Product[]);
        });
      } else { // Initialize if no data exists
        // Initialize if no data exists
         setFirebaseComparisonProductIds([]);
         setComparisonProducts([]);
        // Create the document with initial empty values
         setDoc(userComparisonRef, {
           productIds: []
         }).catch(error => console.error("Error initializing user product comparison data:", error));
      }
    });

    return () => unsubscribeComparisonList();
  }, [user]);

  // Fetch full product details when firebaseComparisonProductIds changes
  useEffect(() => {
    setAvailableProducts(getRandomProducts(6)); // Initialize available products on mount
  }, [firebaseComparisonProductIds]); // Re-run when the list of IDs from Firebase changes


  const removeProduct = async (productId: number) => { // Make async, specify type
    if (!user) return;

    const userComparisonRef = doc(db, 'users', user.uid, 'productComparison', 'list');
    await updateDoc(userComparisonRef, {
      productIds: arrayRemove(productId), // Remove product ID from Firebase array
    });
     // Also remove the product data from the subcollection
     const productDocRef = doc(db, 'users', user.uid, 'productComparison', 'list', 'products', productId.toString());
     // No need to await this, can run in the background
     deleteDoc(productDocRef).catch(error => console.error("Error deleting product data from subcollection:", error));
     // State will be updated by the onSnapshot listener
  };

  const addProduct = async (product: Product) => {
    if (!user || firebaseComparisonProductIds.length >= 4) { // Check limit based on Firebase data
        if (firebaseComparisonProductIds.length >= 4) {
             alert('You can compare up to 4 products.'); // Or use a toast
        }
        return;
    }

    const userComparisonRef = doc(db, 'users', user.uid, 'productComparison', 'list');
     if (!firebaseComparisonProductIds.includes(product.id)) {
         await updateDoc(userComparisonRef, {
            productIds: arrayUnion(product.id),
        });

        // Add the full product data to the subcollection
        const productDocRef = doc(db, 'users', user.uid, 'productComparison', 'list', 'products', product.id.toString());

        await setDoc(productDocRef, product);     }
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      const results = searchProducts(searchQuery); // Assuming searchProducts returns Product[]
      setAvailableProducts(results.slice(0, 10));
    } else {
      setAvailableProducts(getRandomProducts(6)); // Assuming getRandomProducts returns Product[]
    }
  };

   const handleClearComparison = async () => {
       // This function now needs to also delete all documents in the 'products' subcollection
       if (!user) return;
       const userComparisonRef = doc(db, 'users', user.uid, 'productComparison', 'list');

       // First, delete all documents in the 'products' subcollection
       const productsCollectionRef = collection(userComparisonRef, 'products');
       const snapshot = await getDocs(productsCollectionRef);
       const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
       await Promise.all(deletePromises).catch(error => console.error("Error clearing products subcollection:", error));

       // Then, clear the productIds array in the main document
       await updateDoc(userComparisonRef, {
           productIds: [] // Clear the productIds array
       });
        // State will be updated by the onSnapshot listener
   };


  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const metricIcons: { [key: string]: React.ElementType } = {
    carbon: Leaf,
    water: Droplets,
    waste: Trash2,
    energy: Zap,
    ethics: Heart
  };

  const metricLabels: { [key: string]: string } = {
    carbon: 'Carbon',
    water: 'Water',
    waste: 'Waste',
    energy: 'Energy',
    ethics: 'Ethics'
  };

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
            <Badge variant="secondary" className="bg-purple-100 text-purple-700 px-3 py-1 rounded-xl">
              <Sparkles className="w-4 h-4 mr-1" />
              AI Enhanced
            </Badge>
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
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="text-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-200/50">
                      <div className="text-2xl font-bold text-green-700">
                        {Math.max(...comparisonProducts.map(p => p.sustainabilityScore))}
                      </div>
                      <div className="text-sm text-green-600">Highest Score</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200/50">
                      <div className="text-2xl font-bold text-blue-700">
                        {comparisonProducts.length}
                      </div>
                      <div className="text-sm text-blue-600">Products Compared</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-200/50">
                      <div className="text-2xl font-bold text-purple-700">
                        {Math.round(comparisonProducts.reduce((acc, p) => acc + p.sustainabilityScore, 0) / comparisonProducts.length)}
                      </div>
                      <div className="text-sm text-purple-600">Average Score</div>
                    </div>
                  </div>

                  {/* Product Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {comparisonProducts.map((product) => (
                      <Card key={product.id} className="relative border-2 border-gray-200 hover:border-purple-300 transition-all duration-200 rounded-2xl overflow-hidden shadow-lg">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute top-2 right-2 h-8 w-8 p-0 rounded-full bg-white/80 hover:bg-red-100 z-10"
                          onClick={() => removeProduct(product.id)}
                        >
                          <X className="w-4 h-4 text-gray-600 hover:text-red-600" />
                        </Button>

                        <div className="aspect-video relative overflow-hidden">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                          {product.inStock && (
                            <Badge className="absolute top-2 left-2 bg-green-600 text-white">
                              In Stock
                            </Badge>
                          )}
                        </div>

                        <CardContent className="p-6 space-y-4">
                          <div className="text-center">
                            <h3 className="font-bold text-lg text-gray-800">{product.name}</h3>
                            <p className="text-sm text-gray-600">{product.brand}</p>
                            <p className="text-xl font-bold text-purple-600 mt-2">${product.price}</p>
                            <div className="flex items-center justify-center space-x-2 mt-1">
                              <div className="flex text-yellow-400">
                                {'★'.repeat(Math.floor(product.rating))}
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

                         {/* Enhanced Metrics - Render only if metrics exist */}
                          <div className="space-y-3">
                            {Object.entries(product.metrics || {}).map(([key, value]) => {
                              const Icon = metricIcons[key];
                              return (
                                <div key={key} className="flex items-center justify-between">
                                  <div className="flex items-center space-x-2">
                                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                                      <Icon className="w-4 h-4 text-gray-600" />
                                    </div>
                                    <span className="text-sm font-medium">{metricLabels[key as keyof typeof metricLabels]}</span> {/* Use keyof typeof */}
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <div className="w-20 bg-gray-200 rounded-full h-2">
                                      <div
                                        className={`h-2 rounded-full ${value >= 80 ? 'bg-green-500' : value >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                        style={{ width: `${value}%` }}
                                      ></div>
                                    </div>
                                    <span className="text-sm font-bold w-8 text-right">{value}</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {/* Certifications */}
                          {product.certifications && (
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
                                <CheckCircle className="w-4 h-4 mr-1" />
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
                              <p className="text-sm font-medium text-red-700 mb-2 flex items-center">\
                                <AlertCircle className="w-4 h-4 mr-1" />
                                Cons
                              </p>
                              {product.cons && product.cons.slice(0, 2).map((con, index) => (
                                <div key={index} className="flex items-start space-x-2 mb-1">
                                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2"></div>
                                  <span className="text-xs text-gray-600">{con}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          <Button className="w-full bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 rounded-xl">
                            View Details
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ) : ( // Else block
                <Card className="border-dashed border-2 border-gray-300 rounded-2xl">
                  <CardContent className="text-center py-12">
                    <ArrowUpDown className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-600 mb-2">No Products to Compare</h3>
                    <p className="text-gray-500 mb-6">Add products to start comparing their sustainability scores</p>
                    <Button onClick={() => setSelectedCategory('search')} className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 rounded-xl" >
                      Add Products
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="search" className="mt-6">
              {firebaseComparisonProductIds.length < 4 && ( // Check limit before displaying search
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Search for products to compare..." // Added placeholder
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        className="pl-10 border-gray-300 focus:border-purple-400 h-12 rounded-2xl h-12"
 />
                    </div>
                    <Button onClick={handleSearch} className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 rounded-xl px-6">
                      Search
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {availableProducts
                      .filter(product => !firebaseComparisonProductIds.includes(product.id)) // Filter based on Firebase data
                      .slice(0, 8)
                      .map((product) => (
                        <Card key={product.id} className="hover:shadow-lg transition-all duration-200 border border-gray-200 rounded-2xl overflow-hidden">
                          <CardContent className="p-4">
                            <div className="flex items-center space-x-4">
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-16 h-16 object-cover rounded-xl"
                              />
                              <div className="flex-1">
                                <h3 className="font-bold text-gray-800">{product.name}</h3>
                                <p className="text-sm text-gray-600">{product.brand} • ${product.price}</p>
                                <div className="flex items-center space-x-2 mt-2">
                                  <Badge className={`${getScoreBg(product.sustainabilityScore)} text-gray-800 border-0`}>
                                    {product.sustainabilityScore}
                                  </Badge>
                                  <span className="text-xs text-gray-500">Sustainability Score</span>
                                </div>
                              </div>
                              <Button
                                size="sm"
                                onClick={() => addProduct(product)}
                                className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 rounded-xl"
                              >
                                Add
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                </div>
              )}
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
                    {comparisonProducts.length > 1 ? ( // Check comparisonProducts length
                      <>
                        <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                          <div className="flex items-start space-x-3">
                            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                            <div>
                              <p className="font-medium text-green-800">Best Overall Choice</p>
                              <p className="text-sm text-green-700 mt-1">
                                {comparisonProducts.sort((a, b) => b.sustainabilityScore - a.sustainabilityScore)[0].name} scores highest with {Math.max(...comparisonProducts.map(p => p.sustainabilityScore))}/100, offering the best balance of sustainability and value.
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                          <div className="flex items-start space-x-3">
                            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                            <div>
                              <p className="font-medium text-blue-800">Key Differences</p>
                              <p className="text-sm text-blue-700 mt-1">
                                Price variations reflect different investments in sustainable materials and ethical practices.
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl">
                          <div className="flex items-start space-x-3">
                            <Star className="w-5 h-5 text-purple-600 mt-0.5" />
                            <div>
                              <p className="font-medium text-purple-800">Recommendation</p>
                              <p className="text-sm text-purple-700 mt-1">
                                Consider long-term value: sustainable products often have better durability and lower environmental costs over time.
                              </p>
                            </div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-8">
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
