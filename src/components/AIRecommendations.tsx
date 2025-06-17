
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, 
  Lightbulb, 
  TrendingUp, 
  ShoppingBag,
  Leaf,
  Star,
  ArrowRight,
  Sparkles
} from 'lucide-react';

const AIRecommendations = () => {
  const recommendations = [
    {
      id: 1,
      type: 'product',
      title: 'Switch to Bamboo Packaging',
      description: 'Based on your recent scans, consider products with bamboo packaging for 40% less environmental impact.',
      impact: '+18 sustainability points',
      confidence: 94,
      category: 'Packaging',
      icon: Leaf,
      color: 'bg-green-500'
    },
    {
      id: 2,
      type: 'behavior',
      title: 'Local Shopping Recommendation',
      description: 'Shop at farmers markets within 5 miles to reduce carbon footprint by 60%.',
      impact: '-2.4kg CO₂/week',
      confidence: 87,
      category: 'Transportation',
      icon: TrendingUp,
      color: 'bg-blue-500'
    },
    {
      id: 3,
      type: 'alternative',
      title: 'Eco-Friendly Alternative Found',
      description: 'Replace your current detergent with plant-based options for better environmental score.',
      impact: '+25 eco points',
      confidence: 91,
      category: 'Home Care',
      icon: Sparkles,
      color: 'bg-purple-500'
    }
  ];

  const insights = [
    {
      title: 'Your Green Streak',
      value: '12 days',
      trend: '+3 from last week',
      icon: Star
    },
    {
      title: 'AI Accuracy',
      value: '92%',
      trend: 'Recommendations match your preferences',
      icon: Brain
    },
    {
      title: 'Impact Score',
      value: '847',
      trend: '+45 this month',
      icon: TrendingUp
    }
  ];

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-sage-50 to-emerald-50 border-sage-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-sage-700">
            <Brain className="w-6 h-6" />
            <span>AI-Powered Recommendations</span>
            <Badge variant="secondary" className="ml-auto">Beta</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {insights.map((insight, index) => (
              <div key={index} className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-sage-100">
                <div className="flex items-center justify-between mb-2">
                  <insight.icon className="w-5 h-5 text-sage-600" />
                  <span className="text-2xl font-bold text-sage-800">{insight.value}</span>
                </div>
                <h3 className="font-medium text-sage-700">{insight.title}</h3>
                <p className="text-sm text-sage-500">{insight.trend}</p>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            {recommendations.map((rec) => (
              <div key={rec.id} className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-sage-100 hover:shadow-lg transition-all duration-300">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 ${rec.color} rounded-xl flex items-center justify-center`}>
                      <rec.icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sage-800">{rec.title}</h3>
                      <p className="text-sm text-sage-600">{rec.category}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-emerald-600 border-emerald-200">
                    {rec.confidence}% confident
                  </Badge>
                </div>
                
                <p className="text-sage-700 mb-4">{rec.description}</p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
                      {rec.impact}
                    </Badge>
                  </div>
                  <Button variant="outline" size="sm" className="border-sage-200 hover:bg-sage-50">
                    Learn More
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIRecommendations;
