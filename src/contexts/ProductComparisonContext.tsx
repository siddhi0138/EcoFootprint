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
  clearComparison: () => void;
}

const ProductComparisonContext = createContext<ProductComparisonContextType | undefined>(undefined);

export const ProductComparisonProvider = ({ children }: { children: ReactNode }) => {
  const { currentUser } = useAuth();
  const [comparisonProducts, setComparisonProducts] = useState<ScannedProduct[]>([]);

  useEffect(() => {
    if (!currentUser) {
      setComparisonProducts([]);
      return;
    }

    const userDocRef = doc(db, 'users', currentUser.uid);
    const comparisonDocRef = doc(userDocRef, 'productComparison', 'comparisonProducts');

    // Subscribe to Firestore document changes
    const unsubscribe = onSnapshot(comparisonDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data && data.products) {
          setComparisonProducts(data.products);
        } else {
          setComparisonProducts([]);
        }
      } else {
        setComparisonProducts([]);
      }
    }, (error) => {
      console.error('Error fetching product comparison from Firestore:', error);
      setComparisonProducts([]);
    });

    return () => unsubscribe();
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) return;

    const userDocRef = doc(db, 'users', currentUser.uid);
    const comparisonDocRef = doc(userDocRef, 'productComparison', 'comparisonProducts');

    // Save comparisonProducts to Firestore
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

  const clearComparison = () => {
    setComparisonProducts([]);
  };

  return (
    <ProductComparisonContext.Provider value={{ comparisonProducts, setComparisonProducts, addProductToComparison, clearComparison }}>
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
