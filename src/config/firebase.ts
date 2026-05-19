import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyCUOqxooHRcTFbjsOI8SzvMy58pnv7Ds-E",
  authDomain: "sampati-ix.firebaseapp.com",
  projectId: "sampati-ix",
  storageBucket: "sampati-ix.firebasestorage.app",
  messagingSenderId: "580657892242",
  appId: "1:580657892242:web:8aae1287777916bf678f4b",
  measurementId: "G-QZ9CN6NDLN"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = typeof window !== 'undefined' && firebaseConfig.measurementId ? getAnalytics(app) : null;
