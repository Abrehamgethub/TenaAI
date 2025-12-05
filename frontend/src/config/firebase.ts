import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, browserLocalPersistence, setPersistence } from 'firebase/auth';

// Firebase configuration - hardcoded for reliability
const firebaseConfig = {
  apiKey: 'AIzaSyA01Bp90USZuwgTw7PjM7v8x50NEpa7wq8',
  authDomain: 'tenaai-9a62c.firebaseapp.com',
  projectId: 'tenaai-9a62c',
  storageBucket: 'tenaai-9a62c.appspot.com',
  messagingSenderId: '1073812925824',
  appId: '1:1073812925824:web:5205bdd78bf52c71fee565',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth with persistence
export const auth = getAuth(app);

// Set persistence to local (survives browser restarts)
setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.error('Auth persistence error:', error);
});

// Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('email');
googleProvider.addScope('profile');
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

export default app;
