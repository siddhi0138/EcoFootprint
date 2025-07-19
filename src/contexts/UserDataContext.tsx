

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { collection, doc, onSnapshot, addDoc, updateDoc, getDoc, setDoc, getDocs, query, where, serverTimestamp, writeBatch, increment } from 'firebase/firestore';
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
  timestamp: Timestamp; 
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
  source?: string; 
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
  streakDays: number; 
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
  communityHelpCount: number;
}


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
  communityHelpCount: number;
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

  likedArticles: Set<number>;
  bookmarkedArticles: Set<number>;
  registeredWebinars: Set<number>;
  likeArticle: (articleId: number) => void;
  bookmarkArticle: (articleId: number) => void;
  registerWebinar: (webinarId: number) => void;

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

export const UserDataContext = createContext<UserDataContextType | undefined>(undefined);

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
    maxSustainabilityScore: 1000, 
    weeklyFootprint: [0, 0, 0, 0, 0, 0, 0],
    categoryBreakdown: { transport: 0, energy: 0, food: 0, waste: 0 },
    topCategory: 'none',
    monthlyTrend: 0,
    sustainabilityScore: 0, 
    achievements: [],
    communityHelpCount: 0,
  });

  
  const [enrolledCourses, setEnrolledCourses] = useState<Set<number>>(new Set());
  const [courseProgress, setCourseProgress] = useState<Map<number, number>>(new Map());

  
  const [likedArticles, setLikedArticles] = useState<Set<number>>(new Set());
  const [bookmarkedArticles, setBookmarkedArticles] = useState<Set<number>>(new Set());
  const [registeredWebinars, setRegisteredWebinars] = useState<Set<number>>(new Set());

  React.useEffect(() => {
    if (!currentUser) {
      setEnrolledCourses(new Set());
      setCourseProgress(new Map());
      setLikedArticles(new Set());
      setBookmarkedArticles(new Set());
      setRegisteredWebinars(new Set());
      return;
    }

    const userDocRef = doc(db, 'users', currentUser.uid);
    const enrolledCoursesRef = collection(userDocRef, 'enrolledCourses');
    const courseProgressRef = collection(userDocRef, 'courseProgress');
    const likedArticlesRef = collection(userDocRef, 'likedArticles');
    const bookmarkedArticlesRef = collection(userDocRef, 'bookmarkedArticles');
    const registeredWebinarsRef = collection(userDocRef, 'registeredWebinars');

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

    // Load liked articles
    getDocs(likedArticlesRef).then(snapshot => {
      const liked = new Set<number>();
      snapshot.forEach(doc => {
        const data = doc.data();
        if (data.articleId) {
          liked.add(data.articleId);
        }
      });
      setLikedArticles(liked);
    }).catch(error => {
      console.error('Error loading liked articles:', error);
    });

    // Load bookmarked articles
    getDocs(bookmarkedArticlesRef).then(snapshot => {
      const bookmarked = new Set<number>();
      snapshot.forEach(doc => {
        const data = doc.data();
        if (data.articleId) {
          bookmarked.add(data.articleId);
        }
      });
      setBookmarkedArticles(bookmarked);
    }).catch(error => {
      console.error('Error loading bookmarked articles:', error);
    });

    // Load registered webinars
    getDocs(registeredWebinarsRef).then(snapshot => {
      const registered = new Set<number>();
      snapshot.forEach(doc => {
        const data = doc.data();
        if (data.webinarId) {
          registered.add(data.webinarId);
        }
      });
      setRegisteredWebinars(registered);
    }).catch(error => {
      console.error('Error loading registered webinars:', error);
    });
  }, [currentUser]);


  // Function to update enrolled courses in Firestore
  const updateEnrolledCoursesInFirestore = async (enrolled: Set<number>) => {
    if (!currentUser) return;
    const userDocRef = doc(db, 'users', currentUser.uid);
    const enrolledCoursesRef = collection(userDocRef, 'enrolledCourses');

    try {
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

  // Function to update liked articles in Firestore
  const updateLikedArticlesInFirestore = async (liked: Set<number>) => {
    if (!currentUser) return;
    const userDocRef = doc(db, 'users', currentUser.uid);
    const likedArticlesRef = collection(userDocRef, 'likedArticles');

    try {
      const existingDocs = await getDocs(likedArticlesRef);
      const batch = writeBatch(db);
      existingDocs.forEach(docSnap => {
        batch.delete(docSnap.ref);
      });
      liked.forEach(articleId => {
        const newDocRef = doc(likedArticlesRef);
        batch.set(newDocRef, { articleId });
      });
      await batch.commit();
      console.log('Successfully updated liked articles in Firestore');
    } catch (error) {
      console.error('Error updating liked articles in Firestore:', error);
    }
  };

  // Function to update bookmarked articles in Firestore
  const updateBookmarkedArticlesInFirestore = async (bookmarked: Set<number>) => {
    if (!currentUser) return;
    const userDocRef = doc(db, 'users', currentUser.uid);
    const bookmarkedArticlesRef = collection(userDocRef, 'bookmarkedArticles');

    try {
      const existingDocs = await getDocs(bookmarkedArticlesRef);
      const batch = writeBatch(db);
      existingDocs.forEach(docSnap => {
        batch.delete(docSnap.ref);
      });
      bookmarked.forEach(articleId => {
        const newDocRef = doc(bookmarkedArticlesRef);
        batch.set(newDocRef, { articleId });
      });
      await batch.commit();
      console.log('Successfully updated bookmarked articles in Firestore');
    } catch (error) {
      console.error('Error updating bookmarked articles in Firestore:', error);
    }
  };

  // Function to update registered webinars in Firestore
  const updateRegisteredWebinarsInFirestore = async (registered: Set<number>) => {
    if (!currentUser) return;
    const userDocRef = doc(db, 'users', currentUser.uid);
    const registeredWebinarsRef = collection(userDocRef, 'registeredWebinars');

    try {
      const existingDocs = await getDocs(registeredWebinarsRef);
      const batch = writeBatch(db);
      existingDocs.forEach(docSnap => {
        batch.delete(docSnap.ref);
      });
      registered.forEach(webinarId => {
        const newDocRef = doc(registeredWebinarsRef);
        batch.set(newDocRef, { webinarId });
      });
      await batch.commit();
      console.log('Successfully updated registered webinars in Firestore');
    } catch (error) {
      console.error('Error updating registered webinars in Firestore:', error);
    }
  };

  // Function to update course progress in Firestore
  const updateCourseProgressInFirestore = async (progressMap: Map<number, number>) => {
    if (!currentUser) return;
    const userDocRef = doc(db, 'users', currentUser.uid);
    const courseProgressRef = collection(userDocRef, 'courseProgress');

    try {
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

  // Function to like an article
  const likeArticle = (articleId: number) => {
    setLikedArticles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(articleId)) {
        newSet.delete(articleId);
      } else {
        newSet.add(articleId);
      }
      updateLikedArticlesInFirestore(newSet);
      return newSet;
    });
  };

  // Function to bookmark an article
  const bookmarkArticle = (articleId: number) => {
    setBookmarkedArticles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(articleId)) {
        newSet.delete(articleId);
      } else {
        newSet.add(articleId);
      }
      updateBookmarkedArticlesInFirestore(newSet);
      return newSet;
    });
  };

  // Function to register for a webinar
  const registerWebinar = (webinarId: number) => {
    setRegisteredWebinars(prev => {
      const newSet = new Set(prev);
      if (!newSet.has(webinarId)) {
        newSet.add(webinarId);
        updateRegisteredWebinarsInFirestore(newSet);
      }
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

    // Calculate current week scans 
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); 
    const currentWeekScans = scannedProducts.filter(p => {
      const scanDate = new Date(p.date);
      return scanDate >= startOfWeek && scanDate <= now;
    }).length;

    // Calculate streakDays 
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

    // Calculate totalPoints 
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
      recipesViewed: prev.recipesViewed, 
    }));

  }, [scannedProducts, carbonEntries, currentUser]);

  // State for AI Recommendations persistence
  const [completedActions, setCompletedActions] = useState<number[]>([]);
  const [actionProgress, setActionProgress] = useState<Record<string, any>>({});
  const [selectedAICategory, setSelectedAICategory] = useState('all');
  const [selectedAIPriority, setSelectedAIPriority] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all'); 
  const [selectedPriority, setSelectedPriority] = useState('all'); 
  const [selectedTab, setSelectedTab] = useState('insights'); 
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let unsubscribeStats: () => void = () => {};
    let unsubscribeCarbon: () => void = () => {};
    let unsubscribeScans: () => void = () => {};

    if (!currentUser) {
      setLoading(false);
      setCompletedActions([]);
      setActionProgress({});
      setSelectedAICategory('all');
      setSelectedAIPriority('all');
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
        communityHelpCount: 0,
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
        console.log('Fetched recipesViewed from Firestore:', fetchedStats.recipesViewed);
        const defaultAchievements = [
          { id: 1, name: 'Green Streak Master', description: '12 consecutive days', icon: Star, color: 'yellow' },
          { id: 2, name: 'Carbon Reducer', description: 'Saved 67.8kg CO₂', icon: Leaf, color: 'green' },
          { id: 3, name: 'AI Collaborator', description: '92% recommendation accuracy', icon: Brain, color: 'blue' }
        ];
        setUserStats(prevStats => ({
          ...prevStats, 
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
          recipesViewed: typeof fetchedStats.recipesViewed === 'number' ? fetchedStats.recipesViewed : 0,
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
          sustainabilityScore: Number(fetchedStats.sustainabilityScore) || 0, 
          achievements: (Array.isArray(fetchedStats.achievements) && fetchedStats.achievements.length > 0) ? fetchedStats.achievements : defaultAchievements,
          goals: fetchedStats.goals ?? [],
        }));
      } else {
        if (currentUser) {
          const initialStatsForNewUser: UserStats = {
            totalPoints: 0,
            level: 1, 
            totalScans: 0,
            avgScore: 0,
            co2Saved: 0,
            rank: 0, 
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
            totalCarbonFootprint: 0,
            communityHelpCount: 0,
          };
          setDoc(userDocRef, initialStatsForNewUser)
            .then(() => setUserStats(initialStatsForNewUser)) 
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
        date: doc.data().timestamp?.toDate().toISOString() || new Date().toISOString(),
      };
      
      if (productData.source === 'ProductScanner') {
        if (!productsMap[productData.id] || new Date(productData.date) > new Date(productsMap[productData.id].date || 0)) {
          productsMap[productData.id] = productData;
        }
      }
    });
    setScannedProducts(Object.values(productsMap).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    }, (error) => {
      console.error("Error fetching scanned products:", error);
    });

    return () => {
      unsubscribeStats();
      unsubscribeCarbon();
      unsubscribeScans();
    };
  }, [currentUser]);

  
  React.useEffect(() => {
    if (currentUser) {
    }
  }, [currentUser]);

  
  React.useEffect(() => {
    
    const sanitizeActionProgress = (progress: Record<string, any>) => {
      const sanitized: Record<string, any> = {};
      for (const key in progress) {
        if (progress.hasOwnProperty(key)) {
          const action = progress[key];
          const { icon, ...restRecommendation } = action.recommendation || {};
          sanitized[key] = {
            ...action,
            recommendation: restRecommendation
          };
        }
      }
      return sanitized;
    };

    // Helper function to replace undefined values with null recursively
    const replaceUndefinedWithNull = (obj: any): any => {
      if (obj === undefined) {
        return null;
      }
      if (obj === null || typeof obj !== 'object') {
        return obj;
      }
      if (Array.isArray(obj)) {
        return obj.map(item => replaceUndefinedWithNull(item));
      }
      const newObj: any = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          newObj[key] = replaceUndefinedWithNull(obj[key]);
        }
      }
      return newObj;
    };

    if (currentUser) {
      const userDocRef = doc(db, 'users', currentUser.uid);
      const sanitizedActionProgress = sanitizeActionProgress(actionProgress);
      const sanitizedData = replaceUndefinedWithNull({
        completedActions,
        actionProgress: sanitizedActionProgress,
        selectedAICategory,
        selectedAIPriority,
        selectedCategory,
        selectedPriority,
        selectedTab
      });
      console.log('Saving AI Recommendations state to Firestore:', sanitizedData);
      updateDoc(userDocRef, sanitizedData).then(() => {
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

  
  React.useEffect(() => {
    localStorage.setItem('completedActions', JSON.stringify(completedActions));
    localStorage.setItem('actionProgress', JSON.stringify(actionProgress));
  }, [completedActions, actionProgress]);
  
  
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
  
        const sanitizedStats = {
          ...stats,
          achievements: stats.achievements?.map(({ icon, ...rest }) => rest) || [],
        };
       
        Object.keys(sanitizedStats).forEach(key => {
          if (sanitizedStats[key] === undefined) {
            sanitizedStats[key] = null;
          }
        });
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
          date: new Date().toISOString() 
        });
        
        setCarbonEntries(prev => [{ id: docRef.id, ...entry, date: new Date().toISOString() }, ...prev]);

        
        const updatedStats = {
          ...userStats,
          co2Saved: (userStats.co2Saved || 0) + entry.amount,
          totalPoints: (userStats.totalPoints || 0) + Math.floor(entry.amount * 10),
          currentWeekScans: (userStats.currentWeekScans || 0) + 1 
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
        
        const existingScanQuery = await getDocs(
          query(scannedCollectionRef, where('id', '==', product.id))
        );

        if (!existingScanQuery.empty) {
          
          const existingDocRef = existingScanQuery.docs[0].ref;
          
          const sanitizedProduct = { ...product };
          Object.keys(sanitizedProduct).forEach(key => {
            if (sanitizedProduct[key] === undefined) {
              sanitizedProduct[key] = null;
            }
          });
          await updateDoc(existingDocRef, {
            ...sanitizedProduct,
            alternatives: product.alternatives || [], 
            source: product.source || 'ProductScanner', 
            timestamp: serverTimestamp(), 
          });
          
        } else {
          
          await addDoc(scannedCollectionRef, {
            ...product,
            alternatives: product.alternatives || [], 
            source: product.source || 'ProductScanner', 
            date: new Date().toISOString(), 
            timestamp: serverTimestamp(), 
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
          const updatedCart = [...currentCart, product];
          const sanitizedCart = updatedCart.map(item => {
            const sanitizedItem = { ...item };
            Object.keys(sanitizedItem).forEach(key => {
              if (sanitizedItem[key] === undefined) {
                sanitizedItem[key] = null;
              }
            });
            return sanitizedItem;
          });

          await updateDoc(userDocRef, {
            cart: sanitizedCart,
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
    console.log(`Incrementing user stat: \${stat} by \${points}`);
    const newValue = typeof userStats[stat] === 'number' ? (userStats[stat] as number) + 1 : 1;
    const updatedStats = {
      ...userStats,
      [stat]: newValue,
      totalPoints: typeof userStats.totalPoints === 'number' ? userStats.totalPoints + points : points
    };
    console.log('Updated stats before Firestore update:', updatedStats);
    setUserStats(updatedStats);
    try {
      if (currentUser) {
        const userDocRef = doc(db, 'users', currentUser.uid);
        await updateDoc(userDocRef, {
          [stat]: newValue,
          totalPoints: updatedStats.totalPoints
        });
        console.log('Successfully updated user stat field in Firestore');
        const updatedDoc = await getDoc(userDocRef);
        if (updatedDoc.exists()) {
          console.log('Verified updated user stat in Firestore:', updatedDoc.data());
        } else {
          console.warn('User document not found after update');
        }
      }
    } catch (error) {
      console.error('Error updating user stat field in Firestore:', error);
    }
  };

  const incrementCourseCompleted = () => {
    incrementUserStat('coursesCompleted', 50);
  };

  const incrementRecipeViewed = async () => {
    if (!currentUser) return;
    try {
      const userDocRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userDocRef, {
        recipesViewed: increment(1),
        totalPoints: increment(10)
      });
      setUserStats(prev => ({
        ...prev,
        recipesViewed: (prev.recipesViewed || 0) + 1,
        totalPoints: (prev.totalPoints || 0) + 10
      }));
      console.log('Successfully incremented recipesViewed and totalPoints in Firestore');
    } catch (error) {
      console.error('Error incrementing recipesViewed in Firestore:', error);
    }
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
      selectedCategory, 
      setSelectedCategory, 
      selectedPriority, 
      setSelectedPriority, 
      selectedTab, 
      setSelectedTab, 
      enrolledCourses,
      courseProgress,
      enrollInCourse,
      updateCourseProgress,

      likedArticles,
      bookmarkedArticles,
      registeredWebinars,
      likeArticle,
      bookmarkArticle,
      registerWebinar,

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
