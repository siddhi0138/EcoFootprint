
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
 Package, Truck, Factory, Recycle, Leaf, AlertCircle, CheckCircle, Clock, MapPin, Zap, Droplets, Globe 
} from 'lucide-react';
import { db } from '../firebase'; // Import Firebase database instance
import { doc, setDoc, getDocs, collection } from 'firebase/firestore'; // Import Firebase functions
import { useAuth } from '../contexts/AuthContext'; // Import AuthContext


const ProductLifecycle = () => {
  const [selectedProduct, setSelectedProduct] = useState('organic-cotton-shirt');
  const { user } = useAuth(); // Get the current user
  const [viewedProducts, setViewedProducts] = useState({}); // State to store viewed products


  const products = {
    'organic-cotton-shirt': {
      name: 'Organic Cotton T-Shirt',
      brand: 'EcoWear',
      sustainabilityScore: 85,
      stages: [
        {
          name: 'Raw Materials',
          icon: Leaf,
          status: 'completed',
          impact: {
            co2: 2.4,
            water: 180,
            energy: 12
          },
          details: 'Organic cotton sourced from certified farms in India. No pesticides used.',
          location: 'Gujarat, India',
          duration: '90 days'
        },
        {
          name: 'Manufacturing',
          icon: Factory,
          status: 'completed',
          impact: {
            co2: 3.2,
            water: 95,
            energy: 18
          },
          details: 'Manufactured in solar-powered facility with water recycling system.',
          location: 'Tamil Nadu, India',
          duration: '7 days'
        },
        {
          name: 'Transportation',
          icon: Truck,
          status: 'completed',
          impact: {
            co2: 1.8,
            water: 0,
            energy: 8
          },
          details: 'Shipped via ocean freight in consolidated containers.',
          location: 'Mumbai to Los Angeles',
          duration: '21 days'
        },
        {
          name: 'Use Phase',
          icon: Package,
          status: 'active',
          impact: {
            co2: 4.5,
            water: 240,
            energy: 25
          },
          details: 'Expected to last 3+ years with proper care. Washing at 30°C recommended.',
          location: 'Consumer Home',
          duration: '3+ years'
        },
        {
          name: 'End of Life',
          icon: Recycle,
          status: 'pending',
          impact: {
            co2: -0.5,
            water: 15,
            energy: 3
          },
          details: 'Can be composted or recycled into new textile fibers.',
          location: 'Recycling Facility',
          duration: '6 months'
        }
      ]
    }
  };

  // Fetch viewed products from Firebase on component mount or user change
  React.useEffect(() => {
    const fetchViewedProducts = async () => {
      if (user) {
        // Fix collection path to have odd number of segments
        const viewedProductsRef = collection(db, `users/${user.uid}/productLifecycleViewedProducts`);
        const snapshot = await getDocs(viewedProductsRef);
        const data = {};
        snapshot.forEach(doc => {
          data[doc.id] = doc.data();
        });
        setViewedProducts(data);
      } else {
        setViewedProducts({}); // Clear viewed products if no user
      }
    };

    fetchViewedProducts();
  }, [user]);

  const currentProduct = products[selectedProduct];
  const totalImpact = currentProduct.stages.reduce((acc, stage) => ({
    co2: acc.co2 + stage.impact.co2,
    water: acc.water + stage.impact.water,
    energy: acc.energy + stage.impact.energy
  }), { co2: 0, water: 0, energy: 0 });

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'active': return <Clock className="w-5 h-5 text-blue-500" />;
      case 'pending': return <AlertCircle className="w-5 h-5 text-gray-400" />;
      default: return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'border-green-200 bg-green-50';
      case 'active': return 'border-blue-200 bg-blue-50';
      case 'pending': return 'border-gray-200 bg-gray-50';
      default: return 'border-gray-200';
    }
  };

  // Function to add viewed product to Firebase
  const addViewedProduct = async (productId) => {
    if (user) {
      // Fix document path to have even number of segments
      const productRef = doc(db, `users/${user.uid}/productLifecycleViewedProducts`, productId);
      await setDoc(productRef, {
        viewedAt: new Date(),
        productId: productId // Store the product ID as well
      }, { merge: true }); // Use merge to avoid overwriting
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white/80 backdrop-blur-sm border-sage-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-sage-700">
            <Package className="w-6 h-6" />
            <span>Product Lifecycle Tracking</span>
            {/* {user && viewedProducts[selectedProduct] && <Badge>Viewed: {new Date(viewedProducts[selectedProduct].viewedAt.toDate()).toLocaleDateString()}</Badge>} */}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Product Overview */}
          <div className="bg-gradient-to-r from-sage-50 to-emerald-50 rounded-xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-sage-800">{currentProduct.name}</h3>
                <p className="text-sage-600">{currentProduct.brand}</p>
              </div>
              <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white text-lg px-4 py-2">
                {currentProduct.sustainabilityScore}/100
              </Badge>
            </div>
            
            {/* Total Impact Summary */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Globe className="w-5 h-5 text-red-500 mr-2" />
                  <span className="text-2xl font-bold text-red-600">{totalImpact.co2.toFixed(1)}</span>
                </div>
                <p className="text-sm text-sage-600">kg CO₂</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Droplets className="w-5 h-5 text-blue-500 mr-2" />
                  <span className="text-2xl font-bold text-blue-600">{totalImpact.water}</span>
                </div>
                <p className="text-sm text-sage-600">L Water</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Zap className="w-5 h-5 text-yellow-500 mr-2" />
                  <span className="text-2xl font-bold text-yellow-600">{totalImpact.energy}</span>
                </div>
                <p className="text-sm text-sage-600">kWh Energy</p>
              </div>
            </div>
          </div>

          <Tabs defaultValue="timeline" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="timeline">Lifecycle Timeline</TabsTrigger>
              <TabsTrigger value="impact">Impact Analysis</TabsTrigger>
            </TabsList>

            <TabsContent value="timeline" className="space-y-6" onPointerEnter={() => addViewedProduct(selectedProduct)}> {/* Trigger addViewedProduct on tab enter */}
              {/* Lifecycle Stages */}
              <div className="space-y-4">
                {currentProduct.stages.map((stage, index) => (
                  <div key={index} className={`p-6 rounded-xl border-2 ${getStatusColor(stage.status)} transition-all duration-300`}>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-sage-600 rounded-xl flex items-center justify-center">
                          <stage.icon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-sage-800 flex items-center space-x-2">
                            <span>{stage.name}</span>
                            {getStatusIcon(stage.status)}
                          </h3>
                          <div className="flex items-center space-x-4 text-sm text-sage-600 mt-1">
                            <div className="flex items-center space-x-1">
                              <MapPin className="w-3 h-3" />
                              <span>{stage.location}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="w-3 h-3" />
                              <span>{stage.duration}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div className="text-center">
                            <span className="font-semibold text-red-600">{stage.impact.co2}</span>
                            <p className="text-sage-500">CO₂</p>
                          </div>
                          <div className="text-center">
                            <span className="font-semibold text-blue-600">{stage.impact.water}</span>
                            <p className="text-sage-500">H₂O</p>
                          </div>
                          <div className="text-center">
                            <span className="font-semibold text-yellow-600">{stage.impact.energy}</span>
                            <p className="text-sage-500">kWh</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-sage-700">{stage.details}</p>
                    
                    {stage.status === 'active' && (
                      <div className="mt-4">
                        <div className="flex justify-between text-sm text-sage-600 mb-2">
                          <span>Progress through use phase</span>
                          <span>2.3 / 3+ years</span>
                        </div>
                        <Progress value={76} className="h-2" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="impact" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-sage-200">
                  <CardHeader>
                    <CardTitle className="text-sage-700">Environmental Impact</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Carbon Footprint</span>
                          <span>{totalImpact.co2.toFixed(1)} kg CO₂</span>
                        </div>
                        <Progress value={65} className="h-2" />
                        <p className="text-xs text-sage-500 mt-1">35% lower than industry average</p>
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Water Usage</span>
                          <span>{totalImpact.water} L</span>
                        </div>
                        <Progress value={45} className="h-2" />
                        <p className="text-xs text-sage-500 mt-1">55% lower than conventional cotton</p>
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Energy Consumption</span>
                          <span>{totalImpact.energy} kWh</span>
                        </div>
                        <Progress value={40} className="h-2" />
                        <p className="text-xs text-sage-500 mt-1">60% from renewable sources</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-sage-200">
                  <CardHeader>
                    <CardTitle className="text-sage-700">Sustainability Certifications</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                          <CheckCircle className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-sage-800">GOTS Certified</p>
                          <p className="text-xs text-sage-600">Global Organic Textile Standard</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                          <CheckCircle className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-sage-800">Fair Trade</p>
                          <p className="text-xs text-sage-600">Ethical labor practices</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                          <CheckCircle className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-sage-800">Cradle to Cradle</p>
                          <p className="text-xs text-sage-600">Bronze level certification</p>
                        </div>
                      </div>
                    </div>
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

export default ProductLifecycle;
