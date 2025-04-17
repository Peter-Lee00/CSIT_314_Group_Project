import { initializeApp } from "firebase/app";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyD-8QDzqo8EkiDNhKUcIUgItA-_McMw2go",
    authDomain: "csit314-group-project-7d6db.firebaseapp.com",
    projectId: "csit314-group-project-7d6db",
    storageBucket: "csit314-group-project-7d6db.firebasestorage.app",
    messagingSenderId: "848820174767",
    appId: "1:848820174767:web:69d7e378be6f9995b2795a"
};

// Initialize Firebase with options
const app = initializeApp(firebaseConfig);

// Initialize Firestore with settings
const db = getFirestore(app);

// Initialize Storage
const storage = getStorage(app);

export { db, storage };