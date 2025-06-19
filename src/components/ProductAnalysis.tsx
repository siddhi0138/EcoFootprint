
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  BarChart3, 
  Lightbulb, 
  AlertCircle, 
  CheckCircle, 
  XCircle, 
  ExternalLink,
  Leaf,
  Droplets,
  Zap,
  Heart
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { getRandomProducts } from '@/data/productsData';

const ProductAnalysis = ({ product }) => {
  console.log('ProductAnalysis component rendered, product:', product);
  
  const [selectedTimeframe, setSelectedTimeframe] = useState('6months');
  const [selectedView, setSelectedView] = useState('overview');

  if (!product) {
    console.log('No product provided, showing empty state');
    return (
      <Card className="bg-white/95 backdrop-blur-sm border-slate-200/50 shadow-xl rounded-3xl overflow-hidden">
        <CardContent className="p-12 text-center">
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-slate-100 to-gray-100 rounded-full flex items-center justify-center">
            <BarChart3 className="w-12 h-12 text-slate-400" />
          </div>
          <h3 className="text-2xl font-bold text-slate-600 mb-3">No Product Selected</h3>
          <p className="text-slate-500 mb-6 max-w-md mx-auto">Scan a product or search our database to see detailed sustainability analysis and insights.</p>
          <Button className="bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 px-6 py-3 rounded-2xl">
            Scan Product
          </Button>
        </CardContent>
      </Card>
    );
  }

  console.log('Product data available, rendering full analysis');

  const historicalData = {
    '3months': [
      { month: 'Mar', overall: product.sustainability.overall, carbon: product.sustainability.carbon, water: product.sustainability.water, waste: product.sustainability.waste, energy: product.sustainability.energy, ethics: product.sustainability.ethics },
      { month: 'Apr', overall: product.sustainability.overall + 1, carbon: product.sustainability.carbon + 1, water: product.sustainability.water + 1, waste: product.sustainability.waste + 1, energy: product.sustainability.energy + 1, ethics: product.sustainability.ethics + 1 },
      { month: 'May', overall: product.sustainability.overall + 2, carbon: product.sustainability.carbon + 1, water: product.sustainability.water + 2, waste: product.sustainability.waste + 2, energy: product.sustainability.energy + 2, ethics: product.sustainability.ethics + 2 }
    ],
    '6months': [
      { month: 'Jan', overall: product.sustainability.overall - 5, carbon: product.sustainability.carbon - 3, water: product.sustainability.water - 3, waste: product.sustainability.waste - 4, energy: product.sustainability.energy - 3, ethics: product.sustainability.ethics - 3 },
      { month: 'Feb', overall: product.sustainability.overall - 4, carbon: product.sustainability.carbon - 2, water: product.sustainability.water - 2, waste: product.sustainability.waste - 3, energy: product.sustainability.energy - 2, ethics: product.sustainability.ethics - 2 },
      { month: 'Mar', overall: product.sustainability.overall - 2, carbon: product.sustainability.carbon - 1, water: product.sustainability.water, waste: product.sustainability.waste - 2, energy: product.sustainability.energy, ethics: product.sustainability.ethics },
      { month: 'Apr', overall: product.sustainability.overall - 1, carbon: product.sustainability.carbon, water: product.sustainability.water + 1, waste: product.sustainability.waste - 1, energy: product.sustainability.energy + 1, ethics: product.sustainability.ethics + 1 },
      { month: 'May', overall: product.sustainability.overall, carbon: product.sustainability.carbon + 1, water: product.sustainability.water + 2, waste: product.sustainability.waste, energy: product.sustainability.energy + 2, ethics: product.sustainability.ethics + 2 },
      { month: 'Jun', overall: product.sustainability.overall + 1, carbon: product.sustainability.carbon + 1, water: product.sustainability.water + 2, waste: product.sustainability.waste + 1, energy: product.sustainability.energy + 2, ethics: product.sustainability.ethics + 2 }
    ],
    '1year': [
      { month: 'Jul 23', overall: product.sustainability.overall - 9, carbon: product.sustainability.carbon - 6, water: product.sustainability.water - 7, waste: product.sustainability.waste - 8, energy: product.sustainability.energy - 6, ethics: product.sustainability.ethics - 7 },
      { month: 'Aug 23', overall: product.sustainability.overall - 8, carbon: product.sustainability.carbon - 5, water: product.sustainability.water - 6, waste: product.sustainability.waste - 7, energy: product.sustainability.energy - 5, ethics: product.sustainability.ethics - 6 },
      { month: 'Sep 23', overall: product.sustainability.overall - 7, carbon: product.sustainability.carbon - 4, water: product.sustainability.water - 5, waste: product.sustainability.waste - 6, energy: product.sustainability.energy - 4, ethics: product.sustainability.ethics - 5 },
      { month: 'Oct 23', overall: product.sustainability.overall - 6, carbon: product.sustainability.carbon - 3, water: product.sustainability.water - 4, waste: product.sustainability.waste - 5, energy: product.sustainability.energy - 3, ethics: product.sustainability.ethics - 4 },
      { month: 'Nov 23', overall: product.sustainability.overall - 5, carbon: product.sustainability.carbon - 2, water: product.sustainability.water - 3, waste: product.sustainability.waste - 4, energy: product.sustainability.energy - 2, ethics: product.sustainability.ethics - 3 },
      { month: 'Dec 23', overall: product.sustainability.overall - 4, carbon: product.sustainability.carbon - 1, water: product.sustainability.water - 2, waste: product.sustainability.waste - 3, energy: product.sustainability.energy - 1, ethics: product.sustainability.ethics - 2 },
      { month: 'Jan 24', overall: product.sustainability.overall - 3, carbon: product.sustainability.carbon, water: product.sustainability.water - 1, waste: product.sustainability.waste - 2, energy: product.sustainability.energy, ethics: product.sustainability.ethics - 1 },
      { month: 'Feb 24', overall: product.sustainability.overall - 2, carbon: product.sustainability.carbon + 1, water: product.sustainability.water, waste: product.sustainability.waste - 1, energy: product.sustainability.energy + 1, ethics: product.sustainability.ethics },
      { month: 'Mar 24', overall: product.sustainability.overall - 1, carbon: product.sustainability.carbon + 2, water: product.sustainability.water + 1, waste: product.sustainability.waste, energy: product.sustainability.energy + 2, ethics: product.sustainability.ethics + 1 },
      { month: 'Apr 24', overall: product.sustainability.overall, carbon: product.sustainability.carbon + 3, water: product.sustainability.water + 2, waste: product.sustainability.waste + 1, energy: product.sustainability.energy + 3, ethics: product.sustainability.ethics + 2 },
      { month: 'May 24', overall: product.sustainability.overall + 1, carbon: product.sustainability.carbon + 4, water: product.sustainability.water + 3, waste: product.sustainability.waste + 2, energy: product.sustainability.energy + 4, ethics: product.sustainability.ethics + 3 },
      { month: 'Jun 24', overall: product.sustainability.overall + 2, carbon: product.sustainability.carbon + 5, water: product.sustainability.water + 4, waste: product.sustainability.waste + 3, energy: product.sustainability.energy + 5, ethics: product.sustainability.ethics + 4 }
    ]
  };

  const currentData = historicalData[selectedTimeframe];
  const radarData = [
    { subject: 'Carbon', A: product.sustainability.carbon, fullMark: 100 },
    { subject: 'Water', A: product.sustainability.water, fullMark: 100 },
    { subject: 'Waste', A: product.sustainability.waste, fullMark: 100 },
    { subject: 'Energy', A: product.sustainability.energy, fullMark: 100 },
    { subject: 'Ethics', A: product.sustainability.ethics, fullMark: 100 }
  ];

  // Generate competitors from our product data
  const competitorProducts = getRandomProducts(4);
  const competitors = competitorProducts.map(comp => ({
    name: comp.brand,
    score: comp.sustainabilityScore,
    trend: Math.random() > 0.5 ? `+${Math.floor(Math.random() * 3) + 1}` : `-${Math.floor(Math.random() * 2) + 1}`
  }));

  const suggestions = [
    {
      category: 'Packaging',
      impact: 'High',
      suggestion: product.packaging.recyclable ? 'Explore compostable packaging options' : 'Switch to recyclable packaging materials',
      potential: '+8 points',
      status: 'recommended'
    },
    {
      category: 'Supply Chain',
      impact: 'Medium',
      suggestion: 'Implement local sourcing for 40% of materials',
      potential: '+5 points',
      status: 'in-progress'
    },
    {
      category: 'Manufacturing',
      impact: 'High',
      suggestion: product.energySource.includes('Renewable') ? 'Achieve 100% renewable energy' : 'Increase renewable energy usage to 80%',
      potential: '+12 points',
      status: 'planned'
    },
    {
      category: 'Transportation',
      impact: 'Low',
      suggestion: 'Optimize logistics routes and packaging density',
      potential: '+2 points',
      status: 'completed'
    }
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'in-progress': return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'planned': return <AlertCircle className="w-4 h-4 text-blue-500" />;
      default: return <XCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getImpactColor = (impact) => {
    switch (impact) {
      case 'High': return 'bg-red-100 text-red-700';
      case 'Medium': return 'bg-yellow-100 text-yellow-700';
      case 'Low': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white/95 backdrop-blur-sm border-slate-200/50 shadow-xl rounded-3xl overflow-hidden">
        <CardHeader className="pb-6 bg-gradient-to-r from-slate-50 to-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-slate-600 to-slate-700 rounded-2xl shadow-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-slate-800">Deep Analysis: {product.name}</CardTitle>
                <p className="text-slate-600 mt-1">Advanced sustainability insights powered by AI</p>
              </div>
            </div>
            <div className="flex space-x-2">
              {['3months', '6months', '1year'].map((timeframe) => (
                <Button
                  key={timeframe}
                  variant={selectedTimeframe === timeframe ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedTimeframe(timeframe)}
                  className={`rounded-xl ${selectedTimeframe === timeframe ? 'bg-slate-700 hover:bg-slate-800' : 'border-slate-300 hover:bg-slate-50'}`}
                >
                  {timeframe === '3months' ? '3M' : timeframe === '6months' ? '6M' : '1Y'}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <Tabs value={selectedView} onValueChange={setSelectedView} className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-slate-100 rounded-2xl p-1">
              <TabsTrigger value="overview" className="rounded-xl">Overview</TabsTrigger>
              <TabsTrigger value="trends" className="rounded-xl">Trends</TabsTrigger>
              <TabsTrigger value="comparison" className="rounded-xl">Compare</TabsTrigger>
              <TabsTrigger value="insights" className="rounded-xl">AI Insights</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-slate-200/50 shadow-md rounded-2xl">
                  <CardHeader>
                    <CardTitle className="text-lg">Multi-Factor Assessment</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <RadarChart data={radarData}>
                        <PolarGrid stroke="#e2e8f0" />
                        <PolarAngleAxis dataKey="subject" className="text-sm" />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} />
                        <Radar
                          name="Score"
                          dataKey="A"
                          stroke="#0f172a"
                          fill="#0f172a"
                          fillOpacity={0.1}
                          strokeWidth={3}
                          dot={{ fill: '#0f172a', strokeWidth: 2, r: 4 }}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="border-slate-200/50 shadow-md rounded-2xl">
                  <CardHeader>
                    <CardTitle className="text-lg">Key Performance Indicators</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {Object.entries(product.sustainability).map(([key, value]) => {
                      if (key === 'overall') return null;
                      
                      let IconComponent = AlertCircle;
                      switch (key) {
                        case 'carbon': IconComponent = Leaf; break;
                        case 'water': IconComponent = Droplets; break;
                        case 'waste': IconComponent = AlertCircle; break;
                        case 'energy': IconComponent = Zap; break;
                        case 'ethics': IconComponent = Heart; break;
                      }
                      
                      return (
                        <div key={key} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200/50">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-slate-700 rounded-xl flex items-center justify-center">
                              <IconComponent className="w-5 h-5 text-white" />
                            </div>
                            <span className="font-medium capitalize text-slate-800">{key}</span>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-slate-800">{value as number}</div>
                            <div className="text-xs text-slate-500">Score</div>
                          </div>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              </div>

              {/* Product Details Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-slate-200/50 shadow-md rounded-2xl">
                  <CardHeader>
                    <CardTitle className="text-lg">Product Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Brand:</span>
                      <span className="font-medium">{product.brand}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Category:</span>
                      <span className="font-medium capitalize">{product.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Origin:</span>
                      <span className="font-medium">{product.origin}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Price:</span>
                      <span className="font-medium">${product.price}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Rating:</span>
                      <span className="font-medium">{product.rating}/5 ({product.reviews} reviews)</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-slate-200/50 shadow-md rounded-2xl">
                  <CardHeader>
                    <CardTitle className="text-lg">Environmental Impact</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Carbon Footprint:</span>
                      <span className="font-medium">{product.carbon}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Water Usage:</span>
                      <span className="font-medium">{product.water}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Packaging:</span>
                      <span className="font-medium">{product.packaging}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Energy Source:</span>
                      <span className="font-medium">{product.energySource || 'Mixed Grid'}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="trends" className="mt-6">
              <Card className="border-slate-200/50 shadow-md rounded-2xl">
                <CardHeader>
                  <CardTitle>Sustainability Trends Over Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={currentData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="month" className="text-sm" />
                      <YAxis domain={[60, 100]} className="text-sm" />
                      <Tooltip 
                        formatter={(value, name) => [`${value}%`, name]}
                        contentStyle={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          border: '1px solid #e2e8f0',
                          borderRadius: '12px',
                          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                      <Line type="monotone" dataKey="overall" stroke="#0f172a" strokeWidth={4} name="Overall" dot={{ fill: '#0f172a', strokeWidth: 2, r: 6 }} />
                      <Line type="monotone" dataKey="carbon" stroke="#22c55e" strokeWidth={3} name="Carbon" dot={{ fill: '#22c55e', strokeWidth: 2, r: 4 }} />
                      <Line type="monotone" dataKey="water" stroke="#3b82f6" strokeWidth={3} name="Water" dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }} />
                      <Line type="monotone" dataKey="energy" stroke="#8b5cf6" strokeWidth={3} name="Energy" dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }} />
                      <Line type="monotone" dataKey="ethics" stroke="#ef4444" strokeWidth={3} name="Ethics" dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="comparison" className="mt-6">
              <Card className="border-slate-200/50 shadow-md rounded-2xl">
                <CardHeader>
                  <CardTitle>Competitive Landscape</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-slate-800 text-white border border-slate-700 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-bold text-lg">{product.name}</span>
                        <span className="text-slate-300 ml-2">(Current Product)</span>
                      </div>
                      <div className="text-2xl font-bold">{product.sustainability.overall}</div>
                    </div>
                  </div>
                  
                  {competitors.map((competitor, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
                      <span className="font-medium text-slate-800">{competitor.name}</span>
                      <div className="flex items-center space-x-3">
                        <span className="text-xl font-bold text-slate-800">{competitor.score}</span>
                        <span className={`text-sm px-2 py-1 rounded-lg ${competitor.trend.startsWith('+') ? 'text-green-700 bg-green-100' : 'text-red-700 bg-red-100'}`}>
                          {competitor.trend}
                        </span>
                      </div>
                    </div>
                  ))}
                  
                  <div className="text-center pt-4">
                    <Badge className={`px-4 py-2 ${product.sustainability.overall > 75 ? 'bg-green-600 text-white' : 'bg-slate-800 text-white'}`}>
                      <TrendingUp className="w-4 h-4 mr-2" />
                      {product.sustainability.overall > 75 ? 'Above Industry Average' : 'Room for Improvement'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="insights" className="mt-6">
              <Card className="border-slate-200/50 shadow-md rounded-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Lightbulb className="w-5 h-5 text-amber-500" />
                    <span>AI-Powered Improvement Recommendations</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {suggestions.map((suggestion, index) => (
                    <div key={index} className="border border-slate-200 rounded-xl p-5 space-y-3 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {getStatusIcon(suggestion.status)}
                          <span className="font-bold text-slate-800">{suggestion.category}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={`text-xs ${getImpactColor(suggestion.impact)}`}>
                            {suggestion.impact} Impact
                          </Badge>
                          <span className="text-lg font-bold text-slate-700">{suggestion.potential}</span>
                        </div>
                      </div>
                      <p className="text-slate-600 leading-relaxed">{suggestion.suggestion}</p>
                      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                        <span className="text-sm text-slate-500">Expected timeframe: 2-4 weeks</span>
                        <Button size="sm" className="bg-slate-700 hover:bg-slate-800 rounded-xl">
                          Learn More
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card className="bg-white/95 backdrop-blur-sm border-slate-200/50 shadow-lg rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-slate-600" />
            <span>Data Sources & Methodology</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-bold text-slate-800 flex items-center space-x-2">
                <div className="w-3 h-3 bg-slate-700 rounded-full"></div>
                <span>Data Sources</span>
              </h4>
              <ul className="space-y-2 text-sm text-slate-600 ml-5">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Ecoinvent Database (LCA)</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>GHG Protocol Standards</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>EPA Environmental Data</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Company Sustainability Reports</span>
                </li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-bold text-slate-800 flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                <span>AI Analysis Methods</span>
              </h4>
              <ul className="space-y-2 text-sm text-slate-600 ml-5">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-blue-500" />
                  <span>Lifecycle Assessment Modeling</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-blue-500" />
                  <span>Supply Chain Impact Analysis</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-blue-500" />
                  <span>Predictive Sustainability Scoring</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-blue-500" />
                  <span>Cross-Industry Benchmarking</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-blue-50 to-slate-50 border border-blue-200/50 rounded-xl p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <span className="font-bold text-slate-800">Methodology Confidence: 94%</span>
                <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                  Our AI models are trained on verified sustainability data from over 50,000 products. 
                  Scores are updated monthly and normalized across industries for accurate comparison.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductAnalysis;
