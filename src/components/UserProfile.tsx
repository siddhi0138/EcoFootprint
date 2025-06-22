
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button'; // Import Button
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useUserData } from '@/contexts/UserDataContext';
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
  Users,
  LogOut,
  Recycle,
  ShoppingCart,
  Car,
  BookOpen,
  ChefHat,
  Clock,
  BarChart3,
  TrendingDown
} from 'lucide-react';
import { db } from '../firebase'; // Import db
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const UserProfile = () => {
  const { user, logout } = useAuth();
  const { userStats, carbonEntries, scannedProducts } = useUserData();
 const [isEditing, setIsEditing] = useState(false);
 const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || 'alex.green@example.com',
    location: 'San Francisco, CA',
    bio: 'Passionate about sustainability and making eco-friendly choices every day.',
    goals: {
      weeklyScans: 10,
      monthlyGoal: 'Reduce carbon footprint by 20%',
      yearlyTarget: 'Achieve zero waste lifestyle'
    }
  });


  // Fetch user profile and stats on component mount
  React.useEffect(() => {
    const fetchUserProfile = async () => {
      if (user) {
        // Fetch profile data
        const userDocRef = doc(db, 'users', user.id);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          setProfile({
            name: userData.name || user.name || '',
            email: userData.email || user.email || '',
            location: userData.location || '',
            bio: userData.bio || '',
            goals: userData.goals || {
              weeklyScans: 10,
              monthlyGoal: 'Reduce carbon footprint by 20%',
              yearlyTarget: 'Achieve zero waste lifestyle'
            }
          });
        } else {
          // If user document doesn't exist, create it with basic info
          await setDoc(userDocRef, {
            uid: user.id,
            name: user.name || '',
            email: user.email || '',
          }, { merge: true });
        }

        // Fetch user stats
        const userStatsDocRef = doc(db, 'userStats', user.id);
        const userStatsDocSnap = await getDoc(userStatsDocRef);

        if (userStatsDocSnap.exists()) {
 // userStats is already being updated by the UserDataProvider's snapshot listener
        } else {
          // If user stats document doesn't exist, create it with default values
          await setDoc(userStatsDocRef, {
            totalScans: 0, co2Saved: 0, totalPoints: 150, rank: 999, currentWeekScans: 0, coursesCompleted: 0, recipesViewed: 0, investmentsMade: 0, transportTrips: 0, esgReports: 0, badges: 0, avgScore: 0, level: 1, weeklyGoal: 75, streakDays: 0
          });
        }
      }
   };
    fetchUserProfile();
 }, [user]); // Removed setUserStats from the dependency array as it's not directly used here

  const achievements = [
    { 
      name: 'Eco Warrior', 
      description: '100+ sustainable scans', 
      earned: userStats.totalScans >= 100,
      progress: userStats.totalScans,
      target: 100,
      icon: Leaf
    },
    { 
      name: 'Carbon Saver', 
      description: 'Saved 50kg CO₂', 
      earned: userStats.co2Saved >= 50,
      progress: userStats.co2Saved,
      target: 50,
      icon: TrendingDown
    },
    { 
      name: 'Knowledge Seeker', 
      description: '10+ courses completed', 
      earned: userStats.coursesCompleted >= 10,
      progress: userStats.coursesCompleted,
      target: 10,
      icon: BookOpen
    },
    { 
      name: 'Recipe Explorer', 
      description: '25+ recipes viewed', 
      earned: userStats.recipesViewed >= 25,
      progress: userStats.recipesViewed,
      target: 25,
      icon: ChefHat
    },
    { 
      name: 'Green Investor', 
      description: '5+ investments made', 
      earned: userStats.investmentsMade >= 5,
      progress: userStats.investmentsMade,
      target: 5,
      icon: TrendingUp
    },
    { 
      name: 'Transport Pioneer', 
      description: '20+ eco-trips planned', 
      earned: userStats.transportTrips >= 20,
      progress: userStats.transportTrips,
      target: 20,
      icon: Car
    }
  ];

  const monthlyData = [
    { month: 'Jan', scans: Math.max(0, userStats.totalScans - 50), co2Saved: Math.max(0, userStats.co2Saved - 25) },
    { month: 'Feb', scans: Math.max(0, userStats.totalScans - 40), co2Saved: Math.max(0, userStats.co2Saved - 20) },
    { month: 'Mar', scans: Math.max(0, userStats.totalScans - 30), co2Saved: Math.max(0, userStats.co2Saved - 15) },
    { month: 'Apr', scans: Math.max(0, userStats.totalScans - 20), co2Saved: Math.max(0, userStats.co2Saved - 10) },
    { month: 'May', scans: Math.max(0, userStats.totalScans - 10), co2Saved: Math.max(0, userStats.co2Saved - 5) },
    { month: 'Jun', scans: userStats.totalScans, co2Saved: userStats.co2Saved }
  ];

  const categoryData = [
    { name: 'Food & Beverage', value: 35, color: '#22c55e' },
    { name: 'Personal Care', value: 25, color: '#3b82f6' },
    { name: 'Clothing', value: 20, color: '#f59e0b' },
    { name: 'Electronics', value: 12, color: '#8b5cf6' },
    { name: 'Home & Garden', value: 8, color: '#ef4444' }
  ];

  const currentLevel = Math.floor(userStats.totalScans / 25) + 1;
  const nextLevelProgress = (userStats.totalScans % 25) / 25 * 100;
  const scansToNextLevel = 25 - (userStats.totalScans % 25);

  const leaderboard = [
    { rank: 1, name: "EcoMaster_2024", scans: 2156, co2Saved: 124.3 },
    { rank: 2, name: "GreenGuardian", scans: 1892, co2Saved: 108.7 },
    { rank: 3, name: "SustainableLife", scans: 1654, co2Saved: 95.2 },
    { rank: userStats.rank, name: "You", scans: userStats.totalScans, co2Saved: userStats.co2Saved, highlight: true }
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

  const handleSave = async () => {
    setIsEditing(false);
    if (user) {
      try {
        const userDocRef = doc(db, 'users', user.id);
        await setDoc(userDocRef, {
          name: profile.name,
          email: profile.email,
          location: profile.location,
          bio: profile.bio,
          goals: profile.goals, // Save goals as well
        }, { merge: true });
        console.log('Profile updated successfully!');
      } catch (error) {
        console.error('Error updating profile:', error);
      }
    } else {
      console.warn('No user logged in to save profile.');
    }

  };

  const handleLogout = () => {
    logout();
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="bg-white/80 backdrop-blur-sm border-emerald-200 dark:bg-gray-800/80 dark:border-emerald-700">
          <CardContent className="p-8 text-center">
            <User className="w-16 h-16 mx-auto mb-4 text-gray-400 dark:text-gray-500" />
            <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-200">
              Please Login
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              You need to be logged in to view your profile and statistics.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200 dark:from-emerald-900/20 dark:to-green-900/20 dark:border-emerald-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <User className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              <span className="text-gray-800 dark:text-gray-200">User Profile & Dashboard</span>
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="border-red-300 text-red-600 hover:bg-red-50 dark:border-red-600 dark:text-red-400 dark:hover:bg-red-900/20"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 bg-white/60 dark:bg-gray-800/60">
          <TabsTrigger value="profile" className="dark:text-gray-300 dark:data-[state=active]:bg-emerald-600 dark:data-[state=active]:text-white">Profile</TabsTrigger>
          <TabsTrigger value="dashboard" className="dark:text-gray-300 dark:data-[state=active]:bg-emerald-600 dark:data-[state=active]:text-white">Dashboard</TabsTrigger>
          <TabsTrigger value="achievements" className="dark:text-gray-300 dark:data-[state=active]:bg-emerald-600 dark:data-[state=active]:text-white">Achievements</TabsTrigger>
          <TabsTrigger value="goals" className="dark:text-gray-300 dark:data-[state=active]:bg-emerald-600 dark:data-[state=active]:text-white">Goals</TabsTrigger>
          <TabsTrigger value="settings" className="dark:text-gray-300 dark:data-[state=active]:bg-emerald-600 dark:data-[state=active]:text-white">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card className="bg-white/70 backdrop-blur-sm border-sage-200 dark:bg-gray-800/70 dark:border-gray-600">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-gray-800 dark:text-gray-200">Profile Information</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                  className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  {isEditing ? <Save className="w-4 h-4 mr-2" /> : <Edit className="w-4 h-4 mr-2" />}
                  {isEditing ? 'Save' : 'Edit'}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
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
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">{profile.name}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{profile.location}</p>
                  <Badge className="mt-1 bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/50 dark:text-emerald-300 dark:border-emerald-600">
                    Level {currentLevel}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                  {isEditing ? (
                    <Input
                      value={profile.name}
                      onChange={(e) => setProfile({...profile, name: e.target.value})}
                      className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                    />
                  ) : (
                    <p className="text-gray-900 dark:text-gray-200">{profile.name}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                  {isEditing ? (
                    <Input
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile({...profile, email: e.target.value})}
                      className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                    />
                  ) : (
                    <p className="text-gray-900 dark:text-gray-200">{profile.email}</p>
                  )}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location</label>
                  {isEditing ? (
                    <Input
                      value={profile.location}
                      onChange={(e) => setProfile({...profile, location: e.target.value})}
                      className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                    />
                  ) : (
                    <p className="text-gray-900 dark:text-gray-200">{profile.location}</p>
                  )}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bio</label>
                  {isEditing ? (
                    <textarea
                      className="w-full p-3 border border-gray-300 rounded-md resize-none dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                      rows={3}
                      value={profile.bio}
                      onChange={(e) => setProfile({...profile, bio: e.target.value})}
                    />
                  ) : (
                    <p className="text-gray-900 dark:text-gray-200">{profile.bio}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-gray-200 dark:border-gray-600">
                <div className="text-center">
                  <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{userStats.totalScans}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Total Scans</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{userStats.co2Saved}kg</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">CO₂ Saved</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{achievements.filter(a => a.earned).length}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Badges</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">#{userStats.rank}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Global Rank</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dashboard">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-sm">Total Scans</p>
                      <p className="text-2xl font-bold">{userStats.totalScans}</p>
                    </div>
                    <Target className="w-8 h-8 text-green-200" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm">CO₂ Saved</p>
                      <p className="text-2xl font-bold">{userStats.co2Saved}kg</p>
                    </div>
                    <TrendingDown className="w-8 h-8 text-blue-200" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-sm">Total Points</p>
                      <p className="text-2xl font-bold">{userStats.totalPoints}</p>
                    </div>
                    <Star className="w-8 h-8 text-purple-200" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-100 text-sm">Global Rank</p>
                      <p className="text-2xl font-bold">#{userStats.rank}</p>
                    </div>
                    <Trophy className="w-8 h-8 text-orange-200" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white/60 backdrop-blur-sm border-green-100 dark:bg-gray-800/60 dark:border-gray-600">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Star className="w-5 h-5 text-yellow-500" />
                    <span className="text-gray-800 dark:text-gray-200">Level Progress</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">Level {currentLevel}</div>
                    <p className="text-gray-600 dark:text-gray-400">Sustainability Explorer</p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-700 dark:text-gray-300">Progress to Level {currentLevel + 1}</span>
                      <span className="text-gray-700 dark:text-gray-300">{scansToNextLevel} scans to go</span>
                    </div>
                    <Progress value={nextLevelProgress} className="h-3" />
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="text-lg font-bold text-green-600 dark:text-green-400">{userStats.coursesCompleted}</div>
                      <div className="text-sm text-green-700 dark:text-green-300">Courses</div>
                    </div>
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{userStats.recipesViewed}</div>
                      <div className="text-sm text-blue-700 dark:text-blue-300">Recipes</div>
                    </div>
                    <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <div className="text-lg font-bold text-purple-600 dark:text-purple-400">{userStats.investmentsMade}</div>
                      <div className="text-sm text-purple-700 dark:text-purple-300">Investments</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/60 backdrop-blur-sm border-green-100 dark:bg-gray-800/60 dark:border-gray-600">
                <CardHeader>
                  <CardTitle className="text-gray-800 dark:text-gray-200">Monthly Activity</CardTitle>
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
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          color: '#374151'
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
              <Card className="bg-white/60 backdrop-blur-sm border-green-100 dark:bg-gray-800/60 dark:border-gray-600">
                <CardHeader>
                  <CardTitle className="text-gray-800 dark:text-gray-200">Activity Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Recycle className="w-5 h-5 text-green-600" />
                        <span className="font-medium">Carbon Entries</span>
                      </div>
                      <span className="font-bold text-green-600">{carbonEntries.length}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <ShoppingCart className="w-5 h-5 text-blue-600" />
                        <span className="font-medium">Products Scanned</span>
                      </div>
                      <span className="font-bold text-blue-600">{scannedProducts.length}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Car className="w-5 h-5 text-purple-600" />
                        <span className="font-medium">Transport Trips</span>
                      </div>
                      <span className="font-bold text-purple-600">{userStats.transportTrips}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <BarChart3 className="w-5 h-5 text-orange-600" />
                        <span className="font-medium">ESG Reports</span>
                      </div>
                      <span className="font-bold text-orange-600">{userStats.esgReports}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/60 backdrop-blur-sm border-green-100 dark:bg-gray-800/60 dark:border-gray-600">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="w-5 h-5 text-purple-500" />
                    <span className="text-gray-800 dark:text-gray-200">Global Leaderboard</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {leaderboard.map((user) => (
                      <div 
                        key={user.rank}
                        className={`flex items-center justify-between p-3 rounded-lg ${
                          user.highlight ? 'bg-blue-50 border-2 border-blue-200 dark:bg-blue-900/20 dark:border-blue-600' : 'bg-gray-50 dark:bg-gray-700/50'
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
                            <div className="font-medium text-gray-800 dark:text-gray-200">{user.name}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">{user.scans} scans</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-green-600 dark:text-green-400">{user.co2Saved} kg</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">CO₂ saved</div>
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
                  ? 'bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200 dark:from-amber-900/20 dark:to-yellow-900/20 dark:border-amber-600' 
                  : 'bg-gray-50 border-gray-200 dark:bg-gray-700/50 dark:border-gray-600'
              }`}>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className={`p-2 rounded-full ${
                      achievement.earned ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-gray-200 text-gray-400 dark:bg-gray-600 dark:text-gray-500'
                    }`}>
                      <achievement.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className={`font-semibold ${
                        achievement.earned ? 'text-amber-800 dark:text-amber-200' : 'text-gray-600 dark:text-gray-400'
                      }`}>
                        {achievement.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{achievement.description}</p>
                    </div>
                  </div>
                  {achievement.earned ? (
                    <Badge className="bg-amber-500 hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-700">Earned</Badge>
                  ) : (
                    <div>
                      <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                        <span>Progress</span>
                        <span>{achievement.progress}/{achievement.target}</span>
                      </div>
                      <Progress value={(achievement.progress / achievement.target) * 100} className="h-2" />
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="goals">
          <Card className="bg-white/70 backdrop-blur-sm border-sage-200 dark:bg-gray-800/70 dark:border-gray-600">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="w-5 h-5" />
                <span className="text-gray-800 dark:text-gray-200">Personal Goals</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Weekly Scanning Goal</h3>
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <Progress value={(userStats.currentWeekScans / profile.goals.weeklyScans) * 100} />
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {userStats.currentWeekScans}/{profile.goals.weeklyScans}
                  </span>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Monthly Goal</h3>
                <p className="text-gray-600 dark:text-gray-400">{profile.goals.monthlyGoal}</p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Yearly Target</h3>
                <p className="text-gray-600 dark:text-gray-400">{profile.goals.yearlyTarget}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <div className="space-y-6">
            <Card className="bg-white/70 backdrop-blur-sm border-sage-200 dark:bg-gray-800/70 dark:border-gray-600">
              <CardHeader>
                <CardTitle className="text-gray-800 dark:text-gray-200">Notification Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 dark:text-gray-300">Email Notifications</span>
                  <input type="checkbox" defaultChecked={preferences.notifications.email} className="dark:bg-gray-700" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 dark:text-gray-300">Push Notifications</span>
                  <input type="checkbox" defaultChecked={preferences.notifications.push} className="dark:bg-gray-700" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 dark:text-gray-300">Weekly Reports</span>
                  <input type="checkbox" defaultChecked={preferences.notifications.weekly} className="dark:bg-gray-700" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 dark:text-gray-300">Achievement Alerts</span>
                  <input type="checkbox" defaultChecked={preferences.notifications.achievements} className="dark:bg-gray-700" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/70 backdrop-blur-sm border-sage-200 dark:bg-gray-800/70 dark:border-gray-600">
              <CardHeader>
                <CardTitle className="text-gray-800 dark:text-gray-200">Privacy Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 dark:text-gray-300">Public Profile</span>
                  <input type="checkbox" defaultChecked={preferences.privacy.profilePublic} className="dark:bg-gray-700" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 dark:text-gray-300">Show Statistics</span>
                  <input type="checkbox" defaultChecked={preferences.privacy.statsVisible} className="dark:bg-gray-700" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 dark:text-gray-300">Allow Messages</span>
                  <input type="checkbox" defaultChecked={preferences.privacy.allowMessages} className="dark:bg-gray-700" />
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
