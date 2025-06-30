import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useAuth } from './AuthContext';

export interface ScannedProduct {
  id: string;
  date?: string;
  name: string;
  brand: string;
  sustainabilityScore: number;
  category?: string;
  price?: number;
  image?: string;
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

  // Load from localStorage on user change
  useEffect(() => {
    if (currentUser) {
      const saved = localStorage.getItem(`comparisonProducts_${currentUser.uid}`);
      if (saved) {
        try {
          setComparisonProducts(JSON.parse(saved));
        } catch (e) {
          console.error('Failed to parse saved comparison products:', e);
          setComparisonProducts([]);
        }
      } else {
        setComparisonProducts([]);
      }
    } else {
      // Clear on logout
      setComparisonProducts([]);
    }
  }, [currentUser]);

  // Save to localStorage on comparisonProducts change
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`comparisonProducts_${currentUser.uid}`, JSON.stringify(comparisonProducts));
    }
  }, [comparisonProducts, currentUser]);

  const addProductToComparison = (product: ScannedProduct) => {
    setComparisonProducts(prev => {
      if (prev.find(p => p.id === product.id)) {
        return prev; // Already added
      }
      if (prev.length >= 4) {
        return prev; // Max 4 products
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
