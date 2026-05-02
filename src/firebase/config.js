import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBlYDPsSj8H6jfoppw7cOO2TDnwFhPSM4A",
  authDomain: "portaladore-74237.firebaseapp.com",
  projectId: "portaladore-74237",
  storageBucket: "portaladore-74237.firebasestorage.app",
  messagingSenderId: "1071328902318",
  appId: "1:1071328902318:web:d85844a1bf5342af13c13f",
  measurementId: "G-7549GBGRXW"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);          // ← added for image uploads
export const googleProvider = new GoogleAuthProvider();
export const analytics = getAnalytics(app);
export default app;
