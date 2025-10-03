// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBUs0e5Yr99-xPQYH-rWcn8BcZoPhMYU9Q",
  authDomain: "starboard-dorado.firebaseapp.com",
  projectId: "starboard-dorado",
  storageBucket: "starboard-dorado.firebasestorage.app",
  messagingSenderId: "505219985615",
  appId: "1:505219985615:web:5577ee6f6f8ad9243a87ba",
  measurementId: "G-S71M9L3GXW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export auth object
export const auth = getAuth(app);


