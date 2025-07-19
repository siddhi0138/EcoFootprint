import { initializeApp } from 'firebase/app';
import { getFirestore, doc, updateDoc, collection, addDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth'; 
import { getDatabase } from 'firebase/database'; 

const firebaseConfig = {
  apiKey: "AIzaSyBsY9cFgrLX7lQlSpsU9uMkhPSYIawqzeI",
  authDomain: "ecoscope-89cb8.firebaseapp.com",
  projectId: "ecoscope-89cb8",
  storageBucket: "ecoscope-89cb8.firebasestorage.app",
  messagingSenderId: "614859320165",
  appId: "1:614859320165:web:eeb495360b25a5ba784f8c",
  measurementId: "G-ZSDT5YRPJ0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

// Initialize Firebase Authentication
const auth = getAuth(app); 

// Initialize Realtime Database
const database = getDatabase(app); 

export { app, db, auth, database, doc, updateDoc, collection, addDoc }; 