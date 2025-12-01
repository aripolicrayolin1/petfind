// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDTbKQ7OjL4hZIyoQaZ27RX5Y-QEnQxtTI",
  authDomain: "petfind-f6d2d.firebaseapp.com",
  projectId: "petfind-f6d2d",
  storageBucket: "petfind-f6d2d.firebasestorage.app",
  messagingSenderId: "1063802302618",
  appId: "1:1063802302618:web:f6a3ce5859042b57832f23",
  measurementId: "G-PJJ3P7JEHH"
};

// Make sure Firebase initializes only once (important for Next.js)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Analytics only works in the browser
let analytics;
if (typeof window !== "undefined") {
  analytics = getAnalytics(app);
}

export { app, analytics };
