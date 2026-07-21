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
  FileImage,
  X
} from "lucide-react";
import {
  collection,
  doc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { useAuth } from "../contexts/AuthContext";
import { db } from "../firebase";
import { useUserData } from '../contexts/UserDataContext';
import { useProductComparison } from '../contexts/ProductComparisonContext';

import { useCart } from "../contexts/CartContext";
import { useNotifications } from '../contexts/NotificationsContextNew';
import { BrowserMultiFormatReader } from '@zxing/browser';
import type { IScannerControls } from '@zxing/browser';
import { analyzeProduct, analyzeGeneralProduct, searchProducts, type EcoAnalysis, type ProductSearchResult } from '../services/productApi';
import { identifyImage, uploadProductImage, deleteProductImage, type ImageIdentification } from '../services/visionApi';

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
  const [searchResults, setSearchResults] = useState<ProductSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [uploadedImageId, setUploadedImageId] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [stream, setStream] = useState(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [imageIdentification, setImageIdentification] = useState<ImageIdentification | null>(null);
  const [isIdentifyingImage, setIsIdentifyingImage] = useState(false);
  const [visionUnavailableMessage, setVisionUnavailableMessage] = useState<string | null>(null);
  const videoRef = useRef(null);
  const fileInputRef = useRef(null);
  const scannerControlsRef = useRef<IScannerControls | null>(null);

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

  // Cleanup camera stream and barcode reader when component unmounts or scan mode changes
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      scannerControlsRef.current?.stop();
    };
  }, [stream]);

  const mapAnalysisToDetectedProduct = (barcode: string, offProduct: any, analysis: EcoAnalysis) => {
    const overall = analysis.sustainability_score;
    const name = offProduct.product_name || 'Unknown product';
    const brand = offProduct.brands || 'Unknown brand';
    // No fake stock-photo fallback - a mismatched product image is worse than no image, and the
    // UI already renders a placeholder icon when `image` is falsy (see detectedProduct.image below).
    const image = offProduct.image_url || offProduct.image_front_url || null;
    const category = (offProduct.categories || 'Uncategorized').split(',')[0].trim();

    return {
      id: barcode,
      barcode,
      name,
      brand,
      image,
      category,
      origin: offProduct.countries || 'Unknown',
      inStock: true,
      rating: 0,
      reviews: 0,
      description: offProduct.generic_name || '',
      carbon: analysis.carbon_footprint.estimated_kg_co2e ?? analysis.carbon_footprint.score,
      water: overall,
      packaging: offProduct.packaging || 'Unknown',
      certifications: (offProduct.labels_tags || []).slice(0, 5),
      materials: analysis.packaging.materials || [],
      features: [],
      stages: [],
      sustainabilityScore: overall,
      sustainability: {
        carbon: analysis.carbon_footprint.score,
        water: overall,
        waste: analysis.packaging.score,
        energy: overall,
        ethics: analysis.health_impact.score,
        overall,
      },
      alternatives: analysis.alternatives.map((alt) => ({
        name: alt.name,
        reason: alt.reason,
        priceComparison: '',
        score: alt.estimated_score ?? overall,
      })),
      aiAnalysis: analysis,
    };
  };

  // Non-food products (electronics, clothing, etc. from eBay search results) have no OpenFoodFacts
  // barcode record to look up - this maps a real eBay item + its text-based AI analysis into the
  // same detectedProduct shape the barcode flow produces, so the rest of the UI doesn't need to care.
  const mapGeneralAnalysisToDetectedProduct = (result: ProductSearchResult, analysis: EcoAnalysis) => {
    const overall = analysis.sustainability_score;
    return {
      id: result.external_id || result.name,
      barcode: null,
      name: result.name,
      brand: result.brand || 'Unknown brand',
      image: result.image_url || null,
      category: result.category || 'Uncategorized',
      origin: 'Unknown',
      inStock: true,
      rating: 0,
      reviews: 0,
      description: '',
      price: result.price ?? undefined,
      itemUrl: result.item_url,
      carbon: analysis.carbon_footprint.estimated_kg_co2e ?? analysis.carbon_footprint.score,
      water: overall,
      packaging: 'Unknown',
      certifications: [],
      materials: analysis.packaging.materials || [],
      features: [],
      stages: [],
      sustainabilityScore: overall,
      sustainability: {
        carbon: analysis.carbon_footprint.score,
        water: overall,
        waste: analysis.packaging.score,
        energy: overall,
        ethics: analysis.health_impact.score,
        overall,
      },
      alternatives: analysis.alternatives.map((alt) => ({
        name: alt.name,
        reason: alt.reason,
        priceComparison: '',
        score: alt.estimated_score ?? overall,
      })),
      aiAnalysis: analysis,
    };
  };

  const handleGeneralProductDetected = async (result: ProductSearchResult) => {
    if (isScanning) return;
    setIsScanning(true);
    setScanError(null);
    try {
      const analysis = await analyzeGeneralProduct({
        name: result.name,
        brand: result.brand,
        category: result.category,
      });
      const mapped = mapGeneralAnalysisToDetectedProduct(result, analysis);
      setDetectedProduct(mapped);

      addNotification({
        type: 'scanning',
        title: 'Product Analyzed',
        message: `You analyzed ${mapped.name}.`,
        read: false,
        source: 'scanner',
        actionable: true,
        action: 'View',
      });

      addProductToComparison({
        id: mapped.id.toString(),
        name: mapped.name,
        brand: mapped.brand,
        sustainabilityScore: mapped.sustainabilityScore,
        category: mapped.category,
        date: new Date().toISOString(),
        image: mapped.image,
        metrics: {
          carbon: mapped.sustainability.carbon,
          water: mapped.sustainability.water,
          waste: mapped.sustainability.waste,
          energy: mapped.sustainability.energy,
          ethics: mapped.sustainability.ethics,
        },
        certifications: mapped.certifications,
        rating: mapped.rating,
        reviews: mapped.reviews,
        inStock: mapped.inStock,
        features: mapped.features,
      });
    } catch (err: any) {
      console.error('General product analysis failed:', err);
      if (/rate limit/i.test(err?.message || '')) {
        setScanError('The AI service has hit its daily rate limit. Please try again later.');
      } else {
        setScanError('Could not analyze this product. Please try again.');
      }
    } finally {
      setIsScanning(false);
    }
  };

  const handleBarcodeDetected = async (barcode: string) => {
    if (isScanning) return;
    setIsScanning(true);
    setScanError(null);
    try {
      const { product: offProduct, analysis } = await analyzeProduct(barcode);
      const mapped = mapAnalysisToDetectedProduct(barcode, offProduct, analysis);
      setDetectedProduct(mapped);

      addNotification({
        type: 'scanning',
        title: 'Product Scanned',
        message: `You scanned ${mapped.name} by ${mapped.brand}.`,
        read: false,
        source: 'scanner',
        actionable: true,
        action: 'View',
      });

      addProductToComparison({
        id: mapped.id.toString(),
        name: mapped.name,
        brand: mapped.brand,
        sustainabilityScore: mapped.sustainabilityScore,
        category: mapped.category,
        date: new Date().toISOString(),
        image: mapped.image,
        metrics: {
          carbon: mapped.sustainability.carbon,
          water: mapped.sustainability.water,
          waste: mapped.sustainability.waste,
          energy: mapped.sustainability.energy,
          ethics: mapped.sustainability.ethics,
        },
        certifications: mapped.certifications,
        rating: mapped.rating,
        reviews: mapped.reviews,
        inStock: mapped.inStock,
        features: mapped.features,
      });
    } catch (err: any) {
      console.error('Product analysis failed:', err);
      if (err?.message?.includes('404')) {
        setScanError('Product not found. Try a different barcode.');
      } else if (err?.message?.includes('taking too long')) {
        setScanError(err.message);
      } else if (/rate limit/i.test(err?.message || '')) {
        setScanError('The AI service has hit its daily rate limit. Please try again later.');
      } else {
        setScanError('Could not analyze this product. Please try again.');
      }
    } finally {
      setIsScanning(false);
    }
  };

  const startScanning = async () => {
    setScanError(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment'
        }
      });
      setStream(mediaStream);
      setScanMode(true);
    } catch (error) {
      console.error('Error accessing camera:', error);
      setScanError('Unable to access the camera. Check browser permissions, or use "Choose File" to upload a photo instead.');
    }
  };

  // Attaches the stream and starts the barcode decoder only once the <video> element for
  // scanMode is actually mounted, instead of guessing with a fixed setTimeout delay.
  useEffect(() => {
    if (!scanMode || !stream || !videoRef.current) return;

    let cancelled = false;
    const video = videoRef.current;
    video.srcObject = stream;

    const codeReader = new BrowserMultiFormatReader();
    video.play().catch((err) => console.error('Video play() failed:', err));

    codeReader
      .decodeFromVideoElement(video, (result) => {
        if (result) {
          handleBarcodeDetected(result.getText());
        }
      })
      .then((controls) => {
        if (cancelled) {
          controls.stop();
        } else {
          scannerControlsRef.current = controls;
        }
      })
      .catch((err) => {
        console.error('Barcode decoder failed to start:', err);
        if (!cancelled) setScanError('Could not start barcode scanning on this camera stream.');
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scanMode, stream]);

  const stopScanning = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    scannerControlsRef.current?.stop();
    setScanMode(false);
    setDetectedProduct(null);
  };

  const handleIdentifyImage = async (dataUrl: string) => {
    setIsIdentifyingImage(true);
    setImageIdentification(null);
    setVisionUnavailableMessage(null);
    try {
      const [header, base64] = dataUrl.split(',');
      const mimeMatch = header.match(/data:(.*);base64/);
      const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
      const { identification, message } = await identifyImage(base64, mimeType);
      if (identification) {
        setImageIdentification(identification);
      } else {
        setVisionUnavailableMessage(message || 'Image analysis is currently unavailable.');
      }
    } catch (err: any) {
      console.error('Image identification failed:', err);
      if (/rate limit/i.test(err?.message || '')) {
        setVisionUnavailableMessage('The AI service has hit its daily rate limit. Please try again later.');
      } else {
        setVisionUnavailableMessage("Couldn't analyze this image. Please try again.");
      }
    } finally {
      setIsIdentifyingImage(false);
    }
  };

  // Selecting a file now only previews + stores it. Analysis is triggered explicitly by the
  // "Analyze Photo" button (analyzeUploadedImage) so the user is in control and a rate-limited
  // AI call doesn't fire silently on every file pick.
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setImageIdentification(null);
      setVisionUnavailableMessage(null);
      setScanError(null);
      setDetectedProduct(null);
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target.result as string;
        setUploadedImage(dataUrl);
        setUploadedImageId(null);
        setIsUploadingImage(true);
        uploadProductImage(file)
          .then(({ image_id }) => setUploadedImageId(image_id))
          .catch((err) => console.error('Storing uploaded image failed:', err))
          .finally(() => setIsUploadingImage(false));
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeUploadedImage = async () => {
    if (!uploadedImage) return;
    setScanError(null);
    setImageIdentification(null);
    setVisionUnavailableMessage(null);
    try {
      const codeReader = new BrowserMultiFormatReader();
      const result = await codeReader.decodeFromImageUrl(uploadedImage);
      handleBarcodeDetected(result.getText());
    } catch {
      setScanError('No barcode found - identifying the item from the photo with AI instead.');
      handleIdentifyImage(uploadedImage);
    }
  };

  const handleRemoveUploadedImage = () => {
    setUploadedImage(null);
    setImageIdentification(null);
    setVisionUnavailableMessage(null);
    setScanError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (uploadedImageId) {
      deleteProductImage(uploadedImageId).catch((err) =>
        console.error('Deleting uploaded image failed:', err)
      );
      setUploadedImageId(null);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    setScanError(null);
    try {
      const { results } = await searchProducts(searchQuery);
      setSearchResults(results);
    } catch (err) {
      console.error('Product search failed:', err);
      setSearchResults([]);
      setScanError('Product search failed. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const selectSearchResult = (product: ProductSearchResult) => {
    setSearchResults([]);
    setSearchQuery('');
    if (product.source === 'ebay') {
      handleGeneralProductDetected(product);
    } else if (product.barcode) {
      handleBarcodeDetected(product.barcode);
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
      {scannedProducts.length > 0 && (
        <Card className="bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-700 shadow-lg rounded-2xl">
          <CardHeader>
            <CardTitle className="font-bold text-slate-800 dark:text-slate-200">Recent Scans</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {scannedProducts.slice(0, 6).map((product) => (
                <div key={product.id} className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-medium text-slate-800 dark:text-slate-200">{product.name}</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{product.brand}</p>
                    </div>
                    <Badge className={getScoreColor(product.sustainabilityScore)}>
                      {product.sustainabilityScore}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500 dark:text-slate-400">{product.category}</span>
                    <span className="text-slate-500 dark:text-slate-400">{new Date(product.date).toLocaleDateString()}</span>
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
              <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center">
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
                  <Button onClick={handleSearch} size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                    <Search className="w-4 h-4" />
                  </Button>
                </div>
                
                {/* Search Results */}
                {isSearching && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Searching products...</p>
                )}
                {!isSearching && searchResults.length > 0 && (
                  <div className="max-h-60 overflow-y-auto space-y-2 mt-2">
                    {searchResults.map((product, index) => (
                      <div
                        key={product.barcode || product.external_id || index}
                        className="p-2 border border-slate-200 dark:border-slate-700 rounded cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                        onClick={() => selectSearchResult(product)}
                      >
                        <div className="flex items-center space-x-3">
                          {product.image_url ? (
                            <img
                              src={product.image_url}
                              alt={product.name}
                              className="w-8 h-8 object-cover rounded"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                              <Search className="w-3 h-3 text-slate-400" />
                            </div>
                          )}
                          <div className="flex-1">
                            <h4 className="text-sm font-medium text-slate-800 dark:text-slate-200">{product.name}</h4>
                            <p className="text-xs text-slate-600 dark:text-slate-400">
                              {product.brand || (product.category ?? 'Unknown brand')}
                            </p>
                          </div>
                          {product.price != null && (
                            <Badge variant="outline" className="text-xs px-2 py-1 text-slate-700 dark:text-slate-300">
                              {product.price_currency === 'USD' ? '$' : `${product.price_currency} `}{product.price}
                            </Badge>
                          )}
                          {product.ecoscore_grade && (
                            <Badge className="text-xs px-2 py-1 uppercase text-green-600 bg-green-100">
                              Eco {product.ecoscore_grade}
                            </Badge>
                          )}
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
                  <div className="mt-2 relative">
                    <img
                      src={uploadedImage}
                      alt="Uploaded product"
                      className="w-full h-24 object-cover rounded border border-slate-200 dark:border-slate-700"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveUploadedImage}
                      aria-label="Remove uploaded image"
                      className="absolute top-1 right-1 w-6 h-6 flex items-center justify-center rounded-full bg-slate-900/70 text-white hover:bg-slate-900 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                    {isUploadingImage && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Saving image...</p>
                    )}
                    <Button
                      onClick={analyzeUploadedImage}
                      disabled={isScanning || isIdentifyingImage}
                      className="w-full mt-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      <Zap className="w-4 h-4 mr-2" />
                      {isScanning || isIdentifyingImage ? 'Analyzing...' : 'Analyze Photo'}
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          </div>

          <div className="bg-emerald-50 rounded-xl overflow-hidden shadow-lg">
            <div className="bg-emerald-50 h-64 flex items-center justify-center relative">
              {!scanMode ? (
                <div className="text-center">
                  <Camera className="w-16 h-16 mx-auto mb-4 text-emerald-600" />
                  <p className="text-black mb-4">Point your camera at any product</p>
                  <Button onClick={startScanning} className="bg-emerald-600 hover:bg-emerald-700 border border-emerald-600 text-white">
                    <Play className="w-4 h-4 mr-2" />
                    Start Camera
                  </Button>
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
                    <Badge className="bg-slate-800/80 text-white border border-slate-600 px-3 py-1.5">
                      {isScanning ? 'Analyzing...' : 'Scanning automatically - no need to tap'}
                    </Badge>
                  </div>
                </div>
              )}
            </div>
          </div>

          {scanError && (
            <div className="text-center p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-300 text-sm">
              {scanError}
            </div>
          )}

          {isIdentifyingImage && (
            <div className="text-center p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-300 text-sm">
              Identifying item with AI Vision...
            </div>
          )}

          {visionUnavailableMessage && (
            <div className="p-3 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-xl text-amber-700 dark:text-amber-300 text-sm">
              {visionUnavailableMessage}
            </div>
          )}

          {imageIdentification && (
            <div className="p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-slate-800 dark:text-slate-200">{imageIdentification.item_name}</h4>
                <Badge className={imageIdentification.recyclable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                  {imageIdentification.recyclable ? 'Likely Recyclable' : 'Likely Not Recyclable'}
                </Badge>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Material: {imageIdentification.material_guess} ({imageIdentification.confidence} confidence)</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">{imageIdentification.disposal_guidance}</p>
              <p className="text-sm text-slate-500 dark:text-slate-500">{imageIdentification.environmental_impact}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-slate-50/80 dark:bg-slate-700 rounded-xl border border-slate-200/50 dark:border-slate-700">
              <Zap className="w-8 h-8 mx-auto mb-2 text-emerald-600" />
              <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-1">Instant Analysis</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300">Real-time sustainability scoring</p>
            </div>
            <div className="text-center p-4 bg-slate-50/80 dark:bg-slate-700 rounded-xl border border-slate-200/50 dark:border-slate-700">
              <Leaf className="w-8 h-8 mx-auto mb-2 text-emerald-600" />
              <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-1">Impact Assessment</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300">Environmental footprint analysis</p>
            </div>
            <div className="text-center p-4 bg-slate-50/80 dark:bg-slate-700 rounded-xl border border-slate-200/50 dark:border-slate-700">
              <ShoppingCart className="w-8 h-8 mx-auto mb-2 text-emerald-600" />
              <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-1">Smart Alternatives</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300">Better product suggestions</p>
            </div>
          </div>

          {detectedProduct && (
            <div className="space-y-4">
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 shadow-sm">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex space-x-4">
                    {detectedProduct.image ? (
                      <img
                        src={detectedProduct.image}
                        alt={detectedProduct.name}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center shrink-0">
                        <Camera className="w-8 h-8 text-slate-300 dark:text-slate-500" />
                      </div>
                    )}
                    <div>
                      <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200">{detectedProduct.name}</h3>
                      <p className="text-slate-600 dark:text-slate-400">{detectedProduct.brand}</p>
                      {detectedProduct.price !== undefined && (
                        <p className="text-lg font-bold text-green-600">${detectedProduct.price}</p>
                      )}
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
                        onTabChange('analysis');
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
                          ...(detectedProduct.price !== undefined ? { price: detectedProduct.price } : {}),
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
                        // Comparison now lives inside the Marketplace ("Compare" tab) rather
                        // than as a separate page - send the user there to view it.
                        onTabChange('marketplace');
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
