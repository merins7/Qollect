import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Alert, ActivityIndicator } from 'react-native';
import React, { useState, useEffect } from 'react';
import { auth, db, storage } from '../../config/firebaseConfig';
import { useRouter } from 'expo-router';
import Colors from '../../constant/Colors';
import { doc, getDoc, updateDoc, deleteDoc, collection, getDocs, query, where, serverTimestamp } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { signOut } from 'firebase/auth';

export default function ProfileScreen() {
    const router = useRouter();
    const user = auth.currentUser;
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState([]); // For admin view

    useEffect(() => {
        let mounted = true;

        const loadData = async () => {
            try {
                if (!mounted) return;
                await fetchUserData();
                if (userData?.isAdmin && mounted) {
                    await fetchAllUsers();
                }
            } catch (error) {
                console.error('Error loading data:', error);
            }
        };

        loadData();

        return () => {
            mounted = false;
        };
    }, [userData?.isAdmin]);

    const fetchUserData = async () => {
        try {
            const userDoc = await getDoc(doc(db, 'users', user.email));
            if (userDoc.exists()) {
                setUserData(userDoc.data());
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchAllUsers = async () => {
        try {
            const usersQuery = query(collection(db, 'users'), where('isAdmin', '==', false));
            const querySnapshot = await getDocs(usersQuery);
            const usersList = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setUsers(usersList);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const handleDeleteUser = async (userEmail) => {
        Alert.alert(
            'Delete User',
            'Are you sure you want to delete this user?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteDoc(doc(db, 'users', userEmail));
                            // Delete profile image if exists
                            const imageRef = ref(storage, `profileImages/${userEmail}`);
                            try {
                                await deleteObject(imageRef);
                            } catch (error) {
                                // Ignore if image doesn't exist
                            }
                            fetchAllUsers();
                            Alert.alert('Success', 'User deleted successfully');
                        } catch (error) {
                            console.error('Error deleting user:', error);
                            Alert.alert('Error', 'Failed to delete user');
                        }
                    }
                }
            ]
        );
    };

    const handleUpdateUser = async (userEmail) => {
        // Navigate to update user screen with user data
        router.push({
            pathname: '/update-user',
            params: { email: userEmail }
        });
    };

    const handleProfileImage = async () => {
        try {
            if (!auth.currentUser) {
                Alert.alert('Error', 'Please sign in again');
                return;
            }

            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission needed', 'Please grant camera roll permissions.');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.5,
                base64: true,
            });

            if (!result.canceled && result.assets[0]) {
                setLoading(true);

                try {
                    // Clean up the email for the filename
                    const cleanEmail = auth.currentUser.email.replace(/[.#$[\]]/g, '_');
                    const fileName = `profile_${cleanEmail}_${Date.now()}.jpg`;
                    const storageRef = ref(storage, `profileImages/${fileName}`);

                    // Convert base64 to blob
                    const base64Response = await fetch(`data:image/jpeg;base64,${result.assets[0].base64}`);
                    const blob = await base64Response.blob();

                    // Set metadata
                    const metadata = {
                        contentType: 'image/jpeg',
                    };

                    // Upload with metadata
                    await uploadBytes(storageRef, blob, metadata);

                    // Get download URL
                    const downloadURL = await getDownloadURL(storageRef);

                    // Update user document in Firestore
                    await updateDoc(doc(db, 'users', auth.currentUser.email), {
                        profileImage: downloadURL,
                        lastUpdated: serverTimestamp()
                    });

                    // Update local state
                    setUserData(prev => ({
                        ...prev,
                        profileImage: downloadURL
                    }));

                    Alert.alert('Success', 'Profile image updated successfully');
                } catch (error) {
                    console.error('Upload error details:', {
                        code: error.code,
                        message: error.message,
                        name: error.name
                    });
                    
                    if (error.code === 'storage/unauthorized') {
                        Alert.alert('Error', 'Not authorized to upload images');
                    } else if (error.code === 'storage/network-error') {
                        Alert.alert('Error', 'Network error occurred. Please check your connection');
                    } else {
                        Alert.alert(
                            'Error',
                            'Failed to upload image. Please try again with a smaller image.'
                        );
                    }
                }
            }
        } catch (error) {
            console.error('Profile image error:', error);
            Alert.alert('Error', 'Failed to process image');
        } finally {
            setLoading(false);
        }
    };

    const handleSignOut = async () => {
        Alert.alert(
            'Sign Out',
            'Are you sure you want to sign out?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel'
                },
                {
                    text: 'Sign Out',
                    onPress: async () => {
                        try {
                            await signOut(auth);
                            router.replace('/');
                        } catch (error) {
                            console.error('Error signing out:', error);
                            Alert.alert('Error', 'Failed to sign out');
                        }
                    },
                    style: 'destructive'
                }
            ]
        );
    };

    const renderUserItem = (user) => (
        <View key={user.id} style={styles.userItem}>
            <View style={styles.userInfo}>
                <Text style={styles.userName}>{user.name}</Text>
                <Text style={styles.userEmail}>{user.email}</Text>
            </View>
            <View style={styles.userActions}>
                <TouchableOpacity 
                    onPress={() => handleUpdateUser(user.email)}
                    style={styles.actionButton}
                >
                    <Ionicons name="create" size={24} color={Colors.PRIMARY} />
                </TouchableOpacity>
                <TouchableOpacity 
                    onPress={() => handleDeleteUser(user.email)}
                    style={[styles.actionButton, styles.deleteButton]}
                >
                    <Ionicons name="trash" size={24} color="#ff4444" />
                </TouchableOpacity>
            </View>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color={Colors.PRIMARY} />
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity 
                    style={styles.avatarContainer} 
                    onPress={handleProfileImage}
                >
                    {userData?.profileImage ? (
                        <Image 
                            source={{ uri: userData.profileImage }} 
                            style={styles.avatar} 
                        />
                    ) : (
                        <Ionicons name="person-circle" size={100} color={Colors.PRIMARY} />
                    )}
                    <View style={styles.editBadge}>
                        <Ionicons name="camera" size={20} color="#fff" />
                    </View>
                </TouchableOpacity>
                <Text style={styles.name}>{userData?.name || 'User'}</Text>
                <Text style={styles.role}>{userData?.isAdmin ? 'Administrator' : 'Student'}</Text>
            </View>

            {userData?.isAdmin ? (
                <View style={styles.adminSection}>
                    <Text style={styles.sectionTitle}>Manage Users</Text>
                    {users.map(renderUserItem)}
                </View>
            ) : (
                <View style={styles.infoSection}>
                    <ProfileItem icon="mail" label="Email" value={user?.email} />
                    <ProfileItem icon="school" label="Branch" value={userData?.branch} />
                    <ProfileItem icon="calendar" label="Year" value={userData?.year} />
                    <ProfileItem icon="book" label="Semester" value={userData?.semester} />
                    <ProfileItem icon="card" label="Student ID" value={userData?.studentid} />
                </View>
            )}

            {/* Sign Out Button */}
            <TouchableOpacity 
                style={styles.signOutButton}
                onPress={handleSignOut}
            >
                <Ionicons name="log-out-outline" size={24} color={Colors.white} />
                <Text style={styles.signOutText}>Sign Out</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const ProfileItem = ({ icon, label, value }) => (
    <View style={styles.profileItem}>
        <Ionicons name={icon} size={24} color={Colors.PRIMARY} />
        <View style={styles.profileItemText}>
            <Text style={styles.profileLabel}>{label}</Text>
            <Text style={styles.profileValue}>{value}</Text>
        </View>
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        backgroundColor: Colors.white,
        alignItems: 'center',
        padding: 20,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    avatarContainer: {
        marginBottom: 15,
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
    role: {
        fontSize: 16,
        color: '#666',
        marginTop: 5,
    },
    infoSection: {
        backgroundColor: Colors.white,
        margin: 15,
        padding: 15,
        borderRadius: 15,
        elevation: 2,
    },
    profileItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    profileItemText: {
        marginLeft: 15,
        flex: 1,
    },
    profileLabel: {
        fontSize: 14,
        color: '#666',
    },
    profileValue: {
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
    },
    actionsSection: {
        padding: 15,
    },
    actionButton: {
        backgroundColor: Colors.PRIMARY,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
    },
    signOutButton: {
        backgroundColor: '#ff4444',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 15,
        borderRadius: 10,
        margin: 15,
        marginTop: 30,
    },
    signOutText: {
        color: Colors.white,
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 10,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    editBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: Colors.PRIMARY,
        borderRadius: 15,
        width: 30,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#fff',
    },
    adminSection: {
        backgroundColor: Colors.white,
        margin: 15,
        padding: 15,
        borderRadius: 15,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
        color: '#333',
    },
    userItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        fontSize: 16,
        fontWeight: '500',
        color: '#333',
    },
    userEmail: {
        fontSize: 14,
        color: '#666',
    },
    userActions: {
        flexDirection: 'row',
        gap: 10,
    },
    deleteButton: {
        marginLeft: 10,
    },
}); 