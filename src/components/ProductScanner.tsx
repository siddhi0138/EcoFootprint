import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  Camera, 
  Scan, 
  Search, 
  Smartphone, 
  Sparkles, 
  CheckCircle, 
  TrendingUp,
  Leaf,
  Droplets,
  Zap,
  Heart,
  Award,
  BarChart3,
  Star,
  ArrowRight,
  ShoppingCart,
  Share2,
  Bookmark,
  Eye,
  Target,
  Wifi,
  Shield,
  Globe,
  Upload,
  FileImage,
  X,
  Plus,
  Minus
} from 'lucide-react';

const ProductScanner = ({ onProductScanned }) => {
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [manualInput, setManualInput] = useState('');
  const [activeTab, setActiveTab] = useState('camera');
  const [uploadedImage, setUploadedImage] = useState(null);
  const [showDetailedAnalysis, setShowDetailedAnalysis] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [cart, setCart] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const fileInputRef = useRef(null);
  const { toast } = useToast();

  const mockProducts = [
    {
      id: 1,
      name: "Organic Cotton T-Shirt",
      brand: "EcoWear",
      barcode: "1234567890123",
      category: "Clothing",
      price: 29.99,
      originalPrice: 39.99,
      image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400",
      sustainability: {
        overall: 85,
        carbon: 88,
        water: 82,
        waste: 90,
        energy: 85,
        ethics: 92
      },
      certifications: ["GOTS", "Fair Trade", "Organic"],
      description: "Made from 100% organic cotton with low environmental impact manufacturing processes.",
      features: [
        "100% Organic Cotton",
        "Fair Trade Certified",
        "Carbon Neutral Shipping",
        "Plastic-Free Packaging"
      ],
      alternatives: [
        { name: "Hemp T-Shirt", score: 92, brand: "GreenWear", reason: "Lower water usage" },
        { name: "Bamboo Tee", score: 89, brand: "EcoFiber", reason: "Faster growing material" }
      ],
      manufacturer: "EcoWear Industries",
      origin: "India",
      carbonFootprint: "2.1 kg CO2 equivalent",
      waterUsage: "120 liters",
      recyclable: true,
      biodegradable: true,
      certificationDetails: {
        "GOTS": "Global Organic Textile Standard - Ensures organic fiber content and environmental responsibility",
        "Fair Trade": "Workers receive fair wages and work in safe conditions",
        "Organic": "Grown without synthetic pesticides or fertilizers"
      },
      detailedAnalysis: {
        lifecycleAssessment: "Comprehensive environmental impact analysis from cradle to grave",
        materialSourcing: "Ethically sourced organic cotton from certified farms",
        manufacturingProcess: "Low-impact dyeing and processing methods",
        transportation: "Carbon-neutral shipping via renewable energy logistics",
        endOfLife: "100% biodegradable with home composting options"
      }
    },
    {
      id: 2,
      name: "Bamboo Water Bottle",
      brand: "HydroGreen",
      barcode: "2345678901234",
      category: "Drinkware",
      price: 24.99,
      originalPrice: 34.99,
      image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400",
      sustainability: {
        overall: 92,
        carbon: 94,
        water: 88,
        waste: 95,
        energy: 90,
        ethics: 89
      },
      certifications: ["FSC Certified", "BPA Free", "Organic"],
      description: "Sustainable bamboo water bottle with stainless steel interior for temperature retention.",
      features: [
        "Bamboo Exterior",
        "Stainless Steel Interior",
        "Temperature Retention",
        "Leak-Proof Design"
      ],
      alternatives: [
        { name: "Glass Water Bottle", score: 87, brand: "PureGlass", reason: "100% recyclable" },
        { name: "Steel Bottle", score: 84, brand: "MetalWare", reason: "Extremely durable" }
      ],
      manufacturer: "HydroGreen Corp",
      origin: "Vietnam",
      carbonFootprint: "1.8 kg CO2 equivalent",
      waterUsage: "85 liters",
      recyclable: true,
      biodegradable: false,
      certificationDetails: {
        "FSC Certified": "Forest Stewardship Council ensures responsible forest management",
        "BPA Free": "No harmful bisphenol A chemicals",
        "Organic": "Bamboo grown without chemical fertilizers"
      },
      detailedAnalysis: {
        lifecycleAssessment: "Complete environmental footprint analysis",
        materialSourcing: "Sustainably harvested bamboo from certified forests",
        manufacturingProcess: "Energy-efficient production with minimal waste",
        transportation: "Optimized logistics to reduce carbon emissions",
        endOfLife: "Recyclable components with bamboo biodegradability"
      }
    },
    {
      id: 3,
      name: "Solar Power Bank",
      brand: "SunTech",
      barcode: "3456789012345",
      category: "Electronics",
      price: 79.99,
      originalPrice: 99.99,
      image: "https://images.unsplash.com/photo-1593642532842-98d0fd5ebc1a?w=400",
      sustainability: {
        overall: 78,
        carbon: 75,
        water: 70,
        waste: 85,
        energy: 95,
        ethics: 80
      },
      certifications: ["Energy Star", "RoHS", "CE"],
      description: "Portable solar power bank with 20,000mAh capacity and fast charging technology.",
      features: [
        "20,000mAh Capacity",
        "Solar Charging Panel",
        "Fast Charge Technology",
        "Weather Resistant"
      ],
      alternatives: [
        { name: "Wind Power Bank", score: 82, brand: "WindTech", reason: "Alternative renewable energy" },
        { name: "Kinetic Charger", score: 76, brand: "MovePower", reason: "Human-powered charging" }
      ],
      manufacturer: "SunTech Solutions",
      origin: "China",
      carbonFootprint: "8.5 kg CO2 equivalent",
      waterUsage: "450 liters",
      recyclable: true,
      biodegradable: false,
      certificationDetails: {
        "Energy Star": "Meets energy efficiency guidelines",
        "RoHS": "Restriction of Hazardous Substances compliance",
        "CE": "European Conformity marking"
      },
      detailedAnalysis: {
        lifecycleAssessment: "Environmental impact assessment including solar panel efficiency",
        materialSourcing: "Responsibly sourced materials with conflict-free minerals",
        manufacturingProcess: "Clean energy manufacturing facilities",
        transportation: "Bulk shipping to minimize per-unit emissions",
        endOfLife: "E-waste recycling program available"
      }
    }
  ];

  const handleScan = () => {
    setScanning(true);
    setTimeout(() => {
      const randomProduct = mockProducts[Math.floor(Math.random() * mockProducts.length)];
      setScanResult(randomProduct);
      setScanning(false);
      if (onProductScanned) {
        onProductScanned(randomProduct);
      }
      toast({
        title: "Product Scanned Successfully!",
        description: `Found: ${randomProduct.name}`,
      });
    }, 2000);
  };

  const handleManualSearch = () => {
    if (!manualInput.trim()) return;
    
    const searchTerm = manualInput.toLowerCase();
    const foundProduct = mockProducts.find(product => 
      product.name.toLowerCase().includes(searchTerm) ||
      product.brand.toLowerCase().includes(searchTerm) ||
      product.barcode.includes(searchTerm) ||
      product.category.toLowerCase().includes(searchTerm)
    );
    
    setScanning(true);
    setTimeout(() => {
      setScanResult(foundProduct || mockProducts[0]);
      setScanning(false);
      if (onProductScanned) {
        onProductScanned(foundProduct || mockProducts[0]);
      }
      toast({
        title: "Search Complete!",
        description: `Found: ${(foundProduct || mockProducts[0]).name}`,
      });
    }, 1500);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target.result);
        setActiveTab('upload');
        toast({
          title: "Image Uploaded!",
          description: "Processing image for product recognition...",
        });
        // Simulate image analysis
        setTimeout(() => {
          handleScan();
        }, 2000);
      };
      reader.readAsDataURL(file);
    } else {
      toast({
        title: "Invalid File",
        description: "Please upload an image file.",
        variant: "destructive"
      });
    }
  };

  const addToCart = (product) => {
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      setCart(cart.map(item => 
        item.id === product.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
    toast({
      title: "Added to Cart!",
      description: `${product.name} added successfully.`,
    });
  };

  const removeFromCart = (productId) => {
    const existingItem = cart.find(item => item.id === productId);
    if (existingItem && existingItem.quantity > 1) {
      setCart(cart.map(item => 
        item.id === productId 
          ? { ...item, quantity: item.quantity - 1 }
          : item
      ));
    } else {
      setCart(cart.filter(item => item.id !== productId));
    }
  };

  const toggleFavorite = (productId) => {
    setFavorites(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
    toast({
      title: favorites.includes(productId) ? "Removed from Favorites" : "Added to Favorites",
      description: "Your favorites have been updated.",
    });
  };

  const shareResults = (product) => {
    const shareText = `Check out this eco-friendly product: ${product.name} by ${product.brand} - Sustainability Score: ${product.sustainability.overall}/100`;
    if (navigator.share) {
      navigator.share({
        title: `Eco Product: ${product.name}`,
        text: shareText,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(shareText);
      toast({
        title: "Copied to Clipboard!",
        description: "Product details copied for sharing.",
      });
    }
  };

  const showDetailedAnalysisModal = (product) => {
    setShowDetailedAnalysis(true);
    toast({
      title: "Detailed Analysis",
      description: "Opening comprehensive sustainability report...",
    });
  };

  const compareProducts = (product) => {
    setShowComparison(true);
    toast({
      title: "Product Comparison",
      description: "Comparing with similar products...",
    });
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "text-emerald-600 bg-emerald-50 border-emerald-200";
    if (score >= 60) return "text-amber-600 bg-amber-50 border-amber-200";
    return "text-red-600 bg-red-50 border-red-200";
  };

  const sustainabilityMetrics = scanResult ? [
    { icon: Leaf, title: "Carbon", value: scanResult.sustainability.carbon, subtitle: "Low impact", color: "text-emerald-600", bg: "bg-emerald-100" },
    { icon: Droplets, title: "Water", value: scanResult.sustainability.water, subtitle: "Efficient use", color: "text-blue-600", bg: "bg-blue-100" },
    { icon: Zap, title: "Energy", value: scanResult.sustainability.energy, subtitle: "Renewable", color: "text-purple-600", bg: "bg-purple-100" },
    { icon: Heart, title: "Ethics", value: scanResult.sustainability.ethics, subtitle: "Fair trade", color: "text-red-600", bg: "bg-red-100" }
  ] : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/20 p-4">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Left-aligned Header with Upload */}
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Scan className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                Smart Product Scanner
              </h1>
              <p className="text-slate-600">AI-powered sustainability analysis</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              className="hidden"
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              className="border-2 border-emerald-300 hover:bg-emerald-50"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Image
            </Button>
            <Badge variant="outline" className="border-slate-300 text-slate-600 px-3 py-1">
              <ShoppingCart className="w-3 h-3 mr-1" />
              Cart ({cart.reduce((sum, item) => sum + item.quantity, 0)} items)
            </Badge>
          </div>
        </div>

        {/* Main Scanner Interface */}
        <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl rounded-3xl overflow-hidden">
          <CardHeader className="pb-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 px-4 py-2 rounded-xl border border-emerald-200">
                  <Sparkles className="w-4 h-4 mr-2" />
                  AI Enhanced
                </Badge>
                <Badge variant="outline" className="border-slate-300 text-slate-600 px-3 py-1">
                  <Globe className="w-3 h-3 mr-1" />
                  1M+ Products
                </Badge>
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex items-center text-sm text-emerald-600">
                  <Shield className="w-4 h-4 mr-1" />
                  Secure
                </div>
                <div className="flex items-center text-sm text-blue-600">
                  <Wifi className="w-4 h-4 mr-1" />
                  Real-time
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-8">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4 bg-slate-100/80 rounded-2xl p-2 backdrop-blur-sm">
                <TabsTrigger value="camera" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-md transition-all duration-200">
                  <Camera className="w-5 h-5 mr-2" />
                  Camera
                </TabsTrigger>
                <TabsTrigger value="barcode" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-md transition-all duration-200">
                  <Smartphone className="w-5 h-5 mr-2" />
                  Barcode
                </TabsTrigger>
                <TabsTrigger value="search" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-md transition-all duration-200">
                  <Search className="w-5 h-5 mr-2" />
                  Search
                </TabsTrigger>
                <TabsTrigger value="upload" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-md transition-all duration-200">
                  <FileImage className="w-5 h-5 mr-2" />
                  Upload
                </TabsTrigger>
              </TabsList>

              <TabsContent value="camera" className="mt-8">
                <div className="relative">
                  <div className="aspect-video bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl overflow-hidden border-4 border-slate-200/50 shadow-2xl">
                    <div className="relative h-full flex flex-col items-center justify-center">
                      <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
                        <Badge className="bg-emerald-600 text-white border-0 px-3 py-1">
                          <Eye className="w-3 h-3 mr-1" />
                          Live View
                        </Badge>
                        <div className="flex items-center space-x-2 text-white/80 text-sm">
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                          Ready to scan
                        </div>
                      </div>

                      {scanning ? (
                        <div className="text-center text-white flex flex-col items-center justify-center">
                          <div className="relative mb-8">
                            <div className="w-32 h-32 border-4 border-emerald-400 rounded-full animate-spin border-t-transparent"></div>
                            <Target className="w-12 h-12 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-emerald-400" />
                          </div>
                          <div className="space-y-3 text-center">
                            <h3 className="text-xl font-semibold">Analyzing Product...</h3>
                            <p className="text-white/70">AI processing in progress</p>
                            <Progress value={65} className="w-48 mx-auto" />
                          </div>
                        </div>
                      ) : (
                        <div className="text-center text-white flex flex-col items-center justify-center">
                          <div className="w-48 h-48 border-4 border-dashed border-emerald-400/50 rounded-3xl flex items-center justify-center mb-8 backdrop-blur-sm bg-white/5">
                            <Camera className="w-20 h-20 text-emerald-400" />
                          </div>
                          <div className="text-center">
                            <h3 className="text-2xl font-semibold mb-3">Point & Scan</h3>
                            <p className="text-white/70 mb-8 max-w-md">Aim your camera at any product for instant analysis</p>
                          </div>
                        </div>
                      )}

                      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
                        <Button 
                          onClick={handleScan} 
                          disabled={scanning}
                          size="lg"
                          className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 rounded-full w-20 h-20 shadow-2xl border-4 border-white/20 backdrop-blur-sm transition-all duration-300 hover:scale-105"
                        >
                          <Scan className="w-8 h-8" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="barcode" className="mt-8">
                <div className="text-center py-12">
                  <div className="w-40 h-40 mx-auto mb-8 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center shadow-xl border-8 border-white">
                    {scanning ? (
                      <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-blue-600"></div>
                    ) : (
                      <Smartphone className="w-20 h-20 text-blue-600" />
                    )}
                  </div>
                  <Button 
                    onClick={handleScan} 
                    disabled={scanning}
                    size="lg"
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 px-12 py-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
                  >
                    {scanning ? 'Scanning Barcode...' : 'Scan Barcode'}
                  </Button>
                  <p className="text-slate-500 mt-4 max-w-md mx-auto">Position the barcode within the camera frame for automatic detection and analysis</p>
                </div>
              </TabsContent>

              <TabsContent value="search" className="mt-8">
                <div className="max-w-2xl mx-auto space-y-6">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-4 flex items-center">
                      <Search className="w-5 h-5 text-slate-400" />
                    </div>
                    <Input
                      placeholder="Try: organic cotton, bamboo, solar, SunTech..."
                      value={manualInput}
                      onChange={(e) => setManualInput(e.target.value)}
                      className="pl-12 pr-32 h-16 text-lg border-2 border-slate-200 focus:border-emerald-400 rounded-2xl shadow-lg bg-white/80 backdrop-blur-sm"
                      onKeyPress={(e) => e.key === 'Enter' && handleManualSearch()}
                    />
                    <Button 
                      onClick={handleManualSearch}
                      disabled={scanning || !manualInput.trim()}
                      className="absolute right-2 top-2 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 h-12 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      {scanning ? 'Searching...' : 'Search'}
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div className="p-4 bg-white/60 rounded-xl border border-slate-200/50">
                      <div className="text-2xl font-bold text-emerald-600">1M+</div>
                      <div className="text-sm text-slate-600">Products</div>
                    </div>
                    <div className="p-4 bg-white/60 rounded-xl border border-slate-200/50">
                      <div className="text-2xl font-bold text-blue-600">500+</div>
                      <div className="text-sm text-slate-600">Brands</div>
                    </div>
                    <div className="p-4 bg-white/60 rounded-xl border border-slate-200/50">
                      <div className="text-2xl font-bold text-purple-600">50+</div>
                      <div className="text-sm text-slate-600">Categories</div>
                    </div>
                    <div className="p-4 bg-white/60 rounded-xl border border-slate-200/50">
                      <div className="text-2xl font-bold text-amber-600">24/7</div>
                      <div className="text-sm text-slate-600">Updated</div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="upload" className="mt-8">
                <div className="text-center py-12">
                  {uploadedImage ? (
                    <div className="max-w-md mx-auto">
                      <div className="relative mb-6">
                        <img 
                          src={uploadedImage} 
                          alt="Uploaded product" 
                          className="w-full h-64 object-cover rounded-2xl shadow-lg"
                        />
                        <Button
                          onClick={() => setUploadedImage(null)}
                          size="sm"
                          variant="outline"
                          className="absolute top-2 right-2 bg-white/90 hover:bg-white"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                      <p className="text-slate-600 mb-4">Analyzing uploaded image...</p>
                      <Progress value={80} className="w-full mb-4" />
                    </div>
                  ) : (
                    <div className="max-w-md mx-auto">
                      <div className="w-40 h-40 mx-auto mb-8 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center shadow-xl border-8 border-white">
                        <Upload className="w-20 h-20 text-purple-600" />
                      </div>
                      <Button 
                        onClick={() => fileInputRef.current?.click()}
                        size="lg"
                        className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 px-12 py-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
                      >
                        <Upload className="w-5 h-5 mr-2" />
                        Choose Image File
                      </Button>
                      <p className="text-slate-500 mt-4">Upload a product image for AI analysis</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Enhanced Scan Results */}
        {scanResult && (
          <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl rounded-3xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-emerald-50 to-green-50 border-b border-emerald-100">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <Badge className="bg-emerald-600 text-white">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                    <Badge variant="outline" className="border-slate-300 text-slate-600">
                      {scanResult.category}
                    </Badge>
                    <Badge variant="outline" className="border-slate-300 text-slate-600">
                      {scanResult.origin}
                    </Badge>
                  </div>
                  <h3 className="text-3xl font-bold text-slate-800 mb-2">{scanResult.name}</h3>
                  <p className="text-xl text-slate-600 mb-1">{scanResult.brand}</p>
                  <div className="flex items-center space-x-4">
                    <p className="text-lg font-semibold text-emerald-600">${scanResult.price}</p>
                    {scanResult.originalPrice > scanResult.price && (
                      <p className="text-sm text-slate-500 line-through">${scanResult.originalPrice}</p>
                    )}
                  </div>
                </div>
                <div className="text-center">
                  <div className={`text-5xl font-bold ${getScoreColor(scanResult.sustainability.overall)} rounded-2xl p-6 border-2 shadow-lg`}>
                    {scanResult.sustainability.overall}
                  </div>
                  <Badge className="bg-emerald-500 text-white mt-3 px-4 py-1">
                    <Star className="w-4 h-4 mr-1" />
                    Excellent Choice
                  </Badge>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-8 space-y-8">
              {/* Product Image and Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-1">
                  <img 
                    src={scanResult.image} 
                    alt={scanResult.name}
                    className="w-full h-64 object-cover rounded-2xl shadow-lg"
                  />
                </div>
                <div className="md:col-span-2 space-y-4">
                  <div>
                    <h4 className="text-lg font-semibold text-slate-800 mb-2">Product Description</h4>
                    <p className="text-slate-600 leading-relaxed">{scanResult.description}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="bg-slate-50 p-3 rounded-lg">
                      <span className="font-medium text-slate-800">Manufacturer:</span>
                      <p className="text-slate-600">{scanResult.manufacturer}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg">
                      <span className="font-medium text-slate-800">Origin:</span>
                      <p className="text-slate-600">{scanResult.origin}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg">
                      <span className="font-medium text-slate-800">Carbon Footprint:</span>
                      <p className="text-slate-600">{scanResult.carbonFootprint}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg">
                      <span className="font-medium text-slate-800">Water Usage:</span>
                      <p className="text-slate-600">{scanResult.waterUsage}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sustainability Metrics */}
              <div>
                <h4 className="text-xl font-semibold text-slate-800 mb-6 flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2 text-emerald-600" />
                  Sustainability Analysis
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {sustainabilityMetrics.map((metric, index) => (
                    <div key={index} className="relative group">
                      <div className="text-center p-6 bg-white rounded-2xl border-2 border-slate-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                        <div className={`w-16 h-16 ${metric.bg} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md`}>
                          <metric.icon className={`w-8 h-8 ${metric.color}`} />
                        </div>
                        <div className="text-3xl font-bold text-slate-800 mb-1">{metric.value}</div>
                        <div className="text-sm font-semibold text-slate-600 mb-1">{metric.title}</div>
                        <div className="text-xs text-slate-500">{metric.subtitle}</div>
                        <Progress value={metric.value} className="mt-3 h-2" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Product Features */}
              <div>
                <h4 className="text-xl font-semibold text-slate-800 mb-6 flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
                  Key Features & Benefits
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {scanResult.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-2 border-green-200/50 shadow-sm hover:shadow-md transition-all duration-200">
                      <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center shadow-md">
                        <CheckCircle className="w-5 h-5 text-white" />
                      </div>
                      <span className="font-medium text-slate-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Certifications with Details */}
              <div>
                <h4 className="text-xl font-semibold text-slate-800 mb-6 flex items-center">
                  <Award className="w-5 h-5 mr-2 text-blue-500" />
                  Certifications & Standards
                </h4>
                <div className="space-y-4">
                  {scanResult.certifications.map((cert, index) => (
                    <div key={index} className="border border-blue-200 rounded-xl p-4 bg-blue-50/50 hover:bg-blue-50 transition-colors duration-200">
                      <div className="flex items-start space-x-3">
                        <Badge className="bg-blue-600 text-white px-3 py-1 mt-1">
                          <Award className="w-3 h-3 mr-1" />
                          {cert}
                        </Badge>
                        <div className="flex-1">
                          <p className="text-sm text-slate-600">
                            {scanResult.certificationDetails[cert] || "Official certification ensuring quality and sustainability standards."}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Alternative Products */}
              <div>
                <h4 className="text-xl font-semibold text-slate-800 mb-6 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-amber-500" />
                  Alternative Products
                </h4>
                <div className="space-y-4">
                  {scanResult.alternatives.map((alt, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors duration-200">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-1">
                          <span className="font-semibold text-slate-800">{alt.name}</span>
                          <span className="text-sm text-slate-500">by {alt.brand}</span>
                        </div>
                        <p className="text-sm text-slate-600">{alt.reason}</p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge variant="outline" className="border-emerald-300 text-emerald-700 bg-emerald-50">
                          {alt.score}
                        </Badge>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Functional Action Buttons */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 pt-6 border-t border-slate-200">
                <Button 
                  variant="outline" 
                  className="h-12 border-2 border-slate-300 hover:bg-slate-50 rounded-xl"
                  onClick={() => showDetailedAnalysisModal(scanResult)}
                >
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Detailed Analysis
                </Button>
                <Button 
                  variant="outline" 
                  className="h-12 border-2 border-slate-300 hover:bg-slate-50 rounded-xl"
                  onClick={() => compareProducts(scanResult)}
                >
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Compare Products
                </Button>
                <Button 
                  variant="outline" 
                  className="h-12 border-2 border-slate-300 hover:bg-slate-50 rounded-xl"
                  onClick={() => shareResults(scanResult)}
                >
                  <Share2 className="w-5 h-5 mr-2" />
                  Share Results
                </Button>
                <Button 
                  variant="outline" 
                  className="h-12 border-2 border-slate-300 hover:bg-slate-50 rounded-xl"
                  onClick={() => toggleFavorite(scanResult.id)}
                >
                  <Heart className={`w-5 h-5 mr-2 ${favorites.includes(scanResult.id) ? 'fill-red-500 text-red-500' : ''}`} />
                  {favorites.includes(scanResult.id) ? 'Favorited' : 'Add to Favorites'}
                </Button>
                <Button 
                  className="h-12 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 rounded-xl"
                  onClick={() => addToCart(scanResult)}
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Add to Cart
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Cart Summary */}
        {cart.length > 0 && (
          <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl rounded-3xl overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ShoppingCart className="w-6 h-6 text-emerald-600" />
                <span>Shopping Cart ({cart.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-xl">
                    <div className="flex items-center space-x-4">
                      <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-lg" />
                      <div>
                        <h5 className="font-semibold text-slate-800">{item.name}</h5>
                        <p className="text-sm text-slate-600">{item.brand}</p>
                        <p className="text-sm font-medium text-emerald-600">${item.price}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => removeFromCart(item.id)}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <span className="font-medium">{item.quantity}</span>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => addToCart(item)}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                <div className="flex justify-between items-center pt-4 border-t border-slate-200">
                  <span className="text-lg font-semibold">Total: ${cart.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}</span>
                  <Button className="bg-gradient-to-r from-emerald-500 to-green-600">
                    Proceed to Checkout
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ProductScanner;
