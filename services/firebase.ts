
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyD7KNFB2aUdAxS7_WCVyj1tnSRoAOavA80",
  authDomain: "instantspot.firebaseapp.com",
  projectId: "instantspot",
  storageBucket: "instantspot.firebasestorage.app",
  messagingSenderId: "879382648596",
  appId: "1:879382648596:web:7a0ffc3252a8f4d1789401",
  measurementId: "G-9762FGRR2B"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
