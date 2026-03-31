import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyQcsomFtt73dcVu5qAT07VFiQjJ7qK_-Yg",
  authDomain: "oryga-auth.firebaseapp.com",
  projectId: "oryga-auth",
};

// ✅ FIX: Prevent multiple initialization (VERY IMPORTANT)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// ✅ Auth will NEVER be undefined now
const auth = getAuth(app);

// 🔥 DEBUG (keep temporarily)
console.log("🔥 Firebase App:", app);
console.log("🔥 Firebase Auth:", auth);

export { auth };
