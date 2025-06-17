
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  TrendingUp, 
  Target,
  Calculator,
  Leaf
} from 'lucide-react';

const CarbonTracker = () => {
  const [newEntry, setNewEntry] = useState({
    category: 'transport',
    amount: '',
    description: ''
  });

  const monthlyData = [
    { month: 'Jan', emissions: 2.3, target: 2.0 },
    { month: 'Feb', emissions: 2.1, target: 2.0 },
    { month: 'Mar', emissions: 1.9, target: 2.0 },
    { month: 'Apr', emissions: 1.7, target: 2.0 },
    { month: 'May', emissions: 1.5, target: 2.0 },
    { month: 'Jun', emissions: 1.3, target: 2.0 }
  ];

  const categoryData = [
    { name: 'Transport', value: 35, color: '#3b82f6' },
    { name: 'Energy', value: 28, color: '#10b981' },
    { name: 'Food', value: 20, color: '#f59e0b' },
    { name: 'Shopping', value: 12, color: '#ef4444' },
    { name: 'Other', value: 5, color: '#8b5cf6' }
  ];

  const weeklyTrend = [
    { day: 'Mon', emissions: 0.4 },
    { day: 'Tue', emissions: 0.3 },
    { day: 'Wed', emissions: 0.5 },
    { day: 'Thu', emissions: 0.2 },
    { day: 'Fri', emissions: 0.6 },
    { day: 'Sat', emissions: 0.1 },
    { day: 'Sun', emissions: 0.2 }
  ];

  const categories = [
    { id: 'transport', label: 'Transport', icon: Car, color: 'blue' },
    { id: 'energy', label: 'Energy', icon: Home, color: 'green' },
    { id: 'food', label: 'Food', icon: Utensils, color: 'yellow' },
    { id: 'shopping', label: 'Shopping', icon: ShoppingBag, color: 'red' },
    { id: 'travel', label: 'Travel', icon: Plane, color: 'purple' }
  ];

  const recentActivities = [
    { id: 1, category: 'transport', description: 'Car commute to work', emissions: 0.15, date: '2024-06-16' },
    { id: 2, category: 'food', description: 'Lunch at restaurant', emissions: 0.08, date: '2024-06-16' },
    { id: 3, category: 'energy', description: 'Home electricity usage', emissions: 0.12, date: '2024-06-15' },
    { id: 4, category: 'shopping', description: 'Online shopping delivery', emissions: 0.05, date: '2024-06-15' }
  ];

  const handleAddEntry = () => {
    if (newEntry.amount && newEntry.description) {
      console.log('Adding new carbon entry:', newEntry);
      setNewEntry({ category: 'transport', amount: '', description: '' });
    }
  };

  const getCurrentMonthEmissions = () => {
    return monthlyData[monthlyData.length - 1]?.emissions || 0;
  };

  const getEmissionsTrend = () => {
    const current = getCurrentMonthEmissions();
    const previous = monthlyData[monthlyData.length - 2]?.emissions || 0;
    return current < previous ? 'down' : 'up';
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Leaf className="w-6 h-6 text-green-600" />
            <span>Carbon Footprint Tracker</span>
          </CardTitle>
          <p className="text-gray-600">Monitor and reduce your environmental impact</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">This Month</p>
                  <p className="text-2xl font-bold text-green-600">{getCurrentMonthEmissions()} tons</p>
                </div>
                {getEmissionsTrend() === 'down' ? (
                  <TrendingDown className="w-8 h-8 text-green-500" />
                ) : (
                  <TrendingUp className="w-8 h-8 text-red-500" />
                )}
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Target</p>
                  <p className="text-2xl font-bold text-blue-600">2.0 tons</p>
                </div>
                <Target className="w-8 h-8 text-blue-500" />
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg border">
              <div>
                <p className="text-sm text-gray-600">Reduction</p>
                <p className="text-2xl font-bold text-purple-600">43%</p>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg border">
              <div>
                <p className="text-sm text-gray-600">Saved This Year</p>
                <p className="text-2xl font-bold text-orange-600">5.2 tons</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tracker">Add Entry</TabsTrigger>
          <TabsTrigger value="breakdown">Breakdown</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Emissions Trend</CardTitle>
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

            <Card>
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
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentActivities.map((activity) => {
                  const category = categories.find(c => c.id === activity.category);
                  return (
                    <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-full bg-${category?.color}-100`}>
                          <category.icon className={`w-4 h-4 text-${category?.color}-600`} />
                        </div>
                        <div>
                          <p className="font-medium">{activity.description}</p>
                          <p className="text-sm text-gray-600">{activity.date}</p>
                        </div>
                      </div>
                      <Badge variant="outline">
                        {activity.emissions} kg CO₂
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tracker" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calculator className="w-5 h-5" />
                <span>Add Carbon Emission Entry</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="category">Category</Label>
                <div className="grid grid-cols-5 gap-2 mt-2">
                  {categories.map((category) => (
                    <Button
                      key={category.id}
                      variant={newEntry.category === category.id ? "default" : "outline"}
                      className="flex flex-col items-center p-3 h-auto"
                      onClick={() => setNewEntry({ ...newEntry, category: category.id })}
                    >
                      <category.icon className="w-5 h-5 mb-1" />
                      <span className="text-xs">{category.label}</span>
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="amount">CO₂ Amount (kg)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={newEntry.amount}
                  onChange={(e) => setNewEntry({ ...newEntry, amount: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  placeholder="Describe the activity..."
                  value={newEntry.description}
                  onChange={(e) => setNewEntry({ ...newEntry, description: e.target.value })}
                />
              </div>

              <Button onClick={handleAddEntry} className="w-full">
                Add Entry
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="breakdown" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Emissions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={weeklyTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="emissions" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="goals" className="space-y-4">
          <div className="grid gap-4">
            {[
              { title: 'Reduce transport emissions by 50%', progress: 73, target: '1.2 tons', current: '0.6 tons' },
              { title: 'Switch to renewable energy', progress: 45, target: '100%', current: '45%' },
              { title: 'Achieve carbon neutrality', progress: 28, target: '0 tons', current: '1.3 tons' }
            ].map((goal, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium">{goal.title}</h3>
                    <Badge variant="outline">{goal.progress}%</Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Current: {goal.current}</span>
                      <span>Target: {goal.target}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${goal.progress}%` }}
                      ></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CarbonTracker;
