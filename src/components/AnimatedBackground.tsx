import React from 'react';
import { Leaf, Sparkles } from 'lucide-react';

const AnimatedBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Gradient Orbs */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-r from-emerald-400/30 to-green-300/30 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" />
      <div className="absolute top-40 right-20 w-96 h-96 bg-gradient-to-r from-teal-300/30 to-cyan-300/30 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-1000" />
      <div className="absolute bottom-20 left-1/4 w-80 h-80 bg-gradient-to-r from-green-400/30 to-emerald-400/30 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-2000" />

      {/* Floating Nature Elements */}
      <Leaf className="absolute top-20 left-20 w-8 h-8 text-emerald-400 opacity-60 animate-float" style={{ animationDelay: '0s' }} />
      <Sparkles className="absolute top-40 right-40 w-6 h-6 text-teal-400 opacity-50 animate-bounce" style={{ animationDelay: '1s' }} />
      <Leaf className="absolute top-60 right-20 w-10 h-10 text-green-400 opacity-40 animate-float" style={{ animationDelay: '2s' }} />
      <Sparkles className="absolute bottom-60 left-1/3 w-7 h-7 text-emerald-300 opacity-45 animate-bounce" style={{ animationDelay: '3s' }} />
      <Leaf className="absolute bottom-40 right-1/4 w-9 h-9 text-teal-400 opacity-35 animate-float" style={{ animationDelay: '4s' }} />
    </div>
  );
};

export default AnimatedBackground;
