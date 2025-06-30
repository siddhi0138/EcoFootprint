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
  Users
} from 'lucide-react';
import { productsData, searchProducts } from '../data/productsData';
import { useUserData } from '../contexts/UserDataContext';

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
  actionType: string;
  actionData: any;
}

interface ActionProgress {
  type: string;
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

  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);

  // New state for selected tab with persistence
  const [selectedTab, setSelectedTab] = React.useState<string>(() => {
    if (typeof window !== 'undefined') {
      const storedTab = localStorage.getItem('aiRecommendationsSelectedTab') || 'insights';
      console.log('Initializing selectedTab from localStorage:', storedTab);
      return storedTab;
    }
    return 'insights';
  });

  React.useEffect(() => {
    console.log('selectedTab changed to:', selectedTab);
    localStorage.setItem('aiRecommendationsSelectedTab', selectedTab);
  }, [selectedTab]);

  const generateRecommendations = (): Recommendation[] => {
    const recommendations: Recommendation[] = [];
    
    if (scannedProducts.length > 0) {
      const avgScore = userStats.avgScore;
      const lastScannedProduct = scannedProducts[0];
      
      if (avgScore < 70) {
        recommendations.push({
          id: 1,
          type: 'product',
          title: 'Improve Product Choices',
          description: `Your average sustainability score is ${avgScore}. Focus on products with bamboo or recycled packaging to boost your score by 25-30 points.`,
          impact: `+${Math.floor((80 - avgScore) * 0.8)} points potential`,
          confidence: 92,
          category: 'Product Selection',
          icon: Leaf,
          priority: 'high',
          timeToImplement: '2 minutes per product',
          difficulty: 'Easy',
          carbonSaving: `${((80 - avgScore) * 0.05).toFixed(1)}kg CO₂/month`,
          actionType: 'product_search',
          actionData: { query: 'sustainable packaging', category: lastScannedProduct.category }
        });
      }
      
      const categoryCount = scannedProducts.reduce((acc, product) => {
        acc[product.category] = (acc[product.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      const mostScannedCategory = Object.entries(categoryCount).sort(([,a], [,b]) => b - a)[0];
      
      if (mostScannedCategory) {
        recommendations.push({
          id: 2,
          type: 'behavior',
          title: `Optimize ${mostScannedCategory[0]} Choices`,
          description: `You've scanned ${mostScannedCategory[1]} ${mostScannedCategory[0]} products. Consider exploring eco-certified brands in this category.`,
          impact: `+${mostScannedCategory[1] * 5} points`,
          confidence: 88,
          category: mostScannedCategory[0],
          icon: Target,
          priority: 'medium',
          timeToImplement: '5 minutes research',
          difficulty: 'Easy',
          carbonSaving: `${(mostScannedCategory[1] * 0.3).toFixed(1)}kg CO₂/month`,
          actionType: 'habit_tracker',
          actionData: { habit: `eco_${mostScannedCategory[0]}`, target: 'weekly' }
        });
      }
    }
    
    if (carbonEntries.length === 0) {
      recommendations.push({
        id: 3,
        type: 'lifestyle',
        title: 'Start Carbon Tracking',
        description: 'Begin tracking your daily carbon footprint to identify reduction opportunities. Studies show tracking reduces emissions by 15% on average.',
        impact: 'Up to 15% reduction',
        confidence: 95,
        category: 'Carbon Tracking',
        icon: BarChart3,
        priority: 'high',
        timeToImplement: '3 minutes daily',
        difficulty: 'Easy',
        carbonSaving: '4.2kg CO₂/month',
        actionType: 'habit_tracker',
        actionData: { habit: 'daily_carbon_tracking', target: 'daily' }
      });
    } else {
      const avgDailyCarbon = carbonEntries.reduce((acc, entry) => acc + entry.amount, 0) / carbonEntries.length;
      if (avgDailyCarbon > 10) {
        recommendations.push({
          id: 4,
          type: 'optimization',
          title: 'Reduce Daily Carbon Footprint',
          description: `Your average daily carbon footprint is ${avgDailyCarbon.toFixed(1)}kg. Consider public transport or walking for trips under 2 miles.`,
          impact: `-${(avgDailyCarbon * 0.2).toFixed(1)}kg CO₂/day`,
          confidence: 89,
          category: 'Transportation',
          icon: TrendingUp,
          priority: 'medium',
          timeToImplement: 'Planning required',
          difficulty: 'Medium',
          carbonSaving: `${(avgDailyCarbon * 0.2 * 30).toFixed(1)}kg CO₂/month`,
          actionType: 'action_plan',
          actionData: { steps: ['Map nearby public transport', 'Plan walking routes', 'Set weekly targets'] }
        });
      }
    }
    
    if (userStats.streakDays < 7) {
      recommendations.push({
        id: 5,
        type: 'engagement',
        title: 'Build Your Green Streak',
        description: `You're at ${userStats.streakDays} day streak. Reach 7 days to unlock bonus rewards and improve your sustainability habits.`,
        impact: '+100 bonus points',
        confidence: 94,
        category: 'Engagement',
        icon: Star,
        priority: 'medium',
        timeToImplement: 'Daily commitment',
        difficulty: 'Medium',
        carbonSaving: '2.1kg CO₂/week',
        actionType: 'habit_tracker',
        actionData: { habit: 'daily_eco_action', target: 'daily' }
      });
    }
    
    return recommendations;
  };

  useEffect(() => {
    setRecommendations(generateRecommendations());
  }, [userStats, scannedProducts, carbonEntries]);

  // Dynamic insights based on user data
  const generateInsights = () => {
    console.log('User streakDays:', userStats.streakDays);
    const insights = [];
    
    // Daily streak insight
 insights.push({
 title: 'Daily Streak',
 value: `${userStats.streakDays} days`,
 trend: userStats.streakDays > 7 ? 'Excellent streak!' : userStats.streakDays > 3 ? 'Building momentum' : 'Start your streak',
 icon: Zap,
 change: userStats.streakDays > 7 ? 'positive' : userStats.streakDays > 3 ? 'neutral' : 'negative',
 description: 'Consecutive days with eco actions'
    });


    // Scanning streak insight
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


    return insights;
  };

  const handleTakeAction = (recommendation: Recommendation) => {
    const actionId = `action_${recommendation.id}`;
    
    switch (recommendation.actionType) {
      case 'product_search':
        const relevantProducts = searchProducts(recommendation.actionData.query).slice(0, 5);
        setActionProgress(prev => ({
          ...prev,
          [actionId]: {
            type: 'product_search',
            status: 'in_progress',
            data: relevantProducts,
            recommendation
          }
        }));
        addPoints(10);
        break;
        
      case 'habit_tracker':
        setActionProgress(prev => ({
          ...prev,
          [actionId]: {
            type: 'habit_tracker',
            status: 'started',
            data: {
              habit: recommendation.actionData.habit,
              target: recommendation.actionData.target,
              startDate: new Date().toISOString(),
              progress: 0
            },
            recommendation
          }
        }));
        addPoints(25);
        break;
        
      case 'action_plan':
        setActionProgress(prev => ({
          ...prev,
          [actionId]: {
            type: 'action_plan',
            status: 'created',
            data: {
              steps: recommendation.actionData.steps,
              completedSteps: [],
              createdDate: new Date().toISOString()
            },
            recommendation
          }
        }));
        addPoints(15);
        break;
        
      default:
        setCompletedActions(prev => [...prev, recommendation.id]);
        addPoints(20);
    }
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

  return (
    <div className="space-y-6">
      <Card className="bg-white/95 backdrop-blur-sm border-slate-200/50 shadow-lg rounded-2xl dark:bg-gray-800/95 dark:border-gray-700/50">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center justify-between text-slate-800 dark:text-slate-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-slate-800 dark:bg-slate-700 rounded-xl flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold">AI-Powered Recommendations</span>
                <p className="text-sm text-slate-600 dark:text-slate-400 font-normal">Personalized insights based on your activity</p>
              </div>
            </div>
            <Badge variant="outline" className="border-slate-300 text-slate-700 bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:bg-slate-800">
              <Sparkles className="w-3 h-3 mr-1" />
              Live Data
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="insights">Your Insights</TabsTrigger>
              <TabsTrigger value="recommendations">Smart Recommendations</TabsTrigger>
              <TabsTrigger value="actions">Active Actions</TabsTrigger>
              <TabsTrigger value="progress">Progress Tracking</TabsTrigger>
            </TabsList>

            <TabsContent value="insights" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {insights.map((insight, index) => (
                  <div key={index} className="bg-slate-50/80 dark:bg-slate-800/80 rounded-xl p-4 border border-slate-200/50 dark:border-slate-700/50 hover:shadow-lg transition-all duration-200">
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-8 h-8 bg-slate-700 dark:bg-slate-600 rounded-lg flex items-center justify-center">
                        <insight.icon className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-2xl font-bold text-slate-800 dark:text-slate-200">{insight.value}</span>
                    </div>
                    <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">{insight.title}</h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{insight.trend}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">{insight.description}</p>
                  </div>
                ))}
              </div>
              
              {/* Recent Activity Summary */}
              <Card className="bg-white dark:bg-gray-800 border border-slate-200/50 dark:border-slate-700/50">
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
                {filteredRecommendations.length === 0 ? (
                  <div className="text-center py-8">
                    <Brain className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">Great job! You're on track</h3>
                    <p className="text-gray-500">Keep scanning products and tracking your carbon footprint to get personalized recommendations.</p>
                  </div>
                ) : (
                  filteredRecommendations.map((rec) => (
                    <div key={rec.id} className={`border-l-4 ${getPriorityColor(rec.priority)} rounded-xl p-6 hover:shadow-md transition-all duration-200 bg-white dark:bg-gray-800 border border-slate-200/50 dark:border-slate-700/50`}>
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3 flex-1">
                          <div className="w-10 h-10 bg-slate-700 dark:bg-slate-600 rounded-xl flex items-center justify-center">
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
                        <Badge variant="outline" className="border-slate-300 text-slate-700 bg-white/70 dark:border-slate-600 dark:text-slate-300 dark:bg-slate-800/70">
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
                        <Button variant="outline" size="sm" className="border-slate-300 hover:bg-slate-50 text-slate-700 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700">
                          Learn More
                        </Button>
                        <Button 
                          size="sm" 
                          className="bg-slate-800 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600"
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
                    
                    {action.type === 'product_search' && action.data && (
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600">Recommended products:</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {action.data.slice(0, 3).map((product: any) => (
                            <div key={product.id} className="p-3 border rounded-lg bg-gray-50">
                              <h4 className="font-medium text-sm">{product.name}</h4>
                              <p className="text-xs text-gray-500">{product.brand} - Score: {product.sustainabilityScore}</p>
                              <p className="text-sm font-semibold text-green-600">${product.price}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {action.type === 'habit_tracker' && (
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600">Tracking: {action.data.habit}</p>
                        <Progress value={action.data.progress} className="h-2" />
                        <p className="text-xs text-gray-500">Target: {action.data.target}</p>
                      </div>
                    )}
                    
                    {action.type === 'action_plan' && (
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600">Action steps:</p>
                        <div className="space-y-1">
                          {action.data.steps.map((step: string, index: number) => (
                            <div key={index} className="flex items-center space-x-2 text-sm">
                              <CheckCircle className="w-4 h-4 text-gray-400" />
                              <span>{step}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
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
                    <p className="text-gray-500">No active actions yet. Take action on recommendations to see them here!</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="progress" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-slate-200/50 dark:border-slate-700/50">
                  <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center space-x-2">
                    <BarChart3 className="w-5 h-5 text-blue-600" />
                    <span>Your Progress</span>
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Recommendations Followed</span>
                        <span className="text-sm text-slate-600 dark:text-slate-400">{completedActions.length}/{recommendations.length}</span>
                      </div>
                      <Progress value={recommendations.length > 0 ? (completedActions.length / recommendations.length) * 100 : 0} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Weekly Scan Goal</span>
                        <span className="text-sm text-slate-600 dark:text-slate-400">{userStats.currentWeekScans}/{userStats.weeklyGoal}</span>
                      </div>
                      <Progress value={(userStats.currentWeekScans / userStats.weeklyGoal) * 100} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Sustainability Score</span>
                        <span className="text-sm text-slate-600 dark:text-slate-400">{userStats.avgScore}/100</span>
                      </div>
                      <Progress value={userStats.avgScore} className="h-2" />
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-slate-200/50 dark:border-slate-700/50">
                  <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center space-x-2">
                    <Award className="w-5 h-5 text-yellow-600" />
                    <span>Achievements</span>
                  </h3>
                  <div className="space-y-3">
                    {userStats.streakDays >= 7 && (
                      <div className="flex items-center space-x-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200/50 dark:border-yellow-700/30">
                        <Star className="w-5 h-5 text-yellow-600" />
                        <div>
                          <p className="font-medium text-yellow-800 dark:text-yellow-300">Week Streak Master</p>
                          <p className="text-xs text-yellow-600 dark:text-yellow-400">{userStats.streakDays} consecutive days</p>
                        </div>
                      </div>
                    )}
                    {userStats.co2Saved >= 10 && (
                      <div className="flex items-center space-x-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200/50 dark:border-green-700/30">
                        <Leaf className="w-5 h-5 text-green-600" />
                        <div>
                          <p className="font-medium text-green-800 dark:text-green-300">Carbon Reducer</p>
                          <p className="text-xs text-green-600 dark:text-green-400">Saved {userStats.co2Saved.toFixed(1)}kg CO₂</p>
                        </div>
                      </div>
                    )}
                    {userStats.avgScore >= 80 && (
                      <div className="flex items-center space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200/50 dark:border-blue-700/30">
                        <Brain className="w-5 h-5 text-blue-600" />
                        <div>
                          <p className="font-medium text-blue-800 dark:text-blue-300">Sustainability Expert</p>
                          <p className="text-xs text-blue-600 dark:text-blue-400">Average score: {userStats.avgScore}/100</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIRecommendations;
