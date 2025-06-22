import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
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
  BarChart3
} from 'lucide-react';
import { collection, doc, onSnapshot, setDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { productsData, searchProducts } from '@/data/productsData';

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
  const { currentUser } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [completedActions, setCompletedActions] = useState<number[]>([]);
  const [actionProgress, setActionProgress] = useState<Record<string, ActionProgress>>({});

  // Effect to fetch user data from Firebase
  React.useEffect(() => {
    if (!currentUser) return;

    const userDocRef = doc(db, 'users', currentUser.uid);
    const aiRecommendationsDocRef = doc(userDocRef, 'aiRecommendations', 'data');

    const unsubscribe = onSnapshot(aiRecommendationsDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setSelectedCategory(data.selectedCategory || 'all');
        setSelectedPriority(data.selectedPriority || 'all');
        setCompletedActions(data.completedActions || []);
        setActionProgress(data.actionProgress || {});
      }
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Effect to save user data to Firebase whenever relevant state changes
  React.useEffect(() => {
    if (!currentUser) return;

    const userDocRef = doc(db, 'users', currentUser.uid);
    const aiRecommendationsDocRef = doc(userDocRef, 'aiRecommendations', 'data');

    setDoc(aiRecommendationsDocRef, {
      selectedCategory,
      selectedPriority,
      completedActions,
      actionProgress,
    }, { merge: true });
  }, [currentUser, selectedCategory, selectedPriority, completedActions, actionProgress]);

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
      priority: 'high',
      timeToImplement: '2 minutes',
      difficulty: 'Easy',
      carbonSaving: '2.4kg CO₂/month',
      actionType: 'product_search',
      actionData: { query: 'bamboo packaging', category: 'all' }
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
      priority: 'medium',
      timeToImplement: '30 minutes',
      difficulty: 'Medium',
      carbonSaving: '9.6kg CO₂/month',
      actionType: 'habit_tracker',
      actionData: { habit: 'local_shopping', target: 'weekly' }
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
      priority: 'medium',
      timeToImplement: '5 minutes',
      difficulty: 'Easy',
      carbonSaving: '1.8kg CO₂/month',
      actionType: 'product_search',
      actionData: { query: 'plant-based detergent', category: 'home-garden' }
    },
    {
      id: 4,
      type: 'lifestyle',
      title: 'Energy Optimization',
      description: 'Switch to LED bulbs and smart thermostats based on your energy usage patterns.',
      impact: '-30% energy usage',
      confidence: 88,
      category: 'Energy',
      icon: Zap,
      priority: 'high',
      timeToImplement: '1 hour',
      difficulty: 'Medium',
      carbonSaving: '5.2kg CO₂/month',
      actionType: 'action_plan',
      actionData: { steps: ['Research LED bulbs', 'Compare smart thermostats', 'Schedule installation'] }
    }
  ];

  const insights = [
    {
      title: 'Your Green Streak',
      value: '12 days',
      trend: '+3 from last week',
      icon: Star,
      change: 'positive',
      description: 'Consecutive days of sustainable choices'
    },
    {
      title: 'AI Accuracy',
      value: '92%',
      trend: 'Recommendations match your preferences',
      icon: Brain,
      change: 'neutral',
      description: 'How often you follow our suggestions'
    },
    {
      title: 'Impact Score',
      value: '847',
      trend: '+45 this month',
      icon: TrendingUp,
      change: 'positive',
      description: 'Total environmental impact points'
    },
    {
      title: 'CO₂ Saved',
      value: '23.4kg',
      trend: '+12.1kg this month',
      icon: Leaf,
      change: 'positive',
      description: 'Carbon footprint reduction'
    }
  ];

  const handleTakeAction = (recommendation: Recommendation) => {
    const actionId = `action_${recommendation.id}`;
    
    switch (recommendation.actionType) {
      case 'product_search':
        // Show relevant products based on the recommendation
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
        break;
        
      case 'habit_tracker':
        // Start tracking a new habit
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
        break;
        
      case 'action_plan':
        // Create an action plan
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
        break;
        
      default:
        // Mark as completed for other types
        setCompletedActions(prev => [...prev, recommendation.id]);
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
                <p className="text-sm text-slate-600 dark:text-slate-400 font-normal">Personalized sustainability insights</p>
              </div>
            </div>
            <Badge variant="outline" className="border-slate-300 text-slate-700 bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:bg-slate-800">
              <Sparkles className="w-3 h-3 mr-1" />
              Smart
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Tabs defaultValue="insights" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="insights">Insights</TabsTrigger>
              <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
              <TabsTrigger value="actions">Active Actions</TabsTrigger>
              <TabsTrigger value="progress">Progress</TabsTrigger>
            </TabsList>

            <TabsContent value="insights" className="space-y-6">
              {/* Key Insights */}
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
                {filteredRecommendations.map((rec) => (
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
                ))}
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
              {/* Progress Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-slate-200/50 dark:border-slate-700/50">
                  <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center space-x-2">
                    <BarChart3 className="w-5 h-5 text-blue-600" />
                    <span>Monthly Progress</span>
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Recommendations Followed</span>
                        <span className="text-sm text-slate-600 dark:text-slate-400">{completedActions.length}/{recommendations.length}</span>
                      </div>
                      <Progress value={(completedActions.length / recommendations.length) * 100} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Carbon Reduction Goal</span>
                        <span className="text-sm text-slate-600 dark:text-slate-400">23.4/30kg</span>
                      </div>
                      <Progress value={78} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Sustainability Score</span>
                        <span className="text-sm text-slate-600 dark:text-slate-400">847/1000</span>
                      </div>
                      <Progress value={85} className="h-2" />
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-slate-200/50 dark:border-slate-700/50">
                  <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center space-x-2">
                    <Award className="w-5 h-5 text-yellow-600" />
                    <span>Achievements</span>
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200/50 dark:border-yellow-700/30">
                      <Star className="w-5 h-5 text-yellow-600" />
                      <div>
                        <p className="font-medium text-yellow-800 dark:text-yellow-300">Green Streak Master</p>
                        <p className="text-xs text-yellow-600 dark:text-yellow-400">12 consecutive days</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200/50 dark:border-green-700/30">
                      <Leaf className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="font-medium text-green-800 dark:text-green-300">Carbon Reducer</p>
                        <p className="text-xs text-green-600 dark:text-green-400">Saved 50kg+ CO₂</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200/50 dark:border-blue-700/30">
                      <Brain className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-blue-800 dark:text-blue-300">AI Collaborator</p>
                        <p className="text-xs text-blue-600 dark:text-blue-400">92% recommendation accuracy</p>
                      </div>
                    </div>
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
