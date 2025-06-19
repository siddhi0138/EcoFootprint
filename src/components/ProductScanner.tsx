import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
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
} from 'lucide-react';
import { getRandomProducts } from '@/data/productsData';

interface ProductScannerProps {
  onProductScanned: (product: any) => void; // Or a more specific product type
  addToCart: (product: any) => void;
  setActiveTab: (tab: string) => void;
}

const ProductScanner = ({ onProductScanned, addToCart, setActiveTab }: ProductScannerProps) => {
  const [isScanning, setIsScanning] = useState(false);
  const [detectedProduct, setDetectedProduct] = useState(null);
  const [scanMode, setScanMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [uploadedImage, setUploadedImage] = useState(null);
  const videoRef = useRef(null);
  const fileInputRef = useRef(null);

  const mockScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      // Get a random product from our data
      const randomProduct = getRandomProducts(1)[0];
      
      const scannedProduct = {
        id: randomProduct.id,
        name: randomProduct.name,
        brand: randomProduct.brand,
        sustainabilityScore: randomProduct.sustainabilityScore,
        price: randomProduct.price,
        image: randomProduct.image,
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
        }
      };
      setDetectedProduct(scannedProduct);
      onProductScanned(scannedProduct);
      setIsScanning(false);
    }, 2000);
  };

  const startScanning = () => {
    setScanMode(true);
  };

  const stopScanning = () => {
    setScanMode(false);
    setDetectedProduct(null);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target.result);
        // Simulate scanning the uploaded image
        mockScan();
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      // Simulate searching for a product
      mockScan();
    }
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
      <Card className="bg-white/95 backdrop-blur-sm border-slate-200/50 shadow-lg rounded-2xl">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center justify-between text-slate-800">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center">
                <Camera className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold">Smart Product Scanner</span>
                <p className="text-sm text-slate-600 font-normal">Instant sustainability analysis</p>
              </div>
            </div>
            <Badge variant="outline" className="border-slate-300 text-slate-700 bg-slate-50">
              <Zap className="w-3 h-3 mr-1" />
              AI Powered
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Search and Upload Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search Section */}
            <Card className="p-4 border border-slate-200">
              <h3 className="font-semibold text-slate-800 mb-3 flex items-center">
                <Search className="w-4 h-4 mr-2" />
                Search Products
              </h3>
              <div className="flex gap-2">
                <Input
                  placeholder="Search by name or barcode..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button onClick={handleSearch} size="sm">
                  <Search className="w-4 h-4" />
                </Button>
              </div>
            </Card>

            {/* File Upload Section */}
            <Card className="p-4 border border-slate-200">
              <h3 className="font-semibold text-slate-800 mb-3 flex items-center">
                <Upload className="w-4 h-4 mr-2" />
                Upload Photo
              </h3>
              <div className="space-y-2">
                <Button 
                  onClick={triggerFileUpload} 
                  variant="outline" 
                  className="w-full"
                >
                  <FileImage className="w-4 h-4 mr-2" />
                  Choose Image
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
                      className="w-full h-24 object-cover rounded border"
                    />
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Scanner Interface */}
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
                  {/* Scanner Controls */}
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
                  
                  {/* Scanning Target */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-48 h-48 border-2 border-slate-400 border-dashed rounded-lg flex items-center justify-center">
                      {isScanning ? (
                        <div className="text-center">
                          <Scan className="w-12 h-12 mx-auto mb-2 text-slate-400 animate-spin" />
                          <p className="text-slate-300 text-sm">Analyzing product...</p>
                        </div>
                      ) : (
                        <div className="text-center">
                          <Scan className="w-12 h-12 mx-auto mb-2 text-slate-400" />
                          <p className="text-slate-300 text-sm">Aim at product</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Scan Button */}
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                    <Button 
                      onClick={mockScan} 
                      disabled={isScanning}
                      className="bg-slate-700 hover:bg-slate-600 rounded-full w-16 h-16 border-2 border-slate-500"
                    >
                      <Scan className="w-6 h-6" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Scanner Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-slate-50/80 rounded-xl border border-slate-200/50">
              <Zap className="w-8 h-8 mx-auto mb-2 text-slate-600" />
              <h3 className="font-semibold text-slate-800 mb-1">Instant Analysis</h3>
              <p className="text-sm text-slate-600">Real-time sustainability scoring</p>
            </div>
            <div className="text-center p-4 bg-slate-50/80 rounded-xl border border-slate-200/50">
              <Leaf className="w-8 h-8 mx-auto mb-2 text-slate-600" />
              <h3 className="font-semibold text-slate-800 mb-1">Impact Assessment</h3>
              <p className="text-sm text-slate-600">Environmental footprint analysis</p>
            </div>
            <div className="text-center p-4 bg-slate-50/80 rounded-xl border border-slate-200/50">
              <ShoppingCart className="w-8 h-8 mx-auto mb-2 text-slate-600" />
              <h3 className="font-semibold text-slate-800 mb-1">Smart Alternatives</h3>
              <p className="text-sm text-slate-600">Better product suggestions</p>
            </div>
          </div>

          {/* Detected Product Results */}
          {detectedProduct && (
            <div className="space-y-4">
              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex space-x-4">
                    <img 
                      src={detectedProduct.image} 
                      alt={detectedProduct.name}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    <div>
                      <h3 className="font-bold text-lg text-slate-800">{detectedProduct.name}</h3>
                      <p className="text-slate-600">{detectedProduct.brand}</p>
                      <p className="text-lg font-bold text-green-600">${detectedProduct.price}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <div className="flex text-yellow-400">
                          {'★'.repeat(Math.floor(detectedProduct.rating))}
                        </div>
                        <span className="text-sm text-slate-500">({detectedProduct.reviews})</span>
                      </div>
                    </div>
                  </div>
                  <Badge className={`text-2xl font-bold px-4 py-2 ${getScoreColor(detectedProduct.sustainabilityScore)}`}>
                    {detectedProduct.sustainabilityScore}
                  </Badge>
                </div>

                {/* Sustainability Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-3 bg-slate-50 rounded-lg">
                    <Leaf className="w-6 h-6 mx-auto mb-1 text-green-600" />
                    <div className="text-lg font-bold text-slate-800">{detectedProduct.sustainability.carbon}</div>
                    <div className="text-xs text-slate-600">Carbon</div>
                  </div>
                  <div className="text-center p-3 bg-slate-50 rounded-lg">
                    <Droplets className="w-6 h-6 mx-auto mb-1 text-blue-600" />
                    <div className="text-lg font-bold text-slate-800">{detectedProduct.sustainability.water}</div>
                    <div className="text-xs text-slate-600">Water</div>
                  </div>
                  <div className="text-center p-3 bg-slate-50 rounded-lg">
                    <Zap className="w-6 h-6 mx-auto mb-1 text-purple-600" />
                    <div className="text-lg font-bold text-slate-800">{detectedProduct.sustainability.energy}</div>
                    <div className="text-xs text-slate-600">Energy</div>
                  </div>
                  <div className="text-center p-3 bg-slate-50 rounded-lg">
                    <Heart className="w-6 h-6 mx-auto mb-1 text-red-600" />
                    <div className="text-lg font-bold text-slate-800">{detectedProduct.sustainability.ethics}</div>
                    <div className="text-xs text-slate-600">Ethics</div>
                  </div>
                </div>

                {/* Product Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h4 className="font-semibold text-slate-800 mb-2">Environmental Impact</h4>
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
                    <h4 className="font-semibold text-slate-800 mb-2">Product Info</h4>
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

                {/* Features */}
                <div className="mb-6">
                  <h4 className="font-semibold text-slate-800 mb-2">Key Features</h4>
                  <div className="flex flex-wrap gap-2">
                    {detectedProduct.features.slice(0, 6).map((feature, index) => (
                      <Badge key={index} variant="outline" className="border-slate-300 text-slate-700 bg-slate-50">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Certifications */}
                <div className="mb-6">
                  <h4 className="font-semibold text-slate-800 mb-2">Certifications</h4>
                  <div className="flex flex-wrap gap-2">
                    {detectedProduct.certifications.map((cert, index) => (
                      <Badge key={index} className="bg-green-100 text-green-800 border-green-200">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        {cert}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Better Alternatives */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-slate-800">Better Alternatives</h4>
                  {detectedProduct.alternatives.map((alt, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200/50">
                      <div>
                        <span className="font-medium text-slate-800">{alt.name}</span>
                        <p className="text-sm text-slate-600">{alt.reason}</p>
                        <p className="text-xs text-slate-500">{alt.priceComparison}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="border-slate-300 text-slate-700">{alt.score}</Badge>
                        <ArrowRight className="w-4 h-4 text-slate-400" />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 mt-6">
                  <Button 
                    className="bg-slate-800 hover:bg-slate-900"
                    onClick={() => setActiveTab('analysis')}
                  >
                    View Full Analysis
                  </Button>
                  <Button 
                    variant="outline" 
                    className="border-slate-300"
                    onClick={() => setActiveTab('comparison')}
                  >
                    Compare Products
                  </Button>
                  <Button 
                    variant="outline" 
                    className="border-green-300 text-green-700 hover:bg-green-50"
                    onClick={() => detectedProduct && addToCart(detectedProduct)}
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
