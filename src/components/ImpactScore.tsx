
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Leaf, Droplets, Trash2, Zap, Heart, Award, TrendingUp, AlertTriangle } from 'lucide-react';

const ImpactScore = () => {
  const impactData = {
    overall: 72,
    carbon: 75,
    water: 68,
    waste: 70,
    energy: 76,
    ethics: 72,
    confidence: 85
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

  const getProgressColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const categories = [
    {
      name: 'Carbon Footprint',
      icon: Leaf,
      score: impactData.carbon,
      description: 'CO2 emissions from production and transport',
      details: 'Lower carbon footprint indicates more sustainable manufacturing'
    },
    {
      name: 'Water Usage',
      icon: Droplets,
      score: impactData.water,
      description: 'Water consumption in production process',
      details: 'Efficient water usage reduces environmental impact'
    },
    {
      name: 'Waste Management',
      icon: Trash2,
      score: impactData.waste,
      description: 'Recycling and waste reduction practices',
      details: 'Better waste management contributes to circular economy'
    },
    {
      name: 'Energy Efficiency',
      icon: Zap,
      score: impactData.energy,
      description: 'Renewable energy usage in production',
      details: 'Clean energy sources reduce environmental impact'
    },
    {
      name: 'Ethical Practices',
      icon: Heart,
      score: impactData.ethics,
      description: 'Fair labor and supply chain ethics',
      details: 'Ethical practices ensure fair treatment of workers'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <Card className="border-emerald-200">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Award className="h-5 w-5 text-emerald-600" />
              <span>Environmental Impact Score</span>
            </div>
            <Badge 
              variant="outline"
              className="border-emerald-300 text-emerald-700 bg-emerald-50"
            >
              {impactData.confidence}% Confidence
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center mb-6">
            <div className={`text-6xl font-bold mb-2 ${getScoreColor(impactData.overall)}`}>
              {impactData.overall}
            </div>
            <div className="text-lg text-gray-600">out of 100</div>
            <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium mt-2 ${getScoreBg(impactData.overall)}`}>
              <TrendingUp className="h-4 w-4 mr-1" />
              {impactData.overall >= 80 ? 'Excellent' : impactData.overall >= 60 ? 'Good' : 'Needs Improvement'}
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <div key={category.name} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-2 mb-3">
                    <Icon className="h-4 w-4 text-emerald-600" />
                    <span className="font-medium text-sm">{category.name}</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className={`font-bold ${getScoreColor(category.score)}`}>
                        {category.score}/100
                      </span>
                    </div>
                    <Progress 
                      value={category.score} 
                      className="h-2"
                    />
                    <p className="text-xs text-gray-600">{category.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Breakdown */}
      <Card className="border-emerald-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-emerald-600" />
            <span>Impact Analysis</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <div key={category.name} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Icon className="h-4 w-4 text-emerald-600" />
                      <span className="font-medium">{category.name}</span>
                    </div>
                    <span className={`font-bold ${getScoreColor(category.score)}`}>
                      {category.score}/100
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{category.details}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ImpactScore;
