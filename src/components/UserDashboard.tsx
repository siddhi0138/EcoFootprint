
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Award, Target, TrendingUp, Users, Leaf, Star, Trophy, Calendar } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const UserDashboard = ({ stats }) => {
  const achievements = [
    { name: "First Scan", icon: "🔍", unlocked: true, date: "2024-05-01" },
    { name: "Eco Warrior", icon: "🌱", unlocked: true, date: "2024-05-15" },
    { name: "Data Detective", icon: "🕵️", unlocked: true, date: "2024-05-28" },
    { name: "Green Champion", icon: "🏆", unlocked: false, requirement: "50 more scans" },
    { name: "Planet Protector", icon: "🌍", unlocked: false, requirement: "Save 100kg CO₂" },
    { name: "Sustainability Guru", icon: "🧙‍♂️", unlocked: false, requirement: "Reach level 10" }
  ];

  const monthlyData = [
    { month: 'Jan', scans: 12, co2Saved: 5.2 },
    { month: 'Feb', scans: 18, co2Saved: 8.1 },
    { month: 'Mar', scans: 25, co2Saved: 12.3 },
    { month: 'Apr', scans: 32, co2Saved: 15.8 },
    { month: 'May', scans: 28, co2Saved: 13.6 },
    { month: 'Jun', scans: 42, co2Saved: 20.4 }
  ];

  const categoryData = [
    { name: 'Food & Beverage', value: 35, color: '#22c55e' },
    { name: 'Personal Care', value: 25, color: '#3b82f6' },
    { name: 'Clothing', value: 20, color: '#f59e0b' },
    { name: 'Electronics', value: 12, color: '#8b5cf6' },
    { name: 'Home & Garden', value: 8, color: '#ef4444' }
  ];

  const currentLevel = Math.floor(stats.totalScans / 25) + 1;
  const nextLevelProgress = (stats.totalScans % 25) / 25 * 100;
  const scansToNextLevel = 25 - (stats.totalScans % 25);

  const leaderboard = [
    { rank: 1, name: "EcoMaster_2024", scans: 2156, co2Saved: 124.3 },
    { rank: 2, name: "GreenGuardian", scans: 1892, co2Saved: 108.7 },
    { rank: 3, name: "SustainableLife", scans: 1654, co2Saved: 95.2 },
    { rank: stats.rank, name: "You", scans: stats.totalScans, co2Saved: stats.co2Saved, highlight: true }
  ];

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Total Scans</p>
                <p className="text-2xl font-bold">{stats.totalScans}</p>
              </div>
              <Target className="w-8 h-8 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Avg Score</p>
                <p className="text-2xl font-bold">{stats.avgScore}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">CO₂ Saved</p>
                <p className="text-2xl font-bold">{stats.co2Saved}kg</p>
              </div>
              <Leaf className="w-8 h-8 text-purple-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">Global Rank</p>
                <p className="text-2xl font-bold">#{stats.rank}</p>
              </div>
              <Trophy className="w-8 h-8 text-orange-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Progress & Level */}
        <Card className="bg-white/60 backdrop-blur-sm border-green-100">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Star className="w-5 h-5 text-yellow-500" />
              <span>Level Progress</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">Level {currentLevel}</div>
              <p className="text-gray-600">Sustainability Explorer</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress to Level {currentLevel + 1}</span>
                <span>{scansToNextLevel} scans to go</span>
              </div>
              <Progress value={nextLevelProgress} className="h-3" />
            </div>

            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="p-3 bg-green-50 rounded-lg">
                <div className="text-lg font-bold text-green-600">{stats.badges}</div>
                <div className="text-sm text-green-700">Badges Earned</div>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="text-lg font-bold text-blue-600">{Math.round(stats.totalScans / 7)}</div>
                <div className="text-sm text-blue-700">Weekly Avg</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Activity Chart */}
        <Card className="bg-white/60 backdrop-blur-sm border-green-100">
          <CardHeader>
            <CardTitle>Monthly Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'scans' ? `${value} scans` : `${value} kg CO₂`,
                    name === 'scans' ? 'Scans' : 'CO₂ Saved'
                  ]}
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                />
                <Area type="monotone" dataKey="scans" stackId="1" stroke="#22c55e" fill="#22c55e" fillOpacity={0.3} />
                <Area type="monotone" dataKey="co2Saved" stackId="2" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Achievements */}
        <Card className="bg-white/60 backdrop-blur-sm border-green-100">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Award className="w-5 h-5 text-yellow-500" />
              <span>Achievements</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {achievements.map((achievement, index) => (
                <div 
                  key={index}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    achievement.unlocked 
                      ? 'border-green-200 bg-green-50' 
                      : 'border-gray-200 bg-gray-50 opacity-60'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-2xl mb-1">{achievement.icon}</div>
                    <div className="text-sm font-medium">{achievement.name}</div>
                    {achievement.unlocked ? (
                      <div className="text-xs text-green-600 mt-1">
                        <Calendar className="w-3 h-3 inline mr-1" />
                        {achievement.date}
                      </div>
                    ) : (
                      <div className="text-xs text-gray-500 mt-1">
                        {achievement.requirement}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Category Breakdown */}
        <Card className="bg-white/60 backdrop-blur-sm border-green-100">
          <CardHeader>
            <CardTitle>Scan Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [`${value}%`, 'Percentage']}
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Leaderboard */}
      <Card className="bg-white/60 backdrop-blur-sm border-green-100">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-purple-500" />
            <span>Global Leaderboard</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {leaderboard.map((user) => (
              <div 
                key={user.rank}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  user.highlight ? 'bg-blue-50 border-2 border-blue-200' : 'bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    user.rank === 1 ? 'bg-yellow-500 text-white' :
                    user.rank === 2 ? 'bg-gray-400 text-white' :
                    user.rank === 3 ? 'bg-orange-500 text-white' :
                    user.highlight ? 'bg-blue-500 text-white' : 'bg-gray-300'
                  }`}>
                    {user.rank}
                  </div>
                  <div>
                    <div className="font-medium">{user.name}</div>
                    <div className="text-sm text-gray-600">{user.scans} scans</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-green-600">{user.co2Saved} kg</div>
                  <div className="text-sm text-gray-500">CO₂ saved</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserDashboard;
