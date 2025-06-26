import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import {
  Leaf,
  Menu,
  X,
  Scan,
  BarChart3,
  Users,
  Award,
  ChevronDown,
  ShoppingCart,
  MessageCircle,
  Target,
  BookOpen,
  Bell,
  User,
  Brain,
  Gift,
  Search,
  Calendar,
  Heart,
  TrendingUp,
  Building2,
  Navigation,
  ChefHat,
  Bot,
  Sparkles,
  Eye,
  Package,
  Zap,
  AlertTriangle,
  Settings,
  Sun,
  Moon,
  LogOut,
  Plus,
  Minus,
  Trash2
} from 'lucide-react';

const Navbar = ({
  onNavigate,
  activeTab,
  toggleLoginForm,
  cartItems = [],
  updateCartItem,
  removeFromCart,
  clearCart
}: {
  onNavigate: any;
  activeTab: any;
  toggleLoginForm?: () => void;
  cartItems?: any[];
  updateCartItem?: (id: string, quantity: number) => void;
  removeFromCart?: (id: string) => void;
  clearCart?: () => void;
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();

  // Calculate cart total items and price
  const cartItemCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = cartItems.reduce((total, item) => {
    const itemPrice = typeof item.price === 'number' ? item.price : 0; // Default to 0 if price is missing or not a number
    return total + (itemPrice * item.quantity);
  }, 0);

  const quickAccess = [
    { id: 'scanner', label: 'AI Scanner', icon: Scan },
    { id: 'chatbot', label: 'EcoBot Assistant', icon: Bot },
    { id: 'carbon-tracker', label: 'Carbon Tracker', icon: Target },
    { id: 'ai-recommendations', label: 'AI Recommendations', icon: Brain }
  ];

  const mainNavItems = [
    { id: 'marketplace', label: 'Marketplace', icon: ShoppingCart },
    { id: 'community', label: 'Community', icon: MessageCircle },
    { id: 'education', label: 'Education', icon: BookOpen },
    { id: 'rewards', label: 'Rewards', icon: Gift }
  ];

  const smartToolsItems = [
    { id: 'ar-scanner', label: 'AR Scanner', icon: Eye },
    { id: 'smart-insights', label: 'Smart Insights', icon: TrendingUp },
    { id: 'comparison', label: 'Product Comparison', icon: Package }
  ];

  const lifestyleItems = [
    { id: 'recipe-finder', label: 'Eco Recipes', icon: ChefHat },
    { id: 'transportation-planner', label: 'Transport Planner', icon: Navigation },
    { id: 'lifecycle', label: 'Product Lifecycle', icon: Package },
    { id: 'environmental-alerts', label: 'Env. Alerts', icon: AlertTriangle }
  ];

  const businessItems = [
    { id: 'esg-analyzer', label: 'ESG Analysis', icon: Building2 },
    { id: 'investment-tracker', label: 'Green Investments', icon: TrendingUp }
  ];

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
  };

  // Handle navigation functions for buttons
  const handleViewDetailedAnalysis = () => {
    onNavigate('lifecycle');
    setCartOpen(false);
    setActiveDropdown(null);
  };

  const handleCompareProducts = () => {
    onNavigate('comparison');
    setCartOpen(false);
    setActiveDropdown(null);
  };

  const handleCartClick = () => {
    setCartOpen(!cartOpen);
    setActiveDropdown(null);
    setUserMenuOpen(false);
  };

  const handleUpdateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart?.(itemId);
    } else {
      updateCartItem?.(itemId, newQuantity);
    }
  };

  const handleCheckout = () => {
    onNavigate('checkout');
    setCartOpen(false);
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!(event.target as HTMLElement).closest('.dropdown-container')) {
        setActiveDropdown(null);
        setUserMenuOpen(false);
        setCartOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdowns and overlays on activeTab change to prevent blocking clicks
  useEffect(() => {
    setActiveDropdown(null);
    setUserMenuOpen(false);
    setCartOpen(false);
  }, [activeTab]);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm dark:bg-gray-900/95 dark:border-gray-800">
      <div className="container mx-auto px-4 h-20">
        <div className="flex items-center justify-between h-16">
          {/* Enhanced Logo */}
          <div
            className="flex items-center space-x-3 cursor-pointer group min-w-[160px]"
            onClick={() => onNavigate('home')}
          >
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 via-green-600 to-teal-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-emerald-400/50 transition-all duration-700 group-hover:scale-110 group-hover:rotate-12 animate-float">
                <Leaf className="w-6 h-6 text-white transform group-hover:scale-110 transition-all duration-700" />
              </div>
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-xl blur opacity-0 group-hover:opacity-40 transition-all duration-700 animate-pulse-glow"></div>
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-700 via-green-600 to-teal-600 bg-clip-text text-transparent group-hover:from-emerald-600 group-hover:via-green-500 group-hover:to-teal-500 transition-all duration-700 animate-gradient-x">
                EcoScope
              </h1>
              <p className="text-xs text-gray-500 group-hover:text-emerald-600 transition-colors duration-500 dark:text-gray-400">Sustainability</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1 flex-1 justify-center max-w-4xl">
            {/* Quick Access */}
            {quickAccess.slice(0, 4).map((item) => (
              <Button
                key={item.id}
                variant={activeTab === item.id ? "default" : "ghost"}
                size="sm"
                className={`px-3 py-2 text-sm h-9 transition-all duration-200 ${
                  activeTab === item.id
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-md'
                    : 'text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 dark:text-gray-300 dark:hover:text-emerald-400 dark:hover:bg-emerald-900/20'
                }`}
                onClick={() => onNavigate(item.id)}
              >
                <item.icon className="w-4 h-4 mr-2" />
                {item.label}
              </Button>
            ))}

            {/* Smart Tools Dropdown */}
            <div className="relative dropdown-container">
              <Button
                variant="ghost"
                size="sm"
                className="px-3 py-2 text-sm text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 h-9 transition-all duration-200 dark:text-gray-300 dark:hover:text-emerald-400 dark:hover:bg-emerald-900/20"
                onMouseEnter={() => setActiveDropdown('smart-tools')}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                Smart Tools
                <ChevronDown className="w-3 h-3 ml-1" />
              </Button>

              {activeDropdown === 'smart-tools' && (
                <div
                  className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 animate-fade-in dark:bg-gray-800 dark:border-gray-700"
                  onMouseEnter={() => setActiveDropdown('smart-tools')}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <div className="p-3 space-y-1">
                    {smartToolsItems.map((item) => (
                      <Button
                        key={item.id}
                        variant="ghost"
                        size="sm"
                        className={`w-full justify-start px-3 py-2 text-sm h-9 transition-all duration-200 rounded-lg ${
                          activeTab === item.id
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-emerald-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-emerald-400'
                        }`}
                        onClick={() => {
                          onNavigate(item.id);
                          setActiveDropdown(null);
                        }}
                      >
                        <item.icon className="w-4 h-4 mr-3" />
                        {item.label}
                      </Button>
                    ))}
                     {/* Removed the duplicate "View Detailed Analysis" button here */}
                     {/* Removed the duplicate "Compare Products" button here */}
                  </div>
                </div>
              )}
            </div>

            {/* More Dropdown */}
            <div className="relative dropdown-container">
              <Button
                variant="ghost"
                size="sm"
                className="px-3 py-2 text-sm text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 h-9 transition-all duration-200 dark:text-gray-300 dark:hover:text-emerald-400 dark:hover:bg-emerald-900/20"
                onMouseEnter={() => setActiveDropdown('more')}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                More
                <ChevronDown className="w-3 h-3 ml-1" />
              </Button>

              {activeDropdown === 'more' && (
                <div
                  className="absolute top-full left-0 mt-1 w-72 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 max-h-96 overflow-y-auto animate-fade-in dark:bg-gray-800 dark:border-gray-700"
                  onMouseEnter={() => setActiveDropdown('more')}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <div className="p-3">
                    {/* Main nav items */}
                    <div className="mb-4">
                      <div className="px-3 py-2 text-xs font-semibold text-emerald-700 uppercase tracking-wide border-b border-emerald-100 dark:text-emerald-400 dark:border-emerald-800">
                        Main Features
                      </div>
                      <div className="mt-2 space-y-1">
                        {mainNavItems.map((item) => (
                          <Button
                            key={item.id}
                            variant={activeTab === item.id ? "default" : "ghost"}
                            size="sm"
                            className={`w-full justify-start px-3 py-2 text-sm h-9 transition-all duration-200 rounded-lg ${
                              activeTab === item.id
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-emerald-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-emerald-400'
                            }`}
                            onClick={() => {
                              onNavigate(item.id);
                              setActiveDropdown(null);
                            }}
                          >
                            <item.icon className="w-4 h-4 mr-3" />
                            {item.label}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Lifestyle */}
                    <div className="mb-4">
                      <div className="px-3 py-2 text-xs font-semibold text-emerald-700 uppercase tracking-wide border-b border-emerald-100 dark:text-emerald-400 dark:border-emerald-800">
                        Lifestyle
                      </div>
                      <div className="mt-2 space-y-1">
                        {lifestyleItems.map((item) => (
                          <Button
                            key={item.id}
                            variant={activeTab === item.id ? "default" : "ghost"}
                            size="sm"
                            className={`w-full justify-start pl-6 transition-all duration-200 rounded-lg ${
                              activeTab === item.id
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-emerald-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-emerald-400'
                            }`}
                            onClick={() => {
                              onNavigate(item.id);
                              setActiveDropdown(null);
                            }}
                          >
                            <item.icon className="w-4 h-4 mr-3" />
                            {item.label}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Business */}
                    <div>
                      <div className="px-3 py-2 text-xs font-semibold text-emerald-700 uppercase tracking-wide border-b border-emerald-100 dark:text-emerald-400 dark:border-emerald-800">
                        Business
                      </div>
                      <div className="mt-2 space-y-1">
                        {businessItems.map((item) => (
                          <Button
                            key={item.id}
                            variant={activeTab === item.id ? "default" : "ghost"}
                            size="sm"
                            className={`w-full justify-start pl-6 transition-all duration-200 rounded-lg ${
                              activeTab === item.id
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-emerald-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-emerald-400'
                            }`}
                            onClick={() => {
                              onNavigate(item.id);
                              setActiveDropdown(null);
                            }}
                          >
                            <item.icon className="w-4 h-4 mr-3" />
                            {item.label}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Section */}
          <div className="hidden lg:flex items-center space-x-4 min-w-[200px] justify-end">
            {/* Shopping Cart */}
            <div className="relative dropdown-container">
              <Button
                variant="ghost"
                size="sm"
                className="p-2 hover:bg-emerald-50 transition-colors duration-200 rounded-lg dark:hover:bg-emerald-900/20 relative"
                onClick={handleCartClick}
              >
                <ShoppingCart className="w-5 h-5" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                    {cartItemCount > 99 ? '99+' : cartItemCount}
                  </span>
                )}
              </Button>

              {/* Cart Dropdown */}
              {cartOpen && (
                <div className="absolute top-full right-0 mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 max-h-96 overflow-hidden dark:bg-gray-800 dark:border-gray-700">
                  <div className="p-4 border-b border-gray-200 dark:border-gray-600">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">Shopping Cart</h3>
                      {cartItems.length > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                          onClick={() => clearCart?.()}
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Clear
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="max-h-64 overflow-y-auto">
                    {cartItems.length === 0 ? (
                      <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                        <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>Your cart is empty</p>
                        <Button
                          size="sm"
                          className="mt-3 bg-emerald-600 hover:bg-emerald-700"
                          onClick={() => {
                            onNavigate('marketplace');
                            setCartOpen(false);
                          }}
                        >
                          Browse Products
                        </Button>
                      </div>
                    ) : (
                      <div className="p-2">
                        {cartItems.map((item) => (
                          <div key={item.id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                            <img
                              src={item.image || '/api/placeholder/40/40'}
                              alt={item.name}
                              className="w-10 h-10 rounded-lg object-cover"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                {item.name}
                              </p>
                              <p className="text-sm text-emerald-600 dark:text-emerald-400">
 ${typeof item.price === 'number' ? item.price.toFixed(2) : 'N/A'}
                              </p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="w-6 h-6 p-0 hover:bg-gray-200 dark:hover:bg-gray-600"
                                onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                              >
                                <Minus className="w-3 h-3" />
                              </Button>
                              <span className="text-sm font-medium w-8 text-center">
                                {item.quantity}
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="w-6 h-6 p-0 hover:bg-gray-200 dark:hover:bg-gray-600"
                                onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                              >
                                <Plus className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {cartItems.length > 0 && (
                    <div className="p-4 border-t border-gray-200 dark:border-gray-600">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-semibold text-gray-900 dark:text-gray-100">Total:</span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                          ${cartTotal.toFixed(2)}
                        </span>
                      </div>
                      <div className="space-y-2">
                        <Button
                          className="w-full bg-emerald-600 hover:bg-emerald-700"
                          onClick={handleCheckout}
                        >
                          Checkout
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => {
                            onNavigate('marketplace');
                            setCartOpen(false);
                          }}
                        >
                          Continue Shopping
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Notification Icon */}
            <Button
              variant="ghost"
              size="sm"
              className="p-2 hover:bg-emerald-50 transition-colors duration-200 rounded-lg dark:hover:bg-emerald-900/20"
              onClick={() => onNavigate('notifications')}
            >
              <Bell className="w-5 h-5" />
            </Button>

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="sm"
              className="p-2 hover:bg-emerald-50 transition-colors duration-200 rounded-lg dark:hover:bg-emerald-900/20"
              onClick={toggleTheme}
            >
              {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>

            {/* User Profile/Login */}
            {user ? (
              <div className="relative dropdown-container">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center space-x-2 p-2 hover:bg-emerald-50 transition-colors duration-200 rounded-lg dark:hover:bg-emerald-900/20"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{user.name}</span>
                  <ChevronDown className="w-4 h-4" />
                </Button>

                {userMenuOpen && (
                  <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg z-50 dark:bg-gray-800 dark:border-gray-700">
                    <div className="p-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start text-left p-3 hover:bg-gray-50 dark:hover:bg-gray-700"
                        onClick={() => {
                          onNavigate('profile');
                          setUserMenuOpen(false);
                        }}
                      >
                        <User className="w-4 h-4 mr-3" />
                        View Profile
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start text-left p-3 hover:bg-red-50 text-red-600 dark:hover:bg-red-400 dark:hover:bg-red-900/20"
                        onClick={handleLogout}
                      >
                        <LogOut className="w-4 h-4 mr-3" />
                        Logout
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              toggleLoginForm && (
                <Button
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700 text-sm px-4 h-9 shadow-lg hover:shadow-xl transition-all duration-200"
                  onClick={toggleLoginForm}
                >
                  Get Started
                </Button>
              )
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 py-4 bg-white max-h-[80vh] overflow-y-auto animate-fade-in dark:bg-gray-900 dark:border-gray-700">
            <div className="space-y-2">
              {/* Quick Access */}
              <div className="mb-4">
                <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide dark:text-gray-400">
                  Quick Access
                </div>
                {quickAccess.map((item) => (
                  <Button
                    key={item.id}
                    variant={activeTab === item.id ? "default" : "ghost"}
                    className="w-full justify-start transition-all duration-200"
                    onClick={() => {
                      onNavigate(item.id);
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <item.icon className="w-4 h-4 mr-3" />
                    {item.label}
                  </Button>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="mb-4 px-4 space-y-2">
                {/* Removed the duplicate "View Detailed Analysis" button here */}
                {/* Removed the duplicate "Compare Products" button here */}
                <Button
                  variant="outline"
                  className="w-full justify-start relative"
                  onClick={() => {
                    setCartOpen(true);
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <ShoppingCart className="w-4 h-4 mr-3" />
                  Shopping Cart
                  {cartItemCount > 0 && (
                    <span className="absolute right-3 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                      {cartItemCount > 99 ? '99+' : cartItemCount}
                    </span>
                  )}
                </Button>
              </div>

              {/* Main Navigation */}
              <div className="mb-4">
                <div className="px-4 py-2 text-xs font-semibold text-emerald-700 uppercase tracking-wide border-b border-emerald-100 dark:text-emerald-400 dark:border-emerald-800">
                  Main Features
                </div>
                {mainNavItems.map((item) => (
                  <Button
                    key={item.id}
                    variant={activeTab === item.id ? "default" : "ghost"}
                    className="w-full justify-start transition-all duration-200"
                    onClick={() => {
                      onNavigate(item.id);
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <item.icon className="w-4 h-4 mr-3" />
                    {item.label}
                  </Button>
                ))}
              </div>

              {/* Smart Tools */}
              <div className="mb-4">
                <div className="px-4 py-2 text-xs font-semibold text-emerald-700 uppercase tracking-wide border-b border-emerald-100 dark:text-emerald-400 dark:border-emerald-800">
                  Smart Tools
                </div>
                {smartToolsItems.map((item) => (
                  <Button
                    key={item.id}
                    variant={activeTab === item.id ? "default" : "ghost"}
                    className="w-full justify-start pl-6 transition-all duration-200"
                    onClick={() => {
                      onNavigate(item.id);
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <item.icon className="w-4 h-4 mr-3" />
                    {item.label}
                  </Button>
                ))}
              </div>

              {/* Lifestyle */}
              <div className="mb-4">
                <div className="px-4 py-2 text-xs font-semibold text-emerald-700 uppercase tracking-wide border-b border-emerald-100 dark:text-emerald-400 dark:border-emerald-800">
                  Lifestyle
                </div>
                {lifestyleItems.map((item) => (
                  <Button
                    key={item.id}
                    variant={activeTab === item.id ? "default" : "ghost"}
                    className="w-full justify-start pl-6 transition-all duration-200"
                    onClick={() => {
                      onNavigate(item.id);
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <item.icon className="w-4 h-4 mr-3" />
                    {item.label}
                  </Button>
                ))}
              </div>

              {/* Business */}
              <div className="mb-4">
                <div className="px-4 py-2 text-xs font-semibold text-emerald-700 uppercase tracking-wide border-b border-emerald-100 dark:text-emerald-400 dark:border-emerald-800">
                  Business
                </div>
                {businessItems.map((item) => (
                  <Button
                    key={item.id}
                    variant={activeTab === item.id ? "default" : "ghost"}
                    className="w-full justify-start pl-6 transition-all duration-200"
                    onClick={() => {
                      onNavigate(item.id);
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <item.icon className="w-4 h-4 mr-3" />
                    {item.label}
                  </Button>
                ))}
              </div>

              <div className="pt-4 border-t border-gray-200 space-y-2 dark:border-gray-700">
                {user ? (
                  <>
                    <div className="px-4 py-2">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{user.name}</span>
                      </div>
                    </div>
                    <Button variant="ghost" className="w-full justify-start" onClick={() => {
                      onNavigate('profile');
                      setIsMobileMenuOpen(false);
                    }}>
                      <User className="w-4 h-4 mr-3" /> Profile
                    </Button>
                    <Button variant="ghost" className="w-full justify-start text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20" onClick={handleLogout}>
                      <LogOut className="w-4 h-4 mr-3" /> Logout
                    </Button>
                  </>
                ) : (
                  toggleLoginForm && (
                    <Button className="w-full bg-emerald-600 hover:bg-emerald-700" onClick={toggleLoginForm}>
                      Get Started
                    </Button>
                  )
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
