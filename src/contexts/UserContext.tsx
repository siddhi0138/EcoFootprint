
import React, { createContext, useContext, useState, useEffect } from 'react';
import { getAuth, GoogleAuthProvider, signInWithPopup, User as FirebaseUser, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { FirebaseError } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
interface User {
  id: string; // Firebase user ID
  uid: string; // Firebase user UID
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
  const db = getFirestore();
 

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(firebaseUser => {
      if (firebaseUser) {
        setIsLoading(true);
        // Check if the user is a newly registered user vs. a returning user
        // If creationTime is very close to lastSignInTime, it's likely a new registration
        // We add a small buffer (e.g., 1000ms) to account for potential minor time differences
        const isNewUser = firebaseUser.metadata.creationTime === firebaseUser.metadata.lastSignInTime ||
                          (new Date(firebaseUser.metadata.lastSignInTime!).getTime() - new Date(firebaseUser.metadata.creationTime!).getTime() < 1000);

        if (!isNewUser) {
          // User is signed in (returning user)
        handleFirebaseUser(firebaseUser);
        } else {
          // New user just registered, do not automatically log them in
          setUser(null);
        }
      } else {
        // User is signed out
        setUser(null);
      }
      setIsLoading(false);
    });
  }, []);

  const login = async (email: string, password: string) => {
 try {
      setIsLoading(true);
      // Replace with actual Firebase login
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Save user data to Firestore
      await saveUserToFirestore(firebaseUser);

      handleFirebaseUser(firebaseUser);
    } catch (error: FirebaseError | any) {
      console.error("Error during login:", error.message);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };




  const register = async (email: string, password: string, name: string) => {    try {
      setIsLoading(true);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      await saveUserToFirestore(firebaseUser, { name });
      //
      // Examples (replace with your actual routing code):
      //
      // // If using React Router v6:
      // import { useNavigate } from 'react-router-dom';
      // const navigate = useNavigate(); // Call this in your component, not here
      // navigate('/login'); // Call this after successful registration
      //
      // // If using React Router v5 or earlier (with useHistory hook):
      // import { useHistory } from 'react-router-dom';
      // const history = useHistory(); // Call this in your component, not here
      // history.push('/login'); // Call this after successful registration
      setUser(null);
    } catch (error: FirebaseError | any) {
      console.error("Error during registration:", error.message);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    // Sign out from Firebase Authentication
    signOut(auth).then(() => {
      // Sign-out successful.
      setUser(null); // Clear user state
      console.log("User signed out successfully.");
    }).catch((error) => {
      // An error happened.
      console.error("Error during Firebase sign out:", error);
    });
  };

  const saveUserToFirestore = async (firebaseUser: FirebaseUser, additionalData: { name?: string } = {}) => {
 if (!firebaseUser) {
      console.warn("saveUserToFirestore called with null firebaseUser.");
      return; // Exit if firebaseUser is null
 }

    const db = getFirestore(); // Ensure db is accessible within the function
    const userDocRef = doc(db, 'users', firebaseUser.uid);
      try {
        await setDoc(userDocRef, {
 uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          name: firebaseUser.displayName || additionalData.name || 'User', // Use provided name or default
          avatar: firebaseUser.photoURL || null, // Changed undefined to null
          contributedData: user?.contributedData || 0,
          analysisCount: user?.analysisCount || 0,
          greenScore: user?.greenScore || 50
        }, { merge: true });
        console.log("User data saved to Firestore for UID:", firebaseUser.uid);
      } catch (error) {
        console.error("Error saving user data to Firestore:", error);
        throw error; // Re-throw the error to be caught in handleFirebaseUser
      }
  };

  const handleFirebaseUser = async (firebaseUser: FirebaseUser) => {
 try {
      setIsLoading(true); // Set loading to true at the start of handling
      const appUser: User = {
        id: firebaseUser.uid,
        uid: firebaseUser.uid, // Add uid here
        email: firebaseUser.email || '', // Use default empty string if email is null
        name: firebaseUser.displayName || 'User', // Use default name if display name is null
        avatar: firebaseUser.photoURL || null, // Changed undefined to null
        contributedData: user?.contributedData || 0, // Preserve existing data if any
        analysisCount: user?.analysisCount || 0, // Preserve existing data if any
        greenScore: user?.greenScore || 50 // Preserve existing data or set default
      };
      setUser(appUser);
      // Save user data to Firestore after setting the user in state
      await saveUserToFirestore(firebaseUser, { name: appUser.name });
    } catch (error: any) {
      console.error("Error handling Firebase user or saving to Firestore:", error);
 setUser(null); // Clear user state on error
 } finally {
      setIsLoading(false); // Set loading to false regardless of success or failure
    }
  };
  const updateUser = (updates: Partial<User>) => { // This function was incomplete, adding body
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser); // Update the user state
    }
  };
  const signInWithGoogle = async () => {
    setIsLoading(true);
    try {
      const provider = new GoogleAuthProvider();

      // Prompt the user to select a Google account
      const result = await signInWithPopup(auth, provider);
      console.log("Google Sign-In successful. User:", result.user); // Log success
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
