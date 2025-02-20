// Import the necessary functions from the SDK
import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from "firebase/firestore";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getStorage } from 'firebase/storage';
import { Platform } from 'react-native';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAeA2651ERJ8WW7Paiqju26N2k59hy7JQY",
  authDomain: "projects-2025-bdf05.firebaseapp.com",
  projectId: "projects-2025-bdf05",
  storageBucket: "projects-2025-bdf05.appspot.com",
  messagingSenderId: "400835137233",
  appId: "1:400835137233:web:6fbc92765b129e9b557ff0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with persistence
const auth = Platform.OS === 'web' 
  ? getAuth(app)
  : initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage)
    });

// Initialize Firestore
const db = getFirestore(app);

// Initialize Storage
const storage = getStorage(app);

// Log initialization in development
if (__DEV__) {
    console.log('Firebase initialized:', {
        storageBucket: storage.app.options.storageBucket,
        projectId: app.options.projectId,
        auth: !!auth.currentUser
    });
}

export { auth, db, storage, app };
