
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  RadialBarChart, 
  RadialBar, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  Leaf, 
  Droplets, 
  Trash2,
  Zap, 
  Heart,
  TrendingUp,
  Award, 
  AlertTriangle, 
  CheckCircle, 
  Info,
  Globe,
  Factory,
  Truck,
} from 'lucide-react';
import { db } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const SustainabilityScore = ({ product }) => {
  const [activeMetric, setActiveMetric] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (product && currentUser) {
      addDoc(collection(db, `users/${currentUser.uid}/sustainabilityScores`), {
        productId: product.id,
        score: product.sustainability.overall,
        timestamp: serverTimestamp(),
      })
      .catch((error) => {
        console.error("Error adding sustainability score interaction: ", error);
      });
    }
  }, [product, currentUser]); // Effect runs when product or currentUser changes

  if (!product) return null;

  const metrics = [
    {
      key: 'carbon',
      label: 'Carbon Footprint',
      score: product.sustainability.carbon,
      icon: Globe,
      color: '#10b981',
      description: 'CO₂ emissions from production to disposal',
      details: 'Based on manufacturing processes, transportation, and energy sources'
    },
    {
      key: 'water',
      label: 'Water Usage',
      score: product.sustainability.water,
      icon: Droplets,
      color: '#3b82f6',
      description: 'Water consumption in production',
      details: 'Includes direct usage and water pollution impact'
    },
    {
      key: 'waste',
      label: 'Waste Management',
      score: product.sustainability.waste,
      icon: Trash2,
      color: '#f59e0b',
      description: 'Waste generation and recyclability',
      details: 'Packaging materials, production waste, end-of-life disposal'
    },
    {
      key: 'energy',
      label: 'Energy Efficiency',
      score: product.sustainability.energy,
      icon: Zap,
      color: '#8b5cf6',
      description: 'Renewable energy usage',
      details: 'Percentage of renewable energy in production process'
    },
    {
      key: 'ethics',
      label: 'Social Impact',
      score: product.sustainability.ethics,
      icon: Heart,
      color: '#ef4444',
      description: 'Fair trade and labor practices',
      details: 'Worker rights, fair wages, community impact'
    }
  ];

  const chartData = metrics.map(metric => ({
    name: metric.label,
    value: metric.score,
    fill: metric.color
  }));

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getScoreVariant = (score) => {
    if (score >= 80) return 'default' as const;
    if (score >= 60) return 'secondary' as const;
    return 'destructive' as const;
  };

  const timelineData = [
    { month: 'Jan', score: 75 },
    { month: 'Feb', score: 78 },
    { month: 'Mar', score: 82 },
    { month: 'Apr', score: 85 },
    { month: 'May', score: 87 },
    { month: 'Jun', score: product.sustainability.overall }
  ];

  return (
    <div className="space-y-6">
      {/* Main Score Card */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                {product.name}
              </CardTitle>
              <p className="text-gray-600">{product.brand} • {product.category}</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                {product.sustainability.overall}
              </div>
              <Badge variant={getScoreVariant(product.sustainability.overall)} className="mt-1">
                Overall Score
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Radial Chart */}
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart cx="50%" cy="50%" innerRadius="40%" outerRadius="90%" data={chartData}>
                  <RadialBar
                    dataKey="value"
                    cornerRadius={10}
                    fill="#8884d8"
                    startAngle={90}
                    endAngle={-270}
                  />
                </RadialBarChart>
              </ResponsiveContainer>
            </div>

            {/* Metrics Grid */}
            <div className="space-y-3">
              {metrics.map((metric) => (
                <div
                  key={metric.key}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-white/60 transition-colors cursor-pointer"
                  onClick={() => setActiveMetric(activeMetric === metric.key ? null : metric.key)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-full" style={{ backgroundColor: `${metric.color}20` }}>
                      <metric.icon className="w-4 h-4" style={{ color: metric.color }} />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{metric.label}</p>
                      <p className="text-xs text-gray-600">{metric.description}</p>
                    </div>
                  </div>
                  <Badge variant={getScoreVariant(metric.score)}>
                    {metric.score}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Confidence & AI Insights */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Info className="w-4 h-4 text-blue-600" />
                <span className="font-medium text-blue-800">AI Analysis Confidence</span>
              </div>
              <Badge variant="outline" className="text-blue-700">
                {Math.round(product.confidence * 100)}%
              </Badge>
            </div>
            <Progress value={product.confidence * 100} className="mb-3" />
            <div className="space-y-2">
              {product.aiInsights.map((insight, index) => (
                <div key={index} className="flex items-start space-x-2 text-sm text-blue-700">
                  <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{insight}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Tabs */}
      <Tabs defaultValue="breakdown" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="breakdown">Score Breakdown</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="alternatives">Alternatives</TabsTrigger>
          <TabsTrigger value="impact">Your Impact</TabsTrigger>
        </TabsList>

        <TabsContent value="breakdown" className="space-y-4">
          {activeMetric && (
            <Card className="bg-white/80">
              <CardContent className="p-6">
                {(() => {
                  const metric = metrics.find(m => m.key === activeMetric);
                  return (
                    <div>
                      <h3 className="font-semibold text-lg mb-2">{metric.label} Details</h3>
                      <p className="text-gray-600 mb-4">{metric.details}</p>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-1">Current Score</p>
                          <div className="text-2xl font-bold" style={{ color: metric.color }}>
                            {metric.score}/100
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-1">Industry Average</p>
                          <div className="text-2xl font-bold text-gray-400">
                            {Math.round(Math.random() * 20 + 50)}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="timeline">
          <Card>
            <CardHeader>
              <CardTitle>Sustainability Score Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={timelineData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="score" stroke="#10b981" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alternatives">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { name: 'Eco Alternative A', score: 94, price: '+$5' },
              { name: 'Eco Alternative B', score: 89, price: '+$2' },
              { name: 'Budget Green Option', score: 76, price: '-$3' }
            ].map((alt, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium">{alt.name}</h3>
                    <Badge variant={getScoreVariant(alt.score)}>{alt.score}</Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">Price difference: {alt.price}</p>
                  <Button size="sm" className="w-full">
                    View Details
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="impact">
          <Card>
            <CardHeader>
              <CardTitle>Environmental Impact Calculator</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <Factory className="w-8 h-8 mx-auto mb-2 text-gray-500" />
                  <p className="text-2xl font-bold text-green-600">2.3 kg</p>
                  <p className="text-sm text-gray-600">CO₂ Saved vs Average</p>
                </div>
                <div className="text-center">
                  <Droplets className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                  <p className="text-2xl font-bold text-blue-600">15 L</p>
                  <p className="text-sm text-gray-600">Water Saved</p>
                </div>
                <div className="text-center">
                  <Truck className="w-8 h-8 mx-auto mb-2 text-purple-500" />
                  <p className="text-2xl font-bold text-purple-600">12%</p>
                  <p className="text-sm text-gray-600">Lower Transport Impact</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SustainabilityScore;
