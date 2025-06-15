
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, Recycle, ShoppingCart, Leaf, Heart, Droplets } from 'lucide-react';

const SustainabilityTips = () => {
  const tips = [
    {
      category: 'Shopping',
      icon: ShoppingCart,
      color: 'blue',
      tips: [
        'Buy only what you need to reduce waste',
        'Choose products with minimal packaging',
        'Look for certifications like Fair Trade, B-Corp',
        'Support local and sustainable brands'
      ]
    },
    {
      category: 'Usage',
      icon: Lightbulb,
      color: 'yellow',
      tips: [
        'Extend product lifespan through proper care',
        'Use energy-efficient settings when possible',
        'Share or rent items you use infrequently',
        'Repair instead of replacing when possible'
      ]
    },
    {
      category: 'Disposal',
      icon: Recycle,
      color: 'green',
      tips: [
        'Recycle according to local guidelines',
        'Donate items that are still usable',
        'Find specialized recycling for electronics',
        'Compost organic materials when possible'
      ]
    },
    {
      category: 'Lifestyle',
      icon: Heart,
      color: 'red',
      tips: [
        'Choose quality over quantity',
        'Embrace minimalism and conscious consumption',
        'Support circular economy initiatives',
        'Educate others about sustainable choices'
      ]
    }
  ];

  const getIconColor = (color: string) => {
    const colors: Record<string, string> = {
      blue: 'text-blue-600',
      yellow: 'text-yellow-600',
      green: 'text-green-600',
      red: 'text-red-600'
    };
    return colors[color] || 'text-gray-600';
  };

  const getBadgeColor = (color: string) => {
    const colors: Record<string, string> = {
      blue: 'border-blue-300 text-blue-700 bg-blue-50',
      yellow: 'border-yellow-300 text-yellow-700 bg-yellow-50',
      green: 'border-green-300 text-green-700 bg-green-50',
      red: 'border-red-300 text-red-700 bg-red-50'
    };
    return colors[color] || 'border-gray-300 text-gray-700 bg-gray-50';
  };

  return (
    <Card className="border-emerald-200">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Leaf className="h-5 w-5 text-emerald-600" />
          <span>Sustainability Tips</span>
        </CardTitle>
        <p className="text-gray-600 text-sm">
          Make a bigger impact with these actionable tips
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-6">
          {tips.map((section) => {
            const Icon = section.icon;
            return (
              <div key={section.category} className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Icon className={`h-5 w-5 ${getIconColor(section.color)}`} />
                  <Badge variant="outline" className={getBadgeColor(section.color)}>
                    {section.category}
                  </Badge>
                </div>
                <ul className="space-y-2">
                  {section.tips.map((tip, index) => (
                    <li key={index} className="flex items-start space-x-2 text-sm">
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-2 flex-shrink-0" />
                      <span className="text-gray-700">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
        
        <div className="mt-6 p-4 bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <Droplets className="h-4 w-4 text-emerald-600" />
            <span className="font-medium text-emerald-900">Your Impact Matters</span>
          </div>
          <p className="text-sm text-emerald-800">
            Small changes in your purchasing decisions can create ripple effects throughout supply chains, 
            encouraging more companies to adopt sustainable practices.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default SustainabilityTips;
