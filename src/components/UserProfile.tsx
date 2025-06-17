
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, 
  Settings, 
  Award, 
  Target, 
  TrendingUp, 
  Leaf, 
  Star,
  Edit,
  Save,
  Camera,
  Trophy,
  Calendar,
  Users
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const UserProfile = ({ stats }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: 'Alex Green',
    email: 'alex.green@example.com',
    location: 'San Francisco, CA',
    bio: 'Passionate about sustainability and making eco-friendly choices every day.',
    goals: {
      weeklyScans: 10,
      monthlyGoal: 'Reduce carbon footprint by 20%',
      yearlyTarget: 'Achieve zero waste lifestyle'
    }
  });

  const achievements = [
    { name: 'Eco Warrior', description: '100+ sustainable scans', earned: true },
    { name: 'Carbon Saver', description: 'Saved 50kg CO₂', earned: true },
    { name: 'Community Helper', description: 'Helped 10+ users', earned: false, progress: 7 },
    { name: 'Streak Master', description: '30-day streak', earned: false, progress: 12 }
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

  const preferences = {
    notifications: {
      email: true,
      push: true,
      weekly: true,
      achievements: true
    },
    privacy: {
      profilePublic: true,
      statsVisible: true,
      allowMessages: true
    }
  };

  const handleSave = () => {
    setIsEditing(false);
    // Here you would typically save to backend
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="w-6 h-6 text-emerald-600" />
            <span>User Profile & Dashboard</span>
          </CardTitle>
        </CardHeader>
      </Card>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card className="bg-white/70 backdrop-blur-sm border-sage-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Profile Information</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                >
                  {isEditing ? <Save className="w-4 h-4 mr-2" /> : <Edit className="w-4 h-4 mr-2" />}
                  {isEditing ? 'Save' : 'Edit'}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Profile Picture */}
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full flex items-center justify-center">
                    <User className="w-10 h-10 text-white" />
                  </div>
                  {isEditing && (
                    <Button size="sm" className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0">
                      <Camera className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">{profile.name}</h3>
                  <p className="text-gray-600">{profile.location}</p>
                  <Badge className="mt-1 bg-emerald-100 text-emerald-700 border-emerald-200">
                    Level {Math.floor(stats.totalScans / 25) + 1}
                  </Badge>
                </div>
              </div>

              {/* Profile Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  {isEditing ? (
                    <Input
                      value={profile.name}
                      onChange={(e) => setProfile({...profile, name: e.target.value})}
                    />
                  ) : (
                    <p className="text-gray-900">{profile.name}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  {isEditing ? (
                    <Input
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile({...profile, email: e.target.value})}
                    />
                  ) : (
                    <p className="text-gray-900">{profile.email}</p>
                  )}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  {isEditing ? (
                    <Input
                      value={profile.location}
                      onChange={(e) => setProfile({...profile, location: e.target.value})}
                    />
                  ) : (
                    <p className="text-gray-900">{profile.location}</p>
                  )}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                  {isEditing ? (
                    <textarea
                      className="w-full p-3 border border-gray-300 rounded-md resize-none"
                      rows={3}
                      value={profile.bio}
                      onChange={(e) => setProfile({...profile, bio: e.target.value})}
                    />
                  ) : (
                    <p className="text-gray-900">{profile.bio}</p>
                  )}
                </div>
              </div>

              {/* Stats Overview */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-gray-200">
                <div className="text-center">
                  <div className="text-2xl font-bold text-emerald-600">{stats.totalScans}</div>
                  <div className="text-sm text-gray-600">Total Scans</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{stats.co2Saved}kg</div>
                  <div className="text-sm text-gray-600">CO₂ Saved</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-amber-600">{stats.badges}</div>
                  <div className="text-sm text-gray-600">Badges</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">#{stats.rank}</div>
                  <div className="text-sm text-gray-600">Global Rank</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dashboard">
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
          </div>
        </TabsContent>

        <TabsContent value="achievements">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {achievements.map((achievement, index) => (
              <Card key={index} className={`${
                achievement.earned 
                  ? 'bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200' 
                  : 'bg-gray-50 border-gray-200'
              }`}>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className={`p-2 rounded-full ${
                      achievement.earned ? 'bg-amber-100 text-amber-600' : 'bg-gray-200 text-gray-400'
                    }`}>
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className={`font-semibold ${
                        achievement.earned ? 'text-amber-800' : 'text-gray-600'
                      }`}>
                        {achievement.name}
                      </h3>
                      <p className="text-sm text-gray-600">{achievement.description}</p>
                    </div>
                  </div>
                  {achievement.earned ? (
                    <Badge className="bg-amber-500 hover:bg-amber-600">Earned</Badge>
                  ) : (
                    <div>
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Progress</span>
                        <span>{achievement.progress}/10</span>
                      </div>
                      <Progress value={(achievement.progress / 10) * 100} className="h-2" />
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="goals">
          <Card className="bg-white/70 backdrop-blur-sm border-sage-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="w-5 h-5" />
                <span>Personal Goals</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Weekly Scanning Goal</h3>
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <Progress value={(stats.currentWeekScans / profile.goals.weeklyScans) * 100} />
                  </div>
                  <span className="text-sm text-gray-600">
                    {stats.currentWeekScans}/{profile.goals.weeklyScans}
                  </span>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Monthly Goal</h3>
                <p className="text-gray-600">{profile.goals.monthlyGoal}</p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Yearly Target</h3>
                <p className="text-gray-600">{profile.goals.yearlyTarget}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <div className="space-y-6">
            <Card className="bg-white/70 backdrop-blur-sm border-sage-200">
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Email Notifications</span>
                  <input type="checkbox" defaultChecked={preferences.notifications.email} />
                </div>
                <div className="flex items-center justify-between">
                  <span>Push Notifications</span>
                  <input type="checkbox" defaultChecked={preferences.notifications.push} />
                </div>
                <div className="flex items-center justify-between">
                  <span>Weekly Reports</span>
                  <input type="checkbox" defaultChecked={preferences.notifications.weekly} />
                </div>
                <div className="flex items-center justify-between">
                  <span>Achievement Alerts</span>
                  <input type="checkbox" defaultChecked={preferences.notifications.achievements} />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/70 backdrop-blur-sm border-sage-200">
              <CardHeader>
                <CardTitle>Privacy Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Public Profile</span>
                  <input type="checkbox" defaultChecked={preferences.privacy.profilePublic} />
                </div>
                <div className="flex items-center justify-between">
                  <span>Show Statistics</span>
                  <input type="checkbox" defaultChecked={preferences.privacy.statsVisible} />
                </div>
                <div className="flex items-center justify-between">
                  <span>Allow Messages</span>
                  <input type="checkbox" defaultChecked={preferences.privacy.allowMessages} />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserProfile;
