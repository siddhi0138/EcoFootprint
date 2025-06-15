
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Leaf, 
  Target, 
  Award, 
  Calendar,
  BarChart3,
  PieChart as PieChartIcon
} from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { useProductHistory } from '@/hooks/useProductHistory';

const Dashboard = () => {
  const { user } = useUser();
  const { history } = useProductHistory();

  // Mock data for charts
  const monthlyAnalysis = [
    { month: 'Jan', analyses: 12, avgScore: 68 },
    { month: 'Feb', analyses: 18, avgScore: 72 },
    { month: 'Mar', analyses: 24, avgScore: 75 },
    { month: 'Apr', analyses: 31, avgScore: 78 },
    { month: 'May', analyses: 28, avgScore: 80 },
    { month: 'Jun', analyses: 35, avgScore: 82 }
  ];

  const categoryBreakdown = [
    { name: 'Electronics', value: 30, color: '#0088FE' },
    { name: 'Clothing', value: 25, color: '#00C49F' },
    { name: 'Food', value: 20, color: '#FFBB28' },
    { name: 'Home', value: 15, color: '#FF8042' },
    { name: 'Other', value: 10, color: '#8884D8' }
  ];

  const sustainabilityGoals = [
    { goal: 'Reduce Carbon Footprint', progress: 75, target: '20% reduction' },
    { goal: 'Choose Sustainable Products', progress: 60, target: '80% eco-friendly' },
    { goal: 'Minimize Waste', progress: 45, target: 'Zero waste lifestyle' },
    { goal: 'Energy Efficiency', progress: 85, target: '90% renewable energy' }
  ];

  const recentAchievements = [
    { title: 'Eco Warrior', description: 'Analyzed 50 products', icon: '🌿', earned: '2 days ago' },
    { title: 'Carbon Conscious', description: 'Reduced footprint by 15%', icon: '🌱', earned: '1 week ago' },
    { title: 'Sustainable Shopper', description: 'Chose eco-friendly options', icon: '♻️', earned: '2 weeks ago' }
  ];

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-emerald-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Analyses</p>
                <p className="text-2xl font-bold text-gray-900">{user?.analysisCount || 0}</p>
              </div>
              <div className="p-3 bg-emerald-100 rounded-full">
                <BarChart3 className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-sm text-green-600">+12% from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-emerald-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Green Score</p>
                <p className="text-2xl font-bold text-gray-900">{user?.greenScore || 0}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Leaf className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-sm text-green-600">+8 points this week</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-emerald-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Product Score</p>
                <p className="text-2xl font-bold text-gray-900">
                  {history.length > 0 
                    ? Math.round(history.reduce((acc, item) => acc + item.score, 0) / history.length)
                    : 0
                  }
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Target className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-sm text-green-600">Improving</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-emerald-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Achievements</p>
                <p className="text-2xl font-bold text-gray-900">{recentAchievements.length}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <Award className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
            <div className="flex items-center mt-2">
              <span className="text-sm text-gray-600">Latest: Eco Warrior</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-emerald-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-emerald-600" />
              <span>Monthly Analysis Trend</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyAnalysis}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="analyses" stroke="#10b981" strokeWidth={2} />
                <Line type="monotone" dataKey="avgScore" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-emerald-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <PieChartIcon className="h-5 w-5 text-emerald-600" />
              <span>Product Categories</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryBreakdown}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Sustainability Goals */}
      <Card className="border-emerald-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-emerald-600" />
            <span>Sustainability Goals</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {sustainabilityGoals.map((goal, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-900">{goal.goal}</h4>
                  <span className="text-sm text-gray-600">{goal.target}</span>
                </div>
                <Progress value={goal.progress} className="h-2" />
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">{goal.progress}% complete</span>
                  <Badge variant="outline" className="border-emerald-300 text-emerald-700">
                    {goal.progress >= 75 ? 'On Track' : goal.progress >= 50 ? 'In Progress' : 'Needs Attention'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Achievements */}
      <Card className="border-emerald-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Award className="h-5 w-5 text-emerald-600" />
            <span>Recent Achievements</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentAchievements.map((achievement, index) => (
              <div key={index} className="flex items-center space-x-4 p-4 bg-emerald-50 rounded-lg">
                <div className="text-2xl">{achievement.icon}</div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{achievement.title}</h4>
                  <p className="text-sm text-gray-600">{achievement.description}</p>
                </div>
                <div className="text-sm text-gray-500">{achievement.earned}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
