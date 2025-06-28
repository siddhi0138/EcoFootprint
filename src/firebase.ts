import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth'; // Import getAuth
import { getDatabase } from 'firebase/database'; // Import getDatabase

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCbMzZWZjR2RQhz7Hlx2-HejprAhuVHp70",
  authDomain: "ecoscope-f3be7.firebaseapp.com",
  projectId: "ecoscope-f3be7",
  storageBucket: "ecoscope-f3be7.firebasestorage.app",
  messagingSenderId: "68843231274",
  appId: "1:68843231274:web:ada6023586a3cfed680b53",
  measurementId: "G-10YPYWG9MS"
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