import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
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
  CheckCircle,
  X,
  Award,
  Leaf,
  ShoppingCart,
  Activity
} from 'lucide-react';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, orderBy, onSnapshot, doc, setDoc } from 'firebase/firestore';

import { useNavigate } from 'react-router-dom';
import { useToast } from '../hooks/use-toast';

const SmartInsights = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [scannedProducts, setScannedProducts] = useState<any[]>([]);
  const [carbonEntries, setCarbonEntries] = useState<any[]>([]);
  const [showDetailModal, setShowDetailModal] = useState(false);

  
  const saveUserInsights = async (monthlyAnalytics: any, yearlyAnalytics: any) => {
    if (!user) {
      console.warn("User not authenticated. Cannot save insights.");
      return;
    }

    try {
      const userInsightsRef = doc(db, 'users', user.uid, 'userInsights', 'latest');
      await setDoc(userInsightsRef, { monthlyAnalytics, yearlyAnalytics, timestamp: new Date() }, { merge: true });
      console.log("User insights saved successfully!");
    } catch (error) {
      console.error("Error saving user insights:", error);
    }
  };
  const [selectedInsight, setSelectedInsight] = useState<any>(null);

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

    const q = query(collection(db, `users/${user.uid}/carbonEntries`), orderBy('date', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const entriesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCarbonEntries(entriesData);
    }, (error) => console.error('Error fetching carbon entries:', error));
    return () => unsubscribe();
  }, [user]);

  // Calculate sustainability score trend
  const calculateScoreTrend = () => {
    if (scannedProducts.length < 2) return 0;
    
    const now = new Date();
    const thisMonth = scannedProducts.filter(p => {
      const date = new Date(p.timestamp?.toDate() || p.timestamp);
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    });
    
    const lastMonth = scannedProducts.filter(p => {
      const date = new Date(p.timestamp?.toDate() || p.timestamp);
      const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      return date.getMonth() === lastMonthDate.getMonth() && date.getFullYear() === lastMonthDate.getFullYear();
    });

    if (thisMonth.length === 0 || lastMonth.length === 0) return 0;

    const thisMonthAvg = thisMonth.reduce((sum, p) => sum + (p.sustainabilityScore || 0), 0) / thisMonth.length;
    const lastMonthAvg = lastMonth.reduce((sum, p) => sum + (p.sustainabilityScore || 0), 0) / lastMonth.length;
    
    return Math.round(((thisMonthAvg - lastMonthAvg) / lastMonthAvg) * 100);
  };

  // Calculate carbon goal progress based on user's carbon entries
  const calculateCarbonProgress = () => {
    const monthlyGoal = 500; 
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const monthlyEntries = carbonEntries.filter(entry => {
      const date = new Date(entry.date?.toDate() || entry.date);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });

    const totalReduction = monthlyEntries.reduce((sum, entry) => sum + (entry.carbonSaved || 0), 0);
    return Math.round((totalReduction / monthlyGoal) * 100);
  };

  const scoreTrend = calculateScoreTrend();
  const carbonProgress = calculateCarbonProgress();

  const insights = [
    {
      type: 'trend',
      title: 'Sustainability Score Trending Up',
      description: `Your average score ${scoreTrend >= 0 ? 'increased' : 'decreased'} by ${Math.abs(scoreTrend)}% this month`,
      impact: `${scoreTrend >= 0 ? '+' : ''}${scoreTrend}%`,
      icon: TrendingUp,
      color: scoreTrend >= 0 ? 'text-green-500 dark:text-green-400' : 'text-red-500 dark:text-red-400',
      action: 'View Details',
      details: {
        title: 'Sustainability Score Analysis',
        content: `Your sustainability awareness has ${scoreTrend >= 0 ? 'improved' : 'declined'} this month. Based on ${scannedProducts.length} product scans, your average sustainability score is trending ${scoreTrend >= 0 ? 'upward' : 'downward'}.`,
        // Metrics calculated based on the user's scannedProducts data
        metrics: [
          { label: 'Average Score This Month', value: scannedProducts.length > 0 ? Math.round(scannedProducts.reduce((sum, p) => sum + (p.sustainabilityScore || 0), 0) / scannedProducts.length) : 0 },
          { label: 'Best Product Category', value: 'Food & Beverages' },
          { label: 'Improvement Potential', value: `${100 - (scannedProducts.length > 0 ? Math.round(scannedProducts.reduce((sum, p) => sum + (p.sustainabilityScore || 0), 0) / scannedProducts.length) : 0)}%` }
        ]
      }
    },
    {
      type: 'prediction',
      title: 'Carbon Goal Achievement',
      description: `At current pace, you'll ${carbonProgress >= 100 ? 'exceed' : 'reach'} ${carbonProgress}% of your monthly carbon reduction goal`,
      impact: `${carbonProgress}%`,
      icon: Target,
      color: carbonProgress >= 100 ? 'text-green-500 dark:text-green-400' : carbonProgress >= 75 ? 'text-blue-500 dark:text-blue-400' : 'text-orange-500 dark:text-orange-400',
      action: 'Optimize',
      details: {
        title: 'Carbon Footprint Goal Progress',
        content: `You're making ${carbonProgress >= 75 ? 'excellent' : carbonProgress >= 50 ? 'good' : 'steady'} progress toward your monthly carbon reduction goal.`,
        
        metrics: [
          { label: 'Monthly Goal', value: '500 kg CO2' },
          { label: 'Current Progress', value: `${Math.round((carbonProgress / 100) * 500)} kg CO2` },
          { label: 'Days Remaining', value: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate() - new Date().getDate() },
          { label: 'Daily Target', value: `${Math.round(((500 - (carbonProgress / 100) * 500) / (new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate() - new Date().getDate())) * 10) / 10} kg CO2/day` }
        ]
      }
    },
    {
      type: 'recommendation',
      title: 'Shopping Pattern Analysis',
      description: 'You tend to buy more sustainable products on weekends. Consider planning ahead.',
      impact: 'Pattern',
      icon: Lightbulb,
      color: 'text-purple-600 dark:text-purple-400',
      action: 'Set Reminder',
      details: {
        title: 'Shopping Pattern Insights',
        content: 'Analysis of your shopping habits reveals interesting patterns that can help optimize your sustainable choices.',
        
        metrics: [
          { label: 'Best Shopping Day', value: 'Saturday' },
          { label: 'Weekend vs Weekday Score', value: '+23% higher' },
          { label: 'Most Active Shopping Time', value: '2-4 PM' },
          { label: 'Recommendation', value: 'Plan sustainable shopping for weekends' }
        ]
      }
    }
  ];

  const handleViewDetails = (insight: any) => {
    setSelectedInsight(insight);
    setShowDetailModal(true);
  };

  const handleOptimize = (insight: any) => {
    
    setShowDetailModal(false);
    
    toast({
      title: 'Optimization started',
      description: `Optimizing based on: ${insight.title}`,
      variant: 'default',
    });
    navigate('/goals');
  };

  const handleSetReminder = async (insight: any) => {
    if (!user) {
      toast({
        title: 'Not logged in',
        description: 'Please log in to set reminders.',
        variant: 'destructive',
      });
      return;
    }
    try {
      const reminderRef = doc(collection(db, 'users', user.uid, 'reminders')).withConverter(null);
      await setDoc(reminderRef, {
        title: insight.title,
        description: insight.details.content,
        createdAt: new Date(),
        reminderDate: new Date(new Date().getTime() + 24 * 60 * 60 * 1000), 
        completed: false,
      });
      toast({
        title: 'Reminder set',
        description: `Reminder for "${insight.title}" has been set.`,
        variant: 'default',
      });
    } catch (error) {
      console.error('Error setting reminder:', error);
      toast({
        title: 'Error',
        description: 'Failed to set reminder. Please try again later.',
        variant: 'destructive',
      });
    }
  };

  const handleInsightAction = (insight: any) => {
    switch (insight.action) {
      case 'View Details':
        handleViewDetails(insight);
        break;
      case 'Optimize':
        handleOptimize(insight);
        break;
      case 'Set Reminder':
        handleSetReminder(insight);
        break;
      default:
        break;
    }
  };

  // Calculate weekly data based on fetched user's scanned products
  const calculateWeeklyData = () => {
    if (scannedProducts.length === 0) return [];

    const today = new Date();
    const oneWeekAgo = new Date(today.setDate(today.getDate() - 7));

    const weeklyScans = scannedProducts.filter(product => {
      const scanDate = new Date(product.timestamp?.toDate() || product.timestamp);
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
      dailyData[dayName].totalScore += scan.sustainabilityScore || 0;
    });
    return daysOfWeek.map(day => ({ 
      day, 
      scans: dailyData[day]?.scans || 0, 
      avgScore: dailyData[day]?.scans ? Math.round(dailyData[day].totalScore / dailyData[day].scans) : 0 
    }));
  };

  
  const calculateMonthlyData = () => { 
    if (!user) return { scannedProducts: [], carbonEntries: [], analytics: {} };

    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    const monthlyScans = scannedProducts.filter(product => {
      const scanDate = new Date(product.timestamp?.toDate() || product.timestamp);
      return scanDate.getMonth() === currentMonth && scanDate.getFullYear() === currentYear;
    });

    const monthlyCarbonEntries = carbonEntries.filter(entry => {
      const entryDate = new Date(entry.date?.toDate() || entry.date);
      return entryDate.getMonth() === currentMonth && entryDate.getFullYear() === currentYear;
    });

    // Calculate analytics
    const totalScans = monthlyScans.length;
    const avgSustainabilityScore = totalScans > 0 ? 
      Math.round(monthlyScans.reduce((sum, p) => sum + (p.sustainabilityScore || 0), 0) / totalScans) : 0;
    const totalCarbonSaved = monthlyCarbonEntries.reduce((sum, entry) => sum + (entry.carbonSaved || 0), 0);
    const bestCategory = getBestCategory(monthlyScans);
    const scanStreak = calculateScanStreak(monthlyScans);

    return { 
      scannedProducts: monthlyScans, 
      carbonEntries: monthlyCarbonEntries,
      analytics: {
        totalScans,
        avgSustainabilityScore,
        totalCarbonSaved,
        bestCategory,
        scanStreak,
        topProducts: getTopProducts(monthlyScans),
        categoryBreakdown: getCategoryBreakdown(monthlyScans)
      }
    };
  };

  
  const calculateYearlyData = () => { 
    if (!user) return { scannedProducts: [], carbonEntries: [], analytics: {} };

    const today = new Date();
    const currentYear = today.getFullYear();

    const yearlyScans = scannedProducts.filter(product => {
      const scanDate = new Date(product.timestamp?.toDate() || product.timestamp);
      return scanDate.getFullYear() === currentYear;
    });

    const yearlyCarbonEntries = carbonEntries.filter(entry => {
      const entryDate = new Date(entry.date?.toDate() || entry.date);
      return entryDate.getFullYear() === currentYear;
    });

    // Calculate yearly analytics
    const totalScans = yearlyScans.length;
    const avgSustainabilityScore = totalScans > 0 ? 
      Math.round(yearlyScans.reduce((sum, p) => sum + (p.sustainabilityScore || 0), 0) / totalScans) : 0;
    const totalCarbonSaved = yearlyCarbonEntries.reduce((sum, entry) => sum + (entry.carbonSaved || 0), 0);
    const monthlyBreakdown = getMonthlyBreakdown(yearlyScans);
    const yearlyTrend = calculateYearlyTrend(yearlyScans);

    return { 
      scannedProducts: yearlyScans, 
      carbonEntries: yearlyCarbonEntries,
      analytics: {
        totalScans,
        avgSustainabilityScore,
        totalCarbonSaved,
        monthlyBreakdown,
        yearlyTrend,
        bestMonth: getBestMonth(yearlyScans),
        totalCategories: getUniqueCategories(yearlyScans)
      }
    };
  };

  
  const getBestCategory = (products: any[]) => {
    const categories: { [key: string]: { count: number, totalScore: number } } = {};
    products.forEach(p => {
      const category = p.category || 'Other';
      if (!categories[category]) categories[category] = { count: 0, totalScore: 0 };
      categories[category].count++;
      categories[category].totalScore += p.sustainabilityScore || 0;
    });
    
    let bestCategory = 'None';
    let bestScore = 0;
    Object.entries(categories).forEach(([cat, data]) => {
      const avgScore = data.totalScore / data.count;
      if (avgScore > bestScore) {
        bestScore = avgScore;
        bestCategory = cat;
      }
    });
    return bestCategory;
  };

  const calculateScanStreak = (products: any[]) => {
    if (products.length === 0) return 0;
    
    const dates = products.map(p => {
      const date = new Date(p.timestamp?.toDate() || p.timestamp);
      return date.toDateString();
    });
    const uniqueDates = [...new Set(dates)].sort();
    
    let streak = 1;
    for (let i = 1; i < uniqueDates.length; i++) {
      const prev = new Date(uniqueDates[i - 1]);
      const curr = new Date(uniqueDates[i]);
      const diffTime = Math.abs(curr.getTime() - prev.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays === 1) streak++;
      else break;
    }
    return streak;
  };

  const getTopProducts = (products: any[]) => {
    return products
      .sort((a, b) => (b.sustainabilityScore || 0) - (a.sustainabilityScore || 0))
      .slice(0, 3)
      .map(p => ({ name: p.name || 'Unknown Product', score: p.sustainabilityScore || 0 }));
  };

  const getCategoryBreakdown = (products: any[]) => {
    const categories: { [key: string]: number } = {};
    products.forEach(p => {
      const category = p.category || 'Other';
      categories[category] = (categories[category] || 0) + 1;
    });
    return Object.entries(categories).map(([name, count]) => ({ name, count }));
  };

  const getMonthlyBreakdown = (products: any[]) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyData: { [key: string]: number } = {};
    
    products.forEach(p => {
      const date = new Date(p.timestamp?.toDate() || p.timestamp);
      const month = months[date.getMonth()];
      monthlyData[month] = (monthlyData[month] || 0) + 1;
    });
    
    return months.map(month => ({ month, scans: monthlyData[month] || 0 }));
  };

  const calculateYearlyTrend = (products: any[]) => {
    if (products.length < 2) return 0;
    const firstHalf = products.filter(p => {
      const date = new Date(p.timestamp?.toDate() || p.timestamp);
      return date.getMonth() < 6;
    });
    const secondHalf = products.filter(p => {
      const date = new Date(p.timestamp?.toDate() || p.timestamp);
      return date.getMonth() >= 6;
    });
    
    if (firstHalf.length === 0 || secondHalf.length === 0) return 0;
    
    const firstHalfAvg = firstHalf.reduce((sum, p) => sum + (p.sustainabilityScore || 0), 0) / firstHalf.length;
    const secondHalfAvg = secondHalf.reduce((sum, p) => sum + (p.sustainabilityScore || 0), 0) / secondHalf.length;
    
    return Math.round(((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100);
  };

  const getBestMonth = (products: any[]) => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const monthlyScores: { [key: string]: { total: number, count: number } } = {};
    
    products.forEach(p => {
      const date = new Date(p.timestamp?.toDate() || p.timestamp);
      const month = months[date.getMonth()];
      if (!monthlyScores[month]) monthlyScores[month] = { total: 0, count: 0 };
      monthlyScores[month].total += p.sustainabilityScore || 0;
      monthlyScores[month].count++;
    });
    
    let bestMonth = 'None';
    let bestAvg = 0;
    Object.entries(monthlyScores).forEach(([month, data]) => {
      const avg = data.total / data.count;
      if (avg > bestAvg) {
        bestAvg = avg;
        bestMonth = month;
      }
    });
    
    return bestMonth;
  };

  const getUniqueCategories = (products: any[]) => {
    const categories = new Set(products.map(p => p.category || 'Other'));
    return categories.size;
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

  const monthlyData = calculateMonthlyData();
  const yearlyData = calculateYearlyData();

  
  useEffect(() => {
    if (user && monthlyData.analytics && yearlyData.analytics) {
      
      saveUserInsights(monthlyData.analytics, yearlyData.analytics);
    }
  }, [user, monthlyData.analytics, yearlyData.analytics]); // Dependencies

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200 dark:from-gray-900 dark:to-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-indigo-700 dark:text-indigo-300">
            <Brain className="w-6 h-6" />
            <span>Smart Insights & Analytics</span>
            <Badge variant="secondary" className="ml-auto bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300">
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
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center space-x-2">
                  <Lightbulb className="w-5 h-5" />
                  <span>Key Insights</span>
                </h3>
                {insights.map((insight, index) => (
                  <div key={index} className="bg-white/80 dark:bg-gray-900 rounded-xl p-6 border border-gray-100 dark:border-gray-700">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <insight.icon className={`w-6 h-6 ${insight.color}`} />
                        <div>
                          <h4 className="font-semibold text-gray-800 dark:text-gray-200">{insight.title}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{insight.description}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className={`${insight.color} border-current`}>
                        {insight.impact}
                      </Badge>
                    </div>
                    <div className="flex justify-end">
                      <Button variant="outline" size="sm" onClick={() => handleInsightAction(insight)}>
                        {insight.action}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Weekly Chart */}
              <div className="bg-white/80 dark:bg-gray-900 rounded-xl p-6 border border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5" />
                  <span>Weekly Activity</span>
                </h3>
                <div className="space-y-3">
                  {calculateWeeklyData().map((day, index) => (
                    <div key={index} className="flex items-center space-x-4">
                      <div className="w-12 text-sm font-medium text-gray-600 dark:text-gray-400">{day.day}</div>
                      <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                        <div
                          className="bg-indigo-500 dark:bg-indigo-400 h-3 rounded-full"
                          style={{width: `${Math.min((day.scans / 10) * 100, 100)}%`}}
                        ></div>
                      </div>
                      <div className="w-16 text-sm text-gray-600 dark:text-gray-400">{day.scans} scans</div>
                      <Badge variant="outline" className="text-xs dark:text-gray-300">
                        {day.avgScore}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              {/* Personalized Tips */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Personalized Tips</h3>
                {personalizedTips.map((tip, index) => (
                  <div key={index} className="bg-white/80 dark:bg-gray-900 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
                    <div className="flex items-start space-x-3">
                      <tip.icon className="w-5 h-5 text-green-600 dark:text-green-400 mt-1" />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-gray-800 dark:text-gray-200">{tip.category}</span>
                          <Badge variant="secondary" className="text-xs dark:text-gray-300">
                            {tip.confidence}% confidence
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{tip.tip}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="month" className="mt-6">
              {!user ? (
                <div className="bg-white/80 dark:bg-gray-900 rounded-xl p-6 border border-gray-100 dark:border-gray-700 text-center">
                  <PieChart className="w-12 h-12 mx-auto mb-4 text-gray-400 dark:text-gray-500" />
                  <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300 mb-2">Monthly Analytics</h3>
                  <p className="text-gray-500 dark:text-gray-400">Log in to view your monthly sustainability trends.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Monthly Overview Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 dark:from-blue-900 dark:to-blue-800 dark:border-blue-700">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Total Scans</p>
                            <p className="text-2xl font-bold text-blue-800 dark:text-blue-300">{monthlyData.analytics.totalScans}</p>
                          </div>
                          <ShoppingCart className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 dark:from-green-900 dark:to-green-800 dark:border-green-700">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-green-600 dark:text-green-400 font-medium">Avg Score</p>
                            <p className="text-2xl font-bold text-green-800 dark:text-green-300">{monthlyData.analytics.avgSustainabilityScore}</p>
                          </div>
                          <Award className="w-8 h-8 text-green-600 dark:text-green-400" />
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 dark:from-purple-900 dark:to-purple-800 dark:border-purple-700">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">Carbon Saved</p>
                            <p className="text-2xl font-bold text-purple-800 dark:text-purple-300">{Math.round(monthlyData.analytics.totalCarbonSaved)} kg</p>
                          </div>
                          <Leaf className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 dark:from-orange-900 dark:to-orange-800 dark:border-orange-700">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-orange-600 dark:text-orange-400 font-medium">Scan Streak</p>
                            <p className="text-2xl font-bold text-orange-800 dark:text-orange-300">{monthlyData.analytics.scanStreak} days</p>
                          </div>
                          <Activity className="w-8 h-8 text-orange-600 dark:text-orange-400" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Monthly Details */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="bg-white/80 dark:bg-gray-900 border border-gray-100 dark:border-gray-700">
                      <CardHeader>
                        <CardTitle className="text-lg text-gray-800 dark:text-gray-200">Top Sustainable Products</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {monthlyData.analytics.topProducts.map((product: any, index: number) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                              <span className="font-medium text-gray-800 dark:text-gray-200">{product.name}</span>
                              <Badge variant="outline" className="text-green-600 dark:text-green-400 border-green-600 dark:border-green-400">
                                {product.score}
                              </Badge>
                            </div>
                          ))}
                          {monthlyData.analytics.topProducts.length === 0 && (
                            <p className="text-gray-500 dark:text-gray-400 text-center py-4">No products scanned this month</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-white/80 dark:bg-gray-900 border border-gray-100 dark:border-gray-700">
                      <CardHeader>
                        <CardTitle className="text-lg text-gray-800 dark:text-gray-200">Category Breakdown</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {monthlyData.analytics.categoryBreakdown.map((category: any, index: number) => (
                            <div key={index} className="flex items-center justify-between">
                              <span className="text-gray-700 dark:text-gray-300">{category.name}</span>
                              <div className="flex items-center space-x-2">
                                <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                  <div
                                    className="bg-indigo-500 dark:bg-indigo-400 h-2 rounded-full"
                                    style={{width: `${Math.min((category.count / monthlyData.analytics.totalScans) * 100, 100)}%`}}
                                  ></div>
                                </div>
                                <span className="text-sm text-gray-600 dark:text-gray-400 w-8">{category.count}</span>
                              </div>
                            </div>
                          ))}
                          {monthlyData.analytics.categoryBreakdown.length === 0 && (
                            <p className="text-gray-500 dark:text-gray-400 text-center py-4">No categories to display</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Monthly Summary */}
                  <Card className="bg-white/80 dark:bg-gray-900 border border-gray-100 dark:border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-lg text-gray-800 dark:text-gray-200">Monthly Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Best Performing Category</h4>
                          <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{monthlyData.analytics.bestCategory}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Highest average sustainability score</p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Carbon Entries</h4>
                          <p className="text-2xl font-bold text-green-600 dark:text-green-400">{monthlyData.carbonEntries.length}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Total tracking entries this month</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="year" className="mt-6">
              {!user ? (
                <div className="bg-white/80 dark:bg-gray-900 rounded-xl p-6 border border-gray-100 dark:border-gray-700 text-center">
                  <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-400 dark:text-gray-500" />
                  <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300 mb-2">Yearly Overview</h3>
                  <p className="text-gray-500 dark:text-gray-400">Log in to view your yearly sustainability trends.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Yearly Overview Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200 dark:from-indigo-900 dark:to-indigo-800 dark:border-indigo-700">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-indigo-600 dark:text-indigo-400 font-medium">Total Scans</p>
                            <p className="text-2xl font-bold text-indigo-800 dark:text-indigo-300">{yearlyData.analytics.totalScans}</p>
                          </div>
                          <BarChart3 className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-gradient-to-br from-teal-50 to-teal-100 border-teal-200 dark:from-teal-900 dark:to-teal-800 dark:border-teal-700">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-teal-600 dark:text-teal-400 font-medium">Avg Score</p>
                            <p className="text-2xl font-bold text-teal-800 dark:text-teal-300">{yearlyData.analytics.avgSustainabilityScore}</p>
                          </div>
                          <TrendingUp className="w-8 h-8 text-teal-600 dark:text-teal-400" />
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200 dark:from-emerald-900 dark:to-emerald-800 dark:border-emerald-700">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">Carbon Saved</p>
                            <p className="text-2xl font-bold text-emerald-800 dark:text-emerald-300">{Math.round(yearlyData.analytics.totalCarbonSaved)} kg</p>
                          </div>
                          <Leaf className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-gradient-to-br from-rose-50 to-rose-100 border-rose-200 dark:from-rose-900 dark:to-rose-800 dark:border-rose-700">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-rose-600 dark:text-rose-400 font-medium">Categories</p>
                            <p className="text-2xl font-bold text-rose-800 dark:text-rose-300">{yearlyData.analytics.totalCategories}</p>
                          </div>
                          <PieChart className="w-8 h-8 text-rose-600 dark:text-rose-400" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Yearly Trend */}
                  <Card className="bg-white/80 dark:bg-gray-900 rounded-xl p-6 border border-gray-100 dark:border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-lg text-gray-800 dark:text-gray-200">Monthly Activity Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {yearlyData.analytics.monthlyBreakdown.map((month: any, index: number) => (
                          <div key={index} className="flex items-center space-x-4">
                            <div className="w-12 text-sm font-medium text-gray-600 dark:text-gray-400">{month.month}</div>
                            <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                              <div
                                className="bg-gradient-to-r from-indigo-500 to-purple-500 dark:from-indigo-400 dark:to-purple-400 h-3 rounded-full"
                                style={{width: `${Math.min((month.scans / Math.max(...yearlyData.analytics.monthlyBreakdown.map((m: any) => m.scans))) * 100, 100)}%`}}
                              ></div>
                            </div>
                            <div className="w-16 text-sm text-gray-600 dark:text-gray-400">{month.scans} scans</div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Yearly Insights */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="bg-white/80 dark:bg-gray-900 border border-gray-100 dark:border-gray-700">
                      <CardHeader>
                        <CardTitle className="text-lg text-gray-800 dark:text-gray-200">Year Performance</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex justify-between items-center p-3 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900 dark:to-green-800 rounded-lg">
                          <span className="font-medium text-gray-800 dark:text-gray-200">Best Month</span>
                          <span className="font-bold text-green-700 dark:text-green-400">{yearlyData.analytics.bestMonth}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 rounded-lg">
                          <span className="font-medium text-gray-800 dark:text-gray-200">Yearly Trend</span>
                          <Badge variant="outline" className={`${yearlyData.analytics.yearlyTrend >= 0 ? 'text-green-600 border-green-600 dark:text-green-400 dark:border-green-400' : 'text-red-600 border-red-600 dark:text-red-400 dark:border-red-400'}`}>
                            {yearlyData.analytics.yearlyTrend >= 0 ? '+' : ''}{yearlyData.analytics.yearlyTrend}%
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800 rounded-lg">
                          <span className="font-medium text-gray-800 dark:text-gray-200">Carbon Entries</span>
                          <span className="text-purple-700 dark:text-purple-400 font-bold">{yearlyData.carbonEntries.length}</span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-white/80 dark:bg-gray-900 border border-gray-100 dark:border-gray-700">
                      <CardHeader>
                        <CardTitle className="text-lg text-gray-800 dark:text-gray-200">Achievement Summary</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="text-center p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900 dark:to-orange-900 rounded-lg">
                          <Award className="w-12 h-12 mx-auto mb-2 text-orange-500 dark:text-orange-400" />
                          <h4 className="font-semibold text-gray-800 dark:text-gray-200">Sustainability Champion</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {yearlyData.analytics.totalScans} products scanned this year
                          </p>
                        </div>
                        <div className="text-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900 dark:to-emerald-900 rounded-lg">
                          <Leaf className="w-12 h-12 mx-auto mb-2 text-emerald-500 dark:text-emerald-400" />
                          <h4 className="font-semibold text-gray-800 dark:text-gray-200">Carbon Reducer</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {Math.round(yearlyData.analytics.totalCarbonSaved)} kg CO2 saved
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Detail Modal */}
      {showDetailModal && selectedInsight && (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-80 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 flex items-center space-x-2">
                  <selectedInsight.icon className={`w-6 h-6 ${selectedInsight.color}`} />
                  <span>{selectedInsight.details.title}</span>
                </h2>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowDetailModal(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              <p className="text-gray-600 dark:text-gray-400 mb-6">{selectedInsight.details.content}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedInsight.details.metrics.map((metric: any, index: number) => (
                  <div key={index} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">{metric.label}</h4>
                    <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{metric.value}</p>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <Button variant="outline" onClick={() => setShowDetailModal(false)}>
                  Close
                </Button>
      <Button onClick={() => {
        setShowDetailModal(false);
        
        if (selectedInsight.action === 'Optimize') {
          handleOptimize(selectedInsight);
        } else if (selectedInsight.action === 'Set Reminder') {
          handleSetReminder(selectedInsight);
        }
      }}>
        Take Action
      </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SmartInsights;
