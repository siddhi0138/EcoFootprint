
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, BarChart3, Lightbulb, AlertCircle, CheckCircle, XCircle, ExternalLink } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

const ProductAnalysis = ({ product }) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('6months');

  if (!product) {
    return (
      <Card className="bg-white/60 backdrop-blur-sm border-green-100">
        <CardContent className="p-8 text-center">
          <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No Product Selected</h3>
          <p className="text-gray-500">Scan a product to see detailed analysis and trends.</p>
        </CardContent>
      </Card>
    );
  }

  // Mock historical data
  const historicalData = {
    '3months': [
      { month: 'Mar', overall: 85, carbon: 83, water: 88, waste: 80, energy: 86, ethics: 90 },
      { month: 'Apr', overall: 86, carbon: 84, water: 89, waste: 81, energy: 87, ethics: 91 },
      { month: 'May', overall: 87, carbon: 85, water: 90, waste: 82, energy: 88, ethics: 92 }
    ],
    '6months': [
      { month: 'Jan', overall: 82, carbon: 80, water: 85, waste: 78, energy: 83, ethics: 87 },
      { month: 'Feb', overall: 83, carbon: 81, water: 86, waste: 79, energy: 84, ethics: 88 },
      { month: 'Mar', overall: 85, carbon: 83, water: 88, waste: 80, energy: 86, ethics: 90 },
      { month: 'Apr', overall: 86, carbon: 84, water: 89, waste: 81, energy: 87, ethics: 91 },
      { month: 'May', overall: 87, carbon: 85, water: 90, waste: 82, energy: 88, ethics: 92 },
      { month: 'Jun', overall: 87, carbon: 85, water: 90, waste: 82, energy: 88, ethics: 92 }
    ],
    '1year': [
      { month: 'Jul 23', overall: 78, carbon: 76, water: 81, waste: 74, energy: 79, ethics: 83 },
      { month: 'Aug 23', overall: 79, carbon: 77, water: 82, waste: 75, energy: 80, ethics: 84 },
      { month: 'Sep 23', overall: 80, carbon: 78, water: 83, waste: 76, energy: 81, ethics: 85 },
      { month: 'Oct 23', overall: 81, carbon: 79, water: 84, waste: 77, energy: 82, ethics: 86 },
      { month: 'Nov 23', overall: 82, carbon: 80, water: 85, waste: 78, energy: 83, ethics: 87 },
      { month: 'Dec 23', overall: 83, carbon: 81, water: 86, waste: 79, energy: 84, ethics: 88 },
      { month: 'Jan 24', overall: 82, carbon: 80, water: 85, waste: 78, energy: 83, ethics: 87 },
      { month: 'Feb 24', overall: 83, carbon: 81, water: 86, waste: 79, energy: 84, ethics: 88 },
      { month: 'Mar 24', overall: 85, carbon: 83, water: 88, waste: 80, energy: 86, ethics: 90 },
      { month: 'Apr 24', overall: 86, carbon: 84, water: 89, waste: 81, energy: 87, ethics: 91 },
      { month: 'May 24', overall: 87, carbon: 85, water: 90, waste: 82, energy: 88, ethics: 92 },
      { month: 'Jun 24', overall: 87, carbon: 85, water: 90, waste: 82, energy: 88, ethics: 92 }
    ]
  };

  const currentData = historicalData[selectedTimeframe];
  const latestData = currentData[currentData.length - 1];

  // Radar chart data
  const radarData = [
    { subject: 'Carbon', A: product.sustainability.carbon, fullMark: 100 },
    { subject: 'Water', A: product.sustainability.water, fullMark: 100 },
    { subject: 'Waste', A: product.sustainability.waste, fullMark: 100 },
    { subject: 'Energy', A: product.sustainability.energy, fullMark: 100 },
    { subject: 'Ethics', A: product.sustainability.ethics, fullMark: 100 }
  ];

  // Competitive analysis
  const competitors = [
    { name: 'Brand A', score: 79, trend: '+1' },
    { name: 'Brand B', score: 84, trend: '-2' },
    { name: 'Brand C', score: 76, trend: '+3' },
    { name: 'Industry Avg', score: 72, trend: '+1' }
  ];

  // Improvement suggestions
  const suggestions = [
    {
      category: 'Packaging',
      impact: 'High',
      suggestion: 'Switch to biodegradable packaging materials',
      potential: '+8 points',
      status: 'recommended'
    },
    {
      category: 'Supply Chain',
      impact: 'Medium',
      suggestion: 'Implement local sourcing for 40% of ingredients',
      potential: '+5 points',
      status: 'in-progress'
    },
    {
      category: 'Manufacturing',
      impact: 'High',
      suggestion: 'Increase renewable energy usage to 80%',
      potential: '+12 points',
      status: 'planned'
    },
    {
      category: 'Transportation',
      impact: 'Low',
      suggestion: 'Optimize logistics routes',
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
      {/* Analysis Header */}
      <Card className="bg-white/60 backdrop-blur-sm border-green-100">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <span>Deep Analysis: {product.name}</span>
              </CardTitle>
              <p className="text-gray-600 mt-1">Comprehensive sustainability trends and insights</p>
            </div>
            <div className="flex space-x-2">
              {['3months', '6months', '1year'].map((timeframe) => (
                <Button
                  key={timeframe}
                  variant={selectedTimeframe === timeframe ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedTimeframe(timeframe)}
                  className={selectedTimeframe === timeframe ? 'bg-blue-500' : ''}
                >
                  {timeframe === '3months' ? '3M' : timeframe === '6months' ? '6M' : '1Y'}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trend Analysis */}
        <Card className="bg-white/60 backdrop-blur-sm border-green-100">
          <CardHeader>
            <CardTitle>Sustainability Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={currentData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis domain={[60, 100]} />
                <Tooltip 
                  formatter={(value, name) => [`${value}%`, name]}
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                />
                <Line type="monotone" dataKey="overall" stroke="#22c55e" strokeWidth={3} name="Overall" />
                <Line type="monotone" dataKey="carbon" stroke="#3b82f6" strokeWidth={2} name="Carbon" />
                <Line type="monotone" dataKey="water" stroke="#06b6d4" strokeWidth={2} name="Water" />
                <Line type="monotone" dataKey="energy" stroke="#8b5cf6" strokeWidth={2} name="Energy" />
                <Line type="monotone" dataKey="ethics" stroke="#ef4444" strokeWidth={2} name="Ethics" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Sustainability Radar */}
        <Card className="bg-white/60 backdrop-blur-sm border-green-100">
          <CardHeader>
            <CardTitle>Multi-Factor Assessment</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" />
                <PolarRadiusAxis angle={30} domain={[0, 100]} />
                <Radar
                  name="Score"
                  dataKey="A"
                  stroke="#22c55e"
                  fill="#22c55e"
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Competitive Analysis */}
        <Card className="bg-white/60 backdrop-blur-sm border-green-100">
          <CardHeader>
            <CardTitle>Competitive Landscape</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-medium text-blue-800">{product.name}</span>
                  <span className="text-blue-600 ml-2">(Current Product)</span>
                </div>
                <div className="text-lg font-bold text-blue-600">{product.sustainability.overall}</div>
              </div>
            </div>
            
            {competitors.map((competitor, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <span className="font-medium">{competitor.name}</span>
                <div className="flex items-center space-x-2">
                  <span className="font-bold">{competitor.score}</span>
                  <span className={`text-xs ${competitor.trend.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                    {competitor.trend}
                  </span>
                </div>
              </div>
            ))}
            
            <div className="text-center pt-2">
              <Badge variant="outline" className="border-green-200 text-green-700">
                <TrendingUp className="w-3 h-3 mr-1" />
                Above Industry Average
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Improvement Opportunities */}
        <Card className="bg-white/60 backdrop-blur-sm border-green-100">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Lightbulb className="w-5 h-5 text-yellow-500" />
              <span>AI Improvement Suggestions</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {suggestions.map((suggestion, index) => (
              <div key={index} className="border rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(suggestion.status)}
                    <span className="font-medium">{suggestion.category}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={`text-xs ${getImpactColor(suggestion.impact)}`}>
                      {suggestion.impact} Impact
                    </Badge>
                    <span className="text-sm font-medium text-green-600">{suggestion.potential}</span>
                  </div>
                </div>
                <p className="text-sm text-gray-600">{suggestion.suggestion}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Data Sources & Methodology */}
      <Card className="bg-white/60 backdrop-blur-sm border-green-100">
        <CardHeader>
          <CardTitle>Data Sources & Methodology</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">Data Sources</h4>
              <ul className="text-sm space-y-1 text-gray-600">
                <li>• Ecoinvent Database</li>
                <li>• GHG Protocol Standards</li>
                <li>• EPA Environmental Data</li>
                <li>• Company Sustainability Reports</li>
                <li>• Third-party Certifications</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">AI Analysis Methods</h4>
              <ul className="text-sm space-y-1 text-gray-600">
                <li>• Lifecycle Assessment (LCA)</li>
                <li>• Supply Chain Mapping</li>
                <li>• Comparative Impact Analysis</li>
                <li>• Predictive Sustainability Modeling</li>
                <li>• Cross-Industry Benchmarking</li>
              </ul>
            </div>
          </div>
          
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-2">
              <AlertCircle className="w-4 h-4 text-blue-500" />
              <span className="font-medium text-gray-800">Methodology Notes</span>
            </div>
            <p className="text-sm text-gray-600">
              Scores are normalized across industries and updated monthly. AI confidence levels indicate data quality and certainty. 
              Historical trends may include projected data based on company commitments and industry patterns.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductAnalysis;
