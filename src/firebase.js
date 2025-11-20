// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCy0if3qyxzpENDRZmL-gzXR18MP7uiqAg",
  authDomain: "beastdominion.firebaseapp.com",
  projectId: "beastdominion",
  storageBucket: "beastdominion.firebasestorage.app",
  messagingSenderId: "965537544320",
  appId: "1:965537544320:web:908fbdfcc03f2020994e65",
  measurementId: "G-Q9FS0CK919"
};

// Init
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Google Login
export const provider = new GoogleAuthProvider();
export const signInWithGoogle = () => signInWithPopup(auth, provider);
