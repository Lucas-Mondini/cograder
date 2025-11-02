// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDCr1KnaFN34lt_4jCUo0uws2spB_8JnzA",
  authDomain: "cograder-4b7ff.firebaseapp.com",
  projectId: "cograder-4b7ff",
  storageBucket: "cograder-4b7ff.firebasestorage.app",
  messagingSenderId: "329013442077",
  appId: "1:329013442077:web:f0a0cca43cf20c1d0d78f4",
  measurementId: "G-1SF4GTH5BD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const firestore = getFirestore(app);