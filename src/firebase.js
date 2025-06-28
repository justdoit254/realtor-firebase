// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyA6qjIi6F5rWnNvP0rb7dZL_5_7zSjSs5s",
    authDomain: "realtor-firebase-78760.firebaseapp.com",
    projectId: "realtor-firebase-78760",
    storageBucket: "realtor-firebase-78760.firebasestorage.app",
    messagingSenderId: "249262569314",
    appId: "1:249262569314:web:ee17fc8d42c35967d25e3b"
};

// Initialize Firebase
initializeApp(firebaseConfig);
export const db = getFirestore()