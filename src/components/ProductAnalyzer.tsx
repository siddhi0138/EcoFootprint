import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Leaf, Database, Search } from 'lucide-react';
import SustainableAlternatives from './SustainableAlternatives';
import SustainabilityTips from './SustainabilityTips';
import SocialShare from './SocialShare';
import ProductRating from './ProductRating';

interface ProductAnalyzerProps {
  productQuery: string;
}

const ProductAnalyzer = ({ productQuery }: ProductAnalyzerProps) => {
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [analysisStage, setAnalysisStage] = useState(0);

  const analysisStages = [
    'Searching product database...',
    'Analyzing manufacturing data...',
    'Evaluating supply chain impact...',
    'Calculating carbon footprint...',
    'Generating impact score...'
  ];

  useEffect(() => {
    setIsAnalyzing(true);
    setAnalysisStage(0);

    const interval = setInterval(() => {
      setAnalysisStage((prev) => {
        if (prev >= analysisStages.length - 1) {
          clearInterval(interval);
          setTimeout(() => setIsAnalyzing(false), 1000);
          return prev;
        }
        return prev + 1;
      });
    }, 800);

    return () => clearInterval(interval);
  }, [productQuery]);

  if (isAnalyzing) {
    return (
      <Card className="border-emerald-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="h-5 w-5 text-emerald-600 animate-spin" />
            <span>Analyzing "{productQuery}"</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analysisStages.map((stage, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${
                  index <= analysisStage ? 'bg-emerald-500' : 'bg-gray-200'
                } transition-colors`} />
                <span className={`${
                  index <= analysisStage ? 'text-emerald-700' : 'text-gray-400'
                } transition-colors`}>
                  {stage}
                </span>
                {index === analysisStage && (
                  <div className="flex space-x-1">
                    <div className="w-1 h-1 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-1 h-1 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-1 h-1 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Simulated product data based on query
  const getProductData = (query: string) => {
    const products: Record<string, any> = {
      'iphone 15': {
        name: 'Apple iPhone 15',
        brand: 'Apple',
        category: 'Electronics',
        image: '📱',
        score: 72,
        manufacturing: 'Assembled in China with components from multiple countries',
        materials: 'Aluminum, Glass, Rare Earth Elements, Lithium',
        transportation: 'Global shipping network, air and sea freight',
        packaging: 'Recyclable cardboard, reduced plastic usage'
      },
      'nike air max': {
        name: 'Nike Air Max 270',
        brand: 'Nike',
        category: 'Footwear',
        image: '👟',
        score: 58,
        manufacturing: 'Manufactured in Vietnam and Indonesia',
        materials: 'Synthetic leather, foam, rubber, textile',
        transportation: 'International shipping from Asia',
        packaging: 'Cardboard box with tissue paper'
      },
      'tesla model 3': {
        name: 'Tesla Model 3',
        brand: 'Tesla',
        category: 'Automotive',
        image: '🚗',
        score: 85,
        manufacturing: 'Manufactured in multiple Gigafactories globally',
        materials: 'Steel, aluminum, lithium-ion batteries',
        transportation: 'Minimal - direct to consumer delivery',
        packaging: 'No traditional packaging required'
      },
      'patagonia jacket': {
        name: 'Patagonia Better Sweater',
        brand: 'Patagonia',
        category: 'Apparel',
        image: '🧥',
        score: 89,
        manufacturing: 'Fair Trade Certified facilities',
        materials: '100% recycled polyester fleece',
        transportation: 'Carbon-neutral shipping options',
        packaging: 'Compostable packaging materials'
      }
    };

    const key = query.toLowerCase();
    return products[key] || {
      name: productQuery,
      brand: 'Unknown Brand',
      category: 'Consumer Product',
      image: '📦',
      score: Math.floor(Math.random() * 40) + 45,
      manufacturing: 'Manufacturing details analyzed from product information',
      materials: 'Materials composition determined through AI analysis',
      transportation: 'Transportation impact calculated based on supply chain data',
      packaging: 'Packaging assessment based on industry standards'
    };
  };

  const product = getProductData(productQuery);

  return (
    <div className="space-y-6">
      {/* Product Overview */}
      <Card className="border-emerald-200">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-4xl">{product.image}</div>
              <div>
                <CardTitle className="text-2xl text-gray-900">{product.name}</CardTitle>
                <p className="text-gray-600">{product.brand} • {product.category}</p>
              </div>
            </div>
            <Badge 
              variant="outline"
              className="border-emerald-300 text-emerald-700 bg-emerald-50"
            >
              Analyzed
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Analysis Details */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-emerald-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Leaf className="h-5 w-5 text-emerald-600" />
              <span>Manufacturing Impact</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Production</h4>
                <p className="text-gray-600 text-sm">{product.manufacturing}</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Materials</h4>
                <p className="text-gray-600 text-sm">{product.materials}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-emerald-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Database className="h-5 w-5 text-emerald-600" />
              <span>Supply Chain Impact</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Transportation</h4>
                <p className="text-gray-600 text-sm">{product.transportation}</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Packaging</h4>
                <p className="text-gray-600 text-sm">{product.packaging}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Features */}
      <div className="grid lg:grid-cols-2 gap-6">
        <SustainableAlternatives currentProduct={product.name} />
        <SocialShare productName={product.name} score={product.score} />
      </div>
      
      <ProductRating productName={product.name} />
      <SustainabilityTips />
    </div>
  );
};

export default ProductAnalyzer;
