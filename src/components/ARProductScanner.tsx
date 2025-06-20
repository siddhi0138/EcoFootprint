import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Camera, 
  Scan, 
  Zap, 
  Eye,
  Target,
  Sparkles,
  CheckCircle,
  AlertCircle,
  Info,
  ArrowRight,
  Play,
  Square
} from 'lucide-react';
import { getRandomProducts } from '@/data/productsData';
import { useUserData } from '@/contexts/UserDataContext';

const ARProductScanner = () => {
  const { addScannedProduct } = useUserData();
  const [isScanning, setIsScanning] = useState(false);
  const [detectedProduct, setDetectedProduct] = useState(null);
  const [arMode, setArMode] = useState(false);
  const videoRef = useRef(null);

  const mockScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      const randomProduct = getRandomProducts(1)[0];
      
      const productData = {
        id: randomProduct.id,
        name: randomProduct.name,
        brand: randomProduct.brand,
        sustainabilityScore: randomProduct.sustainabilityScore,
        carbon: randomProduct.carbonFootprint.total,
        water: randomProduct.waterUsage,
        packaging: randomProduct.packaging.type,
        certifications: randomProduct.certifications,
        alternatives: randomProduct.alternatives,
        arData: {
          ingredients: randomProduct.ingredients || 'Sustainable materials, eco-friendly components',
          origin: randomProduct.origin,
          co2Impact: `${(Math.random() * 10 + 2).toFixed(1)} kg CO₂ saved vs conventional`,
          barcode: randomProduct.barcode,
          features: randomProduct.features,
          materials: randomProduct.materials
        }
      };
      
      setDetectedProduct(productData);
      
      // Add to user's scanned products
      addScannedProduct({
        name: randomProduct.name,
        brand: randomProduct.brand,
        sustainabilityScore: randomProduct.sustainabilityScore,
        category: randomProduct.category
      });
      
      setIsScanning(false);
    }, 2000);
  };

  const startARMode = () => {
    setArMode(true);
  };

  const stopARMode = () => {
    setArMode(false);
    setDetectedProduct(null);
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white/95 backdrop-blur-sm border-slate-200/50 shadow-lg rounded-2xl">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center justify-between text-slate-800">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center">
                <Eye className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold">AR Product Scanner</span>
                <p className="text-sm text-slate-600 font-normal">Augmented reality sustainability analysis</p>
              </div>
            </div>
            <Badge variant="outline" className="border-slate-300 text-slate-700 bg-slate-50">
              <Sparkles className="w-3 h-3 mr-1" />
              AR Powered
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* AR Camera View */}
          <div className="bg-slate-900 rounded-xl overflow-hidden shadow-lg">
            <div className="bg-slate-800 h-64 flex items-center justify-center relative">
              {!arMode ? (
                <div className="text-center">
                  <Camera className="w-16 h-16 mx-auto mb-4 text-slate-400" />
                  <p className="text-slate-300 mb-4">Point your camera at any product</p>
                  <Button onClick={startARMode} className="bg-slate-700 hover:bg-slate-600 border border-slate-600">
                    <Play className="w-4 h-4 mr-2" />
                    Start AR Scanner
                  </Button>
                </div>
              ) : (
                <div className="w-full h-full relative">
                  {/* AR Interface */}
                  <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
                    <Badge className="bg-red-600 text-white border-0">
                      <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
                      LIVE
                    </Badge>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={stopARMode}
                      className="bg-slate-800/80 border-slate-600 text-white hover:bg-slate-700"
                    >
                      <Square className="w-3 h-3 mr-1" />
                      Stop
                    </Button>
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
                          <Target className="w-12 h-12 mx-auto mb-2 text-slate-400" />
                          <p className="text-slate-300 text-sm">Aim at product</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* AR Overlay Information */}
                  {detectedProduct && (
                    <div className="absolute top-16 left-4 bg-black/70 text-white p-3 rounded-lg max-w-xs">
                      <h3 className="font-bold text-sm">{detectedProduct.name}</h3>
                      <p className="text-xs text-gray-300">{detectedProduct.brand}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge className="bg-green-600 text-white text-xs">
                          {detectedProduct.sustainabilityScore}
                        </Badge>
                        <span className="text-xs">Sustainability Score</span>
                      </div>
                    </div>
                  )}
                  
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

          {/* AR Features Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-slate-50/80 rounded-xl border border-slate-200/50">
              <Zap className="w-8 h-8 mx-auto mb-2 text-slate-600" />
              <h3 className="font-semibold text-slate-800 mb-1">Instant Analysis</h3>
              <p className="text-sm text-slate-600">Real-time sustainability scoring</p>
            </div>
            <div className="text-center p-4 bg-slate-50/80 rounded-xl border border-slate-200/50">
              <Target className="w-8 h-8 mx-auto mb-2 text-slate-600" />
              <h3 className="font-semibold text-slate-800 mb-1">Smart Recognition</h3>
              <p className="text-sm text-slate-600">AI-powered product identification</p>
            </div>
            <div className="text-center p-4 bg-slate-50/80 rounded-xl border border-slate-200/50">
              <Eye className="w-8 h-8 mx-auto mb-2 text-slate-600" />
              <h3 className="font-semibold text-slate-800 mb-1">AR Overlay</h3>
              <p className="text-sm text-slate-600">Visual environmental data</p>
            </div>
          </div>

          {/* Detected Product Results */}
          {detectedProduct && (
            <div className="space-y-4">
              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-lg text-slate-800">{detectedProduct.name}</h3>
                    <p className="text-slate-600">{detectedProduct.brand}</p>
                    <p className="text-sm text-slate-500 mt-1">Barcode: {detectedProduct.arData.barcode}</p>
                  </div>
                  <Badge className="bg-slate-800 text-white text-xl px-3 py-1">
                    {detectedProduct.sustainabilityScore}
                  </Badge>
                </div>

                {/* AR Enhanced Information */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-4 mb-6">
                  <h4 className="font-semibold text-slate-800 mb-3 flex items-center">
                    <Sparkles className="w-4 h-4 mr-2 text-purple-600" />
                    AR Enhanced Data
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-slate-700">Materials:</span>
                      <div className="mt-1">
                        {detectedProduct.arData.materials?.slice(0, 3).map((material, index) => (
                          <Badge key={index} variant="outline" className="mr-1 mb-1 text-xs">
                            {material}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="font-medium text-slate-700">Origin:</span>
                      <p className="text-slate-600 mt-1">{detectedProduct.arData.origin}</p>
                    </div>
                    <div>
                      <span className="font-medium text-slate-700">CO₂ Impact:</span>
                      <p className="text-green-600 font-medium mt-1">{detectedProduct.arData.co2Impact}</p>
                    </div>
                    <div>
                      <span className="font-medium text-slate-700">Ingredients:</span>
                      <p className="text-slate-600 mt-1 text-xs">{detectedProduct.arData.ingredients}</p>
                    </div>
                  </div>
                </div>

                {/* Impact Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-200/50">
                    <div className="flex items-center space-x-2 mb-2">
                      <CheckCircle className="w-5 h-5 text-slate-600" />
                      <span className="font-medium text-slate-800">Carbon Impact</span>
                    </div>
                    <p className="text-sm text-slate-700">{detectedProduct.carbon}</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-200/50">
                    <div className="flex items-center space-x-2 mb-2">
                      <CheckCircle className="w-5 h-5 text-slate-600" />
                      <span className="font-medium text-slate-800">Water Usage</span>
                    </div>
                    <p className="text-sm text-slate-700">{detectedProduct.water}</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-200/50">
                    <div className="flex items-center space-x-2 mb-2">
                      <CheckCircle className="w-5 h-5 text-slate-600" />
                      <span className="font-medium text-slate-800">Packaging</span>
                    </div>
                    <p className="text-sm text-slate-700">{detectedProduct.packaging}</p>
                  </div>
                </div>

                {/* Key Features from AR Data */}
                <div className="mb-6">
                  <h4 className="font-semibold text-slate-800 mb-2">Key Features</h4>
                  <div className="flex flex-wrap gap-2">
                    {detectedProduct.arData.features?.slice(0, 6).map((feature, index) => (
                      <Badge key={index} variant="outline" className="border-slate-300 text-slate-700 bg-slate-50">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Alternative Products */}
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

                {/* Certifications */}
                <div className="mt-4 pt-4 border-t border-slate-200">
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

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 mt-6">
                  <Button className="bg-slate-800 hover:bg-slate-900">
                    View Full Analysis
                  </Button>
                  <Button variant="outline" className="border-slate-300">
                    Share AR Data
                  </Button>
                  <Button variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-50">
                    <Eye className="w-4 h-4 mr-2" />
                    View in AR
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

export default ARProductScanner;
