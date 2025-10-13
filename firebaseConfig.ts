// firebaseConfig.js
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAvhzkGwB7uyF7A6pLxnmkR5CmtnEyperI",
  authDomain: "sgt-logistica.firebaseapp.com",
  projectId: "sgt-logistica",
  storageBucket: "sgt-logistica.appspot.com",
  messagingSenderId: "372545254861",
  appId: "1:372545254861:web:0243484eabfa73a8b38084"
};

// Evita inicializar dos veces
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);