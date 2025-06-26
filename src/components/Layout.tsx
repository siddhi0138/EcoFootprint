import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import { useCart } from '../contexts/CartContext';

const pathToTabId: Record<string, string> = {
  '/': 'home',
  '/goals': 'goals',
  '/product-lifecycle': 'product-lifecycle',
  '/product-comparison': 'product-comparison',
  '/marketplace': 'marketplace',
  '/community': 'community',
  '/education': 'education',
  '/rewards': 'rewards',
  '/ai-scanner': 'ai-scanner',
  '/chatbot': 'chatbot',
  '/carbon-tracker': 'carbon-tracker',
  '/ai-recommendations': 'ai-recommendations',
  '/ar-scanner': 'ar-scanner',
  '/smart-insights': 'smart-insights',
  '/recipe-finder': 'recipe-finder',
  '/transportation-planner': 'transportation-planner',
  '/environmental-alerts': 'environmental-alerts',
  '/esg-analyzer': 'esg-analyzer',
  '/investment-tracker': 'investment-tracker',
  '/checkout': 'checkout',
  '/notifications': 'notifications',
  '/profile': 'profile'
};

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState('home');
  const { cartItems, updateQuantity, removeFromCart, clearCart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const tabId = pathToTabId[location.pathname];
    if (tabId && tabId !== activeTab) {
      setActiveTab(tabId);
    }
  }, [location.pathname, activeTab]);

  const handleNavigate = (tabId: string) => {
    setActiveTab(tabId);
    const path = Object.entries(pathToTabId).find(([path, id]) => id === tabId)?.[0];
    if (path) {
      navigate(path);
    } else {
      console.warn(`No route defined for tabId: ${tabId}`);
    }
  };

  return (
    <>
      <Navbar
        onNavigate={handleNavigate}
        activeTab={activeTab}
        cartItems={cartItems}
        updateCartItem={updateQuantity}
        removeFromCart={removeFromCart}
        clearCart={clearCart}
      />
      <main className="pt-0 min-h-[calc(100vh-80px)]">{children}</main>
      <Footer />
    </>
  );
};

export default Layout;
