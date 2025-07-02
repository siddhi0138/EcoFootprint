import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Progress } from './ui/progress';
import { 
  Package, Truck, Factory, Recycle, Leaf, AlertCircle, CheckCircle, Clock, MapPin, Zap, Droplets, Globe 
} from 'lucide-react';
import { db } from '../firebase';
import { doc, setDoc, getDocs, getDoc, collection } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';

interface ProductLifecycleProps {
  product?: any;
}

const ProductLifecycle: React.FC<ProductLifecycleProps> = ({ product: propProduct }) => {
  const { user } = useAuth();
  const [viewedProducts, setViewedProducts] = useState<{ [key: string]: any }>({});
  const [savedProduct, setSavedProduct] = React.useState<any>(null);
  const location = useLocation();
  const product = propProduct || location.state?.product;

  // Map stage names or keys to icon components
  const iconMap: { [key: string]: React.ElementType } = {
    Package,
    Truck,
    Factory,
    Recycle,
    Leaf,
    AlertCircle,
    CheckCircle,
    Clock,
    MapPin,
    Zap,
    Droplets,
    Globe,
  };

  useEffect(() => {
    const fetchViewedProducts = async () => {
      if (user) {
        try {
          const viewedProductsRef = collection(db, `users/${user.uid}/productLifecycleViewedProducts`);
          const snapshot = await getDocs(viewedProductsRef);
          const data: { [key: string]: any } = {};
          snapshot.forEach(doc => {
            data[doc.id] = doc.data();
          });
          setViewedProducts(data);
        } catch (error) {
          console.error('Error fetching viewed products:', error);
          setViewedProducts({});
        }
      } else {
        setViewedProducts({});
      }
    };
    fetchViewedProducts();
  }, [user]);

  useEffect(() => {
    const fetchSavedProduct = async () => {
      if (user && (product?.id || savedProduct?.id)) {
        try {
          const productId = savedProduct?.id || product?.id;
          const productRef = doc(db, `users/${user.uid}/savedProductLifecycles`, productId.toString());
          const docSnap = await getDoc(productRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            // Restore icon property in stages
            if (data.stages && Array.isArray(data.stages)) {
              data.stages = data.stages.map((stage: any) => {
                return {
                  ...stage,
                  icon: iconMap[stage.iconName] || null, // Use iconName property to map icon
                };
              });
            }
            setSavedProduct(data);
          } else {
            setSavedProduct(null);
          }
        } catch (error) {
          console.error('Error fetching saved product lifecycle data:', error);
          setSavedProduct(null);
        }
      } else {
        setSavedProduct(null);
      }
    };
    fetchSavedProduct();
  }, [user, product?.id]);

  const displayProduct = savedProduct || product;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'active': return <Clock className="w-5 h-5 text-blue-500" />;
      case 'pending': return <AlertCircle className="w-5 h-5 text-gray-400" />;
      default: return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'border-green-200 bg-green-50';
      case 'active': return 'border-blue-200 bg-blue-50';
      case 'pending': return 'border-gray-200 bg-gray-50';
      default: return 'border-gray-200';
    }
  };

  const addViewedProduct = async (productId: string) => {
    if (user) {
      const productRef = doc(db, `users/${user.uid}/productLifecycleViewedProducts`, productId.toString());
      await setDoc(productRef, {
        viewedAt: new Date(),
      }, { merge: true });
    }
  };

  if (!product) {
    return <div>No product data available.</div>;
  }

  const totalImpact = (displayProduct.stages ?? []).reduce((acc: { co2: number; water: number; energy: number }, stage: any) => ({
    co2: acc.co2 + (stage.impact?.co2 || 0),
    water: acc.water + (stage.impact?.water || 0),
    energy: acc.energy + (stage.impact?.energy || 0)
  }), { co2: 0, water: 0, energy: 0 });

  const saveProductLifecycle = async () => {
    if (!user) {
      alert('You must be logged in to save lifecycle data.');
      return;
    }
    try {
      // Create a copy of product without icon functions in stages
      const sanitizedStages = (product.stages ?? []).map((stage: any) => {
        const { icon, ...rest } = stage;
        return {
          ...rest,
          iconName: icon?.displayName || null, // Save iconName for restoring icon later
        };
      });

      // Include other product details explicitly to save all relevant info
      const sanitizedProduct = {
        id: product.id,
        name: product.name,
        brand: product.brand,
        price: product.price,
        image: product.image,
        sustainabilityScore: product.sustainabilityScore,
        carbon: product.carbon,
        water: product.water,
        packaging: product.packaging,
        certifications: product.certifications,
        materials: product.materials,
        origin: product.origin,
        barcode: product.barcode,
        alternatives: product.alternatives,
        features: product.features,
        inStock: product.inStock,
        rating: product.rating,
        reviews: product.reviews,
        description: product.description,
        category: product.category,
        sustainability: product.sustainability,
        stages: sanitizedStages,
      };

      const productRef = doc(db, `users/${user.uid}/savedProductLifecycles`, product.id.toString());
      await setDoc(productRef, sanitizedProduct, { merge: true });
      setSavedProduct(sanitizedProduct);
      alert('Product lifecycle data saved successfully.');
    } catch (error) {
      console.error('Error saving product lifecycle data:', error);
      alert('Failed to save product lifecycle data.');
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white/80 backdrop-blur-sm border-sage-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2 text-sage-700">
              <Package className="w-6 h-6" />
              <span>Product Lifecycle Tracking</span>
            </CardTitle>
            <Button onClick={saveProductLifecycle} className="bg-emerald-500 hover:bg-emerald-600 text-white">
              Save
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="bg-gradient-to-r from-sage-50 to-emerald-50 rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold text-sage-800">{displayProduct.name}</h3>
              <p className="text-sage-600">{displayProduct.brand || 'N/A'}</p>
            </div>
            <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white text-lg px-4 py-2">
              {displayProduct.sustainabilityScore || 'N/A'}/100
            </Badge>
          </div> 
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

            <TabsContent value="timeline" className="space-y-6" onPointerEnter={() => displayProduct.id && addViewedProduct(displayProduct.id)}>
              <div className="space-y-4">
                {(displayProduct.stages ?? []).map((stage: any) => (
                  <div key={stage.name} className={`p-6 rounded-xl border-2 ${getStatusColor(stage.status)} transition-all duration-300`}>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-sage-600 rounded-xl flex items-center justify-center">
                          {stage.icon ? <stage.icon className="w-6 h-6 text-white" /> : null}
                        </div>
                        <div>
                          <h3 className="font-semibold text-sage-800 flex items-center space-x-2">
                            <span>{stage.name}</span>
                            {getStatusIcon(stage.status)}
                          </h3>
                          <div className="flex items-center space-x-4 text-sm text-sage-600 mt-1">
                            <div className="flex items-center space-x-1">
                              <MapPin className="w-3 h-3" />
                              <span>{stage.location || 'N/A'}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="w-3 h-3" />
                              <span>{stage.duration || 'N/A'}</span>
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
