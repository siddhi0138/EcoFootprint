
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, Award, TrendingUp, Users, AlertCircle, CheckCircle, Star, Leaf } from 'lucide-react';

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'achievement',
      title: 'New Badge Earned!',
      message: 'You earned the "Eco Warrior" badge for scanning 100 sustainable products.',
      timestamp: '2 hours ago',
      read: false,
      icon: Award
    },
    {
      id: 2,
      type: 'alert',
      title: 'Product Recall Alert',
      message: 'A product you scanned last week has been recalled due to sustainability concerns.',
      timestamp: '5 hours ago',
      read: false,
      icon: AlertCircle
    },
    {
      id: 3,
      type: 'community',
      title: 'New Community Post',
      message: 'EcoEnthusiast shared a review of the bamboo toothbrush you scanned.',
      timestamp: '1 day ago',
      read: true,
      icon: Users
    },
    {
      id: 4,
      type: 'trending',
      title: 'Trending Now',
      message: 'Solar-powered chargers are trending in your area. Check them out!',
      timestamp: '2 days ago',
      read: true,
      icon: TrendingUp
    },
    {
      id: 5,
      type: 'goal',
      title: 'Weekly Goal Achieved',
      message: 'Congratulations! You completed your weekly scanning goal.',
      timestamp: '3 days ago',
      read: true,
      icon: CheckCircle
    }
  ]);

  const achievements = [
    {
      id: 1,
      name: 'First Scan',
      description: 'Completed your first product scan',
      earned: true,
      date: '2024-06-01',
      icon: Star
    },
    {
      id: 2,
      name: 'Eco Warrior',
      description: 'Scanned 100 sustainable products',
      earned: true,
      date: '2024-06-15',
      icon: Award
    },
    {
      id: 3,
      name: 'Carbon Saver',
      description: 'Saved 50kg of CO₂ through choices',
      earned: true,
      date: '2024-06-10',
      icon: Leaf
    },
    {
      id: 4,
      name: 'Community Helper',
      description: 'Helped 10 community members',
      earned: false,
      progress: 7,
      total: 10,
      icon: Users
    },
    {
      id: 5,
      name: 'Streak Master',
      description: 'Maintain a 30-day scanning streak',
      earned: false,
      progress: 12,
      total: 30,
      icon: TrendingUp
    }
  ];

  const markAsRead = (id) => {
    setNotifications(notifications.map(notif => 
      notif.id === id ? { ...notif, read: true } : notif
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(notif => ({ ...notif, read: true })));
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'achievement':
        return 'bg-amber-50 border-amber-200 text-amber-800';
      case 'alert':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'community':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'trending':
        return 'bg-purple-50 border-purple-200 text-purple-800';
      case 'goal':
        return 'bg-green-50 border-green-200 text-green-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

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
            {unreadCount > 0 && (
              <Button variant="outline" size="sm" onClick={markAllAsRead}>
                Mark All Read
              </Button>
            )}
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="notifications" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
        </TabsList>

        <TabsContent value="notifications">
          <div className="space-y-4">
            {notifications.map((notification) => (
              <Card 
                key={notification.id} 
                className={`transition-all duration-300 hover:shadow-lg cursor-pointer ${
                  !notification.read ? 'bg-white border-l-4 border-l-blue-500' : 'bg-gray-50'
                }`}
                onClick={() => markAsRead(notification.id)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className={`p-2 rounded-full ${getTypeColor(notification.type)}`}>
                      <notification.icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className={`font-semibold ${!notification.read ? 'text-gray-900' : 'text-gray-600'}`}>
                          {notification.title}
                        </h3>
                        <span className="text-xs text-gray-500">{notification.timestamp}</span>
                      </div>
                      <p className={`text-sm ${!notification.read ? 'text-gray-700' : 'text-gray-500'}`}>
                        {notification.message}
                      </p>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="achievements">
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
                        {achievement.earned && (
                          <Badge className="bg-amber-500 hover:bg-amber-600">
                            Earned
                          </Badge>
                        )}
                      </div>
                      <p className={`text-sm ${
                        achievement.earned ? 'text-amber-700' : 'text-gray-500'
                      } mb-3`}>
                        {achievement.description}
                      </p>
                      {achievement.earned ? (
                        <p className="text-xs text-amber-600">Earned on {achievement.date}</p>
                      ) : (
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-xs text-gray-600">Progress</span>
                            <span className="text-xs text-gray-600">
                              {achievement.progress}/{achievement.total}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${(achievement.progress / achievement.total) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
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

export default NotificationCenter;
