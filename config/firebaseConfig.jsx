// Import the necessary functions from the SDK
import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence, getAuth } from 'firebase/auth';
import { getFirestore } from "firebase/firestore";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
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
let auth;
if (Platform.OS === 'web') {
    auth = getAuth(app);
} else {
    auth = initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage)
    });
}

// Initialize Firestore
const db = getFirestore(app);

// Initialize Storage
const storage = getStorage(app);

// If using emulator (for local development)
if (__DEV__) {
  try {
    connectStorageEmulator(storage, 'localhost', 9199);
  } catch (error) {
    console.log('Storage emulator already connected');
  }
}

// Log initialization in development
if (__DEV__) {
    console.log('Firebase initialized:', {
        storageBucket: storage.app.options.storageBucket,
        projectId: app.options.projectId,
        auth: !!auth.currentUser
    });
}

export { auth, db, storage, app };
