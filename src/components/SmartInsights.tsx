
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  TrendingUp, 
  BarChart3, 
  PieChart, 
  Calendar,
  Target,
  Zap,
  ArrowRight,
  Lightbulb,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';

const SmartInsights = () => {
  const { user } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [scannedProducts, setScannedProducts] = useState<any[]>([]);
  const [carbonEntries, setCarbonEntries] = useState<any[]>([]);

  // Fetch user's scanned products
  useEffect(() => {
    if (!user) {
      setScannedProducts([]);
      return;
    }

    const q = query(collection(db, `users/${user.uid}/scannedProducts`), orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const productsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setScannedProducts(productsData);
    }, (error) => {
      console.error('Error fetching scanned products:', error);
    });
    return () => unsubscribe();
  }, [user]);

  // Fetch user's carbon entries
  useEffect(() => {
    if (!user) {
      setCarbonEntries([]);
      return;
    }

    const q = query(collection(db, `users/${user.uid}/carbonEntries`), orderBy('date', 'desc')); // Assuming 'date' is the field name
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const entriesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCarbonEntries(entriesData);
    }, (error) => console.error('Error fetching carbon entries:', error));
    return () => unsubscribe();
  }, [user]);
  const insights = [
 {
      type: 'trend',
      title: 'Sustainability Score Trending Up',
      description: 'Your average score increased by 12% this month',
      impact: '+12%',
      icon: TrendingUp,
      color: 'text-green-600',
      action: 'View Details'
    },
    {
      type: 'prediction',
      title: 'Carbon Goal Achievement',
      description: 'At current pace, you\'ll exceed your monthly carbon reduction goal by 15%',
      impact: '115%',
      icon: Target,
      color: 'text-blue-600',
      action: 'Optimize'
    },
    {
      type: 'recommendation',
      title: 'Shopping Pattern Analysis',
      description: 'You tend to buy more sustainable products on weekends. Consider planning ahead.',
      impact: 'Pattern',
      icon: Lightbulb,
      color: 'text-purple-600',
      action: 'Set Reminder'
    }
  ];

 // Calculate weekly data based on fetched scanned products
  const calculateWeeklyData = () => {
 if (scannedProducts.length === 0) return [];

    const today = new Date();
    const oneWeekAgo = new Date(today.setDate(today.getDate() - 7));

    const weeklyScans = scannedProducts.filter(product => {
      const scanDate = new Date(product.timestamp?.toDate() || product.timestamp); // Handle Firestore Timestamp or Date
      return scanDate >= oneWeekAgo;
    });

    const dailyData: { [key: string]: { scans: number, avgScore: number[], totalScore: number } } = {};
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    weeklyScans.forEach(scan => {
      const scanDate = new Date(scan.timestamp?.toDate() || scan.timestamp);
      const dayName = daysOfWeek[scanDate.getDay()];
      if (!dailyData[dayName]) {
        dailyData[dayName] = { scans: 0, avgScore: [], totalScore: 0 };
      }
      dailyData[dayName].scans++;
      dailyData[dayName].totalScore += scan.sustainabilityScore;
    });
    return daysOfWeek.map(day => ({ day, scans: dailyData[day]?.scans || 0, avgScore: dailyData[day]?.scans ? Math.round(dailyData[day].totalScore / dailyData[day].scans) : 0 }));
 };

  const personalizedTips = [
    {
      category: 'Shopping',
      tip: 'Your best shopping time is Saturday afternoons - sustainable products are 23% higher scored',
      confidence: 94,
      icon: CheckCircle
    },
    {
      category: 'Categories',
      tip: 'Consider exploring electronics - only 8% of your scans but highest impact potential',
      confidence: 87,
      icon: AlertCircle
    },
    {
      category: 'Habits',
      tip: 'Your 3-day scanning streaks result in 15% better product choices',
      confidence: 91,
      icon: Zap
    }
  ];

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-indigo-700">
            <Brain className="w-6 h-6" />
            <span>Smart Insights & Analytics</span>
            <Badge variant="secondary" className="ml-auto bg-indigo-100 text-indigo-700">
              AI Powered
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedPeriod} onValueChange={setSelectedPeriod} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="week">This Week</TabsTrigger>
              <TabsTrigger value="month">This Month</TabsTrigger>
              <TabsTrigger value="year">This Year</TabsTrigger>
            </TabsList>

            <TabsContent value="week" className="space-y-6 mt-6">
              {/* Key Insights */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center space-x-2">
                  <Lightbulb className="w-5 h-5" />
                  <span>Key Insights</span>
                </h3>
                {insights.map((insight, index) => (
                  <div key={index} className="bg-white/80 rounded-xl p-6 border border-gray-100">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <insight.icon className={`w-6 h-6 ${insight.color}`} />
                        <div>
                          <h4 className="font-semibold text-gray-800">{insight.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{insight.description}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className={`${insight.color} border-current`}>
                        {insight.impact}
                      </Badge>
                    </div>
                    <div className="flex justify-end">
                      <Button variant="outline" size="sm">
                        {insight.action}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Weekly Chart */}
              <div className="bg-white/80 rounded-xl p-6 border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5" />
                  <span>Weekly Activity</span>
                </h3>
                <div className="space-y-3">
                  {calculateWeeklyData().map((day, index) => (
                    <div key={index} className="flex items-center space-x-4">
                      <div className="w-12 text-sm font-medium text-gray-600">{day.day}</div>
                      <div className="flex-1 bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-indigo-500 h-3 rounded-full" 
                          style={{width: `${(day.scans / 15) * 100}%`}}
                        ></div>
                      </div>
                      <div className="w-16 text-sm text-gray-600">{day.scans} scans</div>
                      <Badge variant="outline" className="text-xs">
                        {day.avgScore}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              {/* Personalized Tips */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">Personalized Tips</h3>
                {personalizedTips.map((tip, index) => (
                  <div key={index} className="bg-white/80 rounded-xl p-4 border border-gray-100">
                    <div className="flex items-start space-x-3">
                      <tip.icon className="w-5 h-5 text-green-600 mt-1" />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-gray-800">{tip.category}</span>
                          <Badge variant="secondary" className="text-xs">
                            {tip.confidence}% confidence
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{tip.tip}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="month" className="mt-6">
              <div className="bg-white/80 rounded-xl p-6 border border-gray-100 text-center">
                {!user ? (
                   <>
                    <PieChart className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">Monthly Analytics</h3>
                    <p className="text-gray-500">Log in to view your monthly sustainability trends.</p>
                   </>
                ) : (
                  <>
                    <PieChart className="w-12 h-12 mx-auto mb-4 text-indigo-600" />
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Monthly Analytics</h3>
                    <p className="text-gray-600">Detailed monthly insights and trends coming soon!</p>
                  </>
                )}
              </div>
            </TabsContent>
            <TabsContent value="year" className="mt-6">
              <div className="bg-white/80 rounded-xl p-6 border border-gray-100 text-center">
                <Calendar className="w-12 h-12 mx-auto mb-4 text-indigo-600" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Yearly Overview</h3>
                <p className="text-gray-600">Annual sustainability report and achievements coming soon!</p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default SmartInsights;
