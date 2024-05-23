import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration for the second account
const firebaseConfig3 = {
  apiKey: "AIzaSyDrCeB6u0CC3d-NWLudPiPzARkVgot2HyY",
  authDomain: "points-20cf8.firebaseapp.com",
  projectId: "points-20cf8",
  storageBucket: "points-20cf8.appspot.com",
  messagingSenderId: "341348174938",
  appId: "1:341348174938:web:e45f679f1dc18f25149c63",
};

// Initialize Firebase app for the second account with a different name
const app3 = initializeApp(firebaseConfig3, 'app2');
export const db3 = getFirestore(app3);
