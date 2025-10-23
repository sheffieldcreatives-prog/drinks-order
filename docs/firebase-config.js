// Save this file as public/firebase-config.js before deploying.

const firebaseConfig = {
  apiKey: "AIzaSyDs__o-OanlqbDAbIXa1J8oJxPtxLmapW8",
  authDomain: "drinks-or.firebaseapp.com",
  projectId: "drinks-or",
  storageBucket: "drinks-or.firebasestorage.app",
  messagingSenderId: "352500209261",
  appId: "1:352500209261:web:ccde9ccb286cd8353b9164",
  measurementId: "G-R48G73RJGG"
};

// Expose to window for the app to read
window.FIREBASE_CONFIG = FIREBASE_CONFIG;

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);

// Get a reference to the services you need
const auth = app.auth(); // Or getAuth(app) for modular v9+
const db = app.firestore(); // Or getFirestore(app) for modular v9+
