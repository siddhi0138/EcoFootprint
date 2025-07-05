import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useToast } from '../hooks/use-toast';
import { useUserData } from '../contexts/UserDataContext';
import { useNotifications } from '../contexts/NotificationsContextNew';
import { Star, Award, Leaf, BookOpen, Target, Users, Zap, Bell, ShoppingCart } from 'lucide-react';

const NotificationCenter = () => {
  const { userStats } = useUserData();
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    clearAllNotifications 
  } = useNotifications();
  const { toast } = useToast();

  const handleNotificationAction = (notification) => {
    markAsRead(notification.id);
    
    // Handle different notification actions
    switch (notification.source) {
      case 'education':
        toast({
          title: "Redirecting to Education Center",
          description: "Continue your learning journey!",
        });
        break;
      case 'marketplace':
        toast({
          title: "Opening Marketplace",
          description: "Discover new sustainable products!",
        });
        break;
      case 'scanner':
        toast({
          title: "Opening Product Scanner",
          description: "Scan more products to track your impact!",
        });
        break;
      case 'community':
        toast({
          title: "Opening Community Hub",
          description: "Connect with fellow eco-enthusiasts!",
        });
        break;
      case 'carbon':
        toast({
          title: "Opening Carbon Tracker",
          description: "View your environmental impact!",
        });
        break;
      case 'recipes':
        toast({
          title: "Opening Recipe Finder",
          description: "Discover sustainable recipes!",
        });
        break;
      case 'challenges':
        toast({
          title: "Opening Challenges",
          description: "Join the sustainability challenge!",
        });
        break;
      case 'investment':
        toast({
          title: "Opening Investment Tracker",
          description: "Check your ESG portfolio performance!",
        });
        break;
      default:
        toast({
          title: "Action completed",
          description: "Thank you for staying engaged!",
        });
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'achievement':
        return 'bg-amber-50 border-amber-200 text-amber-800';
      case 'shopping':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'environmental':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'community':
        return 'bg-purple-50 border-purple-200 text-purple-800';
      case 'suggestion':
        return 'bg-indigo-50 border-indigo-200 text-indigo-800';
      case 'challenge':
        return 'bg-orange-50 border-orange-200 text-orange-800';
      case 'tip':
        return 'bg-teal-50 border-teal-200 text-teal-800';
      case 'investment':
        return 'bg-teal-50 border-teal-200 text-teal-800';
      case 'investment':
        return 'bg-emerald-50 border-emerald-200 text-emerald-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'scanning':
        return 'bg-blue-100 text-blue-700';
      case 'environmental':
        return 'bg-green-100 text-green-700';
      case 'education':
        return 'bg-purple-100 text-purple-700';
      case 'recipes':
        return 'bg-orange-100 text-orange-700';
      case 'community':
        return 'bg-pink-100 text-pink-700';
      case 'engagement':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  // Generate achievements based on user stats
  const achievements = [
    {
      id: 1,
      name: 'First Scan',
      description: 'Completed your first product scan',
      earned: userStats.totalScans >= 1,
      date: '2024-06-01',
      icon: Star,
      category: 'scanning'
    },
    {
      id: 2,
      name: 'Eco Explorer',
      description: 'Scanned 10 sustainable products',
      earned: userStats.totalScans >= 10,
      date: userStats.totalScans >= 10 ? '2024-06-15' : null,
      progress: Math.min(userStats.totalScans, 10),
      total: 10,
      icon: Award,
      category: 'scanning'
    },
    {
      id: 3,
      name: 'Carbon Saver',
      description: 'Saved 10kg of CO₂ through choices',
      earned: (userStats.totalScans * 0.5) >= 10,
      date: (userStats.totalScans * 0.5) >= 10 ? '2024-06-10' : null,
      progress: Math.min(userStats.totalScans * 0.5, 10),
      total: 10,
      icon: Leaf,
      category: 'environmental'
    },
    {
      id: 4,
      name: 'Learning Champion',
      description: 'Completed your first course',
      earned: userStats.coursesCompleted >= 1,
      date: userStats.coursesCompleted >= 1 ? '2024-06-20' : null,
      icon: BookOpen,
      category: 'education'
    },
    {
      id: 5,
      name: 'Sustainability Scholar',
      description: 'Completed 3 courses',
      earned: userStats.coursesCompleted >= 3,
      date: userStats.coursesCompleted >= 3 ? '2024-06-25' : null,
      progress: Math.min(userStats.coursesCompleted, 3),
      total: 3,
      icon: BookOpen,
      category: 'education'
    },
    {
      id: 6,
      name: 'Recipe Explorer',
      description: 'Viewed 5 eco-friendly recipes',
      earned: userStats.recipesViewed >= 5,
      date: userStats.recipesViewed >= 5 ? '2024-06-18' : null,
      progress: Math.min(userStats.recipesViewed, 5),
      total: 5,
      icon: Target,
      category: 'recipes'
    },
    {
      id: 7,
      name: 'Community Helper',
      description: 'Helped 5 community members',
      earned: false,
      progress: 0,
      total: 5,
      icon: Users,
      category: 'community'
    },
    {
      id: 8,
      name: 'Streak Master',
      description: 'Maintain a 7-day activity streak',
      earned: false,
      progress: 5,
      total: 7,
      icon: Zap,
      category: 'engagement'
    }
  ];

  const earnedAchievements = achievements.filter(a => a.earned).length;

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bell className="w-6 h-6 text-blue-600" />
            <span>Notification Center</span>
            {unreadCount > 0 && (
              <Badge className="bg-red-500 hover:bg-red-600 ml-2">
                {unreadCount}
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center justify-between">
            <p className="text-gray-600">Stay updated with your eco journey</p>
            <div className="flex space-x-2">
              {unreadCount > 0 && (
                <Button variant="outline" size="sm" onClick={markAllAsRead}>
                  Mark All Read
                </Button>
              )}
              {notifications.length > 0 && (
                <Button variant="outline" size="sm" onClick={clearAllNotifications}>
                  Clear All
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="text-center p-4">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <ShoppingCart className="w-5 h-5 text-blue-600" />
            <span className="font-semibold text-2xl text-blue-600">{userStats.totalScans}</span>
          </div>
          <p className="text-sm text-gray-600">Products Scanned</p>
        </Card>
        <Card className="text-center p-4">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <BookOpen className="w-5 h-5 text-purple-600" />
            <span className="font-semibold text-2xl text-purple-600">{userStats.coursesCompleted}</span>
          </div>
          <p className="text-sm text-gray-600">Courses Completed</p>
        </Card>
        <Card className="text-center p-4">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Target className="w-5 h-5 text-orange-600" />
            <span className="font-semibold text-2xl text-orange-600">{userStats.recipesViewed}</span>
          </div>
          <p className="text-sm text-gray-600">Recipes Viewed</p>
        </Card>
        <Card className="text-center p-4">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Award className="w-5 h-5 text-amber-600" />
            <span className="font-semibold text-2xl text-amber-600">{earnedAchievements}</span>
          </div>
          <p className="text-sm text-gray-600">Achievements Earned</p>
        </Card>
      </div>

      <Tabs defaultValue="notifications" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="notifications">
            Notifications
            {unreadCount > 0 && (
              <Badge className="ml-2 bg-red-500 text-white text-xs">
                {unreadCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="achievements">
            Achievements
            <Badge className="ml-2 bg-amber-500 text-white text-xs">
              {earnedAchievements}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="notifications">
          <div className="space-y-4">
            {notifications.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">No notifications yet</h3>
                  <p className="text-gray-500">Start using the app to receive notifications about your eco journey!</p>
                </CardContent>
              </Card>
            ) : (
              notifications.map((notification) => (
                <Card 
                  key={notification.id} 
                  className={`transition-all duration-300 hover:shadow-lg cursor-pointer ${
                    !notification.read ? 'bg-white border-l-4 border-l-blue-500 shadow-sm' : 'bg-gray-50'
                  }`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className={`p-2 rounded-full ${getTypeColor(notification.type)}`}>
                        {notification.icon ? (
                          <notification.icon className="w-5 h-5" />
                        ) : (
                          <Bell className="w-5 h-5" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className={`font-semibold ${!notification.read ? 'text-gray-900' : 'text-gray-600'}`}>
                            {notification.title}
                          </h3>
                          <div className="flex items-center space-x-2">
<span className="text-xs text-gray-500">
  {notification.timestamp
    ? typeof notification.timestamp.toDate === 'function'
      ? notification.timestamp.toDate().toLocaleString()
      : notification.timestamp.seconds
      ? new Date(notification.timestamp.seconds * 1000).toLocaleString()
      : String(notification.timestamp)
    : ''}
</span>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            )}
                          </div>
                        </div>
                        <p className={`text-sm ${!notification.read ? 'text-gray-700' : 'text-gray-500'} mb-3`}>
                          {notification.message}
                        </p>
                        {notification.actionable && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleNotificationAction(notification);
                            }}
                          >
                            {notification.action}
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="achievements">
          <div className="space-y-6">
            {/* Achievement Categories */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {['scanning', 'environmental', 'education', 'community'].map((category) => {
                const categoryAchievements = achievements.filter(a => a.category === category);
                const earned = categoryAchievements.filter(a => a.earned).length;
                return (
                  <Card key={category} className="text-center p-4">
                    <Badge className={`mb-2 ${getCategoryColor(category)}`}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </Badge>
                    <p className="text-sm text-gray-600">{earned}/{categoryAchievements.length} Earned</p>
                  </Card>
                );
              })}
            </div>

            {/* Achievement Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {achievements.map((achievement) => (
                <Card key={achievement.id} className={`transition-all duration-300 hover:shadow-lg ${
                  achievement.earned ? 'bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200' : 'bg-gray-50 border-gray-200'
                }`}>
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className={`p-3 rounded-full ${
                        achievement.earned 
                          ? 'bg-amber-100 text-amber-600' 
                          : 'bg-gray-200 text-gray-400'
                      }`}>
                        <achievement.icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className={`font-semibold ${
                            achievement.earned ? 'text-amber-800' : 'text-gray-600'
                          }`}>
                            {achievement.name}
                          </h3>
                          <div className="flex items-center space-x-2">
                            {achievement.earned && (
                              <Badge className="bg-amber-500 hover:bg-amber-600">
                                Earned!
                              </Badge>
                            )}
                            <Badge className={getCategoryColor(achievement.category)}>
                              {achievement.category}
                            </Badge>
                          </div>
                        </div>
                        <p className={`text-sm ${
                          achievement.earned ? 'text-amber-700' : 'text-gray-500'
                        } mb-3`}>
                          {achievement.description}
                        </p>
                        {achievement.earned ? (
                          <p className="text-xs text-amber-600">Earned on {achievement.date}</p>
                        ) : achievement.progress !== undefined ? (
                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-xs text-gray-600">Progress</span>
                              <span className="text-xs text-gray-600">
                                {Math.round(achievement.progress)}/{achievement.total}
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${Math.min((achievement.progress / achievement.total) * 100, 100)}%` }}
                              ></div>
                            </div>
                          </div>
                        ) : (
                          <p className="text-xs text-gray-500">Complete the required actions to unlock</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NotificationCenter;
