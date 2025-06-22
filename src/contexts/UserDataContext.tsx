
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { collection, doc, onSnapshot, addDoc, updateDoc, getDoc, setDoc, getDocs, query, where, serverTimestamp } from 'firebase/firestore';
import { useAuth } from './AuthContext';
import { db } from '../firebase';
import { Timestamp } from 'firebase/firestore';
interface CarbonEntry {
  id: string;
  category: string;
  amount: number;
  description: string;
  date: string;
}

interface UserScanData {
  timestamp: Timestamp; // Firestore Timestamp type
}

interface ScannedProduct {
  id: string;
  name: string;
  brand: string;
  sustainabilityScore: number;
  date: string;
  category: string;
}

export interface UserStats {
  totalPoints: number;
  level: number;
  totalScans: number;
  avgScore: number;
  co2Saved: number;
  rank: number;
  badges: number;
  weeklyGoal: number;
  currentWeekScans: number;
  streakDays: number; // Assuming this tracks consecutive daily scans or similar activity
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
  addCarbonEntry: (entry: Omit<CarbonEntry, 'id' | 'date'>) => void;
  addScannedProduct: (product: ScannedProduct) => void;
  addPoints: (points: number) => void;
  redeemReward: (cost: number) => Promise<boolean>;
  incrementCourseCompleted: () => void;
  addToCart: (product: ScannedProduct) => Promise<void>;
  incrementRecipeViewed: () => void;
  incrementTransportTrip: () => void;
  incrementESGReport: () => void;
  incrementInvestment: () => void;
}

const UserDataContext = createContext<UserDataContextType | undefined>(undefined);

