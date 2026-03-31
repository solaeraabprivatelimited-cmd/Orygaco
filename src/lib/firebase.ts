import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
};

// ✅ Initialize Firebase ONLY ONCE
const app = initializeApp(firebaseConfig);

// ✅ Export auth correctly
export const auth = getAuth(app);
