import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import AnimatedBackground from './AnimatedBackground';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import AuthModal from './AuthModal';

// Paths that render Index (which switches content based on the activeTab prop Layout derives
// from the path here) - as opposed to paths that render a dedicated page component directly
// (goals, product-lifecycle, ...). A page refresh on any of these used to lose all state and
// bounce to the home hero, because the tab was only ever tracked in-memory with no URL behind
// it - giving each one a real route fixes that the same way normal page refreshes work anywhere
// else on the web: the URL IS the state.
const INDEX_ROUTES: Record<string, string> = {
  '/': 'home',
  '/scanner': 'scanner',
  '/analysis': 'analysis',
  '/chatbot': 'chatbot',
  '/carbon-tracker': 'carbon-tracker',
  '/ai-recommendations': 'ai-recommendations',
  '/marketplace': 'marketplace',
  '/education': 'education',
  '/lifestyle': 'lifestyle',
  '/profile': 'profile',
  '/notifications': 'notifications',
  '/checkout': 'checkout',
};

// Paths that render a dedicated page component (not Index) - still tracked here so Navbar
// knows which item to highlight as active while on one of these pages.
const OTHER_ROUTES: Record<string, string> = {
  '/goals': 'goals',
  '/product-lifecycle': 'product-lifecycle',
  '/community': 'community',
};

const pathToTabId: Record<string, string> = { ...INDEX_ROUTES, ...OTHER_ROUTES };

const tabIdToPath: Record<string, string> = Object.fromEntries(
  Object.entries(pathToTabId).map(([path, tabId]) => [tabId, path])
);

const protectedRoutes = [
  '/goals',
  '/product-lifecycle',
  '/community',
];

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState('home');
  const { cartItems, updateQuantity, removeFromCart, clearCart } = useCart();
  const { currentUser, authChecked } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Tracks the last pathname this effect actually synced activeTab from. Without this guard,
  // the effect (which must depend on activeTab to catch deep-links) would re-fire on every
  // same-page tab switch - e.g. clicking "Marketplace" while already on "/" sets activeTab to
  // 'marketplace', which re-triggers the effect, which then re-derives 'home' from
  // pathToTabId['/'] and immediately stomps the switch back to home.
  const lastSyncedPathRef = useRef<string | null>(null);

  useEffect(() => {
    // Wait for the initial auth check to finish before redirecting - otherwise a hard
    // refresh/direct link to a protected route bounces a genuinely logged-in user back
    // to home, because currentUser is still null on the very first render either way.
    if (!authChecked) return;
    if (protectedRoutes.includes(location.pathname) && !currentUser) {
      // Redirect to home or login page if not authenticated
      navigate('/');
      return;
    }
    if (lastSyncedPathRef.current === location.pathname) return;
    lastSyncedPathRef.current = location.pathname;

    if (location.pathname === '/') {
      // A tab-only feature (e.g. "marketplace") navigated here via handleNavigate below,
      // carrying the target tab in router state since it has no URL of its own.
      const requestedTab = (location.state as { tab?: string } | null)?.tab;
      setActiveTab(requestedTab || 'home');
      return;
    }
    const tabId = pathToTabId[location.pathname];
    if (tabId) {
      setActiveTab(tabId);
    }
  }, [location.pathname, location.state, currentUser, authChecked, navigate]);

  const handleNavigate = (tabId: string) => {
    const path = tabIdToPath[tabId];
    if (path) {
      setActiveTab(tabId);
      navigate(path);
    } else if (location.pathname !== '/') {
      // Tab-only feature with no route of its own - jump to "/" and tell Index which tab to show.
      navigate('/', { state: { tab: tabId } });
    } else {
      setActiveTab(tabId);
    }
  };

  const toggleLoginForm = () => {
    setIsAuthModalOpen(true);
  };

  const handleAuthSuccess = () => {
    setIsAuthModalOpen(false);
  };

  if (!authChecked && protectedRoutes.includes(location.pathname)) {
    // Still checking whether there's a persisted session - render nothing rather than
    // flashing a false "please log in" at a genuinely logged-in user on page refresh.
    return null;
  }

  if (authChecked && !currentUser && protectedRoutes.includes(location.pathname)) {
    return <div className="text-center mt-20 text-red-600">Please log in to access this page.</div>;
  }

  // Index owns no navbar of its own - it renders whichever tab is active based on these props.
  const content =
    location.pathname in INDEX_ROUTES && React.isValidElement(children)
      ? React.cloneElement(children as React.ReactElement<any>, { activeTab, onNavigate: handleNavigate })
      : children;

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
      <main className="relative overflow-hidden pt-0 min-h-[calc(100vh-80px)] bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-emerald-900">
        <AnimatedBackground />
        <div className="relative z-10">{content}</div>
      </main>
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
