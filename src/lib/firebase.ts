// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCPLBXBlUwBv16Q-b1pdya4Yabz1mjdd1U",
  authDomain: "wishfeed-18119.firebaseapp.com",
  projectId: "wishfeed-18119",
  storageBucket: "wishfeed-18119.firebasestorage.app",
  messagingSenderId: "147236387248",
  appId: "1:147236387248:web:9fea2c290a4b8cae877e75",
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
export const db = getFirestore(firebaseApp);
