import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, Award, TrendingUp, Users, AlertCircle, CheckCircle, Star, Leaf } from 'lucide-react';
import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  setDoc,
  updateDoc,
  query,
  orderBy,
  where,
  writeBatch,
} from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  timestamp: any;
  read: boolean;
  icon: any;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  earned: boolean;
  date?: any;
  progress?: number;
  total?: number;
  icon: any;
}

const NotificationCenter = () => {
  const { user } = useAuth();
  const [firebaseNotifications, setFirebaseNotifications] = useState<Notification[]>([]);
  const [firebaseAchievements, setFirebaseAchievements] = useState<Achievement[]>([]);

  // Fetch and listen for notifications
  useEffect(() => {
    if (!user) {
      setFirebaseNotifications([]);
      return;
    }

    const notificationsCollectionRef = collection(db, 'users', user.uid, 'notifications');
    const notificationsQuery = query(notificationsCollectionRef, orderBy('timestamp', 'desc'));

    const unsubscribeNotifications = onSnapshot(notificationsQuery, (snapshot) => {
      const fetchedNotifications = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data() as Notification,
      }));
      setFirebaseNotifications(fetchedNotifications);
    }, (error) => {
      console.error('Error fetching notifications:', error);
    });

    return () => unsubscribeNotifications();
  }, [user]);

  // Fetch and listen for achievements
  useEffect(() => {
    if (!user) {
      setFirebaseAchievements([]);
      return;
    }
    
    const achievementsCollectionRef = collection(db, 'users', user.uid, 'achievements');
    const achievementsQuery = query(achievementsCollectionRef, orderBy('id'));

    const unsubscribeAchievements = onSnapshot(achievementsQuery, (snapshot) => {
      const fetchedAchievements = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data() as Achievement,
      }));
      setFirebaseAchievements(fetchedAchievements);
    }, (error) => {
      console.error('Error fetching achievements:', error);
    });
    
    return () => unsubscribeAchievements();
  }, [user]);

  // Static achievements definition
  const achievementsDefinitions: Achievement[] = [
    {
      id: 'first-scan',
      name: 'First Scan',
      description: 'Completed your first product scan',
      icon: Star,
      earned: false,
    },
    {
      id: 'eco-warrior',
      name: 'Eco Warrior',
      description: 'Scanned 100 sustainable products',
      icon: Award,
      earned: false,
    },
    {
      id: 'carbon-saver',
      name: 'Carbon Saver',
      description: 'Saved 50kg of CO₂ through choices',
      icon: Leaf,
      earned: false,
    },
    {
      id: 'community-helper',
      name: 'Community Helper',
      description: 'Helped 10 community members',
      icon: Users,
      earned: false,
      total: 10,
    },
    {
      id: 'streak-master',
      name: 'Streak Master',
      description: 'Maintain a 30-day scanning streak',
      icon: TrendingUp,
      earned: false,
      total: 30,
    },
  ];

  // Function to mark a specific notification as read
  const markAsRead = async (id: string) => {
    if (!user) return;
    
    const notificationRef = doc(db, 'users', user.uid, 'notifications', id);
    await updateDoc(notificationRef, {
      read: true,
    });
  };

  // Function to mark all unread notifications as read
  const markAllAsRead = async () => {
    if (!user) return;
    
    const batch = writeBatch(db);
    const notificationsCollectionRef = collection(db, 'users', user.uid, 'notifications');
    const unreadNotificationsQuery = query(notificationsCollectionRef, where('read', '==', false));

    const snapshot = await getDocs(unreadNotificationsQuery);
    snapshot.docs.forEach((docSnap) => {
      const notificationRef = doc(db, 'users', user.uid, 'notifications', docSnap.id);
      batch.update(notificationRef, {
        read: true,
      });
    });

    await batch.commit();
  };

  // Helper function to get color classes based on notification type
  const getTypeColor = (type: string) => {
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

  // Helper to combine static achievement definition with user's progress from Firebase
  const getAchievementStatus = (achievementId: string) => {
    const definition = achievementsDefinitions.find(def => def.id === achievementId);
    const achievement = firebaseAchievements.find(a => a.id === achievementId);

    return {
      ...(definition as Achievement),
      earned: achievement?.earned || false,
      date: achievement?.date,
      progress: achievement?.progress,
      total: definition?.total,
    };
  };

  // Calculate unread notification count
  const unreadCount = firebaseNotifications.filter(n => !n.read).length;

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Bell className="w-6 h-6 text-blue-600" />
              <span>Notification Center</span>
              {unreadCount > 0 && (
                <Badge className="bg-red-500 hover:bg-red-600 ml-2">
                  {unreadCount}
                </Badge>
              )}
            </CardTitle>
          </div>
          <div className="flex items-center justify-between w-full">
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
          {firebaseNotifications.map((notification) => (
            <Card
              key={`notification-${notification.id}`}
              className={`transition-all duration-300 hover:shadow-lg cursor-pointer ${!notification.read ? 'bg-white border-l-4 border-l-blue-500' : 'bg-gray-50'}`}
              onClick={() => markAsRead(notification.id)}
            >
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className={`p-2 rounded-full ${getTypeColor(notification.type)}`}>
                    {notification.type === 'achievement' && <Award className="w-5 h-5" />}
                    {notification.type === 'alert' && <AlertCircle className="w-5 h-5" />}
                    {notification.type === 'community' && <Users className="w-5 h-5" />}
                    {notification.type === 'trending' && <TrendingUp className="w-5 h-5" />}
                    {notification.type === 'goal' && <CheckCircle className="w-5 h-5" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className={`font-semibold ${!notification.read ? 'text-gray-900' : 'text-gray-600'}`}>
                        {notification.title}
                      </h3>
                      <span className="text-xs text-gray-500">
                        {notification.timestamp?.toDate().toLocaleString() || 'Loading...'}
                      </span>
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
        </TabsContent>

        <TabsContent value="achievements">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {achievementsDefinitions.map((definition) => {
              const achievement = getAchievementStatus(definition.id);
              return (
                <Card 
                  key={achievement.id} 
                  className={`transition-all duration-300 hover:shadow-lg ${
                    achievement.earned ? 'bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200' : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className={`p-3 rounded-full ${
                        achievement.earned
                          ? 'bg-amber-100 text-amber-600'
                          : 'bg-gray-200 text-gray-400'
                      }`}>
                        {achievement.icon && <achievement.icon className="w-6 h-6" />}
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
                          <p className="text-xs text-amber-600">
                            Earned on {achievement.date?.toDate().toLocaleDateString()}
                          </p>
                        ) : (
                          <>
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-xs text-gray-600">Progress</span>
                              <span className="text-xs text-gray-600">
                                {achievement.progress || 0}/{achievement.total || 'N/A'}
                              </span>
                            </div>
                            {achievement.total && achievement.total > 0 && (
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className="h-2 bg-green-500 rounded-full"
                                  style={{ width: `${((achievement.progress || 0) / achievement.total) * 100}%` }}
                                ></div>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NotificationCenter;