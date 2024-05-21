import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDrCeB6u0CC3d-NWLudPiPzARkVgot2HyY",
    authDomain: "points-20cf8.firebaseapp.com",
    projectId: "points-20cf8",
    storageBucket: "points-20cf8.appspot.com",
    messagingSenderId: "341348174938",
    appId: "1:341348174938:web:e45f679f1dc18f25149c63"
    };
// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);


