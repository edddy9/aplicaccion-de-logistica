import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth'; // Importa getAuth

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAvhzkGwB7uyF7A6pLxnmkR5CmtnEyperI",
  authDomain: "sgt-logistica.firebaseapp.com",
  projectId: "sgt-logistica",
  storageBucket: "sgt-logistica.appspot.com", // ✅ corregido
  messagingSenderId: "372545254861",
  appId: "1:372545254861:web:0243484eabfa73a8b38084"
};

// Inicializa la app solo una vez
const app = initializeApp(firebaseConfig);

// Inicializa Firestore
const db = getFirestore(app);

// Inicializa Firebase Authentication
const auth = getAuth(app); // Obtén la instancia de auth

// Exporta db y auth
export { db, auth };