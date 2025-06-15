
import { useState, useEffect } from 'react';

interface AnalyzedProduct {
  id: string;
  name: string;
  brand: string;
  category: string;
  score: number;
  image: string;
  analyzedAt: Date;
  method: 'search' | 'file' | 'barcode';
}

export const useProductHistory = () => {
  const [history, setHistory] = useState<AnalyzedProduct[]>([]);

  useEffect(() => {
    const storedHistory = localStorage.getItem('eco-analyzer-history');
    if (storedHistory) {
      const parsed = JSON.parse(storedHistory);
      setHistory(parsed.map((item: any) => ({
        ...item,
        analyzedAt: new Date(item.analyzedAt)
      })));
    }
  }, []);

  const addToHistory = (product: Omit<AnalyzedProduct, 'id' | 'analyzedAt'>) => {
    const newProduct: AnalyzedProduct = {
      ...product,
      id: Date.now().toString(),
      analyzedAt: new Date()
    };
    
    const updatedHistory = [newProduct, ...history.slice(0, 49)]; // Keep last 50
    setHistory(updatedHistory);
    localStorage.setItem('eco-analyzer-history', JSON.stringify(updatedHistory));
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('eco-analyzer-history');
  };

  const removeFromHistory = (id: string) => {
    const updatedHistory = history.filter(item => item.id !== id);
    setHistory(updatedHistory);
    localStorage.setItem('eco-analyzer-history', JSON.stringify(updatedHistory));
  };

  return {
    history,
    addToHistory,
    clearHistory,
    removeFromHistory
  };
};
