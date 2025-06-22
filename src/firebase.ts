import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth'; // Import getAuth
import { getDatabase } from 'firebase/database'; // Import getDatabase

// Your web app's Firebase configuration
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
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

// Initialize Firebase Authentication
const auth = getAuth(app); // Initialize auth

// Initialize Realtime Database
const database = getDatabase(app); // Initialize database

export { app, db, auth, database }; // Export auth and database