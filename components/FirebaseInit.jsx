import React, { useEffect } from 'react';
import { auth, db } from '../config/firebaseConfig';
import { initializeAdmin } from '../config/adminInit';
import { onAuthStateChanged } from 'firebase/auth';

export default function FirebaseInit({ children }) {
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user && user.email === 'zuck@gmail.com') {
                await initializeAdmin();
            }
        });

        return () => unsubscribe();
    }, []);

    return children;
} 