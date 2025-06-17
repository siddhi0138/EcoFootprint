import React from 'react';
import LoginForm from '@/components/LoginForm';
import { signInWithPopup, GoogleAuthProvider, getAuth } from 'firebase/auth';

const Login = () => {
  const handleGoogleSignIn = async () => {
    const auth = getAuth();
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      // Navigate or store user details
    } catch (error) {
      console.error('Google Sign-In Error:', error);
    }
  };

  return <LoginForm onGoogleSignIn={handleGoogleSignIn} />;
};

export default Login;
