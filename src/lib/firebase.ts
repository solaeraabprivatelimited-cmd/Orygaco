import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// 🔴 REPLACE WITH YOUR REAL VALUES
const firebaseConfig = {
  apiKey: "AIzaSyCQsomFt73dcVu5gAT070VFiQgJ7gK_-Yg",
  authDomain: "oryga-auth.firebaseapp.com",
  projectId: "oryga-auth",
};

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);

// ✅ Initialize Auth
const auth = getAuth(app);

export { auth };
