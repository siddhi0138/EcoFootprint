import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import AuthModal from './AuthModal';

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

const protectedRoutes = [
  '/goals',
  '/product-lifecycle',
  '/product-comparison',
  '/marketplace',
  '/community',
  '/education',
  '/rewards',
  '/ai-scanner',
  '/chatbot',
  '/carbon-tracker',
  '/ai-recommendations',
  '/ar-scanner',
  '/smart-insights',
  '/recipe-finder',
  '/transportation-planner',
  '/environmental-alerts',
  '/esg-analyzer',
  '/investment-tracker',
  '/checkout',
  '/notifications',
  '/profile'
];

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState('home');
  const { cartItems, updateQuantity, removeFromCart, clearCart } = useCart();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    if (protectedRoutes.includes(location.pathname) && !currentUser) {
      // Redirect to home or login page if not authenticated
      navigate('/');
      return;
    }
    const tabId = pathToTabId[location.pathname];
    if (tabId && tabId !== activeTab) {
      setActiveTab(tabId);
    }
  }, [location.pathname, activeTab, currentUser, navigate]);

  const handleNavigate = (tabId: string) => {
    setActiveTab(tabId);
    const path = Object.entries(pathToTabId).find(([path, id]) => id === tabId)?.[0];
    if (path) {
      navigate(path);
    } else {
      console.warn(`No route defined for tabId: ${tabId}`);
    }
  };

  const toggleLoginForm = () => {
    setIsAuthModalOpen(true);
  };

  const handleAuthSuccess = () => {
    setIsAuthModalOpen(false);
  };

  if (!currentUser && protectedRoutes.includes(location.pathname)) {
    // Optionally render a message or redirect component here
    return <div className="text-center mt-20 text-red-600">Please log in to access this page.</div>;
  }

  return (
    <>
      <Navbar
        onNavigate={handleNavigate}
        activeTab={activeTab}
        cartItems={cartItems}
        updateCartItem={updateQuantity}
        removeFromCart={removeFromCart}
        clearCart={clearCart}
        toggleLoginForm={toggleLoginForm}
      />
      <main className="pt-0 min-h-[calc(100vh-80px)]">{children}</main>
      <Footer />
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />
    </>
  );
};

export default Layout;
