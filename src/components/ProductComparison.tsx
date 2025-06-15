
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, X, Leaf, Droplets, Trash2, Zap, Heart } from 'lucide-react';
import { useProductHistory } from '@/hooks/useProductHistory';

const ProductComparison = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [comparedProducts, setComparedProducts] = useState<any[]>([]);
  const { history } = useProductHistory();

  const mockProducts = [
    {
      id: '1',
      name: 'iPhone 15 Pro',
      brand: 'Apple',
      category: 'Electronics',
      image: '📱',
      score: 72,
      carbon: 75,
      water: 68,
      waste: 70,
      energy: 76,
      ethics: 72,
      price: '$999'
    },
    {
      id: '2',
      name: 'Samsung Galaxy S24',
      brand: 'Samsung',
      category: 'Electronics',
      image: '📱',
      score: 69,
      carbon: 71,
      water: 65,
      waste: 68,
      energy: 74,
      ethics: 68,
      price: '$899'
    },
    {
      id: '3',
      name: 'Fairphone 5',
      brand: 'Fairphone',
      category: 'Electronics',
      image: '📱',
      score: 89,
      carbon: 88,
      water: 92,
      waste: 95,
      energy: 82,
      ethics: 96,
      price: '$699'
    },
    {
      id: '4',
      name: 'Nike Air Force 1',
      brand: 'Nike',
      category: 'Footwear',
      image: '👟',
      score: 58,
      carbon: 55,
      water: 48,
      waste: 62,
      energy: 60,
      ethics: 65,
      price: '$110'
    },
    {
      id: '5',
      name: 'Allbirds Tree Runners',
      brand: 'Allbirds',
      category: 'Footwear',
      image: '👟',
      score: 84,
      carbon: 89,
      water: 86,
      waste: 82,
      energy: 78,
      ethics: 85,
      price: '$98'
    }
  ];

  const filteredProducts = [...mockProducts, ...history.map(h => ({
    id: h.id,
    name: h.name,
    brand: h.brand,
    category: h.category,
    image: h.image,
    score: h.score,
    carbon: h.score + Math.floor(Math.random() * 10) - 5,
    water: h.score + Math.floor(Math.random() * 10) - 5,
    waste: h.score + Math.floor(Math.random() * 10) - 5,
    energy: h.score + Math.floor(Math.random() * 10) - 5,
    ethics: h.score + Math.floor(Math.random() * 10) - 5,
    price: '$' + (Math.floor(Math.random() * 500) + 50)
  }))].filter(product => 
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.brand.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addToComparison = (product: any) => {
    if (comparedProducts.length < 4 && !comparedProducts.find(p => p.id === product.id)) {
      setComparedProducts([...comparedProducts, product]);
    }
  };

  const removeFromComparison = (productId: string) => {
    setComparedProducts(comparedProducts.filter(p => p.id !== productId));
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const getBestInCategory = (category: string) => {
    if (comparedProducts.length === 0) return null;
    return comparedProducts.reduce((best, current) => 
      current[category] > best[category] ? current : best
    );
  };

  return (
    <div className="space-y-6">
      <Card className="border-emerald-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Leaf className="h-5 w-5 text-emerald-600" />
            <span>Product Comparison</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search products to compare..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {searchQuery && (
              <div className="max-h-48 overflow-y-auto space-y-2">
                {filteredProducts.slice(0, 10).map((product) => (
                  <div key={product.id} className="flex items-center justify-between p-2 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">{product.image}</span>
                      <div>
                        <h4 className="font-medium text-gray-900">{product.name}</h4>
                        <p className="text-sm text-gray-600">{product.brand}</p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => addToComparison(product)}
                      disabled={comparedProducts.length >= 4 || comparedProducts.find(p => p.id === product.id)}
                      className="bg-emerald-600 hover:bg-emerald-700"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {comparedProducts.length > 0 && (
        <Card className="border-emerald-200">
          <CardHeader>
            <CardTitle>Comparison ({comparedProducts.length}/4)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="text-left p-2">Product</th>
                    {comparedProducts.map((product) => (
                      <th key={product.id} className="text-center p-2 min-w-[200px]">
                        <div className="flex flex-col items-center space-y-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFromComparison(product.id)}
                            className="self-end p-1 h-6 w-6"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                          <div className="text-center">
                            <div className="text-2xl mb-1">{product.image}</div>
                            <h4 className="font-medium text-sm">{product.name}</h4>
                            <p className="text-xs text-gray-600">{product.brand}</p>
                          </div>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t">
                    <td className="p-2 font-medium">Overall Score</td>
                    {comparedProducts.map((product) => {
                      const best = getBestInCategory('score');
                      const isBest = best && product.id === best.id;
                      return (
                        <td key={product.id} className="p-2 text-center">
                          <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full ${getScoreBg(product.score)} ${isBest ? 'ring-2 ring-green-500' : ''}`}>
                            <span className={`font-bold ${getScoreColor(product.score)}`}>
                              {product.score}/100
                            </span>
                            {isBest && <span className="text-green-600">🏆</span>}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                  
                  <tr className="border-t">
                    <td className="p-2 font-medium flex items-center space-x-1">
                      <Leaf className="h-4 w-4 text-green-600" />
                      <span>Carbon</span>
                    </td>
                    {comparedProducts.map((product) => {
                      const best = getBestInCategory('carbon');
                      const isBest = best && product.id === best.id;
                      return (
                        <td key={product.id} className="p-2 text-center">
                          <div className={`inline-flex items-center space-x-1 ${isBest ? 'font-bold text-green-600' : ''}`}>
                            <span>{product.carbon}/100</span>
                            {isBest && <span>🏆</span>}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                  
                  <tr className="border-t">
                    <td className="p-2 font-medium flex items-center space-x-1">
                      <Droplets className="h-4 w-4 text-blue-600" />
                      <span>Water</span>
                    </td>
                    {comparedProducts.map((product) => {
                      const best = getBestInCategory('water');
                      const isBest = best && product.id === best.id;
                      return (
                        <td key={product.id} className="p-2 text-center">
                          <div className={`inline-flex items-center space-x-1 ${isBest ? 'font-bold text-blue-600' : ''}`}>
                            <span>{product.water}/100</span>
                            {isBest && <span>🏆</span>}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                  
                  <tr className="border-t">
                    <td className="p-2 font-medium flex items-center space-x-1">
                      <Trash2 className="h-4 w-4 text-orange-600" />
                      <span>Waste</span>
                    </td>
                    {comparedProducts.map((product) => {
                      const best = getBestInCategory('waste');
                      const isBest = best && product.id === best.id;
                      return (
                        <td key={product.id} className="p-2 text-center">
                          <div className={`inline-flex items-center space-x-1 ${isBest ? 'font-bold text-orange-600' : ''}`}>
                            <span>{product.waste}/100</span>
                            {isBest && <span>🏆</span>}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                  
                  <tr className="border-t">
                    <td className="p-2 font-medium flex items-center space-x-1">
                      <Zap className="h-4 w-4 text-yellow-600" />
                      <span>Energy</span>
                    </td>
                    {comparedProducts.map((product) => {
                      const best = getBestInCategory('energy');
                      const isBest = best && product.id === best.id;
                      return (
                        <td key={product.id} className="p-2 text-center">
                          <div className={`inline-flex items-center space-x-1 ${isBest ? 'font-bold text-yellow-600' : ''}`}>
                            <span>{product.energy}/100</span>
                            {isBest && <span>🏆</span>}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                  
                  <tr className="border-t">
                    <td className="p-2 font-medium flex items-center space-x-1">
                      <Heart className="h-4 w-4 text-purple-600" />
                      <span>Ethics</span>
                    </td>
                    {comparedProducts.map((product) => {
                      const best = getBestInCategory('ethics');
                      const isBest = best && product.id === best.id;
                      return (
                        <td key={product.id} className="p-2 text-center">
                          <div className={`inline-flex items-center space-x-1 ${isBest ? 'font-bold text-purple-600' : ''}`}>
                            <span>{product.ethics}/100</span>
                            {isBest && <span>🏆</span>}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                  
                  <tr className="border-t">
                    <td className="p-2 font-medium">Price</td>
                    {comparedProducts.map((product) => (
                      <td key={product.id} className="p-2 text-center font-medium">
                        {product.price}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {comparedProducts.length > 1 && (
        <Card className="border-emerald-200">
          <CardHeader>
            <CardTitle>Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(() => {
                const bestOverall = comparedProducts.reduce((best, current) => 
                  current.score > best.score ? current : best
                );
                const mostEthical = comparedProducts.reduce((best, current) => 
                  current.ethics > best.ethics ? current : best
                );
                
                return (
                  <div className="space-y-3">
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <h4 className="font-medium text-green-900 mb-2">🏆 Best Overall Environmental Impact</h4>
                      <p className="text-green-800">
                        <strong>{bestOverall.name}</strong> by {bestOverall.brand} with {bestOverall.score}/100 overall score
                      </p>
                    </div>
                    
                    <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                      <h4 className="font-medium text-purple-900 mb-2">💜 Most Ethical Choice</h4>
                      <p className="text-purple-800">
                        <strong>{mostEthical.name}</strong> by {mostEthical.brand} with {mostEthical.ethics}/100 ethics score
                      </p>
                    </div>
                  </div>
                );
              })()}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProductComparison;
