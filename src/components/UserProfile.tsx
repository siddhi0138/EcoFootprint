
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button'; // Import Button
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useUserData } from '@/contexts/UserDataContext';
import { useToast } from '@/hooks/use-toast';
import { uploadProductImage } from '@/services/visionApi';
import { API_BASE_URL } from '@/services/api';
import {
  User,
  Target,
  Star,
  Edit,
  Save,
  Camera,
  LogOut,
  Bell,
  Lock,
  ShoppingCart,
  TrendingDown,
  Recycle,
  Gift,
  ArrowRight
} from 'lucide-react';
import { db } from '../firebase'; // Import db
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const UserProfile = () => {
  const { user, logout } = useAuth();
  const { userStats, carbonEntries, scannedProducts } = useUserData();
  const { toast } = useToast();
  const navigate = useNavigate();
 const [isEditing, setIsEditing] = useState(false);
 const [avatarUrl, setAvatarUrl] = useState<string>('');
 const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
 const avatarInputRef = React.useRef<HTMLInputElement>(null);
 const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    location: '',
    bio: '',
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

        // User stats initialization and syncing is owned entirely by UserDataProvider's
        // snapshot listener (including new-user defaults) - a second independent init here
        // raced it with different default values (notably totalPoints: 150 vs the real
        // default of 0), corrupting new users' starting stats depending on which write won.
      }
   };
    fetchUserProfile();
 }, [user]); // Removed setUserStats from the dependency array as it's not directly used here

  // Real last-6-months aggregation from the user's actual scans and carbon entries,
  // rather than fabricated offsets from the current totals.
  const MONTH_NAMES_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const generateMonthlyActivityData = () => {
    const now = new Date();
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const target = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const scans = scannedProducts.filter((p) => {
        const d = new Date(p.date);
        return d.getMonth() === target.getMonth() && d.getFullYear() === target.getFullYear();
      }).length;
      const co2Saved = carbonEntries
        .filter((e) => {
          const d = new Date(e.date);
          return d.getMonth() === target.getMonth() && d.getFullYear() === target.getFullYear();
        })
        .reduce((sum, e) => sum + (e.amount || 0), 0);
      months.push({ month: MONTH_NAMES_SHORT[target.getMonth()], scans, co2Saved: parseFloat(co2Saved.toFixed(1)) });
    }
    return months;
  };
  const monthlyData = generateMonthlyActivityData();

  const [preferences, setPreferences] = React.useState({
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
  });

  // Load preferences from user data on mount
  React.useEffect(() => {
    const fetchPreferences = async () => {
      if (user) {
        const userDocRef = doc(db, 'users', user.id);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          if (userData.preferences) {
            setPreferences(userData.preferences);
          }
          if (userData.avatarUrl) {
            setAvatarUrl(userData.avatarUrl);
          }
        }
      }
    };
    fetchPreferences();
  }, [user]);

  const handleAvatarSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (!file.type.startsWith('image/')) {
      toast({ title: 'Invalid file', description: 'Please choose an image.', variant: 'destructive' });
      return;
    }
    setIsUploadingAvatar(true);
    try {
      const { url } = await uploadProductImage(file);
      const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;
      setAvatarUrl(fullUrl);
      await setDoc(doc(db, 'users', user.id), { avatarUrl: fullUrl }, { merge: true });
      toast({ title: 'Profile photo updated' });
    } catch (err) {
      console.error('Avatar upload failed:', err);
      toast({ title: 'Upload failed', description: 'Could not upload your photo. Please try again.', variant: 'destructive' });
    } finally {
      setIsUploadingAvatar(false);
      if (avatarInputRef.current) avatarInputRef.current.value = '';
    }
  };

  const toggleNotificationPref = (key) => {
    setPreferences((prev) => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: !prev.notifications[key]
      }
    }));
  };

  const togglePrivacyPref = (key) => {
    setPreferences((prev) => ({
      ...prev,
      privacy: {
        ...prev.privacy,
        [key]: !prev.privacy[key]
      }
    }));
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
          preferences: preferences
        }, { merge: true });
        toast({ title: 'Saved', description: 'Your profile and settings were updated.' });
      } catch (error) {
        console.error('Error updating profile:', error);
        toast({ title: 'Save failed', description: 'Could not save your changes. Please try again.', variant: 'destructive' });
      }
    } else {
      toast({ title: 'Not logged in', description: 'Please log in to save your profile.', variant: 'destructive' });
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
      <Card className="bg-white border border-gray-200 shadow-lg rounded-2xl dark:bg-gray-900 dark:border-gray-700">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center justify-between text-slate-800 dark:text-slate-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-emerald-600 dark:bg-emerald-600 rounded-xl flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold">User Profile</span>
                <p className="text-sm text-slate-600 dark:text-slate-400 font-normal">Manage your account, preferences and goals</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="border-red-300 text-red-600 hover:bg-red-50 dark:border-red-600 dark:text-red-400 dark:hover:bg-red-900/20"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </CardTitle>
        </CardHeader>
      </Card>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 bg-white/60 dark:bg-gray-800/60">
          <TabsTrigger value="profile" className="dark:text-gray-300 dark:data-[state=active]:bg-emerald-600 dark:data-[state=active]:text-white">Profile</TabsTrigger>
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
                  <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full flex items-center justify-center overflow-hidden">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-10 h-10 text-white" />
                    )}
                  </div>
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarSelect}
                  />
                  <Button
                    size="sm"
                    onClick={() => avatarInputRef.current?.click()}
                    disabled={isUploadingAvatar}
                    className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
                    aria-label="Change profile photo"
                  >
                    <Camera className="w-4 h-4" />
                  </Button>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">{profile.name}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{profile.location || 'Location not set'}</p>
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
                  <p className="text-gray-900 dark:text-gray-200">{profile.email}</p>
                  {isEditing && (
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Email is tied to your sign-in account and can't be changed here.</p>
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
                    <p className="text-gray-900 dark:text-gray-200">{profile.location || 'Not set'}</p>
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
                    <p className="text-gray-900 dark:text-gray-200">{profile.bio || 'No bio yet — click Edit to add one.'}</p>
                  )}
                </div>
              </div>

              <div className="pt-2">
                <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center">
                  <Target className="w-4 h-4 mr-2 text-emerald-600 dark:text-emerald-400" />
                  Sustainability Goals
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Weekly Scan Goal</label>
                    {isEditing ? (
                      <Input
                        type="number"
                        min={0}
                        value={profile.goals.weeklyScans}
                        onChange={(e) => setProfile({ ...profile, goals: { ...profile.goals, weeklyScans: Number(e.target.value) || 0 } })}
                        className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                      />
                    ) : (
                      <p className="text-gray-900 dark:text-gray-200">{profile.goals.weeklyScans} scans/week</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Monthly Goal</label>
                    {isEditing ? (
                      <Input
                        value={profile.goals.monthlyGoal}
                        onChange={(e) => setProfile({ ...profile, goals: { ...profile.goals, monthlyGoal: e.target.value } })}
                        className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                      />
                    ) : (
                      <p className="text-gray-900 dark:text-gray-200">{profile.goals.monthlyGoal}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Yearly Target</label>
                    {isEditing ? (
                      <Input
                        value={profile.goals.yearlyTarget}
                        onChange={(e) => setProfile({ ...profile, goals: { ...profile.goals, yearlyTarget: e.target.value } })}
                        className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                      />
                    ) : (
                      <p className="text-gray-900 dark:text-gray-200">{profile.goals.yearlyTarget}</p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <div className="space-y-6">
            {/* Notification Preferences Section */}
            <Card className="bg-white/70 backdrop-blur-sm border-sage-200 dark:bg-gray-800/70 dark:border-gray-600">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-gray-800 dark:text-gray-200">
                  <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <span>Notification Preferences</span>
                </CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-400">Manage how you receive updates and alerts.</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(preferences.notifications).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between p-3 border rounded-md dark:border-gray-700">
                      <div>
                        <span className="capitalize font-medium text-gray-700 dark:text-gray-300">{key.replace(/([A-Z])/g, ' $1')}</span>
                        {key === 'email' && <p className="text-xs text-gray-500 dark:text-gray-400">Receive updates via email.</p>}
                        {key === 'push' && <p className="text-xs text-gray-500 dark:text-gray-400">Receive real-time notifications on your device.</p>}
                        {key === 'weekly' && <p className="text-xs text-gray-500 dark:text-gray-400">Get a weekly summary of your progress.</p>}
                        {key === 'achievements' && <p className="text-xs text-gray-500 dark:text-gray-400">Be notified when you unlock new achievements.</p>}
                      </div>
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={() => toggleNotificationPref(key)}
                        className="form-checkbox h-5 w-5 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500 dark:bg-gray-700 dark:border-gray-600 dark:checked:bg-emerald-600 dark:focus:ring-emerald-600"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Privacy Settings Section */}
            <Card className="bg-white/70 backdrop-blur-sm border-sage-200 dark:bg-gray-800/70 dark:border-gray-600">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-gray-800 dark:text-gray-200">
                  <Lock className="w-5 h-5 text-red-600 dark:text-red-400" />
                  <span>Privacy Settings</span>
                </CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-400">Control the visibility of your profile and activities.</p>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(preferences.privacy).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between p-3 border rounded-md dark:border-gray-700">
                    <div>
                      <span className="capitalize font-medium text-gray-700 dark:text-gray-300">{key.replace(/([A-Z])/g, ' $1')}</span>
                      {key === 'profilePublic' && <p className="text-xs text-gray-500 dark:text-gray-400">Make your profile visible to other users.</p>}
                      {key === 'statsVisible' && <p className="text-xs text-gray-500 dark:text-gray-400">Show your statistics (total scans, CO₂ saved, etc.) publicly.</p>}
                      {key === 'allowMessages' && <p className="text-xs text-gray-500 dark:text-gray-400">Allow other users to send you messages.</p>}
                    </div>
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={() => togglePrivacyPref(key)}
                      className="form-checkbox h-5 w-5 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500 dark:bg-gray-700 dark:border-gray-600 dark:checked:bg-emerald-600 dark:focus:ring-emerald-600"
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-700 dark:hover:bg-emerald-800">
                Save Settings
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserProfile;
