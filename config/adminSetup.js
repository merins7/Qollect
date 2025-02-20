import { doc, setDoc, getDoc } from 'firebase/firestore';

const ADMIN_EMAIL = 'zuck@gmail.com';

export async function setupAdminUser(db) {
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
            console.log('Admin user created successfully');
        } else {
            if (!adminDoc.data().isAdmin) {
                await setDoc(adminRef, { isAdmin: true }, { merge: true });
            }
        }
    } catch (error) {
        console.error('Error setting up admin:', error);
    }
} 