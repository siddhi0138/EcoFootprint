import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationsContextNew';
import { useToast } from '../hooks/use-toast';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useUserData } from '../contexts/UserDataContext';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  Car,
  Plane,
  Home,
  ShoppingBag,
  Utensils,
  TrendingDown,
  Target,
  Calculator,
  Leaf,
  TrendingUp,
  Sparkles,
} from 'lucide-react';
import { estimateCarbon } from '../services/carbonApi';

const CarbonTracker = () => {
  const { currentUser } = useAuth();
  const { userStats, carbonEntries, addCarbonEntry } = useUserData();
  const { addNotification } = useNotifications();
  const { toast } = useToast();
  const [newEntry, setNewEntry] = useState({
    category: 'transport',
    amount: '',
    description: ''
  });
  const [aiDescription, setAiDescription] = useState('');
  const [isEstimating, setIsEstimating] = useState(false);
  const [estimateExplanation, setEstimateExplanation] = useState<{ text: string; isEstimated: boolean } | null>(null);

  // badgeBg/iconColor must be complete class strings (not built from a template literal at
  // render time) so Tailwind's static scanner can actually see and generate them.
  const categories = [
    { id: 'transport', label: 'Transport', icon: Car, badgeBg: 'bg-blue-100 dark:bg-blue-900/40', iconColor: 'text-blue-600 dark:text-blue-400' },
    { id: 'energy', label: 'Energy', icon: Home, badgeBg: 'bg-green-100 dark:bg-green-900/40', iconColor: 'text-green-600 dark:text-green-400' },
    { id: 'food', label: 'Food', icon: Utensils, badgeBg: 'bg-yellow-100 dark:bg-yellow-900/40', iconColor: 'text-yellow-600 dark:text-yellow-400' },
    { id: 'shopping', label: 'Shopping', icon: ShoppingBag, badgeBg: 'bg-red-100 dark:bg-red-900/40', iconColor: 'text-red-600 dark:text-red-400' },
    { id: 'travel', label: 'Travel', icon: Plane, badgeBg: 'bg-purple-100 dark:bg-purple-900/40', iconColor: 'text-purple-600 dark:text-purple-400' }
  ];

  const handleEstimateWithAI = async () => {
    if (!aiDescription.trim()) return;
    setIsEstimating(true);
    setEstimateExplanation(null);
    try {
      const { estimate, is_estimated } = await estimateCarbon(aiDescription);
      setNewEntry({
        category: estimate.category,
        amount: estimate.amount.toString(),
        description: aiDescription,
      });
      setEstimateExplanation({ text: estimate.explanation, isEstimated: is_estimated });
    } catch (err) {
      console.error('Carbon estimate failed:', err);
      setEstimateExplanation({ text: "Couldn't reach the AI estimator. Please enter values manually.", isEstimated: true });
    } finally {
      setIsEstimating(false);
    }
  };

  const handleAddEntry = async () => {
    if (!currentUser) {
      toast({ title: 'Login Required', description: 'Please log in to log a carbon entry.', variant: 'destructive' });
      return;
    }

    if (!newEntry.amount || !newEntry.description || !(parseFloat(newEntry.amount) > 0)) {
      toast({ title: 'Missing Information', description: 'Please enter a description and a positive amount.', variant: 'destructive' });
      return;
    }

    addCarbonEntry({
      category: newEntry.category,
      amount: parseFloat(newEntry.amount),
      description: newEntry.description,
    });
    toast({ title: 'Entry Logged', description: `Added ${newEntry.amount} kg CO₂ for ${newEntry.category}.` });
    setNewEntry({ category: 'transport', amount: '', description: '' });
    setAiDescription('');
    setEstimateExplanation(null);

    addNotification({
      type: 'environmental',
      title: 'New Carbon Entry Added',
      message: `Added ${newEntry.amount} kg CO₂ for ${newEntry.category}.`,
      read: false,
      source: 'carbon',
      actionable: false,
    });
  };

  const generateMonthlyData = () => {
    if (carbonEntries.length === 0) {
      return [
        { month: 'This Month', emissions: 0, target: 2.0 }
      ];
    }

    const monthlyEmissions = carbonEntries.reduce((acc, entry) => {
      const month = new Date(entry.date).toLocaleDateString('en', { month: 'short' });
      acc[month] = (acc[month] || 0) + entry.amount;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(monthlyEmissions).map(([month, emissions]) => ({
      month,
      emissions: parseFloat(emissions.toFixed(2)),
      target: 2.0
    }));
  };

  const generateCategoryData = () => {
    if (carbonEntries.length === 0) {
      return [];
    }

    const categoryTotals = carbonEntries.reduce((acc, entry) => {
      acc[entry.category] = (acc[entry.category] || 0) + entry.amount;
      return acc;
    }, {} as Record<string, number>);

    const total = Object.values(categoryTotals).reduce((sum, val) => sum + val, 0);
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

    return Object.entries(categoryTotals).map(([category, value], index) => ({
      name: categories.find(c => c.id === category)?.label || category,
      value: Math.round((value / total) * 100),
      color: colors[index % colors.length]
    }));
  };

  const monthlyData = generateMonthlyData();
  const categoryData = generateCategoryData();

  const getCurrentMonthEmissions = () => {
    return carbonEntries.reduce((sum, entry) => sum + entry.amount, 0);
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-700 shadow-lg rounded-2xl">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center space-x-3 text-slate-800 dark:text-slate-200">
            <div className="w-10 h-10 bg-emerald-600 dark:bg-emerald-600 rounded-xl flex items-center justify-center">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold">Carbon Footprint Tracker</span>
              <p className="text-sm text-slate-600 dark:text-slate-400 font-normal">Monitor and reduce your environmental impact</p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Total CO₂ Tracked</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">{getCurrentMonthEmissions().toFixed(1)} kg</p>
                </div>
                <TrendingDown className="w-8 h-8 text-green-500 dark:text-green-400" />
              </div>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Entries</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{carbonEntries.length}</p>
                </div>
                <Target className="w-8 h-8 text-blue-500 dark:text-blue-400" />
              </div>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Categories Tracked</p>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {new Set(carbonEntries.map(e => e.category)).size}
                  </p>
                </div>
                <Sparkles className="w-8 h-8 text-purple-500 dark:text-purple-400" />
              </div>
            </div>
            <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Points Earned</p>
                  <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{userStats.totalPoints}</p>
                </div>
                <Calculator className="w-8 h-8 text-orange-500 dark:text-orange-400" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="tracker" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="tracker">Add Entry</TabsTrigger>
          <TabsTrigger value="overview">Recent Activity</TabsTrigger>
          <TabsTrigger value="breakdown">Breakdown</TabsTrigger>
        </TabsList>

        <TabsContent value="tracker" className="space-y-4">
          <Card className="dark:bg-slate-800">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calculator className="w-5 h-5" />
                <span>Add Carbon Emission Entry</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl space-y-2">
                <Label htmlFor="ai-description" className="dark:text-slate-200 flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-emerald-500" />
                  <span>Estimate with AI</span>
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="ai-description"
                    placeholder="e.g. Drove 30km to work, or flew from NYC to LA"
                    value={aiDescription}
                    onChange={(e) => setAiDescription(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleEstimateWithAI()}
                    className="dark:bg-slate-800 dark:text-slate-300"
                  />
                  <Button onClick={handleEstimateWithAI} disabled={!aiDescription.trim() || isEstimating} variant="outline">
                    {isEstimating ? 'Estimating...' : 'Estimate'}
                  </Button>
                </div>
                {estimateExplanation && (
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {estimateExplanation.isEstimated && <span className="font-medium text-amber-600 dark:text-amber-400">[Estimated] </span>}
                    {estimateExplanation.text}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="category" className="dark:text-slate-200">Category</Label>
                <div className="grid grid-cols-5 gap-2 mt-2">
                  {categories.map((category) => (
                    <Button
                      key={category.id}
                      variant={newEntry.category === category.id ? "default" : "outline"}
                      className={`flex flex-col items-center p-3 h-auto ${
                        newEntry.category === category.id
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                          : 'hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-900/30'
                      }`}
                      onClick={() => setNewEntry({ ...newEntry, category: category.id })}
                    >
                      <category.icon className="w-5 h-5 mb-1" />
                      <span className="text-xs dark:text-slate-300">{category.label}</span>
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="amount" className="dark:text-slate-200">CO₂ Amount (kg)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={newEntry.amount}
                  onChange={(e) => setNewEntry({ ...newEntry, amount: e.target.value })}
                  className="dark:bg-slate-800 dark:text-slate-300"
                />
              </div>

              <div>
                <Label htmlFor="description" className="dark:text-slate-200">Description</Label>
                <Input
                  id="description"
                  placeholder="Describe the activity..."
                  value={newEntry.description}
                  onChange={(e) => setNewEntry({ ...newEntry, description: e.target.value })}
                  className="dark:bg-slate-800 dark:text-slate-300"
                />
              </div>

              <Button onClick={handleAddEntry} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-700 dark:hover:bg-emerald-600">
                Add Entry
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="overview" className="space-y-4">
          {carbonEntries.length === 0 ? (
            <Card className="dark:bg-slate-800">
              <CardContent className="p-8 text-center">
                <Leaf className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-600 dark:text-slate-400 mb-2">No entries yet</h3>
                <p className="text-slate-500 dark:text-slate-400">Start tracking your carbon footprint by adding your first entry!</p>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="dark:bg-slate-800">
                  <CardHeader>
                    <CardTitle>Monthly Emissions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={monthlyData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip />
                          <Line type="monotone" dataKey="emissions" stroke="#10b981" strokeWidth={3} />
                          <Line type="monotone" dataKey="target" stroke="#6b7280" strokeDasharray="5 5" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {categoryData.length > 0 && (
                  <Card className="hidden md:block dark:bg-slate-800"> {/* Hide on small screens */}
                    <CardHeader>
                      <CardTitle>Emissions by Category</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={categoryData}
                              cx="50%"
                              cy="50%"
                              outerRadius={80}
                              dataKey="value"
                              label={({ name, value }) => `${name}: ${value}%`}
                            >
                              {categoryData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
              
              <Card className="dark:bg-slate-800">
                <CardHeader>
                  <CardTitle>Recent Activities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {carbonEntries.slice(0, 5).map((activity) => {
                      const category = categories.find(c => c.id === activity.category);
                      return (
                        <div key={activity.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className={`p-2 rounded-full ${category?.badgeBg || 'bg-slate-100 dark:bg-slate-700'}`}>
                              {category ? (
                                <category.icon className={`w-4 h-4 ${category.iconColor}`} />
                              ) : (
                                <Leaf className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium dark:text-slate-200">{activity.description}</p>
                              <p className="text-sm text-slate-600 dark:text-slate-400">{new Date(activity.date).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <Badge variant="outline" className="dark:border-slate-600 dark:text-slate-300">
                            {activity.amount} kg CO₂
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="breakdown" className="space-y-4">
          {carbonEntries.length === 0 ? (
            <Card className="dark:bg-slate-800">
              <CardContent className="p-8 text-center">
                <h3 className="text-lg font-semibold text-slate-600 dark:text-slate-400 mb-2">No data to show</h3>
                <p className="text-slate-500 dark:text-slate-400">Add some carbon entries to see your breakdown!</p>
              </CardContent>
            </Card>
          ) : (
            <Card className="dark:bg-slate-800">
              <CardHeader>
                <CardTitle>Category Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {categoryData.map((category, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                      <span className="font-medium dark:text-slate-200">{category.name}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 rounded" style={{ backgroundColor: category.color }}></div>
                        <span>{category.value}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CarbonTracker;
