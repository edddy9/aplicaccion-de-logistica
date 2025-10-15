// firebaseConfig.js
import { initializeApp, getApps, getApp } from "firebase/app";
import {
  initializeAuth,
  getReactNativePersistence
} from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAvhzkGwB7uyF7A6pLxnmkR5CmtnEyperI",
  authDomain: "sgt-logistica.firebaseapp.com",
  projectId: "sgt-logistica",
  storageBucket: "sgt-logistica.appspot.com",
  messagingSenderId: "372545254861",
  appId: "1:372545254861:web:0243484eabfa73a8b38084",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// ✅ Persistencia de sesión con AsyncStorage
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export const db = getFirestore(app);
export const storage = getStorage(app);
