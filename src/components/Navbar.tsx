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
  LogOut
} from 'lucide-react';

const Navbar = ({ onNavigate, activeTab, toggleLoginForm }: { 
  onNavigate: any; 
  activeTab: any; 
  toggleLoginForm?: () => void;
  cartItemCount: number;
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();

  const quickAccess = [
 { id: 'scanner', label: 'AI Scanner', icon: Scan },
    { id: 'chatbot', label: 'EcoBot Assistant', icon: Bot },
    { id: 'carbon-tracker', label: 'Carbon Tracker', icon: Target },
    { id: 'ai-recommendations', label: 'AI Recommendations', icon: Brain }
  ];

  const toolsItems = [
    { id: 'ai-recommendations', label: 'AI Tools', icon: Brain },
    { id: 'analysis', label: 'Analytics', icon: BarChart3 },
    { id: 'carbon-tracker', label: 'Tracking', icon: Target }
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

            {/* AI Tools Dropdown */}
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                className="px-3 py-2 text-sm text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 h-9 transition-all duration-200 dark:text-gray-300 dark:hover:text-emerald-400 dark:hover:bg-emerald-900/20"
                onMouseEnter={() => setActiveDropdown('tools')}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                AI Tools
                <ChevronDown className="w-3 h-3 ml-1" />
              </Button>
              
              {activeDropdown === 'tools' && (
                <div 
                  className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 animate-fade-in dark:bg-gray-800 dark:border-gray-700"
                  onMouseEnter={() => setActiveDropdown('tools')}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <div className="p-3 space-y-1">
                    {toolsItems.map((item) => (
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
                  </div>
                </div>
              )}
            </div>

            {/* More Dropdown */}
            <div className="relative">
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
                      </div>
                    </div>

                    {/* Smart Tools */}
                    <div className="mb-4">
                      <div className="px-3 py-2 text-xs font-semibold text-emerald-700 uppercase tracking-wide border-b border-emerald-100 dark:text-emerald-400 dark:border-emerald-800">
                        Smart Tools
                      </div>
                      <div className="mt-2 space-y-1">
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
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Section */}
          <div className="hidden lg:flex items-center space-x-4 min-w-[200px] justify-end">
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
              <div className="relative">
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
                        className="w-full justify-start text-left p-3 hover:bg-red-50 text-red-600 dark:hover:bg-red-900/20 dark:text-red-400"
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
