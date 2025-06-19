
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Scan, TrendingUp, Users, Globe, Leaf, Sparkles } from 'lucide-react';
import AuthModal from '@/components/AuthModal';
import { useAuth } from '@/contexts/AuthContext';

const Hero = ({ onGetStarted }) => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { user } = useAuth();

  const handleGetStartedClick = () => {
    if (user) {
      onGetStarted();
    } else {
      setShowAuthModal(true);
    }
  };

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    onGetStarted();
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-emerald-900 min-h-screen transition-colors duration-300">
      {/* Enhanced Background with Glassmorphism */}
      <div className="absolute inset-0">
        {/* Gradient Orbs */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-r from-emerald-400/30 to-green-300/30 dark:from-emerald-600/20 dark:to-green-500/20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" />
        <div className="absolute top-40 right-20 w-96 h-96 bg-gradient-to-r from-teal-300/30 to-cyan-300/30 dark:from-teal-500/20 dark:to-cyan-400/20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-1000" />
        <div className="absolute bottom-20 left-1/4 w-80 h-80 bg-gradient-to-r from-green-400/30 to-emerald-400/30 dark:from-green-500/20 dark:to-emerald-400/20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-2000" />
        
        {/* Geometric Patterns */}
        {/* Removed Grid Pattern */}
      </div>
      
      {/* Floating Nature Elements with Enhanced Animation */}
      <div className="absolute inset-0 pointer-events-none">
        <Leaf className="absolute top-20 left-20 w-8 h-8 text-emerald-400 dark:text-emerald-300 opacity-60 animate-float" style={{ animationDelay: '0s' }} />
        <Sparkles className="absolute top-40 right-40 w-6 h-6 text-teal-400 dark:text-teal-300 opacity-50 animate-bounce" style={{ animationDelay: '1s' }} />
        <Leaf className="absolute top-60 right-20 w-10 h-10 text-green-400 dark:text-green-300 opacity-40 animate-float" style={{ animationDelay: '2s' }} />
        <Sparkles className="absolute bottom-60 left-1/3 w-7 h-7 text-emerald-300 dark:text-emerald-200 opacity-45 animate-bounce" style={{ animationDelay: '3s' }} />
        <Leaf className="absolute bottom-40 right-1/4 w-9 h-9 text-teal-400 dark:text-teal-300 opacity-35 animate-float" style={{ animationDelay: '4s' }} />
      </div>
      
      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="text-center max-w-6xl mx-auto">
          {/* Enhanced Badge with Glassmorphism */}
          <div className="mb-8 inline-flex">
            <Badge className="bg-white/20 dark:bg-gray-800/20 backdrop-blur-md border border-white/30 dark:border-gray-700/30 text-emerald-700 dark:text-emerald-300 px-8 py-3 text-base font-medium shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <Sparkles className="w-5 h-5 mr-2" />
              AI-Powered Sustainability Intelligence
            </Badge>
          </div>
          
          {/* Enhanced Main Headline */}
          <h1 className="text-6xl md:text-8xl font-bold mb-10 leading-tight">
            <span className="bg-gradient-to-r from-emerald-600 via-green-500 to-teal-600 bg-clip-text text-transparent drop-shadow-sm">
              Discover Nature's
            </span>
            <br />
            <span className="text-slate-800 dark:text-gray-200 font-light tracking-wide">
              Hidden Impact in
            </span>
            <br />
            <span className="bg-gradient-to-r from-emerald-600 via-green-500 to-teal-600 bg-clip-text text-transparent drop-shadow-sm">
              Every Product
            </span>
          </h1>
          
          {/* Enhanced Subtitle with Better Typography */}
          <p className="text-xl md:text-2xl text-slate-600 dark:text-gray-300 mb-14 max-w-4xl mx-auto leading-relaxed font-light tracking-wide">
            Harness the power of AI to reveal the environmental story behind every product. 
            <br className="hidden md:block" />
            Make choices that honor our planet's future.
          </p>
          
          {/* Enhanced CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-20">
            <Button 
              size="lg" 
              className="group text-xl px-12 py-6 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white shadow-2xl hover:shadow-green-500/25 transition-all duration-500 transform hover:scale-105 hover:-translate-y-1 rounded-2xl border-0"
              onClick={handleGetStartedClick}
            >
              <Scan className="w-6 h-6 mr-3 group-hover:rotate-12 transition-transform duration-300" />
              Begin Your Journey
              <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform duration-300" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="text-xl px-12 py-6 border-2 border-emerald-200/50 dark:border-emerald-700/50 bg-white/30 dark:bg-gray-800/30 backdrop-blur-sm text-emerald-700 dark:text-emerald-300 hover:border-emerald-400 dark:hover:border-emerald-500 hover:bg-white/50 dark:hover:bg-gray-800/50 hover:shadow-xl transition-all duration-500 hover:scale-105 hover:-translate-y-1 rounded-2xl"
              onClick={handleGetStartedClick}
            >
              <Sparkles className="w-5 h-5 mr-3" />
              Explore Demo
            </Button>
          </div>
          
          {/* Enhanced Stats with Glassmorphism Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-24">
            <div className="group text-center p-8 bg-white/40 dark:bg-gray-800/40 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-gray-700/20 shadow-xl hover:shadow-2xl hover:bg-white/50 dark:hover:bg-gray-800/50 transition-all duration-500 hover:transform hover:scale-105 hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:rotate-12 group-hover:scale-110 transition-all duration-300 shadow-lg">
                <Scan className="w-8 h-8 text-white" />
              </div>
              <div className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent mb-3">1M+</div>
              <div className="text-slate-600 dark:text-gray-400 font-medium">Products Analyzed</div>
            </div>
            
            <div className="group text-center p-8 bg-white/40 dark:bg-gray-800/40 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-gray-700/20 shadow-xl hover:shadow-2xl hover:bg-white/50 dark:hover:bg-gray-800/50 transition-all duration-500 hover:transform hover:scale-105 hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:rotate-12 group-hover:scale-110 transition-all duration-300 shadow-lg">
                <Users className="w-8 h-8 text-white" />
              </div>
              <div className="text-4xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent mb-3">250K+</div>
              <div className="text-slate-600 dark:text-gray-400 font-medium">Eco Warriors</div>
            </div>
            
            <div className="group text-center p-8 bg-white/40 dark:bg-gray-800/40 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-gray-700/20 shadow-xl hover:shadow-2xl hover:bg-white/50 dark:hover:bg-gray-800/50 transition-all duration-500 hover:transform hover:scale-105 hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:rotate-12 group-hover:scale-110 transition-all duration-300 shadow-lg">
                <Globe className="w-8 h-8 text-white" />
              </div>
              <div className="text-4xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent mb-3">500T</div>
              <div className="text-slate-600 dark:text-gray-400 font-medium">CO₂ Prevented</div>
            </div>
            
            <div className="group text-center p-8 bg-white/40 dark:bg-gray-800/40 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-gray-700/20 shadow-xl hover:shadow-2xl hover:bg-white/50 dark:hover:bg-gray-800/50 transition-all duration-500 hover:transform hover:scale-105 hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:rotate-12 group-hover:scale-110 transition-all duration-300 shadow-lg">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <div className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent mb-3">98%</div>
              <div className="text-slate-600 dark:text-gray-400 font-medium">Accuracy Rate</div>
            </div>
          </div>
        </div>
      </div>

      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
};

export default Hero;
