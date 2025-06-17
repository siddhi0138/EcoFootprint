
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Plus, 
  X, 
  Search, 
  ArrowUpDown, 
  CheckCircle, 
  AlertCircle,
  Zap,
  Droplets,
  Leaf,
  Trash2,
  Heart
} from 'lucide-react';

const ProductComparison = () => {
  const [comparisonProducts, setComparisonProducts] = useState([
    {
      id: 1,
      name: 'Organic Cotton T-Shirt',
      brand: 'EcoWear',
      price: 29.99,
      sustainabilityScore: 85,
      metrics: {
        carbon: 88,
        water: 82,
        waste: 90,
        energy: 85,
        ethics: 92
      },
      image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200',
      certifications: ['GOTS', 'Fair Trade', 'Organic'],
      pros: ['Organic materials', 'Fair trade certified', 'Minimal packaging'],
      cons: ['Higher price point', 'Limited color options']
    },
    {
      id: 2,
      name: 'Regular Cotton T-Shirt',
      brand: 'FastFashion',
      price: 9.99,
      sustainabilityScore: 42,
      metrics: {
        carbon: 35,
        water: 28,
        waste: 45,
        energy: 40,
        ethics: 35
      },
      image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=200',
      certifications: [],
      pros: ['Affordable price', 'Wide availability', 'Multiple colors'],
      cons: ['Non-organic cotton', 'Poor labor practices', 'Excessive packaging']
    }
  ]);

  const [searchQuery, setSearchQuery] = useState('');

  const availableProducts = [
    {
      id: 3,
      name: 'Bamboo T-Shirt',
      brand: 'BambooWear',
      price: 34.99,
      sustainabilityScore: 91,
      image: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=200'
    },
    {
      id: 4,
      name: 'Recycled Polyester Tee',
      brand: 'RecycleWear',
      price: 24.99,
      sustainabilityScore: 78,
      image: 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=200'
    }
  ];

  const removeProduct = (productId) => {
    setComparisonProducts(comparisonProducts.filter(p => p.id !== productId));
  };

  const addProduct = (product) => {
    if (comparisonProducts.length < 4) {
      const fullProduct = {
        ...product,
        metrics: {
          carbon: Math.floor(Math.random() * 40) + 60,
          water: Math.floor(Math.random() * 40) + 60,
          waste: Math.floor(Math.random() * 40) + 60,
          energy: Math.floor(Math.random() * 40) + 60,
          ethics: Math.floor(Math.random() * 40) + 60
        },
        certifications: ['Eco-Label', 'B-Corp'],
        pros: ['Sustainable materials', 'Good quality'],
        cons: ['Price consideration']
      };
      setComparisonProducts([...comparisonProducts, fullProduct]);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBg = (score) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const metricIcons = {
    carbon: Leaf,
    water: Droplets,
    waste: Trash2,
    energy: Zap,
    ethics: Heart
  };

  const metricLabels = {
    carbon: 'Carbon',
    water: 'Water',
    waste: 'Waste',
    energy: 'Energy',
    ethics: 'Ethics'
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ArrowUpDown className="w-6 h-6 text-purple-600" />
            <span>Product Comparison</span>
          </CardTitle>
          <p className="text-gray-600">Compare sustainability scores and make informed choices</p>
        </CardHeader>
      </Card>

      {/* Add Product Section */}
      {comparisonProducts.length < 4 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Plus className="w-5 h-5" />
              <span>Add Product to Compare</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-2 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search for products to compare..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableProducts
                .filter(product => 
                  product.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
                  !comparisonProducts.find(cp => cp.id === product.id)
                )
                .map((product) => (
                  <div key={product.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium">{product.name}</h3>
                      <p className="text-sm text-gray-600">{product.brand} • ${product.price}</p>
                    </div>
                    <Badge className={getScoreBg(product.sustainabilityScore)}>
                      {product.sustainabilityScore}
                    </Badge>
                    <Button 
                      size="sm" 
                      onClick={() => addProduct(product)}
                      className="ml-2"
                    >
                      Add
                    </Button>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Comparison Table */}
      {comparisonProducts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Comparison Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {comparisonProducts.map((product) => (
                  <div key={product.id} className="border rounded-lg p-4 space-y-4">
                    <div className="relative">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full bg-red-100 hover:bg-red-200"
                        onClick={() => removeProduct(product.id)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                      <img 
                        src={product.image} 
                        alt={product.name}
                        className="w-full h-32 object-cover rounded"
                      />
                    </div>

                    <div className="text-center">
                      <h3 className="font-semibold">{product.name}</h3>
                      <p className="text-sm text-gray-600">{product.brand}</p>
                      <p className="text-lg font-bold text-green-600">${product.price}</p>
                    </div>

                    <div className="text-center">
                      <div className={`text-3xl font-bold ${getScoreColor(product.sustainabilityScore)}`}>
                        {product.sustainabilityScore}
                      </div>
                      <p className="text-sm text-gray-600">Overall Score</p>
                    </div>

                    {/* Metrics */}
                    <div className="space-y-2">
                      {Object.entries(product.metrics || {}).map(([key, value]) => {
                        const Icon = metricIcons[key];
                        return (
                          <div key={key} className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Icon className="w-4 h-4 text-gray-500" />
                              <span className="text-sm">{metricLabels[key]}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="w-16 bg-gray-200 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full ${value >= 80 ? 'bg-green-500' : value >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                  style={{ width: `${value}%` }}
                                ></div>
                              </div>
                              <span className="text-sm font-medium w-8">{value}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Certifications */}
                    {product.certifications && product.certifications.length > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-2">Certifications</p>
                        <div className="flex flex-wrap gap-1">
                          {product.certifications.map((cert, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {cert}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Pros and Cons */}
                    <div className="space-y-2">
                      <div>
                        <p className="text-sm font-medium text-green-700 mb-1">Pros</p>
                        {product.pros?.slice(0, 2).map((pro, index) => (
                          <div key={index} className="flex items-start space-x-1">
                            <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-xs text-gray-600">{pro}</span>
                          </div>
                        ))}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-red-700 mb-1">Cons</p>
                        {product.cons?.slice(0, 2).map((con, index) => (
                          <div key={index} className="flex items-start space-x-1">
                            <AlertCircle className="w-3 h-3 text-red-500 mt-0.5 flex-shrink-0" />
                            <span className="text-xs text-gray-600">{con}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Button className="w-full" size="sm">
                      View Details
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {comparisonProducts.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <ArrowUpDown className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Products to Compare</h3>
            <p className="text-gray-600">Add products above to start comparing their sustainability scores</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProductComparison;
