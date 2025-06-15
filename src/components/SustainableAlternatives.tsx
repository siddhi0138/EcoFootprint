
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Leaf, ExternalLink, Star, TrendingUp } from 'lucide-react';

interface SustainableAlternativesProps {
  currentProduct: string;
}

const SustainableAlternatives = ({ currentProduct }: SustainableAlternativesProps) => {
  const alternatives = [
    {
      id: '1',
      name: 'Fairphone 5',
      brand: 'Fairphone',
      category: 'Sustainable Electronics',
      image: '📱',
      score: 89,
      price: '$699',
      savings: '+17 points',
      highlights: ['Modular design', 'Fair trade materials', 'Repairable'],
      link: '#'
    },
    {
      id: '2',
      name: 'Patagonia Synchilla Snap-T',
      brand: 'Patagonia',
      category: 'Sustainable Apparel',
      image: '🧥',
      score: 92,
      price: '$149',
      savings: '+20 points',
      highlights: ['Recycled materials', 'Fair Trade Certified', 'Lifetime repair'],
      link: '#'
    },
    {
      id: '3',
      name: 'Allbirds Tree Runners',
      brand: 'Allbirds',
      category: 'Sustainable Footwear',
      image: '👟',
      score: 84,
      price: '$98',
      savings: '+12 points',
      highlights: ['Carbon neutral', 'Natural materials', 'Biodegradable'],
      link: '#'
    }
  ];

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Card className="border-emerald-200">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Leaf className="h-5 w-5 text-emerald-600" />
          <span>Sustainable Alternatives</span>
        </CardTitle>
        <p className="text-gray-600 text-sm">
          Better environmental choices similar to "{currentProduct}"
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {alternatives.map((product) => (
            <div key={product.id} className="p-4 border border-emerald-200 rounded-lg hover:border-emerald-300 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">{product.image}</div>
                  <div>
                    <h4 className="font-medium text-gray-900">{product.name}</h4>
                    <p className="text-sm text-gray-600">{product.brand}</p>
                    <p className="text-xs text-emerald-600">{product.category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-lg font-bold ${getScoreColor(product.score)}`}>
                    {product.score}/100
                  </div>
                  <Badge variant="outline" className="border-green-300 text-green-700 bg-green-50 text-xs">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    {product.savings}
                  </Badge>
                </div>
              </div>
              
              <div className="mb-3">
                <div className="flex flex-wrap gap-1">
                  {product.highlights.map((highlight, index) => (
                    <Badge key={index} variant="outline" className="text-xs border-emerald-300 text-emerald-700">
                      {highlight}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="font-medium text-gray-900">{product.price}</span>
                  <div className="flex items-center space-x-1 text-yellow-500">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-3 w-3 fill-current" />
                    ))}
                  </div>
                </div>
                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                  <ExternalLink className="h-3 w-3 mr-1" />
                  View Product
                </Button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
          <h4 className="font-medium text-emerald-900 mb-2">Why Switch?</h4>
          <ul className="text-sm text-emerald-800 space-y-1">
            <li>• Reduce your carbon footprint by up to 20%</li>
            <li>• Support ethical manufacturing practices</li>
            <li>• Often better quality and longer-lasting</li>
            <li>• Help drive demand for sustainable products</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default SustainableAlternatives;
