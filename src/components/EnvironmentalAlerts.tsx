
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  AlertTriangle, 
  MapPin, 
  Cloud, 
  Thermometer,
  Wind,
  Droplets,
  Bell,
  Settings,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

const EnvironmentalAlerts = () => {
  const [alertsEnabled, setAlertsEnabled] = useState(true);

  const alerts = [
    {
      id: 1,
      type: 'air-quality',
      severity: 'high',
      title: 'Poor Air Quality Alert',
      location: 'Your Area',
      description: 'AQI is 157 (Unhealthy). Consider staying indoors and using air purifiers.',
      time: '2 hours ago',
      icon: Cloud,
      color: 'bg-red-500',
      trend: 'worsening'
    },
    {
      id: 2,
      type: 'temperature',
      severity: 'medium',
      title: 'Heat Wave Warning',
      location: 'Regional',
      description: 'Temperatures expected to reach 98°F. Stay hydrated and avoid outdoor activities.',
      time: '4 hours ago',
      icon: Thermometer,
      color: 'bg-orange-500',
      trend: 'stable'
    },
    {
      id: 3,
      type: 'sustainability',
      severity: 'low',
      title: 'Green Energy Peak',
      location: 'Grid Supply',
      description: 'Renewable energy at 85% of grid supply. Perfect time for energy-intensive tasks.',
      time: '6 hours ago',
      icon: Wind,
      color: 'bg-green-500',
      trend: 'improving'
    }
  ];

  const metrics = [
    {
      label: 'Air Quality Index',
      value: '157',
      unit: 'AQI',
      status: 'Unhealthy',
      icon: Cloud,
      color: 'text-red-600'
    },
    {
      label: 'UV Index',
      value: '8',
      unit: 'High',
      status: 'Use Protection',
      icon: Thermometer,
      color: 'text-orange-600'
    },
    {
      label: 'Pollen Count',
      value: '4.2',
      unit: 'Medium',
      status: 'Moderate',
      icon: Droplets,
      color: 'text-yellow-600'
    }
  ];

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white/80 backdrop-blur-sm border-sage-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2 text-sage-700">
              <AlertTriangle className="w-6 h-6" />
              <span>Environmental Alerts</span>
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Switch 
                checked={alertsEnabled} 
                onCheckedChange={setAlertsEnabled}
              />
              <span className="text-sm text-sage-600">Live Updates</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Current Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {metrics.map((metric, index) => (
              <div key={index} className="bg-sage-50/50 rounded-xl p-4 border border-sage-100">
                <div className="flex items-center justify-between mb-2">
                  <metric.icon className={`w-5 h-5 ${metric.color}`} />
                  <span className={`text-2xl font-bold ${metric.color}`}>{metric.value}</span>
                </div>
                <h3 className="font-medium text-sage-700">{metric.label}</h3>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-sage-500">{metric.unit}</span>
                  <Badge variant="outline" className="text-xs">
                    {metric.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>

          {/* Active Alerts */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sage-800 flex items-center space-x-2">
              <Bell className="w-4 h-4" />
              <span>Active Alerts</span>
            </h3>
            
            {alerts.map((alert) => (
              <div key={alert.id} className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-sage-100">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 ${alert.color} rounded-xl flex items-center justify-center`}>
                      <alert.icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sage-800">{alert.title}</h4>
                      <div className="flex items-center space-x-2 text-sm text-sage-600">
                        <MapPin className="w-3 h-3" />
                        <span>{alert.location}</span>
                        <span>•</span>
                        <span>{alert.time}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getSeverityColor(alert.severity)}>
                      {alert.severity}
                    </Badge>
                    {alert.trend === 'worsening' && <TrendingDown className="w-4 h-4 text-red-500" />}
                    {alert.trend === 'improving' && <TrendingUp className="w-4 h-4 text-green-500" />}
                  </div>
                </div>
                
                <p className="text-sage-700 mb-4">{alert.description}</p>
                
                <div className="flex items-center justify-between">
                  <Button variant="outline" size="sm" className="border-sage-200 hover:bg-sage-50">
                    View Details
                  </Button>
                  <Button variant="ghost" size="sm" className="text-sage-600">
                    Dismiss
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

export default EnvironmentalAlerts;