export const UserDataProvider = ({ children }: { children: ReactNode }) => {
  const { currentUser } = useAuth();
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

  // Fetch user data on authentication state change
  useEffect(() => {
    let unsubscribeStats: () => void = () => {};
    let unsubscribeCarbon: () => void = () => {};
    let unsubscribeScans: () => void = () => {};

    if (currentUser) {
      const userDocRef = doc(db, 'users', currentUser.uid);
      const carbonCollectionRef = collection(userDocRef, 'carbonEntries');
      const scannedCollectionRef = collection(userDocRef, 'scannedProducts');

      // Listen for user stats
      unsubscribeStats = onSnapshot(userDocRef, (docSnap) => {
        if (docSnap.exists()) {
          setUserStats(docSnap.data() as UserStats);
        } else {
          // Create initial user stats if not exists
          setDoc(userDocRef, userStats);
        }
      }, (error) => {
        console.error("Error fetching user stats:", error);
      });

      // Listen for carbon entries
      unsubscribeCarbon = onSnapshot(carbonCollectionRef, (snapshot) => {
        const entries = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data() as Omit<CarbonEntry, 'id'>
        }));
        setCarbonEntries(entries);
      }, (error) => {
        console.error("Error fetching carbon entries:", error);
      });

      // Listen for scanned products
      unsubscribeScans = onSnapshot(scannedCollectionRef, (snapshot) => {
        const productsMap: { [productId: string]: ScannedProduct } = {};
        snapshot.docs.forEach(doc => {
          const productData = {
            ...(doc.data() as Omit<ScannedProduct, 'date'>),
            date: doc.data().timestamp?.toDate().toISOString() || new Date().toISOString(), // Use Firestore timestamp, fallback to current date
          };
          // Use product's actual ID for grouping, keeping the most recent scan
          if (!productsMap[productData.id] || new Date(productData.date) > new Date(productsMap[productData.id].date || 0)) {
 productsMap[productData.id] = productData;
          }
        });
        setScannedProducts(Object.values(productsMap).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())); // Sort by date
      }, (error) => {
        console.error("Error fetching scanned products:", error);
      });

    } else {
      // Clear data on logout
      setUserStats({
        totalPoints: 0,
        level: 0,
        totalScans: 0,
        avgScore: 0,
        co2Saved: 0,
        rank: 0,
        badges: 0,
        weeklyGoal: 0,
        currentWeekScans: 0,
        streakDays: 0,
        coursesCompleted: 0,
        recipesViewed: 0,
        transportTrips: 0,
        esgReports: 0,
        investmentsMade: 0
      });
      setCarbonEntries([]);
      setScannedProducts([]);
    }

    return () => {
      unsubscribeStats();
      unsubscribeCarbon();
      unsubscribeScans();
    };
  }, [currentUser]);

  const updateFirestoreUserStats = async (stats: UserStats) => {
    if (currentUser) {
      const userDocRef = doc(db, 'users', currentUser.uid);
      try {
        await updateDoc(userDocRef, { ...stats });
      } catch (error) {
        console.error("Error updating user stats:", error);
      }
    }
  };

  const addCarbonEntry = async (entry: Omit<CarbonEntry, 'id' | 'date'>) => {
    if (currentUser) {
      const userDocRef = doc(db, 'users', currentUser.uid);
      const carbonCollectionRef = collection(userDocRef, 'carbonEntries');
      try {
        const docRef = await addDoc(carbonCollectionRef, {
          ...entry,
          date: new Date().toISOString() // Ensure date is stored
        });
        // Update local state with the added entry (including the new ID)
        setCarbonEntries(prev => [{ id: docRef.id, ...entry, date: new Date().toISOString() }, ...prev]);

        // Update user stats
        const updatedStats = {
          ...userStats,
          co2Saved: userStats.co2Saved + entry.amount,
          totalPoints: userStats.totalPoints + Math.floor(entry.amount * 10),
          currentWeekScans: userStats.currentWeekScans + 1 // Assuming carbon entries also count towards weekly goal
        };
        setUserStats(updatedStats);
        updateFirestoreUserStats(updatedStats);
      } catch (error) {
        console.error("Error adding carbon entry:", error);
      }
    }
  };

  const addScannedProduct = async (product: ScannedProduct) => {
    if (currentUser) {
      const userDocRef = doc(db, 'users', currentUser.uid);
      const scannedCollectionRef = collection(userDocRef, 'scannedProducts');

      try {
        // Check if a document with the same product ID already exists
        const existingScanQuery = await getDocs(
          query(scannedCollectionRef, where('id', '==', product.id))
        );

 if (!existingScanQuery.empty) {
          // If a scan for this product exists, update the existing document
          const existingDocRef = existingScanQuery.docs[0].ref;
          await updateDoc(existingDocRef, {
            ...product, // Update with the latest product data
            timestamp: serverTimestamp(), // Update timestamp
          });
          // The onSnapshot listener will handle updating the local state
        } else {
          // If no scan for this product exists, add a new document
          await addDoc(scannedCollectionRef, {
            ...product,
            date: new Date().toISOString(), // Add a local date for display consistency before Firestore sync
            timestamp: serverTimestamp(), // Add timestamp
          });
        }
        // Update user stats
        const updatedStats = {
          ...userStats,
          totalScans: userStats.totalScans + 1,
          avgScore: userStats.totalScans === 0 ? product.sustainabilityScore :
            Math.round(((userStats.avgScore * userStats.totalScans) + product.sustainabilityScore) / (userStats.totalScans + 1)),
          totalPoints: userStats.totalPoints + Math.floor(product.sustainabilityScore / 10),
          currentWeekScans: userStats.currentWeekScans + 1
        };
        setUserStats(updatedStats);
        updateFirestoreUserStats(updatedStats);
      } catch (error) {
        console.error("Error adding scanned product:", error);
      }
    }
  };

  const addToCart = async (product: ScannedProduct) => {
    if (currentUser) {
      const userDocRef = doc(db, 'users', currentUser.uid);
      try {
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const currentCart = (userData?.cart || []) as ScannedProduct[];
          // Add the product to the cart array
          const updatedCart = [...currentCart, product];

          await updateDoc(userDocRef, {
            cart: updatedCart,
          });
        }
      } catch (error) {
        console.error("Error adding product to cart:", error);
      }
    }
  };

  const addPoints = async (points: number) => {
    const updatedStats = {
      ...userStats,
      totalPoints: userStats.totalPoints + points
    };
    setUserStats(prev => ({
      ...prev,
      totalPoints: prev.totalPoints + points
    }));
    updateFirestoreUserStats(updatedStats);
  };

  const redeemReward = async (cost: number): Promise<boolean> => {
    if (userStats.totalPoints >= cost) {
      setUserStats(prev => ({
        ...prev,
        totalPoints: prev.totalPoints - cost,
      }));
      // Use functional update for Firestore update as well to ensure correct state
      await updateFirestoreUserStats({
        ...userStats, // Use current userStats for other fields
 totalPoints: userStats.totalPoints - cost, // Calculate new totalPoints
      });
      return true;
    }
    return false;
  };

  const incrementUserStat = async (stat: keyof UserStats, points: number) => {
    const updatedStats = {
      ...userStats,
      [stat]: userStats[stat] + 1,
      totalPoints: userStats.totalPoints + points
    };
    setUserStats(updatedStats);
    updateFirestoreUserStats(updatedStats);
  };

  const incrementCourseCompleted = () => {
    incrementUserStat('coursesCompleted', 50);
  };

  const incrementRecipeViewed = () => {
    incrementUserStat('recipesViewed', 10);
  };

  const incrementTransportTrip = () => {
    incrementUserStat('transportTrips', 20);
  };

  const incrementESGReport = () => {
    incrementUserStat('esgReports', 30);
  };

  const incrementInvestment = () => {
    incrementUserStat('investmentsMade', 100);
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
      addToCart,
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

