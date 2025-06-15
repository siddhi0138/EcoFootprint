
import React, { useState } from 'react';
import { Search, Leaf, Database, Upload, Scan, User, History, Calculator, Trophy, Newspaper, HelpCircle, Settings as SettingsIcon, BarChart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProductAnalyzer from '@/components/ProductAnalyzer';
import ImpactScore from '@/components/ImpactScore';
import ProductComparison from '@/components/ProductComparison';
import FileUpload from '@/components/FileUpload';
import BarcodeScanner from '@/components/BarcodeScanner';
import AuthModal from '@/components/AuthModal';
import UserProfile from '@/components/UserProfile';
import CarbonCalculator from '@/components/CarbonCalculator';
import EcoChallenges from '@/components/EcoChallenges';
import EcoNewsFeed from '@/components/EcoNewsFeed';
import Dashboard from '@/components/Dashboard';
import Settings from '@/components/Settings';
import Help from '@/components/Help';
import { UserProvider, useUser } from '@/contexts/UserContext';
import { useProductHistory } from '@/hooks/useProductHistory';

const IndexContent = () => {
  const [currentView, setCurrentView] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [analysisMethod, setAnalysisMethod] = useState('search');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const { user, updateUser } = useUser();
  const { history, addToHistory } = useProductHistory();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setCurrentView('analysis');
      setAnalysisMethod('search');
      
      // Add to history and update user stats
      addToHistory({
        name: searchQuery,
        brand: 'Unknown Brand',
        category: 'Consumer Product',
        score: Math.floor(Math.random() * 40) + 50,
        image: '📦',
        method: 'search'
      });
      
      if (user) {
        updateUser({ analysisCount: user.analysisCount + 1 });
      }
    }
  };

  const handleFileAnalyzed = (fileName: string, fileType: string) => {
    setSearchQuery(`${fileName} (${fileType} analysis)`);
    setCurrentView('analysis');
    setAnalysisMethod('file');
    
    addToHistory({
      name: fileName,
      brand: 'File Analysis',
      category: fileType,
      score: Math.floor(Math.random() * 40) + 60,
      image: '📄',
      method: 'file'
    });
    
    if (user) {
      updateUser({ analysisCount: user.analysisCount + 1 });
    }
  };

  const handleBarcodeScanned = (barcode: string, productData: any) => {
    setSearchQuery(productData.name);
    setCurrentView('analysis');
    setAnalysisMethod('barcode');
    
    addToHistory({
      name: productData.name,
      brand: productData.brand,
      category: productData.category,
      score: Math.floor(Math.random() * 40) + 65,
      image: productData.image,
      method: 'barcode'
    });
    
    if (user) {
      updateUser({ analysisCount: user.analysisCount + 1 });
    }
  };

  const resetToHome = () => {
    setCurrentView('home');
    setSearchQuery('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-emerald-100 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div 
              className="flex items-center space-x-2 cursor-pointer group"
              onClick={resetToHome}
            >
              <div className="p-2 rounded-lg bg-emerald-100 group-hover:bg-emerald-200 transition-colors">
                <Leaf className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">EcoAnalyzer</h1>
                <p className="text-xs text-emerald-600">AI Environmental Impact</p>
              </div>
            </div>
            <nav className="hidden md:flex items-center space-x-6">
              <button 
                onClick={() => setCurrentView('comparison')}
                className="text-gray-600 hover:text-emerald-600 transition-colors"
              >
                Compare Products
              </button>
              <button 
                onClick={() => setCurrentView('calculator')}
                className="text-gray-600 hover:text-emerald-600 transition-colors flex items-center space-x-1"
              >
                <Calculator className="h-4 w-4" />
                <span>Carbon Calculator</span>
              </button>
              <button 
                onClick={() => setCurrentView('challenges')}
                className="text-gray-600 hover:text-emerald-600 transition-colors flex items-center space-x-1"
              >
                <Trophy className="h-4 w-4" />
                <span>Challenges</span>
              </button>
              <button 
                onClick={() => setCurrentView('news')}
                className="text-gray-600 hover:text-emerald-600 transition-colors flex items-center space-x-1"
              >
                <Newspaper className="h-4 w-4" />
                <span>News</span>
              </button>
              <button 
                onClick={() => setCurrentView('history')}
                className="text-gray-600 hover:text-emerald-600 transition-colors flex items-center space-x-1"
              >
                <History className="h-4 w-4" />
                <span>History</span>
              </button>
              {user ? (
                <button 
                  onClick={() => setCurrentView('profile')}
                  className="flex items-center space-x-2 text-gray-600 hover:text-emerald-600 transition-colors"
                >
                  <User className="h-4 w-4" />
                  <span>{user.name}</span>
                </button>
              ) : (
                <Button 
                  onClick={() => setAuthModalOpen(true)}
                  variant="outline"
                  className="border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                >
                  Login
                </Button>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {currentView === 'home' && (
          <>
            {/* Hero Section */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center space-x-2 bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full mb-6">
                <Database className="h-4 w-4" />
                <span className="text-sm font-medium">AI-Powered Analysis</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                Discover the True
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600 block">
                  Environmental Impact
                </span>
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
                Our AI analyzes product descriptions, images, barcodes, and documents 
                to generate comprehensive environmental footprint scores.
              </p>

              {/* Quick Stats */}
              {user && (
                <div className="flex justify-center space-x-8 mb-8">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-emerald-600">{user.analysisCount}</div>
                    <div className="text-sm text-gray-600">Products Analyzed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-emerald-600">{user.greenScore}</div>
                    <div className="text-sm text-gray-600">Green Score</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-emerald-600">{history.length}</div>
                    <div className="text-sm text-gray-600">History Items</div>
                  </div>
                </div>
              )}

              {/* Input Methods Tabs */}
              <div className="max-w-4xl mx-auto mb-12">
                <Tabs defaultValue="search" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 mb-6">
                    <TabsTrigger value="search" className="flex items-center space-x-2">
                      <Search className="h-4 w-4" />
                      <span>Search</span>
                    </TabsTrigger>
                    <TabsTrigger value="upload" className="flex items-center space-x-2">
                      <Upload className="h-4 w-4" />
                      <span>Upload</span>
                    </TabsTrigger>
                    <TabsTrigger value="barcode" className="flex items-center space-x-2">
                      <Scan className="h-4 w-4" />
                      <span>Barcode</span>
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="search">
                    <form onSubmit={handleSearch}>
                      <div className="relative">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input
                          type="text"
                          placeholder="Enter product name, brand, or description..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-12 pr-24 py-4 text-lg border-2 border-emerald-200 focus:border-emerald-400 rounded-xl"
                        />
                        <Button 
                          type="submit"
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg"
                        >
                          Analyze
                        </Button>
                      </div>
                    </form>
                  </TabsContent>
                  
                  <TabsContent value="upload">
                    <FileUpload onFileAnalyzed={handleFileAnalyzed} />
                  </TabsContent>
                  
                  <TabsContent value="barcode">
                    <BarcodeScanner onBarcodeScanned={handleBarcodeScanned} />
                  </TabsContent>
                </Tabs>
              </div>
            </div>

            {/* Recent History Preview */}
            {history.length > 0 && (
              <div className="mb-12">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Recently Analyzed</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {history.slice(0, 4).map((product) => (
                    <Card 
                      key={product.id} 
                      className="border-emerald-200 hover:border-emerald-300 transition-colors cursor-pointer"
                      onClick={() => {
                        setSearchQuery(product.name);
                        setCurrentView('analysis');
                      }}
                    >
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl mb-2">{product.image}</div>
                        <h4 className="font-medium text-gray-900 text-sm">{product.name}</h4>
                        <p className="text-xs text-gray-600">{product.brand}</p>
                        <div className="mt-2">
                          <span className="text-sm font-bold text-emerald-600">{product.score}/100</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Features Grid */}
            <div className="grid md:grid-cols-4 gap-8 mb-12">
              <Card className="border-emerald-200 hover:border-emerald-300 transition-colors group cursor-pointer"
                    onClick={() => setCurrentView('comparison')}>
                <CardHeader>
                  <div className="p-3 bg-emerald-100 rounded-lg w-fit group-hover:bg-emerald-200 transition-colors">
                    <Search className="h-6 w-6 text-emerald-600" />
                  </div>
                  <CardTitle className="text-gray-900">Product Comparison</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm">
                    Compare up to 4 products side-by-side with detailed environmental impact analysis.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-emerald-200 hover:border-emerald-300 transition-colors group cursor-pointer"
                    onClick={() => setCurrentView('calculator')}>
                <CardHeader>
                  <div className="p-3 bg-emerald-100 rounded-lg w-fit group-hover:bg-emerald-200 transition-colors">
                    <Calculator className="h-6 w-6 text-emerald-600" />
                  </div>
                  <CardTitle className="text-gray-900">Carbon Calculator</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm">
                    Calculate your personal carbon footprint and get personalized reduction tips.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-emerald-200 hover:border-emerald-300 transition-colors group cursor-pointer"
                    onClick={() => setCurrentView('challenges')}>
                <CardHeader>
                  <div className="p-3 bg-emerald-100 rounded-lg w-fit group-hover:bg-emerald-200 transition-colors">
                    <Trophy className="h-6 w-6 text-emerald-600" />
                  </div>
                  <CardTitle className="text-gray-900">Eco Challenges</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm">
                    Join sustainability challenges and earn achievements for eco-friendly actions.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-emerald-200 hover:border-emerald-300 transition-colors group cursor-pointer"
                    onClick={() => setCurrentView('news')}>
                <CardHeader>
                  <div className="p-3 bg-emerald-100 rounded-lg w-fit group-hover:bg-emerald-200 transition-colors">
                    <Newspaper className="h-6 w-6 text-emerald-600" />
                  </div>
                  <CardTitle className="text-gray-900">Environmental News</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm">
                    Stay updated with the latest environmental developments and sustainability trends.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Sample Analysis Preview */}
            <div className="bg-white rounded-2xl border border-emerald-200 p-8 text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">See It In Action</h3>
              <p className="text-gray-600 mb-6">Try analyzing popular products to see how our AI works</p>
              <div className="flex flex-wrap justify-center gap-4">
                {['iPhone 15', 'Nike Air Max', 'Tesla Model 3', 'Patagonia Jacket'].map((product) => (
                  <Button
                    key={product}
                    variant="outline"
                    onClick={() => {
                      setSearchQuery(product);
                      setCurrentView('analysis');
                    }}
                    className="border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                  >
                    {product}
                  </Button>
                ))}
              </div>
            </div>
          </>
        )}

        {currentView === 'analysis' && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <Button 
                variant="outline" 
                onClick={resetToHome}
                className="border-emerald-300 text-emerald-700 hover:bg-emerald-50"
              >
                ← Back to Search
              </Button>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  Analyzed via: {analysisMethod === 'search' ? 'Search' : analysisMethod === 'file' ? 'File Upload' : 'Barcode'}
                </span>
                <Button 
                  onClick={() => setCurrentView('comparison')}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  Compare Products
                </Button>
              </div>
            </div>
            <ProductAnalyzer productQuery={searchQuery} />
            <ImpactScore />
          </div>
        )}

        {currentView === 'comparison' && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <Button 
                variant="outline" 
                onClick={resetToHome}
                className="border-emerald-300 text-emerald-700 hover:bg-emerald-50"
              >
                ← Back to Home
              </Button>
              <h2 className="text-2xl font-bold text-gray-900">Product Comparison</h2>
            </div>
            <ProductComparison />
          </div>
        )}

        {currentView === 'calculator' && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <Button 
                variant="outline" 
                onClick={resetToHome}
                className="border-emerald-300 text-emerald-700 hover:bg-emerald-50"
              >
                ← Back to Home
              </Button>
              <h2 className="text-2xl font-bold text-gray-900">Carbon Footprint Calculator</h2>
            </div>
            <CarbonCalculator />
          </div>
        )}

        {currentView === 'challenges' && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <Button 
                variant="outline" 
                onClick={resetToHome}
                className="border-emerald-300 text-emerald-700 hover:bg-emerald-50"
              >
                ← Back to Home
              </Button>
              <h2 className="text-2xl font-bold text-gray-900">Eco Challenges & Achievements</h2>
            </div>
            <EcoChallenges />
          </div>
        )}

        {currentView === 'news' && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <Button 
                variant="outline" 
                onClick={resetToHome}
                className="border-emerald-300 text-emerald-700 hover:bg-emerald-50"
              >
                ← Back to Home
              </Button>
              <h2 className="text-2xl font-bold text-gray-900">Environmental News</h2>
            </div>
            <EcoNewsFeed />
          </div>
        )}

        {currentView === 'history' && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <Button 
                variant="outline" 
                onClick={resetToHome}
                className="border-emerald-300 text-emerald-700 hover:bg-emerald-50"
              >
                ← Back to Home
              </Button>
              <h2 className="text-2xl font-bold text-gray-900">Analysis History</h2>
            </div>
            
            {history.length === 0 ? (
              <Card className="border-emerald-200 text-center p-12">
                <CardContent>
                  <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-gray-900 mb-2">No Analysis History</h3>
                  <p className="text-gray-600">Start analyzing products to see your history here.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {history.map((product) => (
                  <Card key={product.id} className="border-emerald-200">
                    <CardContent className="flex items-center justify-between p-4">
                      <div className="flex items-center space-x-4">
                        <div className="text-2xl">{product.image}</div>
                        <div>
                          <h4 className="font-medium text-gray-900">{product.name}</h4>
                          <p className="text-sm text-gray-600">{product.brand} • {product.category}</p>
                          <p className="text-xs text-gray-500">
                            {product.analyzedAt.toLocaleDateString()} via {product.method}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-emerald-600">{product.score}/100</div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSearchQuery(product.name);
                            setCurrentView('analysis');
                          }}
                          className="mt-2"
                        >
                          Re-analyze
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {currentView === 'profile' && user && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <Button 
                variant="outline" 
                onClick={resetToHome}
                className="border-emerald-300 text-emerald-700 hover:bg-emerald-50"
              >
                ← Back to Home
              </Button>
              <h2 className="text-2xl font-bold text-gray-900">My Profile</h2>
            </div>
            <UserProfile />
          </div>
        )}
      </main>

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </div>
  );
};

const Index = () => {
  return (
    <UserProvider>
      <IndexContent />
    </UserProvider>
  );
};

export default Index;
