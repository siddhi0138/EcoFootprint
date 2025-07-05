import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { db } from '../firebase';
import { useAuth } from './AuthContext';
import { collection, doc, onSnapshot, addDoc, updateDoc, query, orderBy, limit, getDocs } from 'firebase/firestore';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  timestamp: any;
  read: boolean;
  source: string;
  actionable?: boolean;
  action?: string;
  icon?: any;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  clearAllNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!currentUser) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    const userDocRef = doc(db, 'users', currentUser.uid);
    const notificationsCollectionRef = collection(userDocRef, 'notifications');

    const q = query(notificationsCollectionRef, orderBy('timestamp', 'desc'), limit(50));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifs: Notification[] = [];
      let unread = 0;
      snapshot.forEach(doc => {
        const data = doc.data() as Notification;
        notifs.push({ id: doc.id, ...data });
        if (!data.read) unread++;
      });
      setNotifications(notifs);
      setUnreadCount(unread);
    }, (error) => {
      console.error('Error fetching notifications from Firestore:', error);
      setNotifications([]);
      setUnreadCount(0);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const addNotification = async (notification: Omit<Notification, 'id' | 'timestamp'>) => {
    if (!currentUser) return;

    const userDocRef = doc(db, 'users', currentUser.uid);
    const notificationsCollectionRef = collection(userDocRef, 'notifications');

    try {
      await addDoc(notificationsCollectionRef, {
        ...notification,
        timestamp: new Date(),
        read: false,
      });
    } catch (error) {
      console.error('Error adding notification to Firestore:', error);
    }
  };

  const markAsRead = async (id: string) => {
    if (!currentUser) return;

    const userDocRef = doc(db, 'users', currentUser.uid);
    const notificationDocRef = doc(userDocRef, 'notifications', id);

    try {
      await updateDoc(notificationDocRef, { read: true });
    } catch (error) {
      console.error('Error marking notification as read in Firestore:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!currentUser) return;

    const userDocRef = doc(db, 'users', currentUser.uid);
    const notificationsCollectionRef = collection(userDocRef, 'notifications');

    try {
      const snapshot = await getDocs(notificationsCollectionRef);
      const batchPromises = snapshot.docs.map(doc => updateDoc(doc.ref, { read: true }));
      await Promise.all(batchPromises);
    } catch (error) {
      console.error('Error marking all notifications as read in Firestore:', error);
    }
  };

  const clearAllNotifications = async () => {
    if (!currentUser) return;

    const userDocRef = doc(db, 'users', currentUser.uid);
    const notificationsCollectionRef = collection(userDocRef, 'notifications');

    try {
      const snapshot = await getDocs(notificationsCollectionRef);
      const batchPromises = snapshot.docs.map(doc => doc.ref.delete());
      await Promise.all(batchPromises);
    } catch (error) {
      console.error('Error clearing all notifications in Firestore:', error);
    }
  };

  const value = {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearAllNotifications
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationProvider;
