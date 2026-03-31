import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCQsomFt73dcVu5gAT070VFiQgJ7gK_-Yg",
  authDomain: "oryga-auth.firebaseapp.com",
  projectId: "oryga-auth",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
