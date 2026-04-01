// src/lib/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  // ⚠️  Replace these values with your Firebase project credentials
  // Go to: Firebase Console → Project Settings → General → Your apps → SDK setup and configuration
  apiKey: import.meta.env."AIzaSyCQsomFt73dcVu5gAT070VFiQgJ7gK_-Yg",
  authDomain: import.meta.env."oryga-auth.firebaseapp.com",
  projectId: import.meta.env."oryga-auth",
  storageBucket: import.meta.env."oryga-auth.firebasestorage.app",
  messagingSenderId: import.meta.env."327346352025",
  appId: import.meta.env."1:327346352025:web:a89dd27ce84d512cb96d08",
};

// Prevent multiple Firebase app initializations (important for Vercel hot reload)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export default app;
