// Import the functions you need from the SDKs you need
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/database'; // Realtime Database için gerekli modül

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAuhDCLsu47lWHvEgHWRSYCCfttwHDhkAk",
  authDomain: "mobileapplication-33ba0.firebaseapp.com",
  projectId: "mobileapplication-33ba0",
  storageBucket: "mobileapplication-33ba0.firebasestorage.app",
  messagingSenderId: "68713003156",
  appId: "1:68713003156:web:f6c35361bdd04ea2d0dc81",
  databaseURL: "https://mobileapplication-33ba0-default-rtdb.firebaseio.com/", // Database URL kısmı
};

// Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const auth = firebase.auth();
const database = firebase.database(); // Realtime Database bağlantısı

export { auth, database };
