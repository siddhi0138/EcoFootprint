
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface CarbonEntry {
  id: string;
  category: string;
  amount: number;
  description: string;
  date: string;
}

interface ScannedProduct {
  id: string;
  name: string;
  brand: string;
  sustainabilityScore: number;
  date: string;
  category: string;
}

interface UserStats {
  totalPoints: number;
  level: number;
  totalScans: number;
  avgScore: number;
  co2Saved: number;
  rank: number;
  badges: number;
  weeklyGoal: number;
  currentWeekScans: number;
  streakDays: number;
  coursesCompleted: number;
  recipesViewed: number;
  transportTrips: number;
  esgReports: number;
  investmentsMade: number;
}

interface UserDataContextType {
  carbonEntries: CarbonEntry[];
  scannedProducts: ScannedProduct[];
  userStats: UserStats;
  addCarbonEntry: (entry: Omit<CarbonEntry, 'id'>) => void;
  addScannedProduct: (product: Omit<ScannedProduct, 'id' | 'date'>) => void;
  addPoints: (points: number) => void;
  redeemReward: (cost: number) => boolean;
  incrementCourseCompleted: () => void;
  incrementRecipeViewed: () => void;
  incrementTransportTrip: () => void;
  incrementESGReport: () => void;
  incrementInvestment: () => void;
}

const UserDataContext = createContext<UserDataContextType | undefined>(undefined);

export const UserDataProvider = ({ children }: { children: ReactNode }) => {
  const [carbonEntries, setCarbonEntries] = useState<CarbonEntry[]>([]);
  const [scannedProducts, setScannedProducts] = useState<ScannedProduct[]>([]);
  const [userStats, setUserStats] = useState<UserStats>({
    totalPoints: 150,
    level: 1,
    totalScans: 0,
    avgScore: 0,
    co2Saved: 0,
    rank: 999,
    badges: 0,
    weeklyGoal: 75,
    currentWeekScans: 0,
    streakDays: 0,
    coursesCompleted: 0,
    recipesViewed: 0,
    transportTrips: 0,
    esgReports: 0,
    investmentsMade: 0
  });

  const addCarbonEntry = (entry: Omit<CarbonEntry, 'id'>) => {
    const newEntry: CarbonEntry = {
      ...entry,
      id: Date.now().toString()
    };
    
    setCarbonEntries(prev => [newEntry, ...prev]);
    
    setUserStats(prev => ({
      ...prev,
      co2Saved: prev.co2Saved + entry.amount,
      totalPoints: prev.totalPoints + Math.floor(entry.amount * 10),
      currentWeekScans: prev.currentWeekScans + 1
    }));
  };

  const addScannedProduct = (product: Omit<ScannedProduct, 'id' | 'date'>) => {
    const newProduct: ScannedProduct = {
      ...product,
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0]
    };
    
    setScannedProducts(prev => [newProduct, ...prev]);
    
    setUserStats(prev => ({
      ...prev,
      totalScans: prev.totalScans + 1,
      avgScore: prev.totalScans === 0 ? product.sustainabilityScore : 
                Math.round(((prev.avgScore * prev.totalScans) + product.sustainabilityScore) / (prev.totalScans + 1)),
      totalPoints: prev.totalPoints + Math.floor(product.sustainabilityScore / 10),
      currentWeekScans: prev.currentWeekScans + 1
    }));
  };

  const addPoints = (points: number) => {
    setUserStats(prev => ({
      ...prev,
      totalPoints: prev.totalPoints + points
    }));
  };

  const redeemReward = (cost: number): boolean => {
    if (userStats.totalPoints >= cost) {
      setUserStats(prev => ({
        ...prev,
        totalPoints: prev.totalPoints - cost
      }));
      return true;
    }
    return false;
  };

  const incrementCourseCompleted = () => {
    setUserStats(prev => ({
      ...prev,
      coursesCompleted: prev.coursesCompleted + 1,
      totalPoints: prev.totalPoints + 50
    }));
  };

  const incrementRecipeViewed = () => {
    setUserStats(prev => ({
      ...prev,
      recipesViewed: prev.recipesViewed + 1,
      totalPoints: prev.totalPoints + 10
    }));
  };

  const incrementTransportTrip = () => {
    setUserStats(prev => ({
      ...prev,
      transportTrips: prev.transportTrips + 1,
      totalPoints: prev.totalPoints + 20
    }));
  };

  const incrementESGReport = () => {
    setUserStats(prev => ({
      ...prev,
      esgReports: prev.esgReports + 1,
      totalPoints: prev.totalPoints + 30
    }));
  };

  const incrementInvestment = () => {
    setUserStats(prev => ({
      ...prev,
      investmentsMade: prev.investmentsMade + 1,
      totalPoints: prev.totalPoints + 100
    }));
  };

  return (
    <UserDataContext.Provider value={{
      carbonEntries,
      scannedProducts,
      userStats,
      addCarbonEntry,
      addScannedProduct,
      addPoints,
      redeemReward,
      incrementCourseCompleted,
      incrementRecipeViewed,
      incrementTransportTrip,
      incrementESGReport,
      incrementInvestment
    }}>
      {children}
    </UserDataContext.Provider>
  );
};

export const useUserData = () => {
  const context = useContext(UserDataContext);
  if (context === undefined) {
    throw new Error('useUserData must be used within a UserDataProvider');
  }
  return context;
};
