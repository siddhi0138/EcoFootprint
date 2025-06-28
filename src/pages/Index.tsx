import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { Search, Sparkles } from 'lucide-react';

// Import components
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Features from '../components/Features';
import Footer from '../components/Footer';
import ProductScanner from '../components/ProductScanner';
import SustainabilityScore from '../components/SustainabilityScore';
import CompanyProfile from '../components/CompanyProfile';
import ProductAnalysis from '../components/ProductAnalysis';
import SustainabilityMarketplace from '../components/SustainabilityMarketplace';
import CommunityHub from '../components/CommunityHub';
import CarbonTracker from '../components/CarbonTracker';
import ProductComparison from '../components/ProductComparison';
import EducationCenter from '../components/EducationCenter';
import NotificationCenter from '../components/NotificationCenter';
import UserProfile from '../components/UserProfile';
import AIRecommendations from '../components/AIRecommendations';
import EnvironmentalAlerts from '../components/EnvironmentalAlerts';
import RewardsSystem from '../components/RewardsSystem';
import ProductLifecycle from '../components/ProductLifecycle';
import SustainabilityChallenges from '../components/SustainabilityChallenges';
import SocialImpactHub from '../components/SocialImpactHub';
import SmartInsights from '../components/SmartInsights';
import LiveEvents from '../components/LiveEvents';
import InvestmentTracker from '../components/InvestmentTracker';
import ESGAnalyzer from '../components/ESGAnalyzer';
import TransportationPlanner from '../components/TransportationPlanner';
import { EcoRecipeFinder } from '../components/EcoRecipeFinder';
import EcoChatbot from '../components/EcoChatbot';
import AuthModal from '../components/AuthModal';
import { useAuth } from '../contexts/AuthContext';
import { UserDataProvider } from '../contexts/UserDataContext';
import { CartProvider, useCart } from '../contexts/CartContext';
import Checkout from './Checkout';
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../firebase";

const Index = () => {
  const { user } = useAuth();

  const { cartItems, updateQuantity, removeFromCart, clearCart } = useCart();
  const [activeTab, setActiveTab] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [scannedProduct, setScannedProduct] = useState(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [recentScans, setRecentScans] = useState([]);

  const handleGetStarted = () => {
    setIsLoginModalOpen(true);
  };

  const toggleLoginForm = () => {
    setIsLoginModalOpen(!isLoginModalOpen);
  };

  const handleLoginSuccess = () => {
    setIsLoginModalOpen(false);
    setActiveTab('scanner');
  };

  useEffect(() => {
    const fetchRecentScans = async () => {
      if (!user) return;
      const scansCollectionRef = collection(db, "users", user.uid, "recentScans");
      const scansQuery = query(scansCollectionRef, orderBy("timestamp", "desc"));
      const querySnapshot = await getDocs(scansQuery);
      const scansData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRecentScans(scansData);
    };

    fetchRecentScans();
  }, [user]);

  const handleNavigation = (tab) => {
    setActiveTab(tab);
  };

  if (activeTab === 'home') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <Navbar
          onNavigate={handleNavigation}
          activeTab={activeTab}
          toggleLoginForm={toggleLoginForm}
          cartItems={cartItems}
          updateCartItem={updateQuantity}
          removeFromCart={removeFromCart}
          clearCart={clearCart}
        />
        <Hero onGetStarted={handleGetStarted} />
        <Features />
        <AuthModal
          isOpen={isLoginModalOpen}
          onClose={() => setIsLoginModalOpen(false)}
          onSuccess={handleLoginSuccess}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-hidden">
      <Navbar
        onNavigate={handleNavigation}
        activeTab={activeTab}
        toggleLoginForm={toggleLoginForm}
        cartItems={cartItems}
        updateCartItem={updateQuantity}
        removeFromCart={removeFromCart}
        clearCart={clearCart}
      />
      <div className="pt-20">
        <div className="container mx-auto px-6 py-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsContent value="scanner" className="mt-6">
              <ProductScanner onTabChange={setActiveTab} />
            </TabsContent>

            <TabsContent value="chatbot" className="mt-6">
              <EcoChatbot />
            </TabsContent>

            <TabsContent value="search" className="mt-6">
              <Card className="bg-white/90 backdrop-blur-sm border-emerald-100/50 shadow-xl rounded-3xl overflow-hidden dark:bg-gray-800/90 dark:border-gray-700/50">
                <CardHeader className="pb-6 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20">
                  <CardTitle className="flex items-center space-x-4 text-gray-800 dark:text-gray-200">
                    <div className="p-3 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl shadow-lg">
                      <Search className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <span className="text-2xl font-bold">Search Products & Brands</span>
                      <p className="text-sm text-gray-600 mt-1 font-normal dark:text-gray-400">Discover the environmental impact of any product</p>
                    </div>
                    <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-xl dark:bg-emerald-900/50 dark:text-emerald-300">
                      <Sparkles className="w-4 h-4 mr-1" />
                      AI Enhanced
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row gap-4 mb-8">
                    <Input
                      placeholder="Search for products, brands, or barcodes..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="flex-1 border-emerald-200 focus:border-emerald-400 h-12 rounded-2xl bg-gray-50/50 dark:border-gray-700/50"
                    />
                    <Button className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 px-8 h-12 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 whitespace-nowrap">
                      <Search className="w-4 h-4 mr-2" />
                      Search
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {recentScans.map((product) => (
                      <Card key={product.id} className="hover:shadow-xl transition-all duration-300 cursor-pointer border-gray-100/50 shadow-md rounded-2xl overflow-hidden group bg-white/80 backdrop-blur-sm dark:bg-gray-700/80 dark:border-gray-600/50">
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-gray-800 truncate text-lg group-hover:text-emerald-700 transition-colors dark:text-gray-200 dark:group-hover:text-emerald-400">{product.name}</h3>
                              <p className="text-sm text-gray-600 mt-1 font-medium dark:text-gray-400">{product.brand}</p>
                            </div>
                            <Badge
                              variant={product.sustainabilityScore >= 80 ? "default" : product.sustainabilityScore >= 60 ? "secondary" : "destructive"}
                              className={`text-sm px-3 py-1 rounded-xl ${product.sustainabilityScore >= 80 ? "bg-emerald-500 hover:bg-emerald-600" : ""}`}
                            >
                              {product.sustainabilityScore}
                            </Badge>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-500 bg-gray-100 px-3 py-1 rounded-xl dark:text-gray-400 dark:bg-gray-600">{product.category}</span>
                            {product.timestamp && (
                              <span className="text-gray-500 dark:text-gray-400">
                                {new Date(product.timestamp.seconds * 1000).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analysis" className="mt-4">
              <ProductAnalysis product={scannedProduct} />
            </TabsContent>

            <TabsContent value="comparison" className="mt-4">
              <ProductComparison />
            </TabsContent>

            <TabsContent value="companies" className="mt-4">
              <CompanyProfile />
            </TabsContent>

            <TabsContent value="marketplace" className="mt-4">
              <SustainabilityMarketplace />
            </TabsContent>

            <TabsContent value="community" className="mt-4">
              <CommunityHub />
            </TabsContent>

            <TabsContent value="carbon-tracker" className="mt-4">
              <CarbonTracker />
            </TabsContent>

            <TabsContent value="education" className="mt-4">
              <EducationCenter />
            </TabsContent>

            <TabsContent value="notifications" className="mt-4">
              <NotificationCenter />
            </TabsContent>

            <TabsContent value="profile" className="mt-4">
              <UserProfile />
            </TabsContent>

            <TabsContent value="ai-recommendations" className="mt-4">
              <AIRecommendations />
            </TabsContent>

            <TabsContent value="environmental-alerts" className="mt-4">
              <EnvironmentalAlerts />
            </TabsContent>

            <TabsContent value="rewards" className="mt-4">
              <RewardsSystem />
            </TabsContent>

            <TabsContent value="lifecycle" className="mt-4">
              <ProductLifecycle />
            </TabsContent>

            <TabsContent value="challenges" className="mt-4">
              <SustainabilityChallenges />
            </TabsContent>

            <TabsContent value="social-impact" className="mt-4">
              <SocialImpactHub />
            </TabsContent>

            <TabsContent value="smart-insights" className="mt-4">
              <SmartInsights />
            </TabsContent>

            <TabsContent value="live-events" className="mt-4">
              <LiveEvents />
            </TabsContent>

            <TabsContent value="investment-tracker" className="mt-4">
              <InvestmentTracker />
            </TabsContent>

            <TabsContent value="esg-analyzer" className="mt-4">
              <ESGAnalyzer />
            </TabsContent>

            <TabsContent value="transportation-planner" className="mt-4">
              <TransportationPlanner />
            </TabsContent>

            <TabsContent value="recipe-finder" className="mt-4">
              <EcoRecipeFinder />
            </TabsContent>

            <TabsContent value="checkout" className="mt-6">
              <Checkout onNavigate={setActiveTab} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

const IndexWithUserDataProvider = () => (
  <UserDataProvider>
    <CartProvider>
      <Index />
    </CartProvider>
  </UserDataProvider>
);

export default IndexWithUserDataProvider;
