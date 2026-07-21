import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { db } from '../firebase';
import { collection, doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';

export interface ScannedProduct {
  id: string;
  date?: string;
  name: string;
  brand: string;
  sustainabilityScore: number;
  category?: string;
  price?: number;
  image?: string;
  metrics?: {
    carbon: number;
    water: number;
    waste: number;
    energy: number;
    ethics: number;
  };
  certifications?: string[];
  pros?: string[];
  cons?: string[];
  rating?: number;
  reviews?: number;
  inStock?: boolean;
  features?: string[];
}

interface ProductComparisonContextType {
  comparisonProducts: ScannedProduct[];
  setComparisonProducts: React.Dispatch<React.SetStateAction<ScannedProduct[]>>;
  addProductToComparison: (product: ScannedProduct) => void;
  removeProductFromComparison: (productId: string) => void;
  clearComparison: () => void;
}

const ProductComparisonContext = createContext<ProductComparisonContextType | undefined>(undefined);

export const ProductComparisonProvider = ({ children }: { children: ReactNode }) => {
  const { currentUser } = useAuth();
  const [comparisonProducts, setComparisonProducts] = useState<ScannedProduct[]>([]);
  // Guards the save effect from firing before the Firestore snapshot has loaded. Without it,
  // the empty initial state ([]) was written straight back to Firestore on every refresh,
  // wiping the saved comparison before the listener could load it.
  const hasLoadedRef = React.useRef(false);

  useEffect(() => {
    hasLoadedRef.current = false;
    if (!currentUser) {
      setComparisonProducts([]);
      return;
    }

    const userDocRef = doc(db, 'users', currentUser.uid);
    const comparisonDocRef = doc(userDocRef, 'productComparison', 'comparisonProducts');

    // Subscribe to Firestore document changes
    const unsubscribe = onSnapshot(comparisonDocRef, (docSnap) => {
      const data = docSnap.exists() ? docSnap.data() : null;
      setComparisonProducts(data?.products ?? []);
      hasLoadedRef.current = true;
    }, (error) => {
      console.error('Error fetching product comparison from Firestore:', error);
      hasLoadedRef.current = true;
    });

    return () => unsubscribe();
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser || !hasLoadedRef.current) return;

    const userDocRef = doc(db, 'users', currentUser.uid);
    const comparisonDocRef = doc(userDocRef, 'productComparison', 'comparisonProducts');

    // Save comparisonProducts to Firestore (only after the initial load, so we never persist
    // the transient empty state that exists before the snapshot arrives).
    setDoc(comparisonDocRef, { products: comparisonProducts })
      .catch(error => {
        console.error('Error saving product comparison to Firestore:', error);
      });
  }, [comparisonProducts, currentUser]);

  const addProductToComparison = (product: ScannedProduct) => {
    setComparisonProducts(prev => {
      if (prev.find(p => p.id === product.id)) {
        return prev; // Already added
      }
      if (prev.length >= 10) {
        return prev; // Max 10 products
      }
      return [...prev, product];
    });
  };

  const removeProductFromComparison = (productId: string) => {
    setComparisonProducts(prev => prev.filter(p => p.id !== productId));
  };

  const clearComparison = () => {
    setComparisonProducts([]);
  };

  return (
    <ProductComparisonContext.Provider value={{ comparisonProducts, setComparisonProducts, addProductToComparison, removeProductFromComparison, clearComparison }}>
      {children}
    </ProductComparisonContext.Provider>
  );
};

export const useProductComparison = () => {
  const context = useContext(ProductComparisonContext);
  if (!context) {
    throw new Error('useProductComparison must be used within a ProductComparisonProvider');
  }
  return context;
};
