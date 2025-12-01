// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage"; // Importar Storage
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDTbKQ7OjL4hZIyoQaZ27RX5Y-QEnQxtTI",
  authDomain: "petfind-f6d2d.firebaseapp.com",
  projectId: "petfind-f6d2d",
  storageBucket: "petfind-f6d2d.appspot.com",
  messagingSenderId: "1063802302618",
  appId: "1:1063802302618:web:f6a3ce5859042b57832f23",
  measurementId: "G-PJJ3P7JEHH"
};

// Make sure Firebase initializes only once (important for Next.js)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app); // Inicializar Storage

// Analytics only works in the browser
let analytics;
if (typeof window !== "undefined") {
  analytics = getAnalytics(app);
}

export { app, db, auth, storage, analytics }; // Exportar Storage
