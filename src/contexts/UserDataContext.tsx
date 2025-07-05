

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { collection, doc, onSnapshot, addDoc, updateDoc, getDoc, setDoc, getDocs, query, where, serverTimestamp, writeBatch } from 'firebase/firestore';
import { useAuth } from './AuthContext';
import { db } from '../firebase';
import { Timestamp } from 'firebase/firestore';
import { Brain, Star, Leaf } from 'lucide-react';
import { useProductComparison } from './ProductComparisonContext';
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
  price?: number;
  metrics?: {
    carbon: number;
    water: number;
    waste: number;
    energy: number;
    ethics: number;
  };
  image?: string;
  certifications?: string[];
  pros?: string[];
  cons?: string[];
  rating?: number;
  reviews?: number;
  inStock?: boolean;
  features?: string[];
  alternatives?: {
    name: string;
    reason: string;
    priceComparison: string;
    score: number;
  }[];
  source?: string; // Added source field to identify data source
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
  goals: {
    title: string;
    target: string;
    progress: number;
  }[];
  esgReports: number;
  investmentsMade: number;
}

// Extend UserStats interface with properties for AI Recommendations
export interface UserStats {
  totalCarbonFootprint: number;
  monthlyReduction: number;
  carbonGoal: number;
  maxSustainabilityScore: number;
  weeklyFootprint: number[];
  categoryBreakdown: { transport: number; energy: number; food: number; waste: number };
  topCategory: string;
  achievements: { id: number; name: string; description: string; icon: any; color: string; }[];
 monthlyTrend: number;
 sustainabilityScore: number;
}

interface UserDataContextType {
  carbonEntries: CarbonEntry[];
  scannedProducts: ScannedProduct[];
  userStats: UserStats;
  completedActions: number[];
  setCompletedActions: React.Dispatch<React.SetStateAction<number[]>>;
  actionProgress: Record<string, any>;
  setActionProgress: React.Dispatch<React.SetStateAction<Record<string, any>>>;
  selectedAICategory: string;
  setSelectedAICategory: React.Dispatch<React.SetStateAction<string>>;
  selectedAIPriority: string;
  setSelectedAIPriority: React.Dispatch<React.SetStateAction<string>>;
  // Properties needed by AIRecommendations
  selectedCategory: string;
  setSelectedCategory: React.Dispatch<React.SetStateAction<string>>;
  selectedPriority: string;
  setSelectedPriority: React.Dispatch<React.SetStateAction<string>>;
  selectedTab?: string;
  setSelectedTab?: React.Dispatch<React.SetStateAction<string>>;

  enrolledCourses: Set<number>;
  courseProgress: Map<number, number>;
  enrollInCourse: (courseId: number) => void;
  updateCourseProgress: (courseId: number, progress: number) => void;

  addCarbonEntry: (entry: Omit<CarbonEntry, 'id' | 'date'>) => void;
  addScannedProduct: (product: ScannedProduct) => void;
  addPoints: (points: number) => void;
  redeemReward: (cost: number) => Promise<boolean>;
  incrementCourseCompleted: () => void;
  addToCart: (product: ScannedProduct) => Promise<void>;
  incrementRecipeViewed: () => void;
  incrementTransportTrip: () => void;
  loading: boolean;
}

const UserDataContext = createContext<UserDataContextType | undefined>(undefined);

