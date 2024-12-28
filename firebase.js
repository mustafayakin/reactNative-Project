// Import the functions you need from the SDKs you need
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAuhDCLsu47lWHvEgHWRSYCCfttwHDhkAk",
  authDomain: "mobileapplication-33ba0.firebaseapp.com",
  projectId: "mobileapplication-33ba0",
  storageBucket: "mobileapplication-33ba0.firebasestorage.app",
  messagingSenderId: "68713003156",
  appId: "1:68713003156:web:f6c35361bdd04ea2d0dc81"
};

// Initialize Firebase
if(!firebase.apps.legth){
    firebase.initializeApp(firebaseConfig);
}
const auth = firebase.auth();

export {auth};