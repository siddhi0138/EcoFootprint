import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Search, TrendingUp, Users, Award, Bell, Star, Zap, Sparkles, Bot, Target } from 'lucide-react';

// Import components
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Footer from '@/components/Footer';
import ProductScanner from '@/components/ProductScanner';
import SustainabilityScore from '@/components/SustainabilityScore';
import CompanyProfile from '@/components/CompanyProfile';
import ProductAnalysis from '@/components/ProductAnalysis';
import SustainabilityMarketplace from '@/components/SustainabilityMarketplace'; // Corrected import
import CommunityHub from '@/components/CommunityHub';
import CarbonTracker from '@/components/CarbonTracker';
import EducationCenter from '@/components/EducationCenter';
import NotificationCenter from '@/components/NotificationCenter';
import QuickActions from '@/components/QuickActions';
import LoginForm from '@/components/LoginForm';
import UserProfile from '@/components/UserProfile';
import AIRecommendations from '@/components/AIRecommendations';
import ProductComparison from '@/components/ProductComparison';
import EnvironmentalAlerts from '@/components/EnvironmentalAlerts';
import RewardsSystem from '@/components/RewardsSystem';
import ProductLifecycle from '@/components/ProductLifecycle';
import SustainabilityChallenges from '@/components/SustainabilityChallenge';
import SocialImpactHub from '@/components/SocialImpactHub';
import SmartInsights from '@/components/SmartInsights';
import LiveEvents from '@/components/LiveEvents';
import ARProductScanner from '@/components/ARProductScanner';
import InvestmentTracker from '@/components/InvestmentTracker';
import ESGAnalyzer from '@/components/ESGAnalyzer';
import TransportationPlanner from '@/components/TransportationPlanner';
import EcoRecipeFinder from '@/components/EcoRecipeFinder';
import EcoChatbot from '@/components/EcoChatbot';
import Features from '@/components/Features';
import { IndexProps } from '@/types';
const Index: React.FC<IndexProps> = ({ showLoginForm, toggleLoginForm }) => {
  const [activeTab, setActiveTab] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [scannedProduct, setScannedProduct] = useState(null);
  const recentScans = [
    {
      id: 1,
      name: "Organic Cotton T-Shirt",
      brand: "EcoWear",
      score: 85,
      category: "Clothing",
      date: "2024-06-15"
    },
    {
      id: 2,
      name: "Bamboo Toothbrush",
      brand: "GreenLife",
      score: 92,
      category: "Personal Care",
      date: "2024-06-14"
    },
    {
      id: 3,
      name: "Plant-Based Protein",
      brand: "NutraGreen",
      score: 78,
      category: "Food",
      date: "2024-06-13"
    }
  ];

  const topCompanies = [
    { name: "Patagonia", score: 94, trend: "+2" },
    { name: "Interface Inc.", score: 91, trend: "+1" },
    { name: "Unilever", score: 76, trend: "-1" },
    { name: "IKEA", score: 73, trend: "+3" }
  ];

  const userStats = {
    totalScans: 127,
    avgScore: 82,
    co2Saved: 45.2,
    rank: 156,
    badges: 8,
    weeklyGoal: 75,
    currentWeekScans: 8,
    streakDays: 12
  };
  console.log('showLoginForm:', showLoginForm);


  const handleNavigation = (tab) => {
    setActiveTab(tab);
  };

  const handleGetStarted = () => {
    setActiveTab('scanner');
  };

  // Render landing page
  if (activeTab === 'home') {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50"> {/* Use flexbox to manage layout */}
        <Navbar onNavigate={handleNavigation} activeTab={activeTab} toggleLoginForm={toggleLoginForm} />
        <main className="flex-grow pt-20"> {/* Main content expands to fill available space, added top padding for navbar */}
          <Hero onGetStarted={handleGetStarted} /> {/* Hero section already likely has top/bottom padding */}
          <Features /> {/* Render the Features component below Hero */}
        </main>
        <Footer />
      </div>
    );
  }

  // Render app interface
  // Conditionally render login form placeholder
  if (showLoginForm) {
    return <LoginForm />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50"> {/* Use flexbox for app layout */}
      <Navbar onNavigate={handleNavigation} activeTab={activeTab} toggleLoginForm={toggleLoginForm} />
      
      {/* App Header - Better spacing and padding */}
      <div className="pt-20 bg-white/90 backdrop-blur-sm border-b border-gray-100">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="flex-1">
              <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-emerald-700 to-teal-600 bg-clip-text text-transparent">
                EcoScope Dashboard
              </h1>
              <p className="text-gray-600 mt-1 text-sm lg:text-base">AI-Powered Environmental Intelligence Platform</p>
            </div>
            
            {/* Quick Stats - Better responsive layout */}
            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
              <div className="flex items-center space-x-2 bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-200">
                <Zap className="w-4 h-4 text-emerald-600" />
                <span className="text-sm font-semibold text-emerald-700">{userStats.streakDays} day streak</span>
              </div>
              <div className="flex items-center space-x-2 bg-blue-50 px-3 py-2 rounded-lg border border-blue-200">
                <Star className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-semibold text-blue-700">Level {Math.floor(userStats.totalScans / 25) + 1}</span>
              </div>
              <Badge variant="secondary" className="bg-gray-100 text-gray-700 px-3 py-1">
                <Award className="w-3 h-3 mr-1" />
                #{userStats.rank} globally
              </Badge>
            </div>
          </div>
          
          {/* Weekly Progress - Better spacing */}
          <div className="mt-6 bg-white rounded-lg p-4 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
                <Target className="w-4 h-4" />
                <span>Weekly Goal Progress</span>
              </span>
              <span className="text-sm text-gray-600">{userStats.currentWeekScans}/{userStats.weeklyGoal} scans</span>
            </div>
            <Progress value={(userStats.currentWeekScans / userStats.weeklyGoal) * 100} className="h-2" />
            <div className="flex justify-between mt-2 text-xs text-gray-500">
              <span>Keep going!</span>
              <span>{Math.round((userStats.currentWeekScans / userStats.weeklyGoal) * 100)}% complete</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area - Better responsive layout and pushes footer */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="xl:col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsContent value="scanner" className="mt-4">
                <ProductScanner onProductScanned={setScannedProduct} />
              </TabsContent>

              <TabsContent value="chatbot" className="mt-4">
                <EcoChatbot />
              </TabsContent>

              <TabsContent value="ar-scanner" className="mt-4">
                <ARProductScanner />
              </TabsContent>

              <TabsContent value="search" className="mt-4">
                <Card className="bg-white border-gray-200 shadow-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center space-x-3 text-gray-800">
                      <div className="p-2 bg-emerald-600 rounded-lg">
                        <Search className="w-5 h-5 text-white" />
                      </div>
                      <span>Search Products & Brands</span>
                      <Badge variant="secondary" className="ml-auto bg-emerald-100 text-emerald-700">
                        <Sparkles className="w-3 h-3 mr-1" />
                        AI Enhanced
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col sm:flex-row gap-3 mb-6">
                      <Input
                        placeholder="Search for products, brands, or barcodes..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="flex-1 border-gray-200 focus:border-emerald-400 h-11"
                      />
                      <Button className="bg-emerald-600 hover:bg-emerald-700 px-6 h-11 whitespace-nowrap">
                        Search
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {recentScans.map((product) => (
                        <Card key={product.id} className="hover:shadow-lg transition-shadow cursor-pointer border-gray-100 shadow-sm">
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-gray-800 truncate">{product.name}</h3>
                                <p className="text-sm text-gray-600">{product.brand}</p>
                              </div>
                              <Badge 
                                variant={product.score >= 80 ? "default" : product.score >= 60 ? "secondary" : "destructive"}
                                className={product.score >= 80 ? "bg-emerald-500 hover:bg-emerald-600" : ""}
                              >
                                {product.score}
                              </Badge>
                            </div>
                            <div className="flex justify-between items-center text-sm text-gray-500">
                              <span>{product.category}</span>
                              <span>{product.date}</span>
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

              <TabsContent value="comparison" className="mt-4">
                <ProductComparison />
              </TabsContent>

              <TabsContent value="education" className="mt-4">
                <EducationCenter />
              </TabsContent>

              <TabsContent value="notifications" className="mt-4">
                <NotificationCenter />
              </TabsContent>

              <TabsContent value="profile" className="mt-4">
                <UserProfile stats={userStats} />
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
            </Tabs>
          </div>

          {/* Enhanced Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <QuickActions onNavigate={handleNavigation} />

            {/* Your Impact */}
            <Card className="bg-white border-gray-200 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-gray-800 flex items-center space-x-3">
                  <div className="p-2 bg-emerald-600 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <span>Your Impact</span>
                  <Badge variant="outline" className="ml-auto border-emerald-200 text-emerald-700">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Live
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600 font-medium">Total Scans</span>
                  <span className="font-bold text-gray-800">{userStats.totalScans}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600 font-medium">Avg Score</span>
                  <span className="font-bold text-emerald-600">{userStats.avgScore}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600 font-medium">CO₂ Saved</span>
                  <span className="font-bold text-blue-600">{userStats.co2Saved} kg</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600 font-medium">Badges Earned</span>
                  <span className="font-bold text-amber-600">{userStats.badges}</span>
                </div>
                <div className="space-y-2">
                  <Progress value={65} className="h-2" />
                  <p className="text-xs text-gray-500 text-center">65% to next level</p>
                </div>
              </CardContent>
            </Card>

            {/* Top Companies */}
            <Card className="bg-white border-gray-200 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-gray-800 flex items-center space-x-3">
                  <div className="p-2 bg-emerald-600 rounded-lg">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <span>Top Sustainable Companies</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {topCompanies.map((company, index) => (
                  <div key={company.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <span className="text-sm font-bold text-gray-600 bg-gray-200 w-6 h-6 rounded-full flex items-center justify-center">#{index + 1}</span>
                      <span className="text-sm font-medium text-gray-800">{company.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-xs border-gray-200">
                        {company.score}
                      </Badge>
                      <span className="text-xs text-emerald-600 font-bold">{company.trend}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="bg-white border-gray-200 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-gray-800 flex items-center space-x-3">
                  <div className="p-2 bg-emerald-600 rounded-lg">
                    <Bell className="w-5 h-5 text-white" />
                  </div>
                  <span>Recent Scans</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentScans.slice(0, 3).map((scan) => (
                  <div key={scan.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{scan.name}</p>
                      <p className="text-xs text-gray-500">{scan.brand}</p>
                    </div>
                    <Badge 
                      variant={scan.score >= 80 ? "default" : "secondary"}
                      className={scan.score >= 80 ? "bg-emerald-500 hover:bg-emerald-600" : ""}
                    >
                      {scan.score}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Footer /> {/* Keep Footer outside main content but inside flex container */}
    </div>
  );
};

export default Index;
