
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
  ArrowRight
} from 'lucide-react';

const ARProductScanner = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [detectedProduct, setDetectedProduct] = useState(null);
  const [arMode, setArMode] = useState(false);
  const videoRef = useRef(null);

  const mockScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setDetectedProduct({
        name: "Organic Almond Milk",
        brand: "Planet Oat",
        sustainabilityScore: 87,
        carbon: "45% lower than dairy",
        water: "80% less water usage",
        packaging: "100% recyclable",
        certifications: ["USDA Organic", "Non-GMO", "B-Corp"],
        alternatives: [
          { name: "Oat Dream", score: 92, reason: "Better packaging" },
          { name: "Silk Organic", score: 84, reason: "Local sourcing" }
        ],
        arData: {
          ingredients: "Filtered Water, Almonds, Sea Salt",
          origin: "California, USA",
          co2Impact: "2.1 kg CO₂ saved vs dairy"
        }
      });
      setIsScanning(false);
    }, 2000);
  };

  const startARMode = () => {
    setArMode(true);
    // In a real app, this would access the camera
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-purple-700">
            <Eye className="w-6 h-6" />
            <span>AR Product Scanner</span>
            <Badge variant="secondary" className="ml-auto bg-purple-100 text-purple-700">
              <Sparkles className="w-4 h-4 mr-1" />
              AR Powered
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* AR Camera View */}
          <div className="bg-gray-900 rounded-xl p-6 mb-6 relative overflow-hidden">
            <div className="bg-gray-800 h-64 rounded-lg flex items-center justify-center relative">
              {!arMode ? (
                <div className="text-center">
                  <Camera className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-300 mb-4">Point your camera at any product</p>
                  <Button onClick={startARMode} className="bg-purple-600 hover:bg-purple-700">
                    <Eye className="w-4 h-4 mr-2" />
                    Start AR Scanner
                  </Button>
                </div>
              ) : (
                <div className="w-full h-full relative">
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20"></div>
                  <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
                    <Badge className="bg-red-500">
                      <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
                      LIVE
                    </Badge>
                    <div className="flex space-x-2">
                      <Target className="w-6 h-6 text-white animate-pulse" />
                    </div>
                  </div>
                  
                  {/* AR Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-48 h-48 border-2 border-purple-400 border-dashed rounded-lg flex items-center justify-center">
                      {isScanning ? (
                        <div className="text-center">
                          <Scan className="w-12 h-12 mx-auto mb-2 text-purple-400 animate-spin" />
                          <p className="text-purple-200 text-sm">Analyzing...</p>
                        </div>
                      ) : (
                        <div className="text-center">
                          <Target className="w-12 h-12 mx-auto mb-2 text-purple-400" />
                          <p className="text-purple-200 text-sm">Aim at product</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                    <Button 
                      onClick={mockScan} 
                      disabled={isScanning}
                      className="bg-purple-600 hover:bg-purple-700 rounded-full w-16 h-16"
                    >
                      <Scan className="w-6 h-6" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Detected Product Results */}
          {detectedProduct && (
            <div className="space-y-4">
              <div className="bg-white/80 rounded-xl p-6 border border-purple-100">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-lg text-gray-800">{detectedProduct.name}</h3>
                    <p className="text-gray-600">{detectedProduct.brand}</p>
                  </div>
                  <Badge className="bg-green-500 text-white">
                    {detectedProduct.sustainabilityScore}
                  </Badge>
                </div>

                {/* AR Insights */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="font-medium text-green-800">Carbon Impact</span>
                    </div>
                    <p className="text-sm text-green-700">{detectedProduct.carbon}</p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <CheckCircle className="w-5 h-5 text-blue-600" />
                      <span className="font-medium text-blue-800">Water Usage</span>
                    </div>
                    <p className="text-sm text-blue-700">{detectedProduct.water}</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <CheckCircle className="w-5 h-5 text-purple-600" />
                      <span className="font-medium text-purple-800">Packaging</span>
                    </div>
                    <p className="text-sm text-purple-700">{detectedProduct.packaging}</p>
                  </div>
                </div>

                {/* Better Alternatives */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-800">AR-Suggested Alternatives</h4>
                  {detectedProduct.alternatives.map((alt, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <span className="font-medium">{alt.name}</span>
                        <p className="text-sm text-gray-600">{alt.reason}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">{alt.score}</Badge>
                        <ArrowRight className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* AR Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4">
              <Zap className="w-8 h-8 mx-auto mb-2 text-purple-600" />
              <h3 className="font-semibold mb-1">Instant Analysis</h3>
              <p className="text-sm text-gray-600">Real-time sustainability scoring</p>
            </div>
            <div className="text-center p-4">
              <Target className="w-8 h-8 mx-auto mb-2 text-purple-600" />
              <h3 className="font-semibold mb-1">Smart Recognition</h3>
              <p className="text-sm text-gray-600">AI-powered product identification</p>
            </div>
            <div className="text-center p-4">
              <Eye className="w-8 h-8 mx-auto mb-2 text-purple-600" />
              <h3 className="font-semibold mb-1">AR Overlay</h3>
              <p className="text-sm text-gray-600">Visual environmental data</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ARProductScanner;
