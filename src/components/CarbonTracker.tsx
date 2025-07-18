import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationsContextNew';
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
import { db } from '../firebase';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';
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
} from 'lucide-react';

const CarbonTracker = () => {
  interface CarbonEntry {
    id: string;
    category: string;
    amount: number;
    description: string;
    date: string;
  }
  const { currentUser } = useAuth();
  const { userStats } = useUserData();
  const { addNotification } = useNotifications();
  const [newEntry, setNewEntry] = useState({
    category: 'transport',
    amount: '',
    description: ''
  });

  const categories = [
    { id: 'transport', label: 'Transport', icon: Car, color: 'blue' },
    { id: 'energy', label: 'Energy', icon: Home, color: 'green' },
    { id: 'food', label: 'Food', icon: Utensils, color: 'yellow' },
    { id: 'shopping', label: 'Shopping', icon: ShoppingBag, color: 'red' },
    { id: 'travel', label: 'Travel', icon: Plane, color: 'purple' }
  ];

  const [carbonEntries, setCarbonEntries] = useState<CarbonEntry[]>([]);

  useEffect(() => {
    if (!currentUser) {
      setCarbonEntries([]);
      return;
    }

    const entriesCollectionRef = collection(db, `users/${currentUser.uid}/carbonEntries`);
    const q = query(entriesCollectionRef, orderBy('timestamp', 'desc') as any);

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const entries: CarbonEntry[] = snapshot.docs.map(doc => ({
        id: doc.id,
        category: doc.data().category,
        amount: doc.data().amount,
        description: doc.data().description,
        date: doc.data().timestamp?.toDate().toISOString().split('T')[0] || '',
      }));
      setCarbonEntries(entries);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const handleAddEntry = async () => {
    if (!currentUser) {
      console.log("User not authenticated. Cannot add entry.");
      return;
    }

    if (newEntry.amount && newEntry.description && parseFloat(newEntry.amount) > 0) {
      const entriesCollectionRef = collection(db, `users/${currentUser.uid}/carbonEntries`);
      await addDoc(entriesCollectionRef, {
        category: newEntry.category,
        amount: parseFloat(newEntry.amount),
        description: newEntry.description,
        timestamp: serverTimestamp()
      });
      setNewEntry({ category: 'transport', amount: '', description: '' });

      addNotification({
        type: 'environmental',
        title: 'New Carbon Entry Added',
        message: `Added ${newEntry.amount} kg CO₂ for ${newEntry.category}.`,
        read: false,
        source: 'carbon',
        actionable: false,
      });
    }
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
      <Card className="bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-700 shadow-lg rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Leaf className="w-6 h-6 text-green-600 dark:text-green-400" />
            <span className="dark:text-slate-200">Carbon Footprint Tracker</span>
          </CardTitle>
          <p className="text-gray-600 dark:text-gray-400">Monitor and reduce your environmental impact</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-gray-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total CO₂ Tracked</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">{getCurrentMonthEmissions().toFixed(1)} kg</p>
                </div>
                <TrendingDown className="w-8 h-8 text-green-500 dark:text-green-400" />
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-gray-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Entries</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{carbonEntries.length}</p>
                </div>
                <Target className="w-8 h-8 text-blue-500 dark:text-blue-400" />
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-gray-200 dark:border-slate-700">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Carbon Entries</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{carbonEntries.length}</p>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-gray-200 dark:border-slate-700">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Points Earned</p>
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{Math.floor(getCurrentMonthEmissions() * 10)}</p>
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
              <div>
                <Label htmlFor="category" className="dark:text-slate-200">Category</Label>
                <div className="grid grid-cols-5 gap-2 mt-2">
                  {categories.map((category) => (
                    <Button
                      key={category.id}
                      variant={newEntry.category === category.id ? "default" : "outline"}
                      className="flex flex-col items-center p-3 h-auto"
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

              <Button onClick={handleAddEntry} className="w-full dark:bg-blue-700 dark:hover:bg-blue-600 dark:text-white">
                Add Entry
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="overview" className="space-y-4">
          {carbonEntries.length === 0 ? (
            <Card className="dark:bg-slate-800">
              <CardContent className="p-8 text-center">
                <Leaf className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">No entries yet</h3>
                <p className="text-gray-500 dark:text-gray-400">Start tracking your carbon footprint by adding your first entry!</p>
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
                        <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className={`p-2 rounded-full bg-${category?.color}-100`}>
                              <category.icon className={`w-4 h-4 text-${category?.color}-600`} />
                            </div>
                            <div>
                              <p className="font-medium dark:text-slate-200">{activity.description}</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">{activity.date}</p>
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
                <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">No data to show</h3>
                <p className="text-gray-500 dark:text-gray-400">Add some carbon entries to see your breakdown!</p>
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
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
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
