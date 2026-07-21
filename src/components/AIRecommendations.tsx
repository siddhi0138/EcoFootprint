import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { 
  Brain, 
  Lightbulb, 
  TrendingUp, 
  ShoppingBag,
  Leaf,
  Star,
  ArrowRight,
  Sparkles,
  Target,
  CheckCircle,
  Clock,
  Zap,
  Award,
  Filter,
  BarChart3,
  Calendar,
  Users,
  ShoppingCart,
  Activity,
  PieChart,
} from 'lucide-react';
import { useUserData } from '../contexts/UserDataContext';
import { useNotifications } from '../contexts/NotificationsContextNew';
import { fetchRecommendations } from '../services/recommendationsApi';

const CATEGORY_ICONS: Record<string, any> = {
  Products: Leaf,
  Habits: Target,
  Carbon: BarChart3,
  Goals: Star,
};

interface Recommendation {
  id: number;
  type: string;
  title: string;
  description: string;
  impact: string;
  confidence: number;
  category: string;
  icon: any;
  priority: string;
  timeToImplement: string;
  difficulty: string;
  carbonSaving: string;
}

interface ActionProgress {
  status: string;
  data: any;
  recommendation: Recommendation;
}

const AIRecommendations = () => {
  const { 
    userStats, 
    scannedProducts, 
    carbonEntries, 
    addPoints,
    selectedCategory, setSelectedCategory,
    selectedPriority, setSelectedPriority,
    completedActions, setCompletedActions,
    actionProgress, setActionProgress,
  } = useUserData();

  const { addNotification } = useNotifications();

  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);
  const [recommendationsEstimated, setRecommendationsEstimated] = useState(false);
  const [recommendationsError, setRecommendationsError] = useState<string | null>(null);
  const [trendsPeriod, setTrendsPeriod] = useState<'month' | 'year'>('month');
  const [learnMoreRec, setLearnMoreRec] = useState<Recommendation | null>(null);

  // Use selectedTab from context instead of local state
  const { selectedTab, setSelectedTab } = useUserData();

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('aiRecommendationsSelectedTab', selectedTab);
    }
  }, [selectedTab]);

  useEffect(() => {
    let cancelled = false;
    setIsLoadingRecommendations(true);
    setRecommendationsError(null);
    fetchRecommendations(scannedProducts, carbonEntries, userStats)
      .then(({ recommendations: items, is_estimated }) => {
        if (cancelled) return;
        setRecommendations(items.map((item, index) => ({
          id: index + 1,
          type: item.category.toLowerCase(),
          title: item.title,
          description: item.description,
          impact: item.impact,
          confidence: item.confidence,
          category: item.category,
          icon: CATEGORY_ICONS[item.category] || Sparkles,
          priority: item.priority,
          timeToImplement: item.timeToImplement,
          difficulty: item.difficulty,
          carbonSaving: item.carbonSaving,
        })));
        setRecommendationsEstimated(is_estimated);
      })
      .catch((err) => {
        console.error('Failed to fetch recommendations:', err);
        if (!cancelled) {
          setRecommendations([]);
          const message = /rate limit/i.test(err?.message || '')
            ? "The AI service has hit its rate limit for now. Please try again later."
            : "Couldn't reach the AI service right now. Please try again in a moment.";
          setRecommendationsError(message);
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoadingRecommendations(false);
      });
    return () => { cancelled = true; };
  }, [userStats, scannedProducts, carbonEntries]);

  // Dynamic insights based on user data
  const generateInsights = () => {
    const insights = [];

    // Total points insight - a real, ever-present headline metric (earned from carbon entries,
    // scans, completed actions, etc.) so the Insights tab always has genuine numbers to show
    // even for users who track carbon but rarely scan products.
    insights.push({
      title: 'Total Points',
      value: `${userStats.totalPoints}`,
      trend: userStats.totalPoints > 500 ? 'Eco champion!' : userStats.totalPoints > 100 ? 'Great progress' : 'Just getting started',
      icon: Award,
      change: userStats.totalPoints > 500 ? 'positive' : userStats.totalPoints > 100 ? 'neutral' : 'negative',
      description: 'Points earned across all eco activities'
    });

    // Daily streak insight
    insights.push({
      title: 'Daily Streak',
      value: `${userStats.streakDays} days`,
      trend: userStats.streakDays > 7 ? 'Excellent streak!' : userStats.streakDays > 3 ? 'Building momentum' : 'Start your streak',
      icon: Zap,
      change: userStats.streakDays > 7 ? 'positive' : userStats.streakDays > 3 ? 'neutral' : 'negative',
      description: 'Consecutive days with eco actions'
    });

    // Weekly scanning activity insight
    const scanningTrend = userStats.currentWeekScans > 5 ? 'up' : userStats.currentWeekScans > 2 ? 'stable' : 'down';
    insights.push({
      title: 'Weekly Scanning Activity',
      value: `${userStats.currentWeekScans} scans`,
      trend: scanningTrend === 'up' ? '+40% from last week' : scanningTrend === 'stable' ? 'Consistent activity' : 'Room for improvement',
      icon: Brain,
      change: scanningTrend,
      description: 'Products scanned this week'
    });

    // Carbon impact insight
    insights.push({
      title: 'Carbon Impact',
      value: `${userStats.co2Saved.toFixed(1)}kg`,
      trend: userStats.co2Saved > 10 ? 'Great impact!' : userStats.co2Saved > 5 ? 'Good start' : 'Just beginning',
      icon: Leaf,
      change: userStats.co2Saved > 10 ? 'positive' : userStats.co2Saved > 5 ? 'neutral' : 'negative',
      description: 'Total CO₂ saved through better choices'
    });

    // Average Sustainability Score insight
    insights.push({
      title: 'Avg Sustainability Score',
      value: `${userStats.avgScore}/100`,
      trend: userStats.avgScore > 80 ? 'Excellent!' : userStats.avgScore > 60 ? 'Good progress' : 'Room for growth',
      icon: Star,
      change: userStats.avgScore > 80 ? 'positive' : userStats.avgScore > 60 ? 'neutral' : 'negative',
      description: 'Average score of scanned products'
    });

    // Monthly Trend insight
    insights.push({
      title: 'Monthly Trend',
      value: `${userStats.monthlyTrend > 0 ? '+' : ''}${userStats.monthlyTrend}%`,
      trend: userStats.monthlyTrend > 0 ? 'Improving' : userStats.monthlyTrend < 0 ? 'Declining' : 'Stable',
      icon: TrendingUp,
      change: userStats.monthlyTrend > 0 ? 'positive' : userStats.monthlyTrend < 0 ? 'negative' : 'neutral',
      description: 'Change in sustainability score over the last month'
    });

    // Top Category insight
    insights.push({
      title: 'Top Category',
      value: userStats.topCategory || 'None',
      trend: 'Most scanned product category',
      icon: Target,
      change: 'neutral',
      description: 'Category with highest scan frequency'
    });

    // Total Carbon Footprint insight
    insights.push({
      title: 'Total Carbon Footprint',
      value: `${userStats.totalCarbonFootprint.toFixed(1)}kg`,
      trend: userStats.totalCarbonFootprint > 100 ? 'High footprint' : 'Manageable footprint',
      icon: Leaf,
      change: userStats.totalCarbonFootprint > 100 ? 'negative' : 'positive',
      description: 'Your overall carbon footprint'
    });

    // Achievements count insight
    insights.push({
      title: 'Achievements',
      value: `${userStats.achievements.length}`,
      trend: 'Achievements unlocked',
      icon: Star,
      change: 'positive',
      description: 'Number of achievements earned'
    });

    // Goals progress insight (showing count of active goals)
    const activeGoals = userStats.goals.filter(goal => goal.progress < 100).length;
    insights.push({
      title: 'Active Goals',
      value: `${activeGoals}`,
      trend: 'Goals in progress',
      icon: CheckCircle,
      change: activeGoals > 0 ? 'neutral' : 'positive',
      description: 'Number of sustainability goals you are working on'
    });

    return insights;
  };

  const handleTakeAction = (recommendation: Recommendation) => {
    const actionId = `action_${recommendation.id}`;
    setActionProgress(prev => ({
      ...prev,
      [actionId]: {
        status: 'in_progress',
        data: { startedDate: new Date().toISOString() },
        recommendation,
      },
    }));
    addPoints(10);
    addNotification({
      type: 'suggestion',
      title: 'Action Started',
      message: `You started working on "${recommendation.title}".`,
      read: false,
      source: 'AIRecommendations',
      actionable: true,
      action: 'View',
    });
  };

  const markActionComplete = (recommendationId: number) => {
    setCompletedActions(prev => [...prev, recommendationId]);
    const actionId = `action_${recommendationId}`;
    setActionProgress(prev => ({
      ...prev,
      [actionId]: {
        ...prev[actionId],
        status: 'completed'
      }
    }));
    addPoints(50);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-red-400 bg-red-50/30 dark:bg-red-900/10';
      case 'medium': return 'border-l-amber-400 bg-amber-50/30 dark:bg-amber-900/10';
      default: return 'border-l-slate-400 bg-slate-50/30 dark:bg-slate-900/10';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'Medium': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
      case 'Hard': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  const filteredRecommendations = recommendations.filter(rec => {
    if (selectedCategory !== 'all' && rec.category !== selectedCategory) return false;
    if (selectedPriority !== 'all' && rec.priority !== selectedPriority) return false;
    return true;
  });

  const categories = [...new Set(recommendations.map(r => r.category))];
  const priorities = [...new Set(recommendations.map(r => r.priority))];
  const insights = generateInsights();
  // "Your Insights" = the user's current lifetime standing (points, total impact, this-week
  // activity, product quality). The Trends tab is the time-scoped historical breakdown (this
  // month vs this year, top products, category mix) - same domain, different framing, and this
  // set always surfaces real non-zero numbers for however the user actually uses the app.
  const headlineInsightTitles = ['Total Points', 'Carbon Impact', 'Weekly Scanning Activity', 'Avg Sustainability Score'];
  const headlineInsights = headlineInsightTitles
    .map(title => insights.find(i => i.title === title))
    .filter((i): i is NonNullable<typeof i> => Boolean(i));

  // --- Trends tab (merged in from the former standalone Smart Insights page) ---
  const getBestCategory = (products: typeof scannedProducts) => {
    const categories: Record<string, { count: number; totalScore: number }> = {};
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

  const calculateScanStreak = (products: typeof scannedProducts) => {
    if (products.length === 0) return 0;
    const dates = products.map(p => new Date(p.date).toDateString());
    const uniqueDates = [...new Set(dates)].sort();
    let streak = 1;
    for (let i = 1; i < uniqueDates.length; i++) {
      const diffDays = Math.ceil(Math.abs(new Date(uniqueDates[i]).getTime() - new Date(uniqueDates[i - 1]).getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) streak++;
      else break;
    }
    return streak;
  };

  const getTopProducts = (products: typeof scannedProducts) =>
    [...products]
      .sort((a, b) => (b.sustainabilityScore || 0) - (a.sustainabilityScore || 0))
      .slice(0, 3)
      .map(p => ({ name: p.name || 'Unknown Product', score: p.sustainabilityScore || 0 }));

  const getCategoryBreakdown = (products: typeof scannedProducts) => {
    const categories: Record<string, number> = {};
    products.forEach(p => {
      const category = p.category || 'Other';
      categories[category] = (categories[category] || 0) + 1;
    });
    return Object.entries(categories).map(([name, count]) => ({ name, count }));
  };

  const MONTH_NAMES_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const MONTH_NAMES_FULL = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const getMonthlyBreakdown = (products: typeof scannedProducts) => {
    const monthlyData: Record<string, number> = {};
    products.forEach(p => {
      const month = MONTH_NAMES_SHORT[new Date(p.date).getMonth()];
      monthlyData[month] = (monthlyData[month] || 0) + 1;
    });
    return MONTH_NAMES_SHORT.map(month => ({ month, scans: monthlyData[month] || 0 }));
  };

  const calculateYearlyTrend = (products: typeof scannedProducts) => {
    if (products.length < 2) return 0;
    const firstHalf = products.filter(p => new Date(p.date).getMonth() < 6);
    const secondHalf = products.filter(p => new Date(p.date).getMonth() >= 6);
    if (firstHalf.length === 0 || secondHalf.length === 0) return 0;
    const firstHalfAvg = firstHalf.reduce((sum, p) => sum + (p.sustainabilityScore || 0), 0) / firstHalf.length;
    const secondHalfAvg = secondHalf.reduce((sum, p) => sum + (p.sustainabilityScore || 0), 0) / secondHalf.length;
    return Math.round(((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100);
  };

  const getBestMonth = (products: typeof scannedProducts) => {
    const monthlyScores: Record<string, { total: number; count: number }> = {};
    products.forEach(p => {
      const month = MONTH_NAMES_FULL[new Date(p.date).getMonth()];
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

  const getUniqueCategories = (products: typeof scannedProducts) =>
    new Set(products.map(p => p.category || 'Other')).size;

  const now = new Date();
  const monthlyScans = scannedProducts.filter(p => {
    const d = new Date(p.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const monthlyCarbonEntries = carbonEntries.filter(e => {
    const d = new Date(e.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const monthlyAnalytics = {
    totalScans: monthlyScans.length,
    avgSustainabilityScore: monthlyScans.length > 0 ? Math.round(monthlyScans.reduce((sum, p) => sum + (p.sustainabilityScore || 0), 0) / monthlyScans.length) : 0,
    totalCarbonSaved: monthlyCarbonEntries.reduce((sum, e) => sum + (e.amount || 0), 0),
    bestCategory: getBestCategory(monthlyScans),
    scanStreak: calculateScanStreak(monthlyScans),
    topProducts: getTopProducts(monthlyScans),
    categoryBreakdown: getCategoryBreakdown(monthlyScans),
  };

  const yearlyScans = scannedProducts.filter(p => new Date(p.date).getFullYear() === now.getFullYear());
  const yearlyCarbonEntries = carbonEntries.filter(e => new Date(e.date).getFullYear() === now.getFullYear());
  const yearlyAnalytics = {
    totalScans: yearlyScans.length,
    avgSustainabilityScore: yearlyScans.length > 0 ? Math.round(yearlyScans.reduce((sum, p) => sum + (p.sustainabilityScore || 0), 0) / yearlyScans.length) : 0,
    totalCarbonSaved: yearlyCarbonEntries.reduce((sum, e) => sum + (e.amount || 0), 0),
    monthlyBreakdown: getMonthlyBreakdown(yearlyScans),
    yearlyTrend: calculateYearlyTrend(yearlyScans),
    bestMonth: getBestMonth(yearlyScans),
    totalCategories: getUniqueCategories(yearlyScans),
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white border border-gray-200 shadow-lg rounded-2xl dark:bg-gray-900 dark:border-gray-700">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center justify-between text-slate-800 dark:text-slate-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-emerald-600 dark:bg-emerald-600 rounded-xl flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold">AI-Powered Recommendations</span>
                <p className="text-sm text-slate-600 dark:text-slate-400 font-normal">Personalized insights based on your activity</p>
              </div>
            </div>
            <Badge variant="outline" className="border-slate-300 text-slate-700 bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:bg-slate-800">
              <Sparkles className="w-3 h-3 mr-1" />
              {recommendationsEstimated ? 'Estimated' : 'Live Data'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Tabs value={selectedTab === 'progress' ? 'insights' : selectedTab} onValueChange={setSelectedTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="insights">Your Insights</TabsTrigger>
              <TabsTrigger value="recommendations">Smart Recommendations</TabsTrigger>
              <TabsTrigger value="trends">Trends</TabsTrigger>
              <TabsTrigger value="actions">Active Actions</TabsTrigger>
            </TabsList>

            <TabsContent value="insights" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {headlineInsights.map((insight, index) => {
                  const trendColors = {
                    positive: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
                    neutral: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
                    negative: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
                  };
                  const trendIcons = {
                    positive: <ArrowRight className="w-4 h-4 rotate-45 text-green-600" />,
                    neutral: <ArrowRight className="w-4 h-4 text-amber-600" />,
                    negative: <ArrowRight className="w-4 h-4 -rotate-45 text-red-600" />,
                  };
                  const valueColors = {
                    positive: 'text-green-700 dark:text-green-400',
                    neutral: 'text-amber-700 dark:text-amber-400',
                    negative: 'text-red-700 dark:text-red-400',
                  };
                  // Each insight card gets its own identity color (icon tile + card wash) so the
                  // four cards read as distinct at a glance, independent of the trend badge color.
                  const cardThemes = [
                    { icon: 'bg-orange-500', wash: 'bg-orange-50/60 dark:bg-orange-900/10 border-orange-200 dark:border-orange-800' },
                    { icon: 'bg-blue-500', wash: 'bg-blue-50/60 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800' },
                    { icon: 'bg-green-500', wash: 'bg-green-50/60 dark:bg-green-900/10 border-green-200 dark:border-green-800' },
                    { icon: 'bg-purple-500', wash: 'bg-purple-50/60 dark:bg-purple-900/10 border-purple-200 dark:border-purple-800' },
                  ];
                  const theme = cardThemes[index % cardThemes.length];
                  return (
                    <div key={index} className={`${theme.wash} rounded-2xl p-5 border hover:shadow-xl transition-shadow duration-300`}>
                      <div className="flex items-center justify-between mb-4">
                        <div className={`w-10 h-10 ${theme.icon} rounded-lg flex items-center justify-center`}>
                          <insight.icon className="w-5 h-5 text-white" />
                        </div>
                        <span className={`text-2xl font-bold ${valueColors[insight.change] || 'text-slate-900 dark:text-slate-200'}`}>{insight.value}</span>
                      </div>
                      <h3 className="font-semibold text-slate-900 dark:text-slate-200 text-base mb-1">{insight.title}</h3>
                      <div className="flex items-center space-x-2 mb-2">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${trendColors[insight.change] || trendColors.neutral}`}>
                          {trendIcons[insight.change] || trendIcons.neutral}
                          <span className="ml-1">{insight.trend}</span>
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{insight.description}</p>
                    </div>
                  );
                })}
              </div>
              
              {/* Recent Activity Summary */}
              <Card className="bg-white dark:bg-gray-800 border border-slate-200/50 dark:border-slate-700/50 rounded-2xl shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <Calendar className="w-5 h-5" />
                    <span>Recent Activity Impact</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Products Scanned This Week</span>
                      <span className="font-semibold">{userStats.currentWeekScans}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Average Sustainability Score</span>
                      <span className="font-semibold">{userStats.avgScore}/100</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600 dark:text-slate-400">CO₂ Saved This Month</span>
                      <span className="font-semibold text-green-600">{userStats.co2Saved.toFixed(1)}kg</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Current Streak</span>
                      <span className="font-semibold text-blue-600">{userStats.streakDays} days</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="recommendations" className="space-y-6">
              {isLoadingRecommendations && recommendations.length === 0 && (
                <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                  Generating personalized recommendations...
                </div>
              )}
              {recommendationsError && !isLoadingRecommendations && (
                <div className="text-center py-8 px-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-xl">
                  <h3 className="text-lg font-semibold text-red-700 dark:text-red-400 mb-2">Couldn't load recommendations</h3>
                  <p className="text-red-600 dark:text-red-400 text-sm">{recommendationsError}</p>
                </div>
              )}
              {/* Filters */}
              <div className="flex flex-wrap gap-4 p-4 bg-slate-50/80 dark:bg-slate-800/80 rounded-xl border border-slate-200/50 dark:border-slate-700/50">
                <div className="flex items-center space-x-2">
                  <Filter className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Filters:</span>
                </div>
                <select 
                  value={selectedCategory} 
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-1 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm"
                >
                  <option value="all">All Categories</option>
                  {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
                <select 
                  value={selectedPriority} 
                  onChange={(e) => setSelectedPriority(e.target.value)}
                  className="px-3 py-1 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm"
                >
                  <option value="all">All Priorities</option>
                  {priorities.map(pri => <option key={pri} value={pri}>{pri}</option>)}
                </select>
              </div>

              {/* Recommendations List */}
              <div className="space-y-4">
                {filteredRecommendations.length === 0 && !recommendationsError && !isLoadingRecommendations ? (
                  <div className="text-center py-8">
                    <Brain className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">Great job! You're on track</h3>
                    <p className="text-gray-500">Keep scanning products and tracking your carbon footprint to get personalized recommendations.</p>
                  </div>
                ) : filteredRecommendations.length > 0 && (
                  filteredRecommendations.map((rec) => (
                    <div key={rec.id} className={`border-l-4 ${getPriorityColor(rec.priority)} rounded-xl p-6 hover:shadow-md transition-all duration-200 bg-white dark:bg-gray-800 border border-slate-200/50 dark:border-slate-700/50`}>
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3 flex-1">
                          <div className="w-10 h-10 bg-emerald-600 dark:bg-emerald-600 rounded-xl flex items-center justify-center">
                            <rec.icon className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold text-slate-800 dark:text-slate-200">{rec.title}</h3>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge variant="outline" className="text-xs">{rec.category}</Badge>
                              <Badge className={getDifficultyColor(rec.difficulty)}>{rec.difficulty}</Badge>
                              {completedActions.includes(rec.id) && (
                                <Badge className="bg-green-100 text-green-800">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Completed
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <Badge variant="outline" className="border-slate-300 text-slate-700 bg-white/70 dark:border-slate-600 dark:text-slate-300 dark:bg-gray-800/70">
                          {rec.confidence}% confident
                        </Badge>
                      </div>
                      
                      <p className="text-slate-700 dark:text-slate-300 mb-4 leading-relaxed">{rec.description}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-slate-500" />
                          <span className="text-sm text-slate-600 dark:text-slate-400">{rec.timeToImplement}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Leaf className="w-4 h-4 text-green-500" />
                          <span className="text-sm text-slate-600 dark:text-slate-400">{rec.carbonSaving}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Target className="w-4 h-4 text-blue-500" />
                          <span className="text-sm text-slate-600 dark:text-slate-400">{rec.impact}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-slate-300 hover:bg-slate-50 text-slate-700 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
                          onClick={() => setLearnMoreRec(rec)}
                        >
                          Learn More
                        </Button>
                        <Button
                          size="sm"
                          className="bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-700 dark:hover:bg-emerald-600"
                          onClick={() => handleTakeAction(rec)}
                          disabled={completedActions.includes(rec.id)}
                        >
                          {completedActions.includes(rec.id) ? 'Completed' : 'Take Action'}
                          {!completedActions.includes(rec.id) && <ArrowRight className="w-4 h-4 ml-1" />}
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="trends" className="space-y-6">
              <div className="flex items-center justify-end gap-2">
                <Button
                  size="sm"
                  variant={trendsPeriod === 'month' ? 'default' : 'outline'}
                  onClick={() => setTrendsPeriod('month')}
                >
                  This Month
                </Button>
                <Button
                  size="sm"
                  variant={trendsPeriod === 'year' ? 'default' : 'outline'}
                  onClick={() => setTrendsPeriod('year')}
                >
                  This Year
                </Button>
              </div>

              {trendsPeriod === 'month' ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="bg-blue-50/60 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">Total Scans</p>
                            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{monthlyAnalytics.totalScans}</p>
                          </div>
                          <ShoppingCart className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="bg-amber-50/60 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">Avg Score</p>
                            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{monthlyAnalytics.avgSustainabilityScore}</p>
                          </div>
                          <Award className="w-8 h-8 text-amber-600 dark:text-amber-400" />
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="bg-green-50/60 dark:bg-green-900/10 border border-green-200 dark:border-green-800">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">Carbon Saved</p>
                            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{monthlyAnalytics.totalCarbonSaved.toFixed(1)} kg</p>
                          </div>
                          <Leaf className="w-8 h-8 text-green-600 dark:text-green-400" />
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="bg-purple-50/60 dark:bg-purple-900/10 border border-purple-200 dark:border-purple-800">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">Scan Streak</p>
                            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{monthlyAnalytics.scanStreak} days</p>
                          </div>
                          <Activity className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="dark:bg-slate-800">
                      <CardHeader>
                        <CardTitle className="text-lg text-slate-800 dark:text-slate-200">Top Sustainable Products</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {monthlyAnalytics.topProducts.map((product, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                              <span className="font-medium text-slate-800 dark:text-slate-200">{product.name}</span>
                              <Badge variant="outline" className="text-green-600 dark:text-green-400 border-green-600 dark:border-green-400">
                                {product.score}
                              </Badge>
                            </div>
                          ))}
                          {monthlyAnalytics.topProducts.length === 0 && (
                            <p className="text-slate-500 dark:text-slate-400 text-center py-4">No products scanned this month</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="dark:bg-slate-800">
                      <CardHeader>
                        <CardTitle className="text-lg text-slate-800 dark:text-slate-200">Category Breakdown</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {monthlyAnalytics.categoryBreakdown.map((category, index) => (
                            <div key={index} className="flex items-center justify-between">
                              <span className="text-slate-700 dark:text-slate-300">{category.name}</span>
                              <div className="flex items-center space-x-2">
                                <div className="w-20 bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                                  <div
                                    className="bg-indigo-500 dark:bg-indigo-400 h-2 rounded-full"
                                    style={{ width: `${Math.min((category.count / monthlyAnalytics.totalScans) * 100, 100)}%` }}
                                  ></div>
                                </div>
                                <span className="text-sm text-slate-600 dark:text-slate-400 w-8">{category.count}</span>
                              </div>
                            </div>
                          ))}
                          {monthlyAnalytics.categoryBreakdown.length === 0 && (
                            <p className="text-slate-500 dark:text-slate-400 text-center py-4">No categories to display</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Card className="dark:bg-slate-800">
                    <CardHeader>
                      <CardTitle className="text-lg text-slate-800 dark:text-slate-200">Monthly Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">Best Performing Category</h4>
                          <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{monthlyAnalytics.bestCategory}</p>
                          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Highest average sustainability score</p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">Carbon Entries</h4>
                          <p className="text-2xl font-bold text-green-600 dark:text-green-400">{monthlyCarbonEntries.length}</p>
                          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Total tracking entries this month</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="bg-blue-50/60 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">Total Scans</p>
                            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{yearlyAnalytics.totalScans}</p>
                          </div>
                          <BarChart3 className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="bg-amber-50/60 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">Avg Score</p>
                            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{yearlyAnalytics.avgSustainabilityScore}</p>
                          </div>
                          <TrendingUp className="w-8 h-8 text-amber-600 dark:text-amber-400" />
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="bg-green-50/60 dark:bg-green-900/10 border border-green-200 dark:border-green-800">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">Carbon Saved</p>
                            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{yearlyAnalytics.totalCarbonSaved.toFixed(1)} kg</p>
                          </div>
                          <Leaf className="w-8 h-8 text-green-600 dark:text-green-400" />
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="bg-purple-50/60 dark:bg-purple-900/10 border border-purple-200 dark:border-purple-800">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">Categories</p>
                            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{yearlyAnalytics.totalCategories}</p>
                          </div>
                          <PieChart className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Card className="dark:bg-slate-800">
                    <CardHeader>
                      <CardTitle className="text-lg text-slate-800 dark:text-slate-200">Monthly Activity Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {yearlyAnalytics.monthlyBreakdown.map((month, index) => {
                          const maxScans = Math.max(...yearlyAnalytics.monthlyBreakdown.map(m => m.scans), 1);
                          return (
                            <div key={index} className="flex items-center space-x-4">
                              <div className="w-12 text-sm font-medium text-slate-600 dark:text-slate-400">{month.month}</div>
                              <div className="flex-1 bg-slate-200 dark:bg-slate-700 rounded-full h-3">
                                <div
                                  className="bg-gradient-to-r from-indigo-500 to-purple-500 dark:from-indigo-400 dark:to-purple-400 h-3 rounded-full"
                                  style={{ width: `${Math.min((month.scans / maxScans) * 100, 100)}%` }}
                                ></div>
                              </div>
                              <div className="w-16 text-sm text-slate-600 dark:text-slate-400">{month.scans} scans</div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="dark:bg-slate-800">
                      <CardHeader>
                        <CardTitle className="text-lg text-slate-800 dark:text-slate-200">Year Performance</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                          <span className="font-medium text-slate-800 dark:text-slate-200">Best Month</span>
                          <span className="font-bold text-green-700 dark:text-green-400">{yearlyAnalytics.bestMonth}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                          <span className="font-medium text-slate-800 dark:text-slate-200">Yearly Trend</span>
                          <Badge variant="outline" className={yearlyAnalytics.yearlyTrend >= 0 ? 'text-green-600 border-green-600 dark:text-green-400 dark:border-green-400' : 'text-red-600 border-red-600 dark:text-red-400 dark:border-red-400'}>
                            {yearlyAnalytics.yearlyTrend >= 0 ? '+' : ''}{yearlyAnalytics.yearlyTrend}%
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                          <span className="font-medium text-slate-800 dark:text-slate-200">Carbon Entries</span>
                          <span className="text-purple-700 dark:text-purple-400 font-bold">{yearlyCarbonEntries.length}</span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="dark:bg-slate-800">
                      <CardHeader>
                        <CardTitle className="text-lg text-slate-800 dark:text-slate-200">Achievement Summary</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="text-center p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                          <Award className="w-12 h-12 mx-auto mb-2 text-orange-500 dark:text-orange-400" />
                          <h4 className="font-semibold text-slate-800 dark:text-slate-200">Sustainability Champion</h4>
                          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{yearlyAnalytics.totalScans} products scanned this year</p>
                        </div>
                        <div className="text-center p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                          <Leaf className="w-12 h-12 mx-auto mb-2 text-emerald-500 dark:text-emerald-400" />
                          <h4 className="font-semibold text-slate-800 dark:text-slate-200">Carbon Reducer</h4>
                          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{yearlyAnalytics.totalCarbonSaved.toFixed(1)} kg CO2 saved</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="actions" className="space-y-6">
              <div className="space-y-4">
                {Object.entries(actionProgress).map(([actionId, action]) => (
                  <Card key={actionId} className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold">{action.recommendation.title}</h3>
                      <Badge variant={action.status === 'completed' ? 'default' : 'secondary'}>
                        {action.status}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600 dark:text-gray-400">{action.recommendation.description}</p>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                        <span className="flex items-center space-x-1">
                          <Leaf className="w-3.5 h-3.5 text-green-500" />
                          <span>{action.recommendation.carbonSaving}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{action.recommendation.timeToImplement}</span>
                        </span>
                        <span>Started {new Date(action.data.startedDate).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {action.status !== 'completed' && (
                      <Button 
                        size="sm" 
                        onClick={() => markActionComplete(action.recommendation.id)}
                        className="mt-3"
                      >
                        Mark Complete
                      </Button>
                    )}
                  </Card>
                ))}
                
                {Object.keys(actionProgress).length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-500 dark:text-gray-400">No active actions yet. Take action on recommendations to see them here!</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Dialog open={learnMoreRec !== null} onOpenChange={(open) => !open && setLearnMoreRec(null)}>
        <DialogContent className="max-w-lg">
          {learnMoreRec && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <learnMoreRec.icon className="w-4 h-4 text-white" />
                  </div>
                  <span>{learnMoreRec.title}</span>
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{learnMoreRec.description}</p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-slate-500" />
                    <span className="text-slate-600 dark:text-slate-400">{learnMoreRec.timeToImplement}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Leaf className="w-4 h-4 text-green-500" />
                    <span className="text-slate-600 dark:text-slate-400">{learnMoreRec.carbonSaving}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Target className="w-4 h-4 text-blue-500" />
                    <span className="text-slate-600 dark:text-slate-400">{learnMoreRec.impact}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Award className="w-4 h-4 text-amber-500" />
                    <span className="text-slate-600 dark:text-slate-400">{learnMoreRec.confidence}% confident</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">{learnMoreRec.category}</Badge>
                  <Badge className={getDifficultyColor(learnMoreRec.difficulty)}>{learnMoreRec.difficulty}</Badge>
                </div>
                <Button
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                  disabled={completedActions.includes(learnMoreRec.id)}
                  onClick={() => {
                    handleTakeAction(learnMoreRec);
                    setLearnMoreRec(null);
                  }}
                >
                  {completedActions.includes(learnMoreRec.id) ? 'Completed' : 'Take Action'}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AIRecommendations;
