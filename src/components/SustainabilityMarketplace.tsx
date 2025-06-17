
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, ShoppingCart, Star, Leaf, Award, Filter } from 'lucide-react';

const SustainabilityMarketplace = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const sustainableProducts = [
    {
      id: 1,
      name: 'Eco-Friendly Bamboo Toothbrush Set',
      brand: 'GreenBrush Co.',
      price: 24.99,
      originalPrice: 34.99,
      rating: 4.8,
      sustainabilityScore: 94,
      category: 'personal-care',
      image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400',
      features: ['Biodegradable', 'Zero Waste', 'Vegan'],
      co2Saved: '2.3 kg',
      description: 'Set of 4 bamboo toothbrushes with replaceable heads'
    },
    {
      id: 2,
      name: 'Organic Cotton Tote Bag',
      brand: 'EarthWear',
      price: 18.99,
      originalPrice: 25.99,
      rating: 4.6,
      sustainabilityScore: 89,
      category: 'accessories',
      image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400',
      features: ['Fair Trade', 'Organic', 'Reusable'],
      co2Saved: '1.8 kg',
      description: 'Durable organic cotton bag for everyday use'
    },
    {
      id: 3,
      name: 'Solar-Powered Phone Charger',
      brand: 'SunTech',
      price: 79.99,
      originalPrice: 99.99,
      rating: 4.7,
      sustainabilityScore: 91,
      category: 'electronics',
      image: 'https://images.unsplash.com/photo-1593642532842-98d0fd5ebc1a?w=400',
      features: ['Renewable Energy', 'Portable', 'Weather Resistant'],
      co2Saved: '15.2 kg',
      description: 'Portable solar charger with 20,000mAh capacity'
    },
    {
      id: 4,
      name: 'Recycled Plastic Water Bottle',
      brand: 'HydroEco',
      price: 12.99,
      originalPrice: 19.99,
      rating: 4.5,
      sustainabilityScore: 85,
      category: 'drinkware',
      image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400',
      features: ['Recycled Materials', 'BPA Free', 'Insulated'],
      co2Saved: '0.8 kg',
      description: 'Made from 100% recycled ocean plastic'
    }
  ];

  const categories = [
    { id: 'all', label: 'All Products', icon: ShoppingCart },
    { id: 'personal-care', label: 'Personal Care', icon: Star },
    { id: 'accessories', label: 'Accessories', icon: Award },
    { id: 'electronics', label: 'Electronics', icon: Leaf },
    { id: 'drinkware', label: 'Drinkware', icon: Search }
  ];

  const filteredProducts = sustainableProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.brand.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ShoppingCart className="w-6 h-6 text-green-600" />
            <span>Sustainability Marketplace</span>
          </CardTitle>
          <p className="text-gray-600">Discover and purchase eco-friendly alternatives</p>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search sustainable products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" className="flex items-center space-x-2">
              <Filter className="w-4 h-4" />
              <span>Filters</span>
            </Button>
          </div>

          <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="mb-6">
            <TabsList className="grid w-full grid-cols-5">
              {categories.map((category) => (
                <TabsTrigger key={category.id} value={category.id} className="flex items-center space-x-1">
                  <category.icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{category.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="relative overflow-hidden rounded-t-lg">
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <Badge className="absolute top-2 right-2 bg-green-500 hover:bg-green-600">
                    {product.sustainabilityScore}
                  </Badge>
                </div>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-semibold text-lg group-hover:text-green-600 transition-colors">
                        {product.name}
                      </h3>
                      <p className="text-sm text-gray-600">{product.brand}</p>
                    </div>

                    <div className="flex items-center space-x-2">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star 
                          key={i} 
                          className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                        />
                      ))}
                      <span className="text-sm text-gray-600">({product.rating})</span>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {product.features.map((feature, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-lg font-bold text-green-600">${product.price}</span>
                        <span className="text-sm text-gray-500 line-through ml-2">${product.originalPrice}</span>
                      </div>
                      <div className="text-xs text-green-600">
                        {product.co2Saved} CO₂ saved
                      </div>
                    </div>

                    <p className="text-sm text-gray-600">{product.description}</p>

                    <Button className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600">
                      Add to Cart
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SustainabilityMarketplace;
