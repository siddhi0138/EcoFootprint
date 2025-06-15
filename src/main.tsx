import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initializeApp } from 'firebase/app';


// TODO: Replace with your actual Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAoBMalN3miOwj4LGgN-ORFclk71kscWuQ",
  authDomain: "ecofootprint-4aa28.firebaseapp.com",
  projectId: "ecofootprint-4aa28",
  storageBucket: "ecofootprint-4aa28.firebasestorage.app",
  messagingSenderId: "263046775029",
  appId: "1:263046775029:web:70f8182a5116696a6b05bc",
  measurementId: "G-FZ5YPG18FC"
};

// Initialize Firebase
initializeApp(firebaseConfig);

createRoot(document.getElementById("root")!).render(<App />);
