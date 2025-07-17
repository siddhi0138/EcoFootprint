import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { db } from '../firebase';
import { writeBatch } from 'firebase/firestore';
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
  loading: boolean;
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
  const [loading, setLoading] = useState(true);

  const { isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) {
      // Auth state is still loading, do not clear notifications yet
      setLoading(true);
      return;
    }
    if (!currentUser) {
      console.info('No currentUser found in NotificationsContextNew, clearing notifications.');
      setNotifications([]);
      setUnreadCount(0);
      return;
    }
    setLoading(true);

    console.log('Setting up notifications listener for user:', currentUser.uid);

    let unsubscribe: (() => void) | undefined;

    const fetchAndListen = async () => {
      const userDocRef = doc(db, 'users', currentUser.uid);
      const notificationsCollectionRef = collection(userDocRef, 'notifications');

      const q = query(notificationsCollectionRef, orderBy('timestamp', 'desc'), limit(50));

      try {
        // First, fetch the initial data
        const initialSnapshot = await getDocs(q);
        const initialNotifs: Notification[] = [];
        let initialUnread = 0;
        initialSnapshot.forEach(doc => {
          const data = doc.data() as Notification;
          initialNotifs.push({ id: doc.id, ...data });
          if (!data.read) initialUnread++;
        });
        setNotifications(initialNotifs);
        setUnreadCount(initialUnread);
        setLoading(false); // Set loading to false after initial fetch

        // Then, set up the real-time listener
        unsubscribe = onSnapshot(q, (snapshot) => {
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
        if (error.code === 'permission-denied') {
          console.warn('Firestore permission denied for notifications:', error.message);
            // Optionally clear notifications on permission error
            setNotifications([]);
            setUnreadCount(0);
        } else {
          console.error('Error fetching notifications from Firestore:', error);
        }
      });
    } catch (error) {
      console.error('Unexpected error setting up notifications listener:', error);
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false); // Set loading to false on error
    }
    };

    fetchAndListen();
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [currentUser, isLoading]);

  const addNotification = async (notification: Omit<Notification, 'id' | 'timestamp'>) => {
    if (!currentUser) return;

    const userDocRef = doc(db, 'users', currentUser.uid);
    const notificationsCollectionRef = collection(userDocRef, 'notifications');

    // Sanitize notification object to exclude unsupported fields like icon
    const { icon, ...sanitizedNotification } = notification;

    try {
      await addDoc(notificationsCollectionRef, {
        ...sanitizedNotification,
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
      // Import writeBatch from firebase/firestore and use it here
    
      const batch = writeBatch(db);
      snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });
      await batch.commit();
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
    clearAllNotifications,
    loading
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationProvider;
