import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCQsomFt73dcVu5gAT070VFiQgJ7gK_-Yg",
  authDomain: "oryga-auth.firebaseapp.com",
  projectId: "oryga-auth",
  storageBucket: "oryga-auth.firebasestorage.app",
  messagingSenderId: "327346352025",
  appId: "1:327346352025:web:a89dd27ce84d512cb96d08",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export default app;
