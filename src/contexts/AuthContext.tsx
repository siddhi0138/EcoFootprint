import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase'; 
 
interface User {
  id: string;
  uid: string; 
  name: string;
  email: string;
  change?: any;
  displayName?: string | null;
  photoURL?: string | null;
}
interface AuthContextType {
  currentUser: User | null;
  user: User | null; 
  login: (email: string, password: string) => Promise<string | null>;
  register: (name: string, email: string, password: string) => Promise<string | null>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

const login = async (email: string, password: string) => {
    setIsLoading(true);
    localStorage.removeItem('user');
    setCurrentUser(null);
    try {
      if (!email || !password) {
        throw new Error('Email and password must not be empty.');
      }
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      const appUser: User = {
        id: firebaseUser.uid,
        uid: firebaseUser.uid,
        name: firebaseUser.displayName || firebaseUser.email || '',
        email: firebaseUser.email || '',
      };

      
      if (firebaseUser) {
        setCurrentUser(appUser);
        localStorage.setItem('user', JSON.stringify(appUser));
      }
      return null; 
    } catch (error: any) {
      console.error('Login error full object:', error);
      
      if (error.code === 'auth/user-not-found') {
        return 'User not found. Please register first.';
      } else if (error.code === 'auth/wrong-password') {
        return 'Incorrect password. Please try again.';
      } else if (error.code === 'auth/invalid-email') {
        return 'Invalid email address.';
      } else if (error.code === 'auth/user-disabled') {
        return 'User account is disabled.';
      } else if (error.message) {
        return error.message;
      } else {
        return 'Login failed. Please try again.';
      }
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string): Promise<string | null> => {
    setIsLoading(true);
    try {
      if (!email || !password || !name) {
        return 'Name, email, and password must not be empty.';
      }
      if (!validateEmail(email)) {
        return 'Invalid email format.';
      }
      if (password.length < 6) {
        return 'Password must be at least 6 characters.';
      }
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      if (!firebaseUser) {
        return 'Registration failed. Please try again.';
      }

      await updateProfile(firebaseUser, {
        displayName: name,
      });

      
      const writeUserData = async () => {
        for (let attempt = 1; attempt <= 3; attempt++) {
          try {
            const user = auth.currentUser;
            if (user && user.uid === firebaseUser.uid) {
              await setDoc(doc(db, 'users', firebaseUser.uid), {
                uid: firebaseUser.uid,
                name,
                email: firebaseUser.email,
              });
              console.log('Firestore write successful on attempt', attempt);
              return;
            } else {
              console.warn('Auth user not ready, attempt', attempt);
            }
          } catch (firestoreError) {
            console.error('Firestore write error during registration attempt', attempt, firestoreError);
            if (attempt === 3) throw firestoreError;
          }
          await new Promise(res => setTimeout(res, 1000));
        }
      };
      await writeUserData();

      return null; 
    } catch (error: any) {
      console.error('Registration error:', error);
      if (error.code === 'auth/email-already-in-use') {
        return 'Email is already in use. Please login or use a different email.';
      } else if (error.message) {
        return error.message;
      } else {
        return 'Registration failed. Please try again.';
      }
    } finally {
      setIsLoading(false);
    }
  };

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const loginWithGoogle = async () => {
    setIsLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;

      const appUser: User = {
        id: firebaseUser.uid,
        uid: firebaseUser.uid,
        name: firebaseUser.displayName || '',
        email: firebaseUser.email || '',
      };

     
      const writeUserData = async () => {
        for (let attempt = 1; attempt <= 3; attempt++) {
          try {
            const user = auth.currentUser;
            if (user && user.uid === firebaseUser.uid) {
              await setDoc(doc(db, 'users', firebaseUser.uid), {
                uid: firebaseUser.uid,
                name: firebaseUser.displayName || '',
                email: firebaseUser.email || '',
              }, { merge: true });
              console.log('Firestore write successful on attempt', attempt);
              return;
            } else {
              console.warn('Auth user not ready, attempt', attempt);
            }
          } catch (firestoreError) {
            console.error('Firestore write error during Google login attempt', attempt, firestoreError);
            if (attempt === 3) throw firestoreError;
          }
          await new Promise(res => setTimeout(res, 1000));
        }
      };
      await writeUserData();

      
      const userDocRef = doc(db, 'users', firebaseUser.uid);

      const subcollectionsInit = async () => {
        const batchPromises = [];

        
        batchPromises.push(setDoc(doc(userDocRef, 'profile', 'data'), {}));

        batchPromises.push(setDoc(doc(userDocRef, 'cart', 'items'), { items: [] }));


        await Promise.all(batchPromises);
      };

      await subcollectionsInit();

      setCurrentUser(appUser);
      localStorage.setItem('user', JSON.stringify(appUser));
    } catch (error) {
      console.error('Google login error:', error);
    } finally {
      setIsLoading(false);
    }
  };


  const logout = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
      localStorage.removeItem('user');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      if (firebaseUser) {
        const appUser: User = {
          id: firebaseUser.uid,
          uid: firebaseUser.uid,
          name: firebaseUser.displayName || firebaseUser.email || '',
          email: firebaseUser.email || '',
        };
        setCurrentUser(appUser);
        localStorage.setItem('user', JSON.stringify(appUser));
      } else {
        setCurrentUser(null);
        localStorage.removeItem('user');
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider
 value={{ currentUser, user: currentUser, login, register, loginWithGoogle, logout, isLoading }} 
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
