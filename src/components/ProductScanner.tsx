
import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Scan, Upload, Camera, FileText, Loader2, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import SustainabilityScore from './SustainabilityScore';

const ProductScanner = ({ onProductScanned }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanMethod, setScanMethod] = useState('barcode');
  const [inputData, setInputData] = useState('');
  const [scannedProduct, setScannedProduct] = useState(null);
  const fileInputRef = useRef(null);
  const { toast } = useToast();

  const mockAnalyzeProduct = async (data, method) => {
    // Simulate AI analysis
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const mockProduct = {
      name: method === 'barcode' ? 'Organic Fair Trade Coffee' : 'Analyzed Product',
      brand: 'GreenBean Co.',
      category: 'Food & Beverage',
      barcode: data.length === 12 ? data : '123456789012',
      description: 'Organic, fair trade certified coffee beans sourced from sustainable farms in Colombia.',
      sustainability: {
        overall: 87,
        carbon: 85,
        water: 90,
        waste: 82,
        energy: 88,
        ethics: 92
      },
      ingredients: ['Organic Coffee Beans', 'Fair Trade Certified'],
      certifications: ['USDA Organic', 'Fair Trade', 'Rainforest Alliance'],
      origin: 'Colombia',
      packaging: 'Recyclable aluminum packaging',
      confidence: 0.89,
      aiInsights: [
        'High sustainability score due to organic farming practices',
        'Fair trade certification ensures ethical sourcing',
        'Recyclable packaging reduces environmental impact',
        'Water usage optimized through sustainable farming techniques'
      ]
    };

    return mockProduct;
  };

  const handleScan = async () => {
    if (!inputData.trim()) {
      toast({
        title: "Input Required",
        description: "Please enter product information to analyze.",
        variant: "destructive",
      });
      return;
    }

    setIsScanning(true);
    try {
      const product = await mockAnalyzeProduct(inputData, scanMethod);
      setScannedProduct(product);
      onProductScanned?.(product);
      
      toast({
        title: "Analysis Complete",
        description: `Successfully analyzed ${product.name}`,
      });
    } catch (error) {
      toast({
        title: "Scan Failed",
        description: "Failed to analyze product. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsScanning(false);
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setScanMethod('image');
      setInputData(`Image: ${file.name}`);
      toast({
        title: "Image Uploaded",
        description: "Image ready for analysis. Click scan to process.",
      });
    }
  };

  const scanMethods = [
    { id: 'barcode', label: 'Barcode', icon: Scan, placeholder: 'Enter barcode number...' },
    { id: 'text', label: 'Product Info', icon: FileText, placeholder: 'Enter product name, brand, ingredients...' },
    { id: 'image', label: 'Upload Image', icon: Upload, placeholder: 'Upload product image or label...' },
    { id: 'camera', label: 'Take Photo', icon: Camera, placeholder: 'Use camera to scan...' }
  ];

  return (
    <div className="space-y-6">
      <Card className="bg-white/60 backdrop-blur-sm border-green-100">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Scan className="w-5 h-5 text-green-600" />
            <span>AI-Powered Product Scanner</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Scan Method Selection */}
          <div>
            <Label className="text-sm font-medium mb-3 block">Scan Method</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {scanMethods.map((method) => (
                <Button
                  key={method.id}
                  variant={scanMethod === method.id ? "default" : "outline"}
                  className={`h-auto p-3 flex flex-col items-center space-y-2 ${
                    scanMethod === method.id 
                      ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white' 
                      : 'hover:bg-green-50'
                  }`}
                  onClick={() => setScanMethod(method.id)}
                >
                  <method.icon className="w-5 h-5" />
                  <span className="text-xs">{method.label}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Input Area */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Product Information</Label>
            {scanMethod === 'image' ? (
              <div className="border-2 border-dashed border-green-200 rounded-lg p-6 text-center">
                <Upload className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-3">Upload product image or label</p>
                <Button 
                  variant="outline" 
                  onClick={() => fileInputRef.current?.click()}
                  className="mb-2"
                >
                  Choose File
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                {inputData && (
                  <p className="text-xs text-green-600 mt-2">{inputData}</p>
                )}
              </div>
            ) : scanMethod === 'text' ? (
              <Textarea
                placeholder={scanMethods.find(m => m.id === scanMethod)?.placeholder}
                value={inputData}
                onChange={(e) => setInputData(e.target.value)}
                rows={4}
                className="border-green-200 focus:border-green-400"
              />
            ) : (
              <Input
                placeholder={scanMethods.find(m => m.id === scanMethod)?.placeholder}
                value={inputData}
                onChange={(e) => setInputData(e.target.value)}
                className="border-green-200 focus:border-green-400"
              />
            )}
          </div>

          {/* Scan Button */}
          <Button 
            onClick={handleScan}
            disabled={isScanning || !inputData.trim()}
            className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 h-12"
          >
            {isScanning ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing with AI...
              </>
            ) : (
              <>
                <Scan className="w-4 h-4 mr-2" />
                Analyze Product
              </>
            )}
          </Button>

          {/* AI Features Info */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-medium text-green-800 mb-2">AI Analysis Features</h4>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• OCR + NLP to extract data from images and text</li>
              <li>• Cross-reference with sustainability databases</li>
              <li>• Interpret marketing language and supply chain info</li>
              <li>• Confidence scoring and uncertainty estimates</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {scannedProduct && (
        <div className="animate-fade-in">
          <SustainabilityScore product={scannedProduct} />
        </div>
      )}
    </div>
  );
};

export default ProductScanner;
