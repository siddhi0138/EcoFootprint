

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { collection, doc, onSnapshot, addDoc, updateDoc, getDoc, setDoc, deleteDoc, getDocs, query, where, serverTimestamp, increment, runTransaction } from 'firebase/firestore';
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
  articlesRead: number;
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

  enrolledCourses: Set<string>;
  courseProgress: Map<string, number>;
  enrollInCourse: (courseId: string, meta?: { title?: string; instructor?: string; level?: string; category?: string }) => void;
  updateCourseProgress: (courseId: string, progress: number, meta?: { title?: string }) => void;

  likedArticles: Set<string>;
  bookmarkedArticles: Set<string>;
  bookmarkedCourses: Set<string>;
  registeredWebinars: Set<string>;
  likeArticle: (articleId: string, meta?: { title?: string; author?: string; category?: string }) => void;
  bookmarkArticle: (articleId: string, meta?: { title?: string; author?: string; category?: string }) => void;
  bookmarkCourse: (courseId: string, meta?: { title?: string; instructor?: string; level?: string; category?: string }) => void;
  registerWebinar: (webinarId: string, meta?: { title?: string; speaker?: string; date?: string; time?: string }) => void;

  addCarbonEntry: (entry: Omit<CarbonEntry, 'id' | 'date'>) => void;
  addScannedProduct: (product: ScannedProduct) => void;
  addPoints: (points: number) => void;
  redeemReward: (cost: number, rewardName: string) => Promise<boolean>;
  incrementCourseCompleted: () => void;
  addToCart: (product: ScannedProduct) => Promise<void>;
  incrementRecipeViewed: () => void;
  incrementArticlesRead: () => void;
  incrementTransportTrip: () => void;
  loading: boolean;
}

export const UserDataContext = createContext<UserDataContextType | undefined>(undefined);

const DEFAULT_USER_STATS: UserStats = {
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
  articlesRead: 0,
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
};

// Last-known user data is cached in localStorage so a page refresh can paint the real numbers
// instantly, instead of flashing zeros for the ~0.5-3s it takes Firebase Auth to restore the
// session and Firestore to stream the stats back. The live onSnapshot listeners reconcile the
// cache with the server moments later. `achievements` is intentionally dropped from the cache
// because its entries carry live React icon components that don't survive JSON serialization.
const USER_DATA_CACHE_KEY = 'ecoscope_userdata_cache_v1';

interface UserDataCache {
  uid: string;
  userStats: UserStats;
  carbonEntries: CarbonEntry[];
  scannedProducts: ScannedProduct[];
}

