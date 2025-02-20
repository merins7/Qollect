import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from './firebaseConfig';

const ADMIN_EMAIL = 'zuck@gmail.com';
const ADMIN_PASSWORD = '12345678';

export async function initializeAdmin() {
    try {
        const adminRef = doc(db, 'users', ADMIN_EMAIL);
        const adminDoc = await getDoc(adminRef);

        if (!adminDoc.exists()) {
            await setDoc(adminRef, {
                email: ADMIN_EMAIL,
                name: 'Admin',
                isAdmin: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });
        }
    } catch (error) {
        console.error('Admin initialization error:', error);
    }
} 