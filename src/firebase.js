import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
} from "firebase/auth";
import {
  getFirestore,
  enableIndexedDbPersistence,
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  onSnapshot,
  query,
  orderBy,
  where,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyARj5fuxtFJdjiKYUYcTq7Uwa4L49Wku6g",
  authDomain: "keuangan-4b63f.firebaseapp.com",
  projectId: "keuangan-4b63f",
  storageBucket: "keuangan-4b63f.firebasestorage.app",
  messagingSenderId: "710568430345",
  appId: "1:710568430345:web:09f68d96803a885126a1d8",
  measurementId: "G-Z1RRXW92V7",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Enable offline persistence
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === "failed-precondition") {
    console.warn("Offline persistence unavailable: multiple tabs open");
  } else if (err.code === "unimplemented") {
    console.warn("Offline persistence not supported in this browser");
  }
});

export {
  db,
  auth,
  googleProvider,
  // Firestore
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  onSnapshot,
  query,
  orderBy,
  where,
  serverTimestamp,
  setDoc,
  // Auth
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
};