
import React, { createContext, useContext, useState, useEffect } from 'react';
import { getAuth, GoogleAuthProvider, signInWithPopup, User as FirebaseUser } from 'firebase/auth';

interface User {
  id: string; // Firebase user ID
  email: string;
  name: string;
  avatar?: string;
  contributedData: number;
  analysisCount: number;
  greenScore: number;
}

interface UserContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  signInWithGoogle: () => Promise<void>; // Added signInWithGoogle signature
  isLoading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  // Initialize Firebase Auth
  const auth = getAuth();
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const auth = getAuth();
 

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(firebaseUser => {
      if (firebaseUser) {
        setIsLoading(true);
        // User is signed in
        handleFirebaseUser(firebaseUser);
      } else {
        // User is signed out
        setUser(null);
      }
      setIsLoading(false);
    });
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockUser: User = {
      id: '1',
      email,
      name: email.split('@')[0],
      contributedData: 12,
      analysisCount: 45,
      greenScore: 78
    };
    
    setUser(mockUser);
    setIsLoading(false);
  };

  const register = async (email: string, password: string, name: string) => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockUser: User = {
      id: '1',
      email: email,
      name,
      contributedData: 0,
      analysisCount: 0,
      greenScore: 50
    };
    
    setUser(mockUser);
    setIsLoading(false);
  };

  const logout = () => {
    setUser(null);
  };

  const handleFirebaseUser = (firebaseUser: FirebaseUser) => {
    const appUser: User = {
      id: firebaseUser.uid,
      email: firebaseUser.email || '', // Use default empty string if email is null
      name: firebaseUser.displayName || 'User', // Use default name if display name is null
      avatar: firebaseUser.photoURL || undefined,
      contributedData: user?.contributedData || 0, // Preserve existing data if any
      analysisCount: user?.analysisCount || 0, // Preserve existing data if any
      greenScore: user?.greenScore || 50 // Preserve existing data or set default
    };
    setUser(appUser);
  };

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
    }
  };

  const signInWithGoogle = async () => {
    setIsLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      // The signed-in user info is in result.user
      handleFirebaseUser(result.user);
    } catch (error: any) {
      console.error("Error during Google Sign-In:", error.message);
      setIsLoading(false);
    }
  };

  return (
    <UserContext.Provider value={{ user, login, register, logout, updateUser, signInWithGoogle, isLoading }}>
      {children}
    </UserContext.Provider>
  );

}
