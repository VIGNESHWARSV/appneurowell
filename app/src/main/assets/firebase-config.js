import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";

// Your web app's Firebase configuration
export const firebaseConfig = {
  apiKey: "AIzaSyDVsIsC0O670V8GDF8NmDm4z4prqGkCDZU",
  authDomain: "neurowellai-49389.firebaseapp.com",
  projectId: "neurowellai-49389",
  storageBucket: "neurowellai-49389.firebasestorage.app",
  messagingSenderId: "296899830526",
  appId: "1:296899830526:web:20fd87ac25219c44effbaf",
  measurementId: "G-R86DHQEGTT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

console.log("Firebase initialized successfully");
