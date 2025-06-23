import React, { useState, useRef } from 'react';
import { db } from '../firebase'; // Assuming firebase.ts exports your initialized Firestore instance
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getAuth } from 'firebase/auth'; // Add this import
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
  Square,
  Share2,
  Download,
  X,
  BarChart3,
  Globe,
  Leaf,
  Factory,
  Truck,
  Recycle,
  CheckSquare,
  ExternalLink,
 Share, // Changed from Copy to Share for clarity in Share Modal
  Copy,
  Link,
  Mail,
  MessageCircle
} from 'lucide-react';

const ARProductScanner = () => {
  // Define interfaces for the nested analysis data
  interface LifecyclePhase {
    score: number;
    impact: string;
    details: string;
  }

  interface EnvironmentalDetails {
    biodiversity: string;
    soilHealth: string;
    waterConservation: string;
    airQuality: string;
  }

  interface SocialDetails {
    fairTrade: string;
    localEconomy: string;
    workingConditions: string;
  }

  interface ProductAnalysis {
    lifecycle: {
      production: LifecyclePhase;
      transportation: LifecyclePhase;
      usage: LifecyclePhase;
      disposal: LifecyclePhase;
    };
    environmental: EnvironmentalDetails;
    social: SocialDetails;
  }

  interface ARData {
    ingredients: string;
    origin: string;
    co2Impact: string;
    barcode: string;
    features: string[];
    materials: string[];
    fullAnalysis: ProductAnalysis;
  }

  interface Alternative {
    name: string;
    reason: string;
    score: string;
    priceComparison: string;
  }

  interface Product {
    id: string;
    name: string;
    brand: string;
    sustainabilityScore: string;
    carbon: string;
    water: string;
    packaging: string;
    certifications: string[];
    alternatives: Alternative[];
    arData: ARData;
  }
  const [isScanning, setIsScanning] = useState(false);
  const [detectedProduct, setDetectedProduct] = useState<Product | null>(null);
  const [arMode, setArMode] = useState(false);
  const [showFullAnalysis, setShowFullAnalysis] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');


  const [showARView, setShowARView] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);
  const videoRef = useRef(null);

  // Mock product data for demonstration
  const mockProductData: Product = {
    id: 'prod_001',
    name: 'EcoClean Bamboo Toothbrush',
    brand: 'GreenLife',
    sustainabilityScore: 'A+',
    carbon: '0.2 kg CO₂ per unit',
    water: '15L per production cycle',
    packaging: 'Compostable cardboard',
    certifications: ['FSC Certified', 'Carbon Neutral', 'Biodegradable'],
    alternatives: [
      {
        name: 'PlasticFree Bamboo Brush',
        reason: '25% lower carbon footprint',
        score: 'A+',
        priceComparison: '15% cheaper'
      },
      {
        name: 'ZeroWaste Wooden Brush',
        reason: 'Locally sourced materials',
        score: 'A',
        priceComparison: 'Similar price'
      }
    ],
    arData: {
      ingredients: 'Sustainable bamboo, natural bristles, biodegradable coating',
      origin: 'Sustainably harvested bamboo from certified forests in Vietnam',
      co2Impact: '3.2 kg CO₂ saved vs conventional plastic toothbrush',
      barcode: '8901234567890',
      features: ['Biodegradable', 'Antimicrobial', 'Ergonomic', 'Plastic-free', 'Compostable', 'Fair Trade'],
      materials: ['Bamboo Handle', 'Natural Bristles', 'Organic Coating'],
      fullAnalysis: {
        lifecycle: {
          production: { score: 92, impact: 'Very Low', details: 'Renewable bamboo grows 10x faster than trees' },
          transportation: { score: 78, impact: 'Low', details: 'Shipped via carbon-neutral logistics partners' },
          usage: { score: 95, impact: 'Minimal', details: 'No electricity required, biodegradable materials' },
          disposal: { score: 98, impact: 'Positive', details: 'Fully compostable within 6 months' }
        },
        environmental: {
          biodiversity: 'Positive impact - supports sustainable bamboo farming',
          soilHealth: 'Bamboo cultivation improves soil structure and prevents erosion',
          waterConservation: '90% less water usage compared to plastic alternatives',
          airQuality: 'Carbon negative - bamboo absorbs 35% more CO₂ than trees'
        },
        social: {
          fairTrade: 'Certified fair trade with Vietnamese bamboo farmers',
          localEconomy: 'Supports 150+ local farming families',
          workingConditions: 'Ethical manufacturing with living wage guarantee'
        }
      }
    }
  };

  const mockScan = async () => {
    setIsScanning(true);
    setTimeout(() => {
      setDetectedProduct(mockProductData);
      setIsScanning(false);
      // Automatically save the scanned data after detection (optional)
      // if (mockProductData) {
      //   handleSaveData(mockProductData);
      // }
    }, 1500);
  };

  const handleSaveData = async (product: Product) => {
    setShowSaveModal(true);
    setSaveSuccess(false);
    setSaveError('');

    try {
      // Get current user ID from Firebase Authentication
      const auth = getAuth();
      const user = auth.currentUser;

      if (user) {
        const userId = user.uid;

        // Change collection path to scannedARProducts
        await addDoc(collection(db, `users/${userId}/scannedARProducts`), {
          ...product,
          scannedAt: serverTimestamp(),
          userId: userId, // Store userId for query/security purposes
        });
        setSaveSuccess(true);
      } else {
        setSaveError('User not authenticated.');
      }
    } catch (e: any) {
      setSaveError('Failed to save data: ' + e.message);
    }
  };

  const startARMode = () => {
    setArMode(true);
  };

  const stopARMode = () => {
    setArMode(false);
    setDetectedProduct(null);
    setShowFullAnalysis(false);
    setShowARView(false);
  };

  const handleViewFullAnalysis = () => {
    setShowFullAnalysis(true);
  };

  const handleShareData = () => {
    setShowShareModal(true);
  };

  const handleARView = () => {
    setShowARView(true);
  };

  const copyToClipboard = async (text, type) => {
    try {
      await navigator.clipboard.writeText(text);
      setShareSuccess(true);
      setTimeout(() => setShareSuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const shareViaEmail = () => {
    const subject = encodeURIComponent(`Sustainability Analysis: ${detectedProduct?.name}`);
    const body = encodeURIComponent(`Check out this sustainable product analysis:\n\nProduct: ${detectedProduct?.name}\nBrand: ${detectedProduct?.brand}\nSustainability Score: ${detectedProduct?.sustainabilityScore}\nCarbon Impact: ${detectedProduct?.arData?.co2Impact}\n\nScanned with AR Product Scanner`);
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  const downloadReport = (product) => {
    const reportData = `
SUSTAINABILITY ANALYSIS REPORT
Generated on: ${new Date().toLocaleDateString()}

PRODUCT INFORMATION
==================
Name: ${product.name}
Brand: ${product.brand}
Sustainability Score: ${product.sustainabilityScore}
Barcode: ${product.arData.barcode}

ENVIRONMENTAL IMPACT
===================
Carbon Footprint: ${product.carbon}
Water Usage: ${product.water}
Packaging: ${product.packaging}
CO₂ Impact: ${product.arData.co2Impact}

MATERIALS & ORIGIN
==================
Materials: ${product.arData.materials.join(', ')}
Origin: ${product.arData.origin}
Ingredients: ${product.arData.ingredients}

LIFECYCLE ASSESSMENT
===================
Production Score: ${product.arData.fullAnalysis.lifecycle.production.score}/100
- Impact: ${product.arData.fullAnalysis.lifecycle.production.impact}
- Details: ${product.arData.fullAnalysis.lifecycle.production.details}

Transportation Score: ${product.arData.fullAnalysis.lifecycle.transportation.score}/100
- Impact: ${product.arData.fullAnalysis.lifecycle.transportation.impact}
- Details: ${product.arData.fullAnalysis.lifecycle.transportation.details}

Usage Score: ${product.arData.fullAnalysis.lifecycle.usage.score}/100
- Impact: ${product.arData.fullAnalysis.lifecycle.usage.impact}
- Details: ${product.arData.fullAnalysis.lifecycle.usage.details}

Disposal Score: ${product.arData.fullAnalysis.lifecycle.disposal.score}/100
- Impact: ${product.arData.fullAnalysis.lifecycle.disposal.impact}
- Details: ${product.arData.fullAnalysis.lifecycle.disposal.details}

ENVIRONMENTAL DETAILS
====================
Biodiversity: ${product.arData.fullAnalysis.environmental.biodiversity}
Soil Health: ${product.arData.fullAnalysis.environmental.soilHealth}
Water Conservation: ${product.arData.fullAnalysis.environmental.waterConservation}
Air Quality: ${product.arData.fullAnalysis.environmental.airQuality}

SOCIAL IMPACT
=============
Fair Trade: ${product.arData.fullAnalysis.social.fairTrade}
Local Economy: ${product.arData.fullAnalysis.social.localEconomy}
Working Conditions: ${product.arData.fullAnalysis.social.workingConditions}

CERTIFICATIONS
==============
${product.certifications.map(cert => `- ${cert}`).join('\n')}

KEY FEATURES
============
${product.arData.features.map(feature => `- ${feature}`).join('\n')}

ALTERNATIVES
============
${product.alternatives.map(alt => `- ${alt.name}: ${alt.reason} (${alt.priceComparison})`).join('\n')}

---
Report generated by AR Product Scanner
`;

    const blob = new Blob([reportData], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${product.name.replace(/[^a-z0-9]/gi, '_')}_sustainability_report.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const generateShareableLink = (productId: string = 'default') => {
    return `${window.location.origin}/product/${productId}/ar-analysis`;
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

                  {/* AR View Mode */}
                  {showARView && detectedProduct && (
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-900/50 to-purple-900/50">
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <div className="bg-black/80 text-white p-6 rounded-2xl border-2 border-cyan-400 shadow-2xl max-w-sm">
                          <div className="text-center mb-4">
                            <div className="w-16 h-16 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full mx-auto mb-3 flex items-center justify-center">
                              <Sparkles className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-cyan-400">{detectedProduct.name}</h3>
                            <p className="text-gray-300">{detectedProduct.brand}</p>
                          </div>
                          
                          <div className="space-y-3">
                            <div className="flex justify-between items-center p-2 bg-slate-800/50 rounded-lg">
                              <span className="text-sm">Sustainability Score</span>
                              <Badge className="bg-green-500 text-white">{detectedProduct.sustainabilityScore}</Badge>
                            </div>
                            <div className="flex justify-between items-center p-2 bg-slate-800/50 rounded-lg">
                              <span className="text-sm">CO₂ Saved</span>
                              <span className="text-green-400 text-sm font-medium">{detectedProduct.arData.co2Impact}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 bg-slate-800/50 rounded-lg">
                              <span className="text-sm">Materials</span>
                              <span className="text-cyan-400 text-sm">Eco-Friendly</span>
                            </div>
                          </div>
                          
                          <Button 
                            onClick={() => setShowARView(false)}
                            variant="outline"
                            size="sm"
                            className="w-full mt-4 border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black"
                          >
                            Exit AR View
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Scanning Target */}
                  {!showARView && (
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
                  )}

                  {/* AR Overlay Information */}
                  {detectedProduct && !showARView && (
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
                  {!showARView && (
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                      <Button
                        onClick={mockScan}
                        disabled={isScanning}
                        className="bg-slate-700 hover:bg-slate-600 rounded-full w-16 h-16 border-2 border-slate-500"
                      >
                        <Scan className="w-6 h-6" />
                      </Button>
                    </div>
                  )}
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
                  <Button onClick={handleViewFullAnalysis} className="bg-slate-800 hover:bg-slate-900">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    View Full Analysis
                  </Button>
                  <Button onClick={handleShareData} variant="outline" className="border-slate-300">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share AR Data
                  </Button>
                  <Button onClick={() => detectedProduct && handleSaveData(detectedProduct)} variant="secondary">
                    <Download className="w-4 h-4 mr-2" />
                    Save Scan
                  </Button>
                  <Button onClick={handleARView} variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-50">
                    <Eye className="w-4 h-4 mr-2" />
                    View in AR
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Full Analysis Modal */}
      {showFullAnalysis && detectedProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">Full Sustainability Analysis</h2>
                <p className="text-slate-600">{detectedProduct.name} - {detectedProduct.brand}</p>
              </div>
              <Button onClick={() => setShowFullAnalysis(false)} variant="outline" size="sm">
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Lifecycle Analysis */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
                <Recycle className="w-5 h-5 mr-2 text-green-600" />
                Product Lifecycle Assessment
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(detectedProduct.arData.fullAnalysis.lifecycle).map(([phase, data]: [string, LifecyclePhase]) => (
                  <div key={phase} className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-slate-800 capitalize">{phase}</h4>
                      <Badge className={`${data.score >= 90 ? 'bg-green-100 text-green-800' : data.score >= 70 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                        {data.score}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-600 mb-2">{data.impact}</p>
                    <p className="text-xs text-slate-500">{data.details}</p>
                    <Progress value={data.score} className="mt-2 h-2" />
                  </div>
                ))}
              </div>
            </div>

            {/* Environmental Impact */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
                <Globe className="w-5 h-5 mr-2 text-blue-600" />
                Environmental Impact
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(detectedProduct.arData.fullAnalysis.environmental).map(([category, impact]: [string, string]) => (
                  <div key={category} className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                    <h4 className="font-semibold text-slate-800 capitalize mb-2 flex items-center">
                      <Leaf className="w-4 h-4 mr-2 text-green-600" />
                      {category.replace(/([A-Z])/g, ' $1').trim()}
                    </h4>
                    <p className="text-sm text-slate-700">{impact}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Social Impact */}
            <div className="mb-6">
              <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
                <CheckSquare className="w-5 h-5 mr-2 text-purple-600" />
                Social Impact
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(detectedProduct.arData.fullAnalysis.social).map(([category, impact]: [string, string]) => (
                  <div key={category} className="bg-purple-50 p-4 rounded-xl border border-purple-200">
                    <h4 className="font-semibold text-slate-800 capitalize mb-2">
                      {category.replace(/([A-Z])/g, ' $1').trim()}
                    </h4>
                    <p className="text-sm text-slate-700">{impact}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button onClick={() => setShowFullAnalysis(false)} variant="outline">
                Close Analysis
              </Button>
              <Button onClick={() => downloadReport(detectedProduct)} className="bg-slate-800 hover:bg-slate-900">
                <Download className="w-4 h-4 mr-2" />
                Download Report
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && detectedProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-800">Share AR Data</h2>
              <Button onClick={() => setShowShareModal(false)} variant="outline" size="sm">
                <X className="w-4 h-4" />
              </Button>
            </div>

            {shareSuccess && (
              <div className="mb-4 p-3 bg-green-100 border border-green-200 rounded-lg flex items-center">
                <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                <span className="text-green-800 text-sm">Copied to clipboard!</span>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Product Summary</label>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <p className="text-sm text-slate-800">{detectedProduct.name} - Score: {detectedProduct.sustainabilityScore}</p>
                  <p className="text-xs text-slate-600 mt-1">{detectedProduct.arData.co2Impact}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Shareable Link</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={generateShareableLink(detectedProduct.id)}
                    readOnly
                    className="flex-1 p-2 border border-slate-300 rounded-lg text-sm bg-slate-50"
                  />
                  <Button
                    onClick={() => copyToClipboard(generateShareableLink(), 'link')}
                    variant="outline"
                    size="sm"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={shareViaEmail}
                  variant="outline"
                  className="flex items-center justify-center"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Email
                </Button>
                <Button
                  onClick={() => copyToClipboard(`${detectedProduct.name} has a sustainability score of ${detectedProduct.sustainabilityScore}! ${detectedProduct.arData.co2Impact}`, 'text')}
                  variant="outline"
                  className="flex items-center justify-center"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Copy Details
                </Button>
              </div>

              <div className="pt-4 border-t border-slate-200">
                <Button
                  onClick={() => {
                    // Simulate social media sharing
                    const shareData = {
                      title: `Sustainable Product: ${detectedProduct.name}`,
                      text: `Check out this eco-friendly product with a ${detectedProduct.sustainabilityScore} sustainability score!`,
                      url: generateShareableLink(detectedProduct.id)
                    };
                    
                    if (navigator.share) {
                      navigator.share(shareData);
                    } else {
                      copyToClipboard(shareData.text + ' ' + shareData.url, 'share');
                    }
                  }}
                  className="w-full bg-slate-800 hover:bg-slate-900"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share on Social Media
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Save Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-800">Saving Product Data</h2>
              <Button onClick={() => setShowSaveModal(false)} variant="outline" size="sm">
                <X className="w-4 h-4" />
              </Button>
            </div>
            {saveSuccess && (
              <>
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <p className="text-slate-700 font-semibold">Product data saved successfully!</p>
                <p className="text-sm text-slate-500 mt-2">You can view saved scans in your dashboard.</p>
              </>
            )}
            {saveError && (
              <>
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <p className="text-red-700 font-semibold">Error saving data.</p>
                <p className="text-sm text-slate-500 mt-2">{saveError}</p>
              </>
            )}
            {!saveSuccess && !saveError && (
              <p className="text-slate-600">Saving product data to your profile...</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ARProductScanner;