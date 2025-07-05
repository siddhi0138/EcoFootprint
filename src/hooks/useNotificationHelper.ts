import { useNotifications } from '../contexts/NotificationsContext';
import { Bell, Award, ShoppingCart, BookOpen, Users, Leaf, Target, Zap, TrendingUp, AlertCircle } from 'lucide-react';

export const useNotificationHelper = () => {
  const { addNotification } = useNotifications();

  const addScanNotification = (productName: string, score: number) => {
    addNotification({
      type: 'achievement',
      title: 'Product Scanned Successfully!',
      message: 'You scanned "' + productName + '" with a sustainability score of ' + score + '. Keep making eco-friendly choices!',
      read: false,
      source: 'scanner',
      actionable: true,
      action: 'View Analysis',
      icon: Award
    });
  };

  const addPurchaseNotification = (productName: string) => {
    addNotification({
      type: 'shopping',
      title: 'Added to Cart!',
      message: '"' + productName + '" has been added to your cart. Continue shopping for more eco-friendly products!',
      read: false,
      source: 'marketplace',
      actionable: true,
      action: 'View Cart',
      icon: ShoppingCart
    });
  };

  const addCourseCompletionNotification = (courseName: string) => {
    addNotification({
      type: 'achievement',
      title: 'Course Completed!',
      message: 'Congratulations! You\'ve completed "' + courseName + '". Your knowledge about sustainability is growing!',
      read: false,
      source: 'education',
      actionable: true,
      action: 'View Certificate',
      icon: BookOpen
    });
  };

  const addCommunityNotification = (message: string) => {
    addNotification({
      type: 'community',
      title: 'Community Activity',
      message: message,
      read: false,
      source: 'community',
      actionable: true,
      action: 'View Community',
      icon: Users
    });
  };

  const addCarbonSavingNotification = (amount: number) => {
    addNotification({
      type: 'environmental',
      title: 'Carbon Footprint Reduced!',
      message: 'Great job! You\'ve saved approximately ' + amount + 'kg of CO₂ through your sustainable choices this week.',
      read: false,
      source: 'carbon',
      actionable: true,
      action: 'View Carbon Tracker',
      icon: Leaf
    });
  };

  const addRecipeViewNotification = (recipeName: string) => {
    addNotification({
      type: 'suggestion',
      title: 'Recipe Viewed!',
      message: 'You viewed "' + recipeName + '". Try cooking this sustainable recipe to reduce your environmental impact!',
      read: false,
      source: 'recipes',
      actionable: true,
      action: 'Start Cooking',
      icon: Target
    });
  };

  const addAchievementNotification = (achievementName: string) => {
    addNotification({
      type: 'achievement',
      title: 'New Achievement Unlocked!',
      message: 'Congratulations! You\'ve earned the "' + achievementName + '" achievement. Keep up the great work!',
      read: false,
      source: 'achievements',
      actionable: true,
      action: 'View Achievements',
      icon: Award
    });
  };

  const addInvestmentNotification = (performance: string) => {
    addNotification({
      type: 'investment',
      title: 'ESG Portfolio Update',
      message: 'Your sustainable investment portfolio ' + performance + '. Check your detailed performance report.',
      read: false,
      source: 'investment',
      actionable: true,
      action: 'View Portfolio',
      icon: TrendingUp
    });
  };

  const addChallengeNotification = (challengeName: string) => {
    addNotification({
      type: 'challenge',
      title: 'New Challenge Available!',
      message: 'Join the "' + challengeName + '" challenge and make a positive impact on the environment with the community!',
      read: false,
      source: 'challenges',
      actionable: true,
      action: 'Join Challenge',
      icon: Zap
    });
  };

  const addGeneralNotification = (title: string, message: string, type: string = 'info') => {
    addNotification({
      type: type,
      title: title,
      message: message,
      read: false,
      source: 'general',
      actionable: false,
      icon: Bell
    });
  };

  return {
    addScanNotification,
    addPurchaseNotification,
    addCourseCompletionNotification,
    addCommunityNotification,
    addCarbonSavingNotification,
    addRecipeViewNotification,
    addAchievementNotification,
    addChallengeNotification,
    addGeneralNotification
  };
};
