import React, { useEffect, useState } from 'react';
import { auth, db } from '../config/firebaseConfig';
import { initializeAdmin } from '../config/adminInit';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

export default function FirebaseInit({ children }) {
    const [initialized, setInitialized] = useState(false);

    useEffect(() => {
        const initializeFirebase = async () => {
            try {
                // Wait for auth to be ready
                await new Promise((resolve) => {
                    const unsubscribe = onAuthStateChanged(auth, (user) => {
                        unsubscribe();
                        resolve(user);
                    });
                });

                // Initialize admin user
                await initializeAdmin();
                setInitialized(true);
            } catch (error) {
                console.error('Firebase initialization error:', error);
                setInitialized(true); // Continue even if there's an error
            }
        };

        initializeFirebase();
    }, []);

    if (!initialized) {
        return null; // Or a loading spinner
    }

    return children;
} 