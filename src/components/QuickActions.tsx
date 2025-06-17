
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Scan, 
  Target, 
  MessageCircle, 
  Award,
  Bot,
  Sparkles,
  Zap,
  Eye,
  Brain
} from 'lucide-react';

const QuickActions = ({ onNavigate }) => {
  const quickActions = [
    {
      id: 'scanner',
      title: 'AI Scanner',
      description: 'Scan products instantly',
      icon: Scan,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-600',
      textColor: 'text-blue-700'
    },
    {
      id: 'chatbot',
      title: 'EcoBot',
      description: 'Ask sustainability questions',
      icon: Bot,
      color: 'from-emerald-500 to-teal-500',
      bgColor: 'bg-emerald-600',
      textColor: 'text-emerald-700',
      badge: 'New'
    },
    {
      id: 'carbon-tracker',
      title: 'Carbon Tracker',
      description: 'Monitor your footprint',
      icon: Target,
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-600',
      textColor: 'text-green-700'
    },
    {
      id: 'ar-scanner',
      title: 'AR Scanner',
      description: 'Augmented reality scanning',
      icon: Eye,
      color: 'from-purple-500 to-indigo-500',
      bgColor: 'bg-purple-600',
      textColor: 'text-purple-700'
    },
    {
      id: 'ai-recommendations',
      title: 'AI Tips',
      description: 'Personalized suggestions',
      icon: Brain,
      color: 'from-orange-500 to-red-500',
      bgColor: 'bg-orange-600',
      textColor: 'text-orange-700'
    },
    {
      id: 'dashboard',
      title: 'Dashboard',
      description: 'View your progress',
      icon: Award,
      color: 'from-indigo-500 to-purple-500',
      bgColor: 'bg-indigo-600',
      textColor: 'text-indigo-700'
    }
  ];

  return (
    <Card className="bg-white border-gray-200">
      <CardHeader>
        <CardTitle className="text-lg text-gray-800 flex items-center space-x-3">
          <div className="p-2 bg-emerald-600 rounded-lg">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span>Quick Actions</span>
          <Sparkles className="w-4 h-4 text-amber-500 animate-pulse ml-auto" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-3">
          {quickActions.map((action) => (
            <Button
              key={action.id}
              variant="ghost"
              className="flex items-center justify-start space-x-3 p-3 h-auto text-left hover:shadow-md transition-all duration-200 border border-gray-100 hover:border-gray-200 bg-gray-50 hover:bg-white"
              onClick={() => onNavigate(action.id)}
            >
              <div className={`p-2 ${action.bgColor} rounded-lg shadow-sm`}>
                <action.icon className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className={`font-semibold text-sm ${action.textColor}`}>
                    {action.title}
                  </span>
                  {action.badge && (
                    <span className="text-xs bg-emerald-500 text-white px-2 py-0.5 rounded-full font-bold">
                      {action.badge}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-600 mt-0.5">{action.description}</p>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActions;