const loadUserDataCache = (): UserDataCache | null => {
  try {
    const raw = localStorage.getItem(USER_DATA_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as UserDataCache;
    if (!parsed || typeof parsed.uid !== 'string' || !parsed.userStats) return null;
    return parsed;
  } catch {
    return null;
  }
};

const saveUserDataCache = (cache: UserDataCache) => {
  try {
    const { achievements, ...statsWithoutIcons } = cache.userStats;
    localStorage.setItem(
      USER_DATA_CACHE_KEY,
      JSON.stringify({ ...cache, userStats: { ...statsWithoutIcons, achievements: [] } })
    );
  } catch {
    /* quota / serialization errors are non-fatal - we just lose the instant-paint optimization */
  }
};

const clearUserDataCache = () => {
  try {
    localStorage.removeItem(USER_DATA_CACHE_KEY);
  } catch {
    /* ignore */
  }
};

export const UserDataProvider = ({ children }: { children: ReactNode }) => {
  const { currentUser, authChecked } = useAuth();
  // Read the cache once at mount so the very first paint after a refresh shows real values.
  const initialCache = React.useRef<UserDataCache | null>(loadUserDataCache()).current;
  const [carbonEntries, setCarbonEntries] = useState<CarbonEntry[]>(initialCache?.carbonEntries ?? []);
  const [scannedProducts, setScannedProducts] = useState<ScannedProduct[]>(initialCache?.scannedProducts ?? []);
  const [userStats, setUserStats] = useState<UserStats>(
    initialCache?.userStats ? { ...DEFAULT_USER_STATS, ...initialCache.userStats } : { ...DEFAULT_USER_STATS }
  );

  
  const [enrolledCourses, setEnrolledCourses] = useState<Set<string>>(new Set());
  const [courseProgress, setCourseProgress] = useState<Map<string, number>>(new Map());

  
  const [likedArticles, setLikedArticles] = useState<Set<string>>(new Set());
  const [bookmarkedArticles, setBookmarkedArticles] = useState<Set<string>>(new Set());
  // Separate from bookmarkedArticles - courses and articles both use small numeric ids (1, 2, 3...)
  // so bookmarking course #1 must not be stored in the same collection/Set as article #1.
  const [bookmarkedCourses, setBookmarkedCourses] = useState<Set<string>>(new Set());
  const [registeredWebinars, setRegisteredWebinars] = useState<Set<string>>(new Set());

  React.useEffect(() => {
    if (!currentUser) {
      setEnrolledCourses(new Set());
      setCourseProgress(new Map());
      setLikedArticles(new Set());
      setBookmarkedArticles(new Set());
      setBookmarkedCourses(new Set());
      setRegisteredWebinars(new Set());
      return;
    }

    const userDocRef = doc(db, 'users', currentUser.uid);
    const enrolledCoursesRef = collection(userDocRef, 'enrolledCourses');
    const courseProgressRef = collection(userDocRef, 'courseProgress');
    const likedArticlesRef = collection(userDocRef, 'likedArticles');
    const bookmarkedArticlesRef = collection(userDocRef, 'bookmarkedArticles');
    const bookmarkedCoursesRef = collection(userDocRef, 'bookmarkedCourses');
    const registeredWebinarsRef = collection(userDocRef, 'registeredWebinars');

    // Load enrolled courses
    getDocs(enrolledCoursesRef).then(snapshot => {
      const enrolled = new Set<string>();
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
      const progressMap = new Map<string, number>();
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
      const liked = new Set<string>();
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
      const bookmarked = new Set<string>();
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

    // Load bookmarked courses
    getDocs(bookmarkedCoursesRef).then(snapshot => {
      const bookmarked = new Set<string>();
      snapshot.forEach(doc => {
        const data = doc.data();
        if (data.courseId) {
          bookmarked.add(data.courseId);
        }
      });
      setBookmarkedCourses(bookmarked);
    }).catch(error => {
      console.error('Error loading bookmarked courses:', error);
    });

    // Load registered webinars
    getDocs(registeredWebinarsRef).then(snapshot => {
      const registered = new Set<string>();
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


  // Each of these writes/deletes a single doc keyed by the item's own id (courseId/articleId/
  // webinarId as the doc ID) instead of the previous approach of deleting and rewriting the
  // ENTIRE subcollection on every single add/remove. That old approach lost per-item metadata
  // (there wasn't any to lose before) and would only ever have stored the bare id - this version
  // stores real metadata (title, etc.) plus a timestamp for when the action happened, and only
  // ever touches the one doc that actually changed.

  // Function to enroll in a course
  const enrollInCourse = (courseId: string, meta?: { title?: string; instructor?: string; level?: string; category?: string }) => {
    setEnrolledCourses(prev => {
      if (prev.has(courseId)) return prev;
      const newSet = new Set(prev);
      newSet.add(courseId);
      return newSet;
    });
    if (!currentUser) return;
    const courseDocRef = doc(db, 'users', currentUser.uid, 'enrolledCourses', courseId.toString());
    setDoc(courseDocRef, { courseId, ...meta, enrolledAt: serverTimestamp() }, { merge: true }).catch(error => {
      console.error('Error enrolling in course in Firestore:', error);
    });
  };

  // Function to like an article
  const likeArticle = (articleId: string, meta?: { title?: string; author?: string; category?: string }) => {
    if (!currentUser) {
      setLikedArticles(prev => {
        const newSet = new Set(prev);
        newSet.has(articleId) ? newSet.delete(articleId) : newSet.add(articleId);
        return newSet;
      });
      return;
    }
    const articleDocRef = doc(db, 'users', currentUser.uid, 'likedArticles', articleId.toString());
    setLikedArticles(prev => {
      const wasLiked = prev.has(articleId);
      const newSet = new Set(prev);
      wasLiked ? newSet.delete(articleId) : newSet.add(articleId);
      if (wasLiked) {
        deleteDoc(articleDocRef).catch(error => console.error('Error unliking article in Firestore:', error));
      } else {
        setDoc(articleDocRef, { articleId, ...meta, likedAt: serverTimestamp() }).catch(error => console.error('Error liking article in Firestore:', error));
      }
      return newSet;
    });
  };

  // Function to bookmark an article
  const bookmarkArticle = (articleId: string, meta?: { title?: string; author?: string; category?: string }) => {
    if (!currentUser) {
      setBookmarkedArticles(prev => {
        const newSet = new Set(prev);
        newSet.has(articleId) ? newSet.delete(articleId) : newSet.add(articleId);
        return newSet;
      });
      return;
    }
    const articleDocRef = doc(db, 'users', currentUser.uid, 'bookmarkedArticles', articleId.toString());
    setBookmarkedArticles(prev => {
      const wasBookmarked = prev.has(articleId);
      const newSet = new Set(prev);
      wasBookmarked ? newSet.delete(articleId) : newSet.add(articleId);
      if (wasBookmarked) {
        deleteDoc(articleDocRef).catch(error => console.error('Error removing bookmark in Firestore:', error));
      } else {
        setDoc(articleDocRef, { articleId, ...meta, bookmarkedAt: serverTimestamp() }).catch(error => console.error('Error bookmarking article in Firestore:', error));
      }
      return newSet;
    });
  };

  // Function to bookmark a course - kept entirely separate from bookmarkArticle/bookmarkedArticles
  // above (own Set, own Firestore subcollection) since courses and articles share the same
  // small numeric id space.
  const bookmarkCourse = (courseId: string, meta?: { title?: string; instructor?: string; level?: string; category?: string }) => {
    if (!currentUser) {
      setBookmarkedCourses(prev => {
        const newSet = new Set(prev);
        newSet.has(courseId) ? newSet.delete(courseId) : newSet.add(courseId);
        return newSet;
      });
      return;
    }
    const courseDocRef = doc(db, 'users', currentUser.uid, 'bookmarkedCourses', courseId.toString());
    setBookmarkedCourses(prev => {
      const wasBookmarked = prev.has(courseId);
      const newSet = new Set(prev);
      wasBookmarked ? newSet.delete(courseId) : newSet.add(courseId);
      if (wasBookmarked) {
        deleteDoc(courseDocRef).catch(error => console.error('Error removing course bookmark in Firestore:', error));
      } else {
        setDoc(courseDocRef, { courseId, ...meta, bookmarkedAt: serverTimestamp() }).catch(error => console.error('Error bookmarking course in Firestore:', error));
      }
      return newSet;
    });
  };

  // Function to register for a webinar
  const registerWebinar = (webinarId: string, meta?: { title?: string; speaker?: string; date?: string; time?: string }) => {
    setRegisteredWebinars(prev => {
      if (prev.has(webinarId)) return prev;
      const newSet = new Set(prev);
      newSet.add(webinarId);
      return newSet;
    });
    if (!currentUser) return;
    const webinarDocRef = doc(db, 'users', currentUser.uid, 'registeredWebinars', webinarId.toString());
    setDoc(webinarDocRef, { webinarId, ...meta, registeredAt: serverTimestamp() }, { merge: true }).catch(error => {
      console.error('Error registering webinar in Firestore:', error);
    });
  };

  // Function to update progress for a course
  const updateCourseProgress = (courseId: string, progress: number, meta?: { title?: string }) => {
    setCourseProgress(prev => {
      const newMap = new Map(prev);
      newMap.set(courseId, progress);
      return newMap;
    });
    if (!currentUser) return;
    const progressDocRef = doc(db, 'users', currentUser.uid, 'courseProgress', courseId.toString());
    setDoc(progressDocRef, { courseId, progress, ...meta, updatedAt: serverTimestamp() }, { merge: true }).catch(error => {
      console.error('Error updating course progress in Firestore:', error);
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

    // Most-scanned product category
    const categoryCounts = scannedProducts.reduce((acc, p) => {
      const cat = p.category || 'Uncategorized';
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const topCategory = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'none';

    // Month-over-month change in average sustainability score
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();
    const lastMonthDate = new Date(thisYear, thisMonth - 1, 1);
    const scoresInMonth = (month: number, year: number) =>
      scannedProducts.filter(p => {
        const d = new Date(p.date);
        return d.getMonth() === month && d.getFullYear() === year;
      });
    const avgOf = (items: typeof scannedProducts) =>
      items.length > 0 ? items.reduce((acc, p) => acc + (p.sustainabilityScore || 0), 0) / items.length : null;
    const thisMonthAvg = avgOf(scoresInMonth(thisMonth, thisYear));
    const lastMonthAvg = avgOf(scoresInMonth(lastMonthDate.getMonth(), lastMonthDate.getFullYear()));
    const monthlyTrend = thisMonthAvg !== null && lastMonthAvg !== null && lastMonthAvg > 0
      ? Math.round(((thisMonthAvg - lastMonthAvg) / lastMonthAvg) * 100)
      : 0;

    // Update userStats with recalculated values. totalPoints is deliberately NOT
    // recomputed here - it's authoritative from Firestore (accumulated via
    // updateUserStatsAtomic across many different action types with their own point
    // values: carbon entries, scans, manual awards, redemptions). Re-deriving it from
    // just totalScans/co2Saved here used a different formula and clobbered the real
    // value every time carbonEntries/scannedProducts changed.
    setUserStats(prev => ({
      ...prev,
      totalScans,
      co2Saved: totalCO2Saved,
      totalCarbonFootprint: totalCO2Saved,
      avgScore,
      currentWeekScans,
      streakDays: streak,
      topCategory,
      monthlyTrend,
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
  // Guards the save effect below from firing with the fresh-mount empty state before Firestore's
  // previously-saved completedActions/actionProgress have actually been loaded - without this,
  // logging in always immediately overwrote saved progress with [] / {} (see the user-stats
  // onSnapshot handler below, which is what actually sets this once real data has loaded).
  const hasLoadedActionStateRef = React.useRef(false);

  React.useEffect(() => {
    let unsubscribeStats: () => void = () => {};
    let unsubscribeCarbon: () => void = () => {};
    let unsubscribeScans: () => void = () => {};

    if (!currentUser) {
      // Auth is still restoring the persisted session on a fresh page load - keep whatever we
      // hydrated from the cache rather than flashing zeros. We only clear once auth has
      // definitively resolved to "logged out".
      if (!authChecked) return;
      setLoading(false);
      setCompletedActions([]);
      setActionProgress({});
      setSelectedAICategory('all');
      setSelectedAIPriority('all');
      setUserStats({ ...DEFAULT_USER_STATS });
      setCarbonEntries([]);
      setScannedProducts([]);
      clearUserDataCache();
      hasLoadedActionStateRef.current = false;
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
          weeklyGoal: Number(fetchedStats.weeklyGoal) || 75,
          currentWeekScans: Number(fetchedStats.currentWeekScans) || 0,
          streakDays: Number(fetchedStats.streakDays) || 0,
          coursesCompleted: Number(fetchedStats.coursesCompleted) || 0,
          recipesViewed: typeof fetchedStats.recipesViewed === 'number' ? fetchedStats.recipesViewed : 0,
          articlesRead: typeof fetchedStats.articlesRead === 'number' ? fetchedStats.articlesRead : 0,
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

        // Hydrate AI Recommendations state from the SAME doc the save effect below writes to -
        // this must happen before that effect is allowed to write, or it always overwrites real
        // saved progress with the fresh mount's empty [] / {} defaults.
        setCompletedActions(Array.isArray((fetchedStats as any).completedActions) ? (fetchedStats as any).completedActions : []);
        setActionProgress(
          (fetchedStats as any).actionProgress && typeof (fetchedStats as any).actionProgress === 'object'
            ? (fetchedStats as any).actionProgress
            : {}
        );
        setSelectedAICategory((fetchedStats as any).selectedAICategory || 'all');
        setSelectedAIPriority((fetchedStats as any).selectedAIPriority || 'all');
        setSelectedCategory((fetchedStats as any).selectedCategory || 'all');
        setSelectedPriority((fetchedStats as any).selectedPriority || 'all');
        setSelectedTab((fetchedStats as any).selectedTab || 'insights');
        hasLoadedActionStateRef.current = true;
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
            articlesRead: 0,
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
          // Merge (not replace) and carry the identity fields, so this can never wipe the
          // uid/name/email that AuthContext writes if the two run in a race on first login.
          setDoc(userDocRef, {
            ...initialStatsForNewUser,
            uid: currentUser.uid,
            name: currentUser.name || currentUser.email || '',
            email: currentUser.email || '',
          }, { merge: true })
            .then(() => setUserStats(initialStatsForNewUser))
            .catch(error => console.error("Error setting initial user stats:", error));
          // Brand-new user doc, so there's nothing pre-existing to lose - safe to let the save
          // effect below run with the fresh empty completedActions/actionProgress defaults.
          hasLoadedActionStateRef.current = true;
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
  }, [currentUser, authChecked]);

  // Keep the localStorage cache in sync with the live data so the next refresh paints instantly.
  React.useEffect(() => {
    if (!currentUser) return;
    saveUserDataCache({
      uid: currentUser.uid,
      userStats,
      carbonEntries,
      scannedProducts,
    });
  }, [currentUser, userStats, carbonEntries, scannedProducts]);

  
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

    if (currentUser && hasLoadedActionStateRef.current) {
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


  // Mirrors just the public fields needed for the community leaderboard into a top-level
  // 'leaderboard' collection. Firestore security rules only let a user read their own
  // 'users/{uid}' doc, so the leaderboard (which must read every user's points) needs its
  // own doc per user that everyone is allowed to read.
  React.useEffect(() => {
    if (!currentUser) return;
    const leaderboardRef = doc(db, 'leaderboard', currentUser.uid);
    setDoc(leaderboardRef, {
      name: currentUser.name || currentUser.email || 'EcoScope Member',
      totalPoints: userStats.totalPoints || 0,
      level: userStats.level || 0,
      updatedAt: serverTimestamp(),
    }, { merge: true }).catch((err) => console.error('Failed to update leaderboard entry:', err));
  }, [currentUser, userStats.totalPoints, userStats.level]);

  // Accumulator-style updates (add N points, add 1 scan, etc.) must read the CURRENT Firestore
  // value, not React's `userStats` state - that state can be stale by the time a write lands
  // (e.g. adding several carbon entries in quick succession, each computed from the same
  // pre-update snapshot, silently loses all but the last increment). A transaction reads the
  // live server value and writes atomically, so concurrent calls can never clobber each other.
  const updateUserStatsAtomic = async (computeUpdates: (current: Partial<UserStats>) => Partial<UserStats>) => {
    if (!currentUser) return;
    const userDocRef = doc(db, 'users', currentUser.uid);
    await runTransaction(db, async (transaction) => {
      const snap = await transaction.get(userDocRef);
      const current = (snap.exists() ? snap.data() : {}) as Partial<UserStats>;
      const updates: Record<string, unknown> = { ...computeUpdates(current) };
      Object.keys(updates).forEach((key) => {
        if (updates[key] === undefined) updates[key] = null;
      });
      transaction.set(userDocRef, updates, { merge: true });
    });
  };

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
      const pointsEarned = Math.floor(entry.amount * 10);
      try {
        await addDoc(carbonCollectionRef, {
          ...entry,
          date: new Date().toISOString()
        });
        // carbonEntries updates via the onSnapshot listener above - adding it here too
        // would double the entry once that listener's own update lands.

        // Note: currentWeekScans is deliberately NOT touched here. It counts actual product
        // scans (the recompute effect derives it from scannedProducts this week), and the
        // "Weekly Scanning Activity" / "Weekly Scan Goal" UI is labelled as products scanned.
        // Bumping it on carbon entries made the number inconsistent - it showed a non-zero
        // count in-session but reset to the real scan count (often 0) after a refresh.
        await updateUserStatsAtomic((current) => ({
          co2Saved: (Number(current.co2Saved) || 0) + entry.amount,
          totalPoints: (Number(current.totalPoints) || 0) + pointsEarned,
        }));
        // Optimistic local bump for instant UI feedback - onSnapshot reconciles with the
        // real server value moments later regardless.
        setUserStats(prev => ({
          ...prev,
          co2Saved: (prev.co2Saved || 0) + entry.amount,
          totalPoints: (prev.totalPoints || 0) + pointsEarned,
        }));
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
        const scanPointsEarned = Math.floor(product.sustainabilityScore / 10);
        await updateUserStatsAtomic((current) => {
          const priorScans = Number(current.totalScans) || 0;
          const priorAvg = Number(current.avgScore) || 0;
          return {
            totalScans: priorScans + 1,
            avgScore: priorScans === 0 ? product.sustainabilityScore :
              Math.round((priorAvg * priorScans + product.sustainabilityScore) / (priorScans + 1)),
            totalPoints: (Number(current.totalPoints) || 0) + scanPointsEarned,
            currentWeekScans: (Number(current.currentWeekScans) || 0) + 1,
          };
        });
        setUserStats(prev => {
          const priorScans = prev.totalScans || 0;
          return {
            ...prev,
            totalScans: priorScans + 1,
            avgScore: priorScans === 0 ? product.sustainabilityScore :
              Math.round(((prev.avgScore || 0) * priorScans + product.sustainabilityScore) / (priorScans + 1)),
            totalPoints: (prev.totalPoints || 0) + scanPointsEarned,
            currentWeekScans: (prev.currentWeekScans || 0) + 1,
          };
        });
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
    await updateUserStatsAtomic((current) => ({
      totalPoints: (Number(current.totalPoints) || 0) + points,
    }));
    setUserStats(prev => ({ ...prev, totalPoints: (prev.totalPoints || 0) + points }));
  };

  const redeemReward = async (cost: number, rewardName: string): Promise<boolean> => {
    if (!currentUser) return false;
    try {
      // The affordability check has to happen with the transaction's live-read value, not
      // React state - otherwise two rapid redemptions (or stale local state) could both pass
      // the check and overspend points that were already spent by the other.
      await updateUserStatsAtomic((current) => {
        const available = Number(current.totalPoints) || 0;
        if (available < cost) {
          throw new Error('INSUFFICIENT_POINTS');
        }
        return { totalPoints: available - cost };
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'INSUFFICIENT_POINTS') return false;
      console.error('Error redeeming reward:', error);
      return false;
    }
    setUserStats(prev => ({ ...prev, totalPoints: (prev.totalPoints || 0) - cost }));
    try {
      const redeemedRef = collection(db, 'users', currentUser.uid, 'redeemedRewards');
      await addDoc(redeemedRef, { rewardName, cost, redeemedAt: serverTimestamp() });
    } catch (error) {
      console.error('Error recording reward redemption:', error);
    }
    return true;
  };

  const incrementUserStat = async (stat: keyof UserStats, points: number) => {
    if (!currentUser) return;
    let newValue: number = 0;
    try {
      await updateUserStatsAtomic((current) => {
        newValue = (typeof current[stat] === 'number' ? (current[stat] as number) : 0) + 1;
        return {
          [stat]: newValue,
          totalPoints: (Number(current.totalPoints) || 0) + points,
        } as Partial<UserStats>;
      });
      setUserStats(prev => ({
        ...prev,
        [stat]: newValue,
        totalPoints: (prev.totalPoints || 0) + points,
      }));
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

  const incrementArticlesRead = async () => {
    if (!currentUser) return;
    try {
      const userDocRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userDocRef, {
        articlesRead: increment(1),
        totalPoints: increment(5)
      });
      setUserStats(prev => ({
        ...prev,
        articlesRead: (prev.articlesRead || 0) + 1,
        totalPoints: (prev.totalPoints || 0) + 5
      }));
    } catch (error) {
      console.error('Error incrementing articlesRead in Firestore:', error);
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
      bookmarkedCourses,
      registeredWebinars,
      likeArticle,
      bookmarkArticle,
      bookmarkCourse,
      registerWebinar,

      addCarbonEntry,
      addScannedProduct,
      addPoints,
      redeemReward,
      addToCart,
      incrementCourseCompleted,
      incrementRecipeViewed,
      incrementArticlesRead,
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
