import { initializeApp, getApp, getApps } from "firebase/app";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Config matches firebase-applet-config.json
const firebaseConfig = {
  apiKey: "AIzaSyBJ1GlJhnK1ZYMxnDAHZ_fn3gJlBWe3B-k",
  authDomain: "gen-lang-client-0443531587.firebaseapp.com",
  projectId: "gen-lang-client-0443531587",
  storageBucket: "gen-lang-client-0443531587.firebasestorage.app",
  messagingSenderId: "158068671768",
  appId: "1:158068671768:web:331df8b738a3ec1e840a6d",
};

// Initialize Firebase safely
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);

// Providers
export const googleProvider = new GoogleAuthProvider();

export { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  RecaptchaVerifier,
  signInWithPhoneNumber
};
export type { ConfirmationResult };
