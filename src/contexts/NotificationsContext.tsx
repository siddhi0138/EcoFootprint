
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getStoredNotifications, saveNotification, markNotificationAsRead, getUnreadCount } from '@/utils/notificationUtils';

interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  source: string;
  actionable?: boolean;
  action?: string;
  icon?: any;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  markAsRead: (id: number) => void;
  markAllAsRead: () => void;
  clearAllNotifications: () => void;
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
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Load notifications from localStorage on mount
    const storedNotifications = getStoredNotifications();
    setNotifications(storedNotifications);
    setUnreadCount(getUnreadCount());
  }, []);

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now(),
      timestamp: 'Just now'
    };

    // Add to state
    setNotifications(prev => [newNotification, ...prev.slice(0, 49)]);
    setUnreadCount(prev => prev + 1);

    // Save to localStorage
    saveNotification(newNotification);
  };

  const markAsRead = (id: number) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
    
    // Update unread count
    setUnreadCount(prev => Math.max(0, prev - 1));
    
    // Update localStorage
    markNotificationAsRead(id);
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
    setUnreadCount(0);

    // Update localStorage
    const updatedNotifications = notifications.map(n => ({ ...n, read: true }));
    localStorage.setItem('eco_notifications', JSON.stringify(updatedNotifications));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
    localStorage.removeItem('eco_notifications');
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
