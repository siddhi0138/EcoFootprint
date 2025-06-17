import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FcGoogle } from 'react-icons/fc';
import { motion } from 'framer-motion';

const LoginForm = ({ onGoogleSignIn }: { onGoogleSignIn?: () => void }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-100 via-green-50 to-sage-100 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="backdrop-blur-md bg-white/70 border border-green-100 shadow-xl rounded-3xl">
          <CardHeader>
            <CardTitle className="text-center text-green-800 text-3xl font-bold">
              Welcome to EcoFootprint
            </CardTitle>
            <p className="text-center text-sm text-gray-500 mt-1">
              Sign in to reduce your carbon trail 🌍
            </p>
          </CardHeader>

          <CardContent className="space-y-5 px-6 pb-6">
            <div className="space-y-4">
              <Input
                type="email"
                placeholder="you@example.com"
                className="rounded-xl focus-visible:ring-green-500"
              />
              <Input
                type="password"
                placeholder="••••••••"
                className="rounded-xl focus-visible:ring-green-500"
              />
              <Button className="w-full bg-green-600 hover:bg-green-700 text-white text-md rounded-xl shadow-sm transition-all">
                Log In
              </Button>
            </div>

            <div className="relative flex items-center justify-center">
              <span className="absolute w-full border-t border-gray-300" />
              <span className="relative px-3 bg-white text-sm text-gray-400">OR</span>
            </div>

            {onGoogleSignIn && (
              <Button
                variant="outline"
                className="w-full flex items-center justify-center gap-3 rounded-xl hover:bg-gray-100 transition"
                onClick={onGoogleSignIn}
              >
                <FcGoogle className="text-2xl" />
                Continue with Google
              </Button>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default LoginForm;
