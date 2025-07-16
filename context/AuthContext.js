import React, { createContext, useState, useContext, useEffect } from 'react';
import { auth, db } from '../config/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { router } from 'expo-router';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [userProfile, setUserProfile] = useState(null);

    // Function to create or update user profile
    const updateUserProfile = async (userData) => {
        try {
            if (!userData) return;
            
            const userRef = doc(db, 'users', userData.uid);
            const userSnap = await getDoc(userRef);

            if (!userSnap.exists()) {
                // Create new user profile
                const userProfile = {
                    uid: userData.uid,
                    email: userData.email,
                    displayName: userData.displayName || '',
                    photoURL: userData.photoURL || '',
                    createdAt: new Date().toISOString(),
                    isAdmin: false, // Default to regular user
                };
                await setDoc(userRef, userProfile);
                setUserProfile(userProfile);
            } else {
                // Update existing profile with any new auth data
                const existingData = userSnap.data();
                setUserProfile(existingData);
            }
        } catch (error) {
            console.error('Error updating user profile:', error);
        }
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (userData) => {
            try {
                if (userData) {
                    setUser(userData);
                    await updateUserProfile(userData);
                } else {
                    setUser(null);
                    setUserProfile(null);
                    router.replace('/');
                }
            } catch (error) {
                console.error('Auth state change error:', error);
            } finally {
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, []);

    const signOut = async () => {
        try {
            await auth.signOut();
            setUser(null);
            setUserProfile(null);
            router.replace('/');
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            userProfile,
            loading,
            signOut,
            isAuthenticated: !!user,
            isAdmin: userProfile?.isAdmin || false,
        }}>
            {!loading && children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
} 