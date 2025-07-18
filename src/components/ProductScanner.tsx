import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import {
  Camera,
  Scan,
  Zap,
  CheckCircle,
  AlertCircle,
  Info,
  ArrowRight,
  Play,
  Square,
  Leaf,
  Droplets,
  Heart,
  ShoppingCart,
  Upload,
  Search,
  Image as ImageIcon,
  FileImage
} from "lucide-react";
import {
  collection,
  doc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { Factory, Truck, Package } from 'lucide-react';
import { useAuth } from "../contexts/AuthContext";
import { db } from "../firebase";
import { getRandomProducts } from '../data/productsData';
import { useUserData } from '../contexts/UserDataContext';
import { useProductComparison } from '../contexts/ProductComparisonContext';

import { useCart } from "../contexts/CartContext";
import { useNotifications } from '../contexts/NotificationsContextNew';

interface ProductScannerProps {
  scannedProduct: any; // Define a more specific type if possible
  setScannedProduct: React.Dispatch<any>; // Define a more specific type if possible
  onTabChange?: (tab: string) => void;
  saveScannedProduct?: (product: any) => void;
}

const ProductScanner: React.FC<ProductScannerProps> = ({ scannedProduct, setScannedProduct, onTabChange, saveScannedProduct }) => {
  const navigate = useNavigate();  const { scannedProducts, addScannedProduct } = useUserData();
  const { addToCart } = useCart();
  const { addProductToComparison } = useProductComparison();
  const { addNotification } = useNotifications();
  const [isScanning, setIsScanning] = useState(false);
  const [detectedProduct, setDetectedProduct] = useState(null);
  const [scanMode, setScanMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [stream, setStream] = useState(null);
  const videoRef = useRef(null);
  const fileInputRef = useRef(null);

  // Sync detectedProduct with scannedProduct prop and preserve on tab switch
  useEffect(() => {
    if (scannedProduct) {
      setDetectedProduct(scannedProduct);
    }
  }, [scannedProduct]);

  // Automatically save detectedProduct to recent scans when it changes
  useEffect(() => {
    if (detectedProduct) {
      // Check if product is already in scannedProducts to avoid duplicates and infinite loops
      const alreadySaved = scannedProducts.some(p => p.id === detectedProduct.id.toString());
      if (!alreadySaved) {
        const today = new Date();
        addScannedProduct({
          id: detectedProduct.id.toString(),
          name: detectedProduct.name,
          brand: detectedProduct.brand,
          sustainabilityScore: detectedProduct.sustainabilityScore,
          category: detectedProduct.category,
          date: `${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getDate().toString().padStart(2, '0')}/${today.getFullYear()}`,
          alternatives: detectedProduct.alternatives || [],
          source: 'ProductScanner',
        });
      }
    }
  }, [detectedProduct, addScannedProduct, scannedProducts]);

  // Preserve detectedProduct on tab switch by not clearing it
  // If you want to clear detectedProduct on some condition, handle it explicitly

  // Cleanup camera stream when component unmounts or scan mode changes
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const mockScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      const randomProduct = getRandomProducts(1)[0];
      
      const productData = {
        id: randomProduct.id,
        name: randomProduct.name,
        brand: randomProduct.brand,
        sustainabilityScore: randomProduct.sustainabilityScore,
        price: randomProduct.price,
        image: `https://images.unsplash.com/${randomProduct.image}?w=400&h=400&fit=crop`,
        carbon: randomProduct.carbonFootprint.total,
        water: randomProduct.waterUsage,
        packaging: randomProduct.packaging.type,
        certifications: randomProduct.certifications,
        materials: randomProduct.materials,
        origin: randomProduct.origin,
        barcode: randomProduct.barcode,
        alternatives: randomProduct.alternatives,
        features: randomProduct.features,
        inStock: randomProduct.inStock,
        rating: randomProduct.rating,
        reviews: randomProduct.reviews,
        description: randomProduct.description,
        category: randomProduct.category,
        sustainability: {
          carbon: Math.floor(randomProduct.sustainabilityScore * 0.9),
          water: Math.floor(randomProduct.sustainabilityScore * 0.95),
          waste: Math.floor(randomProduct.sustainabilityScore * 0.85),
          energy: Math.floor(randomProduct.sustainabilityScore * 0.92),
          ethics: Math.floor(randomProduct.sustainabilityScore * 1.05),
          overall: randomProduct.sustainabilityScore
        },
        stages: [
          {
            name: 'Raw Material Sourcing',
            status: 'completed',
            location: 'California, USA',
            duration: '2 weeks',
            impact: { co2: 1.2, water: 500, energy: 300 },
            details: 'Sustainable sourcing of raw materials from certified farms.',
            icon: () => <Factory className="w-6 h-6 text-white" />
          },
          {
            name: 'Manufacturing',
            status: 'active',
            location: 'Oregon, USA',
            duration: '4 weeks',
            impact: { co2: 2.5, water: 800, energy: 1200 },
            details: 'Eco-friendly manufacturing processes with renewable energy.',
            icon: () => <Factory className="w-6 h-6 text-white" />
          },
          {
            name: 'Transportation',
            status: 'pending',
            location: 'Distribution Center',
            duration: '1 week',
            impact: { co2: 0.8, water: 100, energy: 400 },
            details: 'Low-emission transportation to retail locations.',
            icon: () => <Truck className="w-6 h-6 text-white" />
          },
          {
            name: 'Retail',
            status: 'pending',
            location: 'Various Stores',
            duration: 'Ongoing',
            impact: { co2: 0.5, water: 50, energy: 200 },
            details: 'Sustainable retail practices and packaging.',
            icon: () => <Package className="w-6 h-6 text-white" />
          }
        ]
      };
      
      setDetectedProduct(productData);
      
      // Add notification for scanned product
      addNotification({
        type: 'scanning',
        title: 'Product Scanned',
        message: `You scanned ${randomProduct.name} by ${randomProduct.brand}.`,
        read: false,
        source: 'scanner',
        actionable: true,
        action: 'View',
      });

      // Add to product comparison
      addProductToComparison({
        id: randomProduct.id.toString(),
        name: randomProduct.name,
        brand: randomProduct.brand,
        sustainabilityScore: randomProduct.sustainabilityScore,
        category: randomProduct.category,
        date: new Date().toISOString(),
        price: randomProduct.price,
        image: `https://images.unsplash.com/${randomProduct.image}?w=400&h=400&fit=crop`,
        metrics: {
          carbon: Math.floor(randomProduct.sustainabilityScore * 0.9),
          water: Math.floor(randomProduct.sustainabilityScore * 0.95),
          waste: Math.floor(randomProduct.sustainabilityScore * 0.85),
          energy: Math.floor(randomProduct.sustainabilityScore * 0.92),
          ethics: Math.floor(randomProduct.sustainabilityScore * 1.05),
        },
        certifications: randomProduct.certifications || [],
        pros: [
          randomProduct.vegan ? 'Vegan friendly' : 'Quality materials',
          randomProduct.packaging?.recyclable ? 'Recyclable packaging' : 'Durable design',
          'Good sustainability score'
        ],
        cons: [
          randomProduct.price > 50 ? 'Higher price point' : 'Limited color options',
          'Consider shipping impact'
        ],
        rating: randomProduct.rating,
        reviews: randomProduct.reviews,
        inStock: randomProduct.inStock,
        features: randomProduct.features,
      });
      setIsScanning(false);
    }, 2000);
  };

  const startScanning = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment' 
        } 
      });
      
      setStream(mediaStream);
      setScanMode(true);
      
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      }, 100);
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Unable to access camera. Please check permissions or try uploading an image instead.');
    }
  };

  const stopScanning = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setScanMode(false);
    setDetectedProduct(null);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target.result);
        mockScan();
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      const allProducts = getRandomProducts(20);
      const results = allProducts.filter(product => 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.barcode.includes(searchQuery)
      );
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  const selectSearchResult = (product) => {
    setIsScanning(true);
    setSearchResults([]);
    setSearchQuery('');
      setTimeout(() => {
        const productData = {
          id: product.id,
          name: product.name,
          brand: product.brand,
          sustainabilityScore: product.sustainabilityScore,
          price: product.price,
          image: `https://images.unsplash.com/${product.image}?w=400&h=400&fit=crop`,
          carbon: product.carbonFootprint.total,
          water: product.waterUsage,
          packaging: product.packaging.type,
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
          sustainability: {
            carbon: Math.floor(product.sustainabilityScore * 0.9),
            water: Math.floor(product.sustainabilityScore * 0.95),
            waste: Math.floor(product.sustainabilityScore * 0.85),
            energy: Math.floor(product.sustainabilityScore * 0.92),
            ethics: Math.floor(product.sustainabilityScore * 1.05),
            overall: product.sustainabilityScore
          },
          stages: [
            {
              name: 'Raw Material Sourcing',
              status: 'completed',
              location: 'California, USA',
              duration: '2 weeks',
              impact: { co2: 1.2, water: 500, energy: 300 },
              details: 'Sustainable sourcing of raw materials from certified farms.',
              icon: () => <Factory className="w-6 h-6 text-white" />
            },
            {
              name: 'Manufacturing',
              status: 'active',
              location: 'Oregon, USA',
              duration: '4 weeks',
              impact: { co2: 2.5, water: 800, energy: 1200 },
              details: 'Eco-friendly manufacturing processes with renewable energy.',
              icon: () => <Factory className="w-6 h-6 text-white" />
            },
            {
              name: 'Transportation',
              status: 'pending',
              location: 'Distribution Center',
              duration: '1 week',
              impact: { co2: 0.8, water: 100, energy: 400 },
              details: 'Low-emission transportation to retail locations.',
              icon: () => <Truck className="w-6 h-6 text-white" />
            },
            {
              name: 'Retail',
              status: 'pending',
              location: 'Various Stores',
              duration: 'Ongoing',
              impact: { co2: 0.5, water: 50, energy: 200 },
              details: 'Sustainable retail practices and packaging.',
              icon: () => <Package className="w-6 h-6 text-white" />
            }
          ]
        };
        
        setDetectedProduct(productData);
        // Removed automatic addScannedProduct call to prevent default saving
        // addScannedProduct({
        //   id: product.id.toString(),
        //   name: product.name,
        //   brand: product.brand,
        //   sustainabilityScore: product.sustainabilityScore,
        //   category: product.category,
        //   date: new Date().toLocaleDateString(),
        //   source: 'ProductScanner',
        // });

        // Add notification for scanned product
        addNotification({
          type: 'scanning',
          title: 'Product Scanned',
          message: `You scanned ${product.name} by ${product.brand}.`,
          read: false,
          source: 'scanner',
          actionable: true,
          action: 'View',
        });

        setIsScanning(false);
      }, 2000);
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  return (
<div className="space-y-6">
      {scannedProducts.length > 0 && (
        <Card className="bg-white/95 dark:bg-slate-800 backdrop-blur-sm border-slate-200/50 dark:border-slate-700 shadow-lg rounded-2xl">
          <CardHeader>
            <CardTitle className="text-slate-800 dark:text-slate-200">Recent Scans</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {scannedProducts.slice(0, 6).map((product) => (
                <div key={product.id} className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-slate-800 dark:text-slate-200">{product.name}</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{product.brand}</p>
                    </div>
                    <Badge className={getScoreColor(product.sustainabilityScore)}>
                      {product.sustainabilityScore}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500 dark:text-slate-400">{product.category}</span>
                    <span className="text-slate-500 dark:text-slate-400">{product.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="bg-white/95 dark:bg-slate-800 backdrop-blur-sm border-slate-200/50 dark:border-slate-700 shadow-lg rounded-2xl">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center justify-between text-slate-800 dark:text-slate-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center">
                <Camera className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold">Smart Product Scanner</span>
                <p className="text-sm text-slate-600 dark:text-slate-400 font-normal">Instant sustainability analysis</p>
              </div>
            </div>
            <Badge variant="outline" className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-700">
              <Zap className="w-3 h-3 mr-1" />
              AI Powered
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-4 border border-slate-200 dark:border-slate-700">
              <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-3 flex items-center">
                <Search className="w-4 h-4 mr-2" />
                Search Products
              </h3>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    placeholder="Search by name, brand, or barcode..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1"
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                  <Button onClick={handleSearch} size="sm">
                    <Search className="w-4 h-4" />
                  </Button>
                </div>
                
                {/* Search Results */}
                {searchResults.length > 0 && (
                  <div className="max-h-60 overflow-y-auto space-y-2 mt-2">
                    {searchResults.map((product) => (
                      <div
                        key={product.id}
                        className="p-2 border border-slate-200 dark:border-slate-700 rounded cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                        onClick={() => selectSearchResult(product)}
                      >
                        <div className="flex items-center space-x-3">
                          <img 
                            src={`https://images.unsplash.com/${product.image}?w=40&h=40&fit=crop`}
                            alt={product.name}
                            className="w-8 h-8 object-cover rounded"
                          />
                          <div className="flex-1">
                            <h4 className="text-sm font-medium text-slate-800 dark:text-slate-200">{product.name}</h4>
                            <p className="text-xs text-slate-600 dark:text-slate-400">{product.brand} • {product.category}</p>
                          </div>
                          <Badge className={`text-xs px-2 py-1 ${getScoreColor(product.sustainabilityScore)}`}>
                            {product.sustainabilityScore}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>

            <Card className="p-4 border border-slate-200 dark:border-slate-700">
              <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-3 flex items-center">
                <Upload className="w-4 h-4 mr-2" />
                Upload Files
              </h3>
              <div className="space-y-2">
                <Button 
                  onClick={triggerFileUpload} 
                  variant="outline" 
                  className="w-full"
                >
                  <FileImage className="w-4 h-4 mr-2" />
                  Choose File
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                {uploadedImage && (
                  <div className="mt-2">
                    <img 
                      src={uploadedImage} 
                      alt="Uploaded product" 
                      className="w-full h-24 object-cover rounded border border-slate-200 dark:border-slate-700"
                    />
                  </div>
                )}
              </div>
            </Card>
          </div>

          <div className="bg-slate-900 rounded-xl overflow-hidden shadow-lg">
            <div className="bg-slate-800 h-64 flex items-center justify-center relative">
              {!scanMode ? (
                <div className="text-center">
                  <Camera className="w-16 h-16 mx-auto mb-4 text-slate-400" />
                  <p className="text-slate-300 mb-4">Point your camera at any product</p>
                  <div className="flex gap-3 justify-center">
                    <Button onClick={startScanning} className="bg-slate-700 hover:bg-slate-600 border border-slate-600">
                      <Play className="w-4 h-4 mr-2" />
                      Start Camera
                    </Button>
                    <Button onClick={triggerFileUpload} variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                      <ImageIcon className="w-4 h-4 mr-2" />
                      Take Photo
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="w-full h-full relative">
                  {/* Live Camera Feed */}
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  
                  <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
                    <Badge className="bg-red-600 text-white border-0">
                      <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
                      LIVE
                    </Badge>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={triggerFileUpload}
                        className="bg-slate-800/80 border-slate-600 text-white hover:bg-slate-700"
                      >
                        <ImageIcon className="w-3 h-3 mr-1" />
                        Photo
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={stopScanning}
                        className="bg-slate-800/80 border-slate-600 text-white hover:bg-slate-700"
                      >
                        <Square className="w-3 h-3 mr-1" />
                        Stop
                      </Button>
                    </div>
                  </div>
                  
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-48 h-48 border-2 border-white border-dashed rounded-lg flex items-center justify-center">
                      {isScanning ? (
                        <div className="text-center">
                          <Scan className="w-12 h-12 mx-auto mb-2 text-white animate-spin" />
                          <p className="text-white text-sm">Analyzing product...</p>
                        </div>
                      ) : (
                        <div className="text-center">
                          <Scan className="w-12 h-12 mx-auto mb-2 text-white" />
                          <p className="text-white text-sm">Aim at product</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                    <Button 
                      onClick={mockScan} 
                      disabled={isScanning}
                      className="bg-white/20 dark:bg-white/10 hover:bg-white/30 dark:hover:bg-white/20 rounded-full w-16 h-16 border-2 border-white dark:border-white/50 backdrop-blur-sm"
                    >
                      <Scan className="w-6 h-6 text-white" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-slate-50/80 dark:bg-slate-700 rounded-xl border border-slate-200/50 dark:border-slate-700">
              <Zap className="w-8 h-8 mx-auto mb-2 text-slate-600 dark:text-slate-300" />
              <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-1">Instant Analysis</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300">Real-time sustainability scoring</p>
            </div>
            <div className="text-center p-4 bg-slate-50/80 dark:bg-slate-700 rounded-xl border border-slate-200/50 dark:border-slate-700">
              <Leaf className="w-8 h-8 mx-auto mb-2 text-green-600" />
              <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-1">Impact Assessment</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300">Environmental footprint analysis</p>
            </div>
            <div className="text-center p-4 bg-slate-50/80 dark:bg-slate-700 rounded-xl border border-slate-200/50 dark:border-slate-700">
              <ShoppingCart className="w-8 h-8 mx-auto mb-2 text-slate-600 dark:text-slate-300" />
              <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-1">Smart Alternatives</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300">Better product suggestions</p>
            </div>
          </div>

          {detectedProduct && (
            <div className="space-y-4">
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 shadow-sm">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex space-x-4">
                    <img 
                      src={detectedProduct.image} 
                      alt={detectedProduct.name}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    <div>
                      <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200">{detectedProduct.name}</h3>
                      <p className="text-slate-600 dark:text-slate-400">{detectedProduct.brand}</p>
                      <p className="text-lg font-bold text-green-600">${detectedProduct.price}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <div className="flex text-yellow-400">
                          {'★'.repeat(Math.floor(detectedProduct.rating))}
                        </div>
                        <span className="text-sm text-slate-500 dark:text-slate-400">({detectedProduct.reviews})</span>
                      </div>
                    </div>
                  </div>
                  <Badge className={`text-2xl font-bold px-4 py-2 ${getScoreColor(detectedProduct.sustainabilityScore)}`}>
                    {detectedProduct.sustainabilityScore}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                    <Leaf className="w-6 h-6 mx-auto mb-1 text-green-600" />
                    <div className="text-lg font-bold text-slate-800 dark:text-slate-200">{detectedProduct.sustainability.carbon}</div>
                    <div className="text-xs text-slate-600 dark:text-slate-400">Carbon</div>
                  </div>
                  <div className="text-center p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                    <Droplets className="w-6 h-6 mx-auto mb-1 text-blue-600" />
                    <div className="text-lg font-bold text-slate-800 dark:text-slate-200">{detectedProduct.sustainability.water}</div>
                    <div className="text-xs text-slate-600 dark:text-slate-400">Water</div>
                  </div>
                  <div className="text-center p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                    <Zap className="w-6 h-6 mx-auto mb-1 text-purple-600" />
                    <div className="text-lg font-bold text-slate-800 dark:text-slate-200">{detectedProduct.sustainability.energy}</div>
                    <div className="text-xs text-slate-600 dark:text-slate-400">Energy</div>
                  </div>
                  <div className="text-center p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                    <Heart className="w-6 h-6 mx-auto mb-1 text-red-600" />
                    <div className="text-lg font-bold text-slate-800 dark:text-slate-200">{detectedProduct.sustainability.ethics}</div>
                    <div className="text-xs text-slate-600 dark:text-slate-400">Ethics</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">Environmental Impact</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Carbon Footprint:</span>
                        <span className="font-medium">{detectedProduct.carbon}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Water Usage:</span>
                        <span className="font-medium">{detectedProduct.water}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Packaging:</span>
                        <span className="font-medium">{detectedProduct.packaging}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">Product Info</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Origin:</span>
                        <span className="font-medium">{detectedProduct.origin}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Stock:</span>
                        <span className={`font-medium ${detectedProduct.inStock ? 'text-green-600' : 'text-red-600'}`}>
 {detectedProduct.inStock ? 'In Stock' : 'Out of Stock'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Barcode:</span>
                        <span className="font-medium text-xs">{detectedProduct.barcode}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">Key Features</h4>
                  <div className="flex flex-wrap gap-2">
                    {detectedProduct.features.slice(0, 6).map((feature, index) => (
                      <Badge key={index} variant="outline" className="border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-700">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">Certifications</h4>
                  <div className="flex flex-wrap gap-2">
                    {detectedProduct.certifications.map((cert, index) => (
                      <Badge key={index} className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border-green-200 dark:border-green-700">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        {cert}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text-slate-800 dark:text-slate-200">Better Alternatives</h4>
                  {detectedProduct.alternatives.map((alt, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg border border-slate-200/50 dark:border-slate-700">
                      <div>
                        <span className="font-medium text-slate-800 dark:text-slate-200">{alt.name}</span>
                        <p className="text-sm text-slate-600 dark:text-slate-400">{alt.reason}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{alt.priceComparison}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300">{alt.score}</Badge>
                        <ArrowRight className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-3 mt-6">
                  {detectedProduct && (
                    <>
                  <Button 
                    className="bg-slate-800 hover:bg-slate-900 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-foreground"
                    onClick={() => {
                      setScannedProduct(detectedProduct);
                      if (onTabChange) {
                        onTabChange('lifecycle');
                      }
                    }}
                  >
                    View Full Analysis
                  </Button>
                      {/* Remove Save Scan button since saving is automatic */}
                      {/* <Button
                        variant="outline"
                        className="border-slate-300"
                        onClick={() => saveScannedProduct && saveScannedProduct(detectedProduct)}
                      >
                        Save Scan
                      </Button> */}
                    </>
                  )}
                  <Button
                    variant="outline" 
                    className="border-slate-300 dark:border-slate-700"
                    onClick={() => {
                      if (detectedProduct) {
                        addProductToComparison({
                          id: detectedProduct.id.toString(),
                          name: detectedProduct.name,
                          brand: detectedProduct.brand,
                          sustainabilityScore: detectedProduct.sustainabilityScore,
                          category: detectedProduct.category,
                          date: new Date().toISOString(),
                          price: detectedProduct.price,
                          image: detectedProduct.image,
                          metrics: {
                            carbon: detectedProduct.sustainability?.carbon || 0,
                            water: detectedProduct.sustainability?.water || 0,
                            waste: detectedProduct.sustainability?.waste || 0,
                            energy: detectedProduct.sustainability?.energy || 0,
                            ethics: detectedProduct.sustainability?.ethics || 0,
                          },
                          certifications: detectedProduct.certifications || [],
                          pros: detectedProduct.pros || [],
                          cons: detectedProduct.cons || [],
                          rating: detectedProduct.rating,
                          reviews: detectedProduct.reviews,
                          inStock: detectedProduct.inStock,
                          features: detectedProduct.features,
                        });
                      }
                      if (onTabChange) {
                        onTabChange('comparison');
                      }
                    }}
                  >
                    Compare Products
                  </Button>
                  <Button 
                    variant="outline" 
                    className="border-green-300 text-green-700 hover:bg-green-50 dark:hover:bg-green-900"
                    onClick={() => {
                      if (detectedProduct && detectedProduct.price !== undefined) {
                        addToCart({
                          id: detectedProduct.id.toString(),
                          name: detectedProduct.name,
                          price: detectedProduct.price,
                          image: detectedProduct.image || "", // Provide a default value
                          brand: detectedProduct.brand || null,
                        });
                      }
                    }}
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Add to Cart
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductScanner;