export const UserDataProvider = ({ children }: { children: ReactNode }) => {
  const { currentUser } = useAuth();
  const [carbonEntries, setCarbonEntries] = useState<CarbonEntry[]>([]);
  const [scannedProducts, setScannedProducts] = useState<ScannedProduct[]>([]);
  const [userStats, setUserStats] = useState<UserStats>({
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
    goals: [],
    investmentsMade: 0,
    totalCarbonFootprint: 0,
    monthlyReduction: 0,
    carbonGoal: 0,
    maxSustainabilityScore: 1000, // Assuming a max score
    weeklyFootprint: [0, 0, 0, 0, 0, 0, 0], // Initialize with 7 zeros
    categoryBreakdown: { transport: 0, energy: 0, food: 0, waste: 0 },
    topCategory: 'none', // Or a default value
    monthlyTrend: 0,
    sustainabilityScore: 0, // Assuming a current score separate from max
    achievements: [],
  });

  // New state for course progress and enrolled courses
  const [enrolledCourses, setEnrolledCourses] = useState<Set<number>>(new Set());
  const [courseProgress, setCourseProgress] = useState<Map<number, number>>(new Map());

  React.useEffect(() => {
    if (!currentUser) {
      setEnrolledCourses(new Set());
      setCourseProgress(new Map());
      return;
    }

    const userDocRef = doc(db, 'users', currentUser.uid);
    const enrolledCoursesRef = collection(userDocRef, 'enrolledCourses');
    const courseProgressRef = collection(userDocRef, 'courseProgress');

    // Load enrolled courses
    getDocs(enrolledCoursesRef).then(snapshot => {
      const enrolled = new Set<number>();
      snapshot.forEach(doc => {
        const data = doc.data();
        if (data.courseId) {
          enrolled.add(data.courseId);
        }
      });
      setEnrolledCourses(enrolled);
    }).catch(error => {
      console.error('Error loading enrolled courses:', error);
    });

    // Load course progress
    getDocs(courseProgressRef).then(snapshot => {
      const progressMap = new Map<number, number>();
      snapshot.forEach(doc => {
        const data = doc.data();
        if (data.courseId && typeof data.progress === 'number') {
          progressMap.set(data.courseId, data.progress);
        }
      });
      setCourseProgress(progressMap);
    }).catch(error => {
      console.error('Error loading course progress:', error);
    });
  }, [currentUser]);

  // Function to update enrolled courses in Firestore
  const updateEnrolledCoursesInFirestore = async (enrolled: Set<number>) => {
    if (!currentUser) return;
    const userDocRef = doc(db, 'users', currentUser.uid);
    const enrolledCoursesRef = collection(userDocRef, 'enrolledCourses');

    try {
      // Clear existing enrolled courses
      const existingDocs = await getDocs(enrolledCoursesRef);
      const batch = writeBatch(db);
      existingDocs.forEach(docSnap => {
        batch.delete(docSnap.ref);
      });
      enrolled.forEach(courseId => {
        const newDocRef = doc(enrolledCoursesRef);
        batch.set(newDocRef, { courseId });
      });
      await batch.commit();
    } catch (error) {
      console.error('Error updating enrolled courses in Firestore:', error);
    }
  };

  // Function to update course progress in Firestore
  const updateCourseProgressInFirestore = async (progressMap: Map<number, number>) => {
    if (!currentUser) return;
    const userDocRef = doc(db, 'users', currentUser.uid);
    const courseProgressRef = collection(userDocRef, 'courseProgress');

    try {
      // Clear existing progress
      const existingDocs = await getDocs(courseProgressRef);
      const batch = writeBatch(db);
      existingDocs.forEach(docSnap => {
        batch.delete(docSnap.ref);
      });
      progressMap.forEach((progress, courseId) => {
        const newDocRef = doc(courseProgressRef);
        batch.set(newDocRef, { courseId, progress });
      });
      await batch.commit();
    } catch (error) {
      console.error('Error updating course progress in Firestore:', error);
    }
  };

  // Function to enroll in a course
  const enrollInCourse = (courseId: number) => {
    setEnrolledCourses(prev => {
      const newSet = new Set(prev);
      newSet.add(courseId);
      updateEnrolledCoursesInFirestore(newSet);
      return newSet;
    });
  };

  // Function to update progress for a course
  const updateCourseProgress = (courseId: number, progress: number) => {
    setCourseProgress(prev => {
      const newMap = new Map(prev);
      newMap.set(courseId, progress);
      updateCourseProgressInFirestore(newMap);
      return newMap;
    });
  };

  // Recalculate userStats based on scannedProducts and carbonEntries
  React.useEffect(() => {
    if (!currentUser) return;

    const totalScans = scannedProducts.length;
    const totalCO2Saved = carbonEntries.reduce((acc, entry) => acc + (entry.amount || 0), 0);
    const avgScore = totalScans > 0 ? Math.round(scannedProducts.reduce((acc, p) => acc + (p.sustainabilityScore || 0), 0) / totalScans) : 0;

    // Calculate current week scans (assuming date is ISO string)
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday as start of week
    const currentWeekScans = scannedProducts.filter(p => {
      const scanDate = new Date(p.date);
      return scanDate >= startOfWeek && scanDate <= now;
    }).length;

    // Calculate streakDays (consecutive days with scans)
    const scanDatesSet = new Set(scannedProducts.map(p => p.date.split('T')[0]));
    let streak = 0;
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(now.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      if (scanDatesSet.has(dateStr)) {
        streak++;
      } else {
        break;
      }
    }

    // Calculate totalPoints (example: 10 points per scan + 5 points per kg CO2 saved)
    const totalPoints = totalScans * 10 + totalCO2Saved * 5;

    // Update userStats with recalculated values
    setUserStats(prev => ({
      ...prev,
      totalScans,
      co2Saved: totalCO2Saved,
      avgScore,
      currentWeekScans,
      streakDays: streak,
      totalPoints,
    }));

  }, [scannedProducts, carbonEntries, currentUser]);

  // State for AI Recommendations persistence
  const [completedActions, setCompletedActions] = useState<number[]>([]);
  const [actionProgress, setActionProgress] = useState<Record<string, any>>({});
  const [selectedAICategory, setSelectedAICategory] = useState('all');
  const [selectedAIPriority, setSelectedAIPriority] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all'); // State for AI Recommendations
  const [selectedPriority, setSelectedPriority] = useState('all'); // State for AI Recommendations
  const [selectedTab, setSelectedTab] = useState('insights'); // Add selectedTab state for AIRecommendations tab persistence
  // Fetch user data on authentication state change
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let unsubscribeStats: () => void = () => {};
    let unsubscribeCarbon: () => void = () => {};
    let unsubscribeScans: () => void = () => {};

    if (!currentUser) {
      setLoading(false);
      // Reset AI Recommendations state on logout
      setCompletedActions([]);
      setActionProgress({});
      setSelectedAICategory('all');
      setSelectedAIPriority('all');
      setUserStats({ // Reset to default zeros when no user is logged in
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
        investmentsMade: 0,
        totalCarbonFootprint: 0,
        monthlyReduction: 0,
        carbonGoal: 0,
        maxSustainabilityScore: 1000,
        weeklyFootprint: [0, 0, 0, 0, 0, 0, 0],
        categoryBreakdown: { transport: 0, energy: 0, food: 0, waste: 0 },
        topCategory: 'none',
        monthlyTrend: 0,
        achievements: [],
        sustainabilityScore: 0,
        goals: [],
      });
      setCarbonEntries([]);
      setScannedProducts([]);
      return;
    }

    setLoading(true);

    const userDocRef = doc(db, 'users', currentUser.uid);
    const carbonCollectionRef = collection(userDocRef, 'carbonEntries');
    const scannedCollectionRef = collection(userDocRef, 'scannedProducts');

    // Listen for user stats
    unsubscribeStats = onSnapshot(userDocRef, (docSnap) => {
      console.log('UserDataContext: user stats snapshot received', docSnap.data());
      if (docSnap.exists()) {
        const fetchedStats = docSnap.data() as UserStats;
        const defaultAchievements = [
          { id: 1, name: 'Green Streak Master', description: '12 consecutive days', icon: Star, color: 'yellow' },
          { id: 2, name: 'Carbon Reducer', description: 'Saved 67.8kg CO₂', icon: Leaf, color: 'green' },
          { id: 3, name: 'AI Collaborator', description: '92% recommendation accuracy', icon: Brain, color: 'blue' }
        ];
        setUserStats(prevStats => ({
          ...prevStats, // Use previous state as base
          // Ensure numerical fields are numbers, default to 0 if NaN, undefined, or null
          totalPoints: Number(fetchedStats.totalPoints) || 0,
          level: Number(fetchedStats.level) || 0,
          totalScans: Number(fetchedStats.totalScans) || 0,
          avgScore: Number(fetchedStats.avgScore) || 0,
          co2Saved: Number(fetchedStats.co2Saved) || 0,
          rank: Number(fetchedStats.rank) || 0,
          badges: Number(fetchedStats.badges) || 0,
          weeklyGoal: Number(fetchedStats.weeklyGoal) || 0,
          currentWeekScans: Number(fetchedStats.currentWeekScans) || 0,
          streakDays: Number(fetchedStats.streakDays) || 0,
          coursesCompleted: Number(fetchedStats.coursesCompleted) || 0,
          recipesViewed: Number(fetchedStats.recipesViewed) || 0,
          transportTrips: Number(fetchedStats.transportTrips) || 0,
          esgReports: Number(fetchedStats.esgReports) || 0,
          investmentsMade: Number(fetchedStats.investmentsMade) || 0,
          monthlyReduction: Number(fetchedStats.monthlyReduction) || 0,
          carbonGoal: Number(fetchedStats.carbonGoal) || 0,
          maxSustainabilityScore: Number(fetchedStats.maxSustainabilityScore) || 1000,
          weeklyFootprint: Array.isArray(fetchedStats.weeklyFootprint) ? fetchedStats.weeklyFootprint.map(Number).filter(n => !isNaN(n)) : [0, 0, 0, 0, 0, 0, 0],
          categoryBreakdown: fetchedStats.categoryBreakdown || { transport: 0, energy: 0, food: 0, waste: 0 },
          topCategory: fetchedStats.topCategory || 'none',
          monthlyTrend: Number(fetchedStats.monthlyTrend) || 0,
          sustainabilityScore: Number(fetchedStats.sustainabilityScore) || 0, // Ensure sustainabilityScore is handled
          achievements: (Array.isArray(fetchedStats.achievements) && fetchedStats.achievements.length > 0) ? fetchedStats.achievements : defaultAchievements,
          goals: fetchedStats.goals ?? [],
        }));
      } else {
        // Create initial user stats if not exists with a comprehensive default object
        if (currentUser) {
          const initialStatsForNewUser: UserStats = {
            totalPoints: 0,
            level: 1, // Start at level 1
            totalScans: 0,
            avgScore: 0,
            co2Saved: 0,
            rank: 0, // New user, no rank yet
            badges: 0,
            weeklyGoal: 75,
            currentWeekScans: 0,
            streakDays: 0,
            coursesCompleted: 0,
            recipesViewed: 0,
            transportTrips: 0,
            esgReports: 0,
            goals: [],
            investmentsMade: 0,
            monthlyReduction: 0,
            carbonGoal: 0,
            maxSustainabilityScore: 1000,
            weeklyFootprint: [0, 0, 0, 0, 0, 0, 0],
            categoryBreakdown: { transport: 0, energy: 0, food: 0, waste: 0 },
            topCategory: 'none',
            achievements: [],
            monthlyTrend: 0,
            sustainabilityScore: 0,
            totalCarbonFootprint: 0
          };
          setDoc(userDocRef, initialStatsForNewUser)
            .then(() => setUserStats(initialStatsForNewUser)) // Update local state after setting in Firestore
            .catch(error => console.error("Error setting initial user stats:", error));
        } else {
          console.error("Cannot set initial user stats: no authenticated user");
        }
      }
      setLoading(false);
    }, (error) => {
      console.error("Error fetching user stats:", error);
      setLoading(false);
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
      // Filter to only include products with source 'ProductScanner'
      if (productData.source === 'ProductScanner') {
        // Use product's actual ID for grouping, keeping the most recent scan
        if (!productsMap[productData.id] || new Date(productData.date) > new Date(productsMap[productData.id].date || 0)) {
          productsMap[productData.id] = productData;
        }
      }
    });
    setScannedProducts(Object.values(productsMap).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())); // Sort by date
    }, (error) => {
      console.error("Error fetching scanned products:", error);
    });

    return () => {
      unsubscribeStats();
      unsubscribeCarbon();
      unsubscribeScans();
    };
  }, [currentUser]);

  // Removed redundant localStorage loading on component mount as Firestore loading on login covers this

  // Load AI Recommendations state from Firestore on user login
  React.useEffect(() => {
    if (currentUser) {
      const userDocRef = doc(db, 'users', currentUser.uid);
      getDoc(userDocRef).then(docSnap => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.completedActions) {
            console.log('Loading completedActions from Firestore on login:', data.completedActions);
            setCompletedActions(data.completedActions);
          }
          if (data.actionProgress) {
            console.log('Loading actionProgress from Firestore on login:', data.actionProgress);
            setActionProgress(data.actionProgress);
          }
          if (data.selectedAICategory) {
            setSelectedAICategory(data.selectedAICategory);
          }
          if (data.selectedAIPriority) {
            setSelectedAIPriority(data.selectedAIPriority);
          }
          if (data.selectedCategory) {
            setSelectedCategory(data.selectedCategory);
          }
          if (data.selectedPriority) {
            setSelectedPriority(data.selectedPriority);
          }
          if (data.selectedTab) {
            setSelectedTab(data.selectedTab);
          }
        }
      }).catch(error => {
        console.error('Error loading AI Recommendations state from Firestore:', error);
      });
    }
  }, [currentUser]);

  // Save AI Recommendations state to Firestore and localStorage whenever it changes
  React.useEffect(() => {
    // Helper function to sanitize actionProgress by removing icon fields
    const sanitizeActionProgress = (progress: Record<string, any>) => {
      const sanitized: Record<string, any> = {};
      for (const key in progress) {
        if (progress.hasOwnProperty(key)) {
          const action = progress[key];
          // Deep copy excluding icon in recommendation
          const { icon, ...restRecommendation } = action.recommendation || {};
          sanitized[key] = {
            ...action,
            recommendation: restRecommendation
          };
        }
      }
      return sanitized;
    };

    if (currentUser) {
      const userDocRef = doc(db, 'users', currentUser.uid);
      const sanitizedActionProgress = sanitizeActionProgress(actionProgress);
      console.log('Saving AI Recommendations state to Firestore:', {
        completedActions,
        actionProgress: sanitizedActionProgress,
        selectedAICategory,
        selectedAIPriority,
        selectedCategory,
        selectedPriority,
        selectedTab
      });
      updateDoc(userDocRef, {
        completedActions,
        actionProgress: sanitizedActionProgress,
        selectedAICategory,
        selectedAIPriority,
        selectedCategory,
        selectedPriority,
        selectedTab
      }).then(() => {
        console.log('Successfully saved AI Recommendations state to Firestore');
      }).catch(error => {
        console.error('Error saving AI Recommendations state to Firestore:', error);
        console.error('Error details:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
      });
    }
    localStorage.setItem('completedActions', JSON.stringify(completedActions));
    localStorage.setItem('actionProgress', JSON.stringify(actionProgress));
    localStorage.setItem('selectedAICategory', selectedAICategory);
    localStorage.setItem('selectedAIPriority', selectedAIPriority);
    localStorage.setItem('selectedCategory', selectedCategory);
    localStorage.setItem('selectedPriority', selectedPriority);
    localStorage.setItem('selectedTab', selectedTab);
  }, [completedActions, actionProgress, selectedAICategory, selectedAIPriority, selectedCategory, selectedPriority, selectedTab]);
  
  // Clear in-memory and localStorage state on logout
  React.useEffect(() => {
    if (!currentUser) {
      setCompletedActions([]);
      setActionProgress({});
      setSelectedAICategory('all');
      setSelectedAIPriority('all');
      setSelectedCategory('all');
      setSelectedPriority('all');
      localStorage.removeItem('completedActions');
      localStorage.removeItem('actionProgress');
      localStorage.removeItem('selectedAICategory');
      localStorage.removeItem('selectedAIPriority');
      localStorage.removeItem('selectedCategory');
      localStorage.removeItem('selectedPriority');
    }
  }, [currentUser]);

  // Save AI Recommendations state to localStorage whenever it changes
  React.useEffect(() => {
    localStorage.setItem('completedActions', JSON.stringify(completedActions));
    localStorage.setItem('actionProgress', JSON.stringify(actionProgress));
  }, [completedActions, actionProgress]);
  
  // Clear in-memory state on logout but keep localStorage intact
  React.useEffect(() => {
    if (!currentUser) {
      setCompletedActions([]);
      setActionProgress({});
      setSelectedAICategory('all');
      setSelectedAIPriority('all');
      setSelectedCategory('all');
      setSelectedPriority('all');
    }
  }, [currentUser]);


  const updateFirestoreUserStats = async (stats: UserStats) => {
    if (currentUser) {
      const userDocRef = doc(db, 'users', currentUser.uid);
      try {
        // Sanitize stats to remove non-serializable fields like React components (icon)
        const sanitizedStats = {
          ...stats,
          achievements: stats.achievements?.map(({ icon, ...rest }) => rest) || [],
        };
        await updateDoc(userDocRef, { ...sanitizedStats });
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
          co2Saved: (userStats.co2Saved || 0) + entry.amount,
          totalPoints: (userStats.totalPoints || 0) + Math.floor(entry.amount * 10),
          currentWeekScans: (userStats.currentWeekScans || 0) + 1 // Assuming carbon entries also count towards weekly goal
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
      // Removed skip logic for product comparison to ensure all scanned products are saved

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
        alternatives: product.alternatives || [], // Ensure alternatives are saved
        source: product.source || 'ProductScanner', // Save source field
        timestamp: serverTimestamp(), // Update timestamp
      });
          // The onSnapshot listener will handle updating the local state
        } else {
          // If no scan for this product exists, add a new document
        await addDoc(scannedCollectionRef, {
          ...product,
          alternatives: product.alternatives || [], // Ensure alternatives are saved
          source: product.source || 'ProductScanner', // Save source field
          date: new Date().toISOString(), // Add a local date for display consistency before Firestore sync
          timestamp: serverTimestamp(), // Add timestamp
        });
        }
        // Update user stats
        const updatedStats = {
          ...userStats,
          totalScans: (userStats.totalScans || 0) + 1,
          avgScore: (userStats.totalScans || 0) === 0 ? product.sustainabilityScore :
            Math.round(((userStats.avgScore || 0) * (userStats.totalScans || 0) + product.sustainabilityScore) / ((userStats.totalScans || 0) + 1)),
          totalPoints: (userStats.totalPoints || 0) + Math.floor(product.sustainabilityScore / 10),
          currentWeekScans: (userStats.currentWeekScans || 0) + 1
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
      totalPoints: (userStats.totalPoints || 0) + points
    };
    setUserStats(prev => ({ ...prev, totalPoints: (prev.totalPoints || 0) + points }));
    updateFirestoreUserStats(updatedStats);
  };

  const redeemReward = async (cost: number): Promise<boolean> => {
    if ((userStats.totalPoints || 0) >= cost) {
      const updatedStats = {
        ...userStats,
        totalPoints: (userStats.totalPoints || 0) - cost,
      };
      setUserStats(updatedStats);
      await updateFirestoreUserStats(updatedStats);
      return true;
    }
    return false;
  };

  const incrementUserStat = async (stat: keyof UserStats, points: number) => {
    const updatedStats = {
      ...userStats,
      [stat]: typeof userStats[stat] === 'number' ? (userStats[stat] as number) + 1 : 1,
      totalPoints: typeof userStats.totalPoints === 'number' ? userStats.totalPoints + points : points
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



  return (
    <UserDataContext.Provider value={{
      carbonEntries,
      scannedProducts,
      userStats,
      completedActions,
      actionProgress,
      setCompletedActions,
      setActionProgress,
      selectedAICategory,
      selectedAIPriority,
      setSelectedAICategory,
      setSelectedAIPriority,
      selectedCategory, // Add these to context value
      setSelectedCategory, // Add these to context value
      selectedPriority, // Add these to context value
      setSelectedPriority, // Add these to context value
      selectedTab, // Add selectedTab to context value
      setSelectedTab, // Add setSelectedTab to context value

      enrolledCourses,
      courseProgress,
      enrollInCourse,
      updateCourseProgress,

      addCarbonEntry,
      addScannedProduct,
      addPoints,
      redeemReward,
      addToCart,
      incrementCourseCompleted,
      incrementRecipeViewed,
      incrementTransportTrip,
      loading
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
