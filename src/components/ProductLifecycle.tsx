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
import { fetchProductLifecycle } from '../services/productApi';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationsContextNew';
import { useToast } from '../hooks/use-toast';

interface ProductLifecycleProps {
  product?: any;
}

const ProductLifecycle: React.FC<ProductLifecycleProps> = ({ product: propProduct }) => {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const { toast } = useToast();
  const [viewedProducts, setViewedProducts] = useState<{ [key: string]: any }>({});
  const [savedProduct, setSavedProduct] = React.useState<any>(null);
  const location = useLocation();

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

  // A genuinely fresh product (just scanned/compared and passed in) must always win over
  // whatever Firestore/localStorage last remembered - otherwise navigating here with a NEW
  // product while an OLD one is still cached in `savedProduct` state silently ignores it.
  const freshProduct = propProduct || location.state?.product;

  // Load product from localStorage only as a last resort (e.g. a hard refresh with no fresh
  // product and nothing loaded from Firestore yet).
  const storedProductJSON = localStorage.getItem('persistedProductLifecycle');
  let initialProduct = freshProduct;
  if (!initialProduct && storedProductJSON) {
    try {
      initialProduct = JSON.parse(storedProductJSON);
      // Restore icon functions in stages if needed
      if (initialProduct.stages && Array.isArray(initialProduct.stages)) {
        initialProduct.stages = initialProduct.stages.map((stage: any) => ({
          ...stage,
          icon: iconMap[stage.iconName] || null,
        }));
      }
    } catch (e) {
      console.error('Error parsing persisted product lifecycle from localStorage', e);
      initialProduct = null;
    }
  }
  // Fresh product always wins; savedProduct (Firestore) only fills in when there's no fresh one.
  const product = freshProduct || savedProduct || initialProduct;

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
      if (user) {
        try {
          let productIdToFetch = freshProduct?.id;
          let data = null;
          if (productIdToFetch) {
            const productRef = doc(db, `users/${user.uid}/savedProductLifecycles`, productIdToFetch.toString());
            const docSnap = await getDoc(productRef);
            if (docSnap.exists()) {
              data = docSnap.data();
            }
          } else {
            // Fetch the most recent saved product lifecycle if no product id is available
            const savedProductsRef = collection(db, `users/${user.uid}/savedProductLifecycles`);
            const querySnapshot = await getDocs(savedProductsRef);
            let latestProduct = null;
            querySnapshot.forEach(doc => {
              const docData = doc.data();
              if (!latestProduct || (docData.savedAt && docData.savedAt.toMillis() > latestProduct.savedAt.toMillis())) {
                latestProduct = docData;
              }
            });
            data = latestProduct;
          }
          if (data) {
            // Restore icon property in stages
            if (data.stages && Array.isArray(data.stages)) {
              data.stages = data.stages.map((stage: any) => {
                return {
                  ...stage,
                  icon: iconMap[stage.iconName] || null,
                };
              });
            }
            setSavedProduct(data);
            localStorage.setItem('persistedProductLifecycle', JSON.stringify(data));
          } else {
            setSavedProduct(null);
            localStorage.removeItem('persistedProductLifecycle');
          }
        } catch (error) {
          console.error('Error fetching saved product lifecycle data:', error);
          setSavedProduct(null);
          localStorage.removeItem('persistedProductLifecycle');
        }
      } else {
        setSavedProduct(null);
        localStorage.removeItem('persistedProductLifecycle');
      }
    };
    fetchSavedProduct();
  }, [user, freshProduct?.id]);

  const displayProduct = product;

  // Real lifecycle stages are generated on demand by the backend LLM (cradle-to-grave, with
  // per-stage CO2/water/energy estimates) whenever the loaded product doesn't already carry
  // stages - replacing the previous empty/placeholder timeline.
  const [generatedStages, setGeneratedStages] = React.useState<any[]>([]);
  const [isLoadingLifecycle, setIsLoadingLifecycle] = React.useState(false);
  const [lifecycleError, setLifecycleError] = React.useState<string | null>(null);

  const hasOwnStages = Array.isArray(displayProduct?.stages) && displayProduct.stages.length > 0;

  // Cache generated stages per product so a refresh paints them instantly instead of showing 0
  // and re-hitting the (rate-limited) LLM every time.
  const lifecycleCacheKey = (p: any) => `ecoscope_lifecycle_${(p?.id ?? p?.name ?? 'unknown')}`;
  const restoreIcons = (stages: any[]) => stages.map((s) => ({ ...s, icon: iconMap[s.iconName] || null }));

  React.useEffect(() => {
    if (!displayProduct || hasOwnStages) return;
    let cancelled = false;

    // 1) Use cached stages immediately if we have them for this product.
    try {
      const cached = localStorage.getItem(lifecycleCacheKey(displayProduct));
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length) {
          setGeneratedStages(restoreIcons(parsed));
          setIsLoadingLifecycle(false);
          setLifecycleError(null);
          return () => { cancelled = true; };
        }
      }
    } catch { /* ignore cache read errors */ }

    // 2) Otherwise generate and cache the result.
    setIsLoadingLifecycle(true);
    setLifecycleError(null);
    setGeneratedStages([]);
    fetchProductLifecycle({
      name: displayProduct.name,
      brand: displayProduct.brand ?? null,
      category: displayProduct.category ?? null,
      sustainability_score: displayProduct.sustainabilityScore ?? null,
    })
      .then((res) => {
        if (cancelled) return;
        const stages = res.stages || [];
        setGeneratedStages(restoreIcons(stages));
        try { localStorage.setItem(lifecycleCacheKey(displayProduct), JSON.stringify(stages)); } catch { /* ignore */ }
      })
      .catch((err) => {
        if (cancelled) return;
        console.error('Failed to generate product lifecycle:', err);
        setLifecycleError('Could not generate a lifecycle analysis for this product right now.');
      })
      .finally(() => {
        if (!cancelled) setIsLoadingLifecycle(false);
      });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [displayProduct?.name, displayProduct?.id, hasOwnStages]);

  const effectiveStages = hasOwnStages ? displayProduct.stages : generatedStages;

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
    return (
      <div className="pt-20 text-center text-sage-600 dark:text-gray-400">
        No product data available.
      </div>
    );
  }

  const totalImpact = (effectiveStages ?? []).reduce((acc: { co2: number; water: number; energy: number }, stage: any) => ({
    co2: acc.co2 + (stage.impact?.co2 || 0),
    water: acc.water + (stage.impact?.water || 0),
    energy: acc.energy + (stage.impact?.energy || 0)
  }), { co2: 0, water: 0, energy: 0 });

  const saveProductLifecycle = async () => {
    if (!user) {
      toast({ title: 'Login Required', description: 'You must be logged in to save lifecycle data.', variant: 'destructive' });
      return;
    }
    try {
      // Create a copy of product without icon functions in stages
      const sanitizedStages = (product.stages ?? []).map((stage: any) => {
        const { icon, ...rest } = stage;
        return {
          ...rest,
          iconName: icon?.displayName || null, // Save iconName for restoring icon later
          details: stage.details || '', // Save details field explicitly
          progress: stage.progress || null, // Save progress if exists (e.g., progress through use phase)
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
        savedAt: new Date(),
      };

      const productRef = doc(db, `users/${user.uid}/savedProductLifecycles`, product.id.toString());
      await setDoc(productRef, sanitizedProduct, { merge: true });
      setSavedProduct(sanitizedProduct);
      // Persist to localStorage
      localStorage.setItem('persistedProductLifecycle', JSON.stringify(sanitizedProduct));
      toast({ title: 'Lifecycle Saved', description: `Lifecycle data for "${product.name}" was saved successfully.` });

      // Add notification for saved product lifecycle
      addNotification({
        type: 'achievement',
        title: 'Product Lifecycle Saved',
        message: `You have saved the lifecycle data for ${product.name}.`,
        read: false,
        source: 'productLifecycle',
        actionable: true,
        action: 'View',
      });

    } catch (error) {
      console.error('Error saving product lifecycle data:', error);
      toast({ title: 'Save Failed', description: 'Failed to save product lifecycle data.', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white/80 backdrop-blur-sm border-sage-200 dark:bg-gray-900 dark:border-gray-700 shadow-lg rounded-2xl">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-3 text-slate-800 dark:text-slate-200">
              <div className="w-10 h-10 bg-emerald-600 dark:bg-emerald-600 rounded-xl flex items-center justify-center">
                <Package className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold">Product Lifecycle Tracking</span>
                <p className="text-sm text-slate-600 dark:text-slate-400 font-normal">Cradle-to-grave impact, generated for each product</p>
              </div>
            </CardTitle>
            <Button onClick={saveProductLifecycle} className="bg-emerald-500 hover:bg-emerald-600 text-white dark:bg-emerald-700 dark:hover:bg-emerald-600">
              Save
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="bg-gradient-to-r from-sage-50 to-emerald-50 rounded-xl p-6 mb-6 dark:from-gray-800 dark:to-gray-900">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold text-sage-800 dark:text-gray-200">{displayProduct.name}</h3>
              <p className="text-sage-600 dark:text-gray-400">{displayProduct.brand || 'N/A'}</p>
            </div>
            <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white text-lg px-4 py-2 dark:bg-emerald-700 dark:hover:bg-emerald-600">
              {displayProduct.sustainabilityScore || 'N/A'}/100
            </Badge>
          </div> 
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Globe className="w-5 h-5 text-red-500 dark:text-red-400 mr-2" />
                <span className="text-2xl font-bold text-red-600 dark:text-red-400">{totalImpact.co2.toFixed(1)}</span>
              </div>
              <p className="text-sm text-sage-600 dark:text-gray-400">kg CO₂</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Droplets className="w-5 h-5 text-blue-500 dark:text-blue-400 mr-2" />
                <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">{totalImpact.water}</span>
              </div>
              <p className="text-sm text-sage-600 dark:text-gray-400">L Water</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Zap className="w-5 h-5 text-yellow-500 dark:text-yellow-400 mr-2" />
                <span className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{totalImpact.energy}</span>
              </div>
              <p className="text-sm text-sage-600 dark:text-gray-400">kWh Energy</p>
            </div>
          </div>
          </div>

          <Tabs defaultValue="timeline" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="timeline">Lifecycle Timeline</TabsTrigger>
              <TabsTrigger value="impact">Impact Analysis</TabsTrigger>
            </TabsList>

            <TabsContent value="timeline" className="space-y-6 dark:text-gray-200" onPointerEnter={() => displayProduct.id && addViewedProduct(displayProduct.id)}>
              {isLoadingLifecycle && (
                <div className="text-center py-10 text-sage-600 dark:text-gray-400">Generating a real lifecycle analysis for this product...</div>
              )}
              {lifecycleError && !isLoadingLifecycle && (
                <div className="text-center py-6 px-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-xl">
                  <p className="text-red-600 dark:text-red-400 text-sm">{lifecycleError}</p>
                </div>
              )}
              <div className="space-y-4">
                {(effectiveStages ?? []).map((stage: any) => (
                  <div key={stage.name} className={`p-6 rounded-xl border-2 ${getStatusColor(stage.status)} transition-all duration-300 dark:border-gray-700 dark:bg-gray-800`}>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-sage-600 rounded-xl flex items-center justify-center dark:bg-slate-700">
                          {stage.icon ? <stage.icon className="w-6 h-6 text-white" /> : null}
                        </div>
                        <div>
                          <h3 className="font-semibold text-sage-800 flex items-center space-x-2 dark:text-gray-200">
                            <span>{stage.name}</span>
                            {getStatusIcon(stage.status)}
                          </h3>
                          <div className="flex items-center space-x-4 text-sm text-sage-600 mt-1 dark:text-gray-400">
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
                            <span className="font-semibold text-red-600 dark:text-red-400">{stage.impact.co2}</span>
                            <p className="text-sage-500 dark:text-gray-400">CO₂</p>
                          </div>
                          <div className="text-center">
                            <span className="font-semibold text-blue-600 dark:text-blue-400">{stage.impact.water}</span>
                            <p className="text-sage-500 dark:text-gray-400">H₂O</p>
                          </div>
                          <div className="text-center">
                            <span className="font-semibold text-yellow-600 dark:text-yellow-400">{stage.impact.energy}</span>
                            <p className="text-sage-500 dark:text-gray-400">kWh</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <p className="text-sage-700 dark:text-gray-300">{stage.details}</p>
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
                    <p className="text-xs text-sage-500 dark:text-gray-400">
                      Totals across all lifecycle stages (category-level estimates).
                    </p>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="text-center p-3 rounded-lg bg-red-50 dark:bg-red-900/10">
                        <div className="text-xl font-bold text-red-600 dark:text-red-400">{totalImpact.co2.toFixed(1)}</div>
                        <div className="text-xs text-sage-600 dark:text-gray-400">kg CO₂</div>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-blue-50 dark:bg-blue-900/10">
                        <div className="text-xl font-bold text-blue-600 dark:text-blue-400">{totalImpact.water}</div>
                        <div className="text-xs text-sage-600 dark:text-gray-400">L Water</div>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/10">
                        <div className="text-xl font-bold text-yellow-600 dark:text-yellow-400">{totalImpact.energy}</div>
                        <div className="text-xs text-sage-600 dark:text-gray-400">kWh Energy</div>
                      </div>
                    </div>
                    {displayProduct.sustainabilityScore != null && (
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Overall Sustainability</span>
                          <span>{displayProduct.sustainabilityScore}/100</span>
                        </div>
                        <Progress value={displayProduct.sustainabilityScore} className="h-2" />
                      </div>
                    )}
                  </CardContent>
                </Card>
                <Card className="border-sage-200 dark:border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-sage-700 dark:text-gray-200">Labels & Certifications</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {Array.isArray(displayProduct.certifications) && displayProduct.certifications.length > 0 ? (
                      <div className="space-y-3">
                        {displayProduct.certifications.map((cert: string, i: number) => (
                          <div key={i} className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                              <CheckCircle className="w-5 h-5 text-white" />
                            </div>
                            <p className="font-medium text-sage-800 dark:text-gray-200 capitalize">
                              {cert.replace(/^en:/, '').replace(/-/g, ' ')}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-sage-500 dark:text-gray-400">
                        No verified certifications or eco-labels are recorded for this product.
                      </p>
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

export default ProductLifecycle;
