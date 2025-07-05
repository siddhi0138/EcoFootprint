
// Utility functions for generating cross-page notifications

export const generateScannerNotification = (productName: string, sustainabilityScore: number) => {
    return {
      id: Date.now(),
      type: 'achievement',
      title: 'Product Scanned Successfully!',
      message: `You scanned "${productName}" with a sustainability score of ${sustainabilityScore}/100. Keep scanning to track your environmental impact!`,
      timestamp: 'Just now',
      read: false,
      source: 'scanner',
      actionable: true,
      action: 'View Similar Products'
    };
  };
  
  export const generateCourseNotification = (courseName: string, progress: number) => {
    return {
      id: Date.now(),
      type: 'education',
      title: progress === 100 ? 'Course Completed!' : 'Course Progress Update',
      message: progress === 100 
        ? `Congratulations! You've completed "${courseName}". You earned a new achievement badge!`
        : `You're ${progress}% through "${courseName}". Keep learning!`,
      timestamp: 'Just now',
      read: false,
      source: 'education',
      actionable: true,
      action: progress === 100 ? 'View Certificate' : 'Continue Learning'
    };
  };
  
  export const generateCommunityNotification = (action: string, count: number) => {
    return {
      id: Date.now(),
      type: 'community',
      title: 'Community Engagement',
      message: `Your ${action} received ${count} interactions from the community! Keep sharing your sustainable journey.`,
      timestamp: 'Just now',
      read: false,
      source: 'community',
      actionable: true,
      action: 'View Community'
    };
  };
  
  export const generateMarketplaceNotification = (productName: string, category: string) => {
    return {
      id: Date.now(),
      type: 'shopping',
      title: 'Product Added to Wishlist',
      message: `"${productName}" from the ${category} category has been saved to your wishlist.`,
      timestamp: 'Just now',
      read: false,
      source: 'marketplace',
      actionable: true,
      action: 'View Wishlist'
    };
  };
  
  export const generateRecipeNotification = (recipeName: string, category: string) => {
    return {
      id: Date.now(),
      type: 'suggestion',
      title: 'Recipe Saved Successfully',
      message: `"${recipeName}" (${category}) has been added to your saved recipes collection.`,
      timestamp: 'Just now',
      read: false,
      source: 'recipes',
      actionable: true,
      action: 'View Saved Recipes'
    };
  };
  
  export const generateCarbonNotification = (carbonSaved: number, action: string) => {
    return {
      id: Date.now(),
      type: 'environmental',
      title: 'Carbon Footprint Reduced!',
      message: `Great job! Your ${action} helped save approximately ${carbonSaved.toFixed(1)}kg of CO₂. Every action counts!`,
      timestamp: 'Just now',
      read: false,
      source: 'carbon',
      actionable: true,
      action: 'View Carbon Stats'
    };
  };
  
  export const generateAchievementNotification = (achievementName: string, description: string) => {
    return {
      id: Date.now(),
      type: 'achievement',
      title: 'New Achievement Unlocked! 🏆',
      message: `You earned the "${achievementName}" badge! ${description}`,
      timestamp: 'Just now',
      read: false,
      source: 'achievements',
      actionable: true,
      action: 'View All Achievements'
    };
  };
  
  export const generateChallengeNotification = (challengeName: string, status: 'joined' | 'completed' | 'reminder') => {
    const messages = {
      joined: `You've joined the "${challengeName}" challenge! Check your progress and compete with others.`,
      completed: `Congratulations! You've completed the "${challengeName}" challenge and earned bonus points!`,
      reminder: `Don't forget about the "${challengeName}" challenge! You have 3 days left to complete it.`
    };
  
    return {
      id: Date.now(),
      type: 'challenge',
      title: status === 'completed' ? 'Challenge Completed!' : status === 'joined' ? 'Challenge Joined!' : 'Challenge Reminder',
      message: messages[status],
      timestamp: 'Just now',
      read: false,
      source: 'challenges',
      actionable: true,
      action: status === 'completed' ? 'View Rewards' : 'View Challenge'
    };
  };
  
  // Notification storage utilities
  export const saveNotification = (notification: any) => {
    const existingNotifications = getStoredNotifications();
    const updatedNotifications = [notification, ...existingNotifications].slice(0, 50); // Keep last 50 notifications
    localStorage.setItem('eco_notifications', JSON.stringify(updatedNotifications));
  };
  
  export const getStoredNotifications = () => {
    try {
      const stored = localStorage.getItem('eco_notifications');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading notifications:', error);
      return [];
    }
  };
  
  export const clearNotifications = () => {
    localStorage.removeItem('eco_notifications');
  };
  
  export const markNotificationAsRead = (notificationId: number) => {
    const notifications = getStoredNotifications();
    const updated = notifications.map((n: any) => 
      n.id === notificationId ? { ...n, read: true } : n
    );
    localStorage.setItem('eco_notifications', JSON.stringify(updated));
  };
  
  export const getUnreadCount = () => {
    const notifications = getStoredNotifications();
    return notifications.filter((n: any) => !n.read).length;
  };
  