
import { initializeApp, getApps, getApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
    apiKey: "AIzaSyCYznVRJEd4D0BhNmfUiE2JHwvKzvtXTRE",
    authDomain: "kcc-auction-2026.firebaseapp.com",
    databaseURL: "https://kcc-auction-2026-default-rtdb.firebaseio.com",
    projectId: "kcc-auction-2026",
    storageBucket: "kcc-auction-2026.firebasestorage.app",
    messagingSenderId: "500724281136",
    appId: "1:500724281136:web:9c5130aa4698a6b1faa2f5",
    measurementId: "G-Z1JJT8J7V4"
};

// Initialize Firebase (singleton pattern)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getDatabase(app);

export { db };
