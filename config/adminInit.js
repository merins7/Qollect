import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from './firebaseConfig';

const ADMIN_EMAIL = 'zuck@gmail.com';

export async function initializeAdmin() {
    try {
        const adminRef = doc(db, 'users', ADMIN_EMAIL);
        
        // First check if the document exists
        const adminDoc = await getDoc(adminRef);
        
        if (!adminDoc.exists()) {
            // Create new admin document
            await setDoc(adminRef, {
                email: ADMIN_EMAIL,
                isAdmin: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                role: 'admin',
                name: 'Admin'
            });
            console.log('Admin user created');
        } else if (!adminDoc.data().isAdmin) {
            // Update existing document to ensure admin privileges
            await setDoc(adminRef, {
                isAdmin: true,
                updatedAt: new Date().toISOString(),
                role: 'admin'
            }, { merge: true });
            console.log('Admin user updated');
        }
    } catch (error) {
        console.error('Error initializing admin:', error);
        // Don't throw the error, just log it
    }
} 