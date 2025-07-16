import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Alert, ActivityIndicator, FlatList, SafeAreaView } from 'react-native';
import React, { useState, useEffect } from 'react';
import { auth, db, storage } from '../../config/firebaseConfig';
import { useRouter } from 'expo-router';
import Colors from '../../constant/Colors';
import { doc, getDoc, updateDoc, deleteDoc, collection, getDocs, query, where, serverTimestamp } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { signOut } from 'firebase/auth';
import { useTheme } from '../../context/ThemeContext';

export default function ProfileScreen() {
    const router = useRouter();
    const user = auth.currentUser;
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState([]); // For admin view
    const { isDarkMode } = useTheme();

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
            setLoading(true);
            const usersQuery = query(
                collection(db, 'users'), 
                where('isAdmin', '==', false)
            );
            const querySnapshot = await getDocs(usersQuery);
            const usersList = querySnapshot.docs.map(doc => ({
                id: doc.id,
                email: doc.data().email,
                ...doc.data()
            }));
            setUsers(usersList);
        } catch (error) {
            console.error('Error fetching users:', error);
            Alert.alert('Error', 'Failed to fetch users');
        } finally {
            setLoading(false);
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
                            setLoading(true);
                            // Delete user document
                            const userRef = doc(db, 'users', userEmail);
                            await deleteDoc(userRef);

                            // Delete profile image
                            try {
                                const imageRef = ref(storage, `profileImages/${userEmail}`);
                                await deleteObject(imageRef);
                            } catch (error) {
                                // Ignore if image doesn't exist
                                console.log('No profile image to delete');
                            }

                            // Delete user's materials
                            const materialsQuery = query(
                                collection(db, 'materials'),
                                where('uploadedBy', '==', userEmail)
                            );
                            const materialsSnapshot = await getDocs(materialsQuery);
                            const deletePromises = materialsSnapshot.docs.map(doc => deleteDoc(doc.ref));
                            await Promise.all(deletePromises);

                            // Update local state
                            setUsers(prevUsers => prevUsers.filter(user => user.email !== userEmail));
                            Alert.alert('Success', 'User and associated data deleted successfully');
                        } catch (error) {
                            console.error('Error deleting user:', error);
                            Alert.alert('Error', 'Failed to delete user');
                        } finally {
                            setLoading(false);
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
                            router.replace('/auth/signIn');
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

    const renderUserItem = ({ item }) => {
        if (!item?.email) return null;

        return (
            <View style={[
                styles.userItem,
                isDarkMode && styles.userItemDark
            ]}>
                <View style={styles.userInfo}>
                    <Text style={[styles.userName, isDarkMode && styles.userNameDark]}>
                        {item.name || 'Unnamed User'}
                    </Text>
                    <Text style={[styles.userEmail, isDarkMode && styles.userEmailDark]}>
                        {item.email}
                    </Text>
                    <View style={styles.userDetailsContainer}>
                        <Text style={[styles.userDetails, isDarkMode && styles.userDetailsDark]}>
                            Branch: {item.branch || 'N/A'}
                        </Text>
                        <Text style={[styles.userDetails, isDarkMode && styles.userDetailsDark]}>
                            Semester: {item.semester || 'N/A'}
                        </Text>
                    </View>
                </View>
                <View style={styles.userActions}>
                    <TouchableOpacity 
                        onPress={() => handleUpdateUser(item.email)}
                        style={[styles.actionButton, isDarkMode && styles.actionButtonDark]}
                    >
                        <Ionicons 
                            name="create-outline" 
                            size={22} 
                            color={isDarkMode ? Colors.PRIMARY : '#fff'} 
                        />
                    </TouchableOpacity>
                    <TouchableOpacity 
                        onPress={() => handleDeleteUser(item.email)}
                        style={[styles.actionButton, styles.deleteButton]}
                    >
                        <Ionicons name="trash-outline" size={22} color="#fff" />
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color={Colors.PRIMARY} />
            </View>
        );
    }

    const renderHeader = () => (
        <>
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

            {!userData?.isAdmin && (
                <View style={styles.infoSection}>
                    <ProfileItem icon="mail" label="Email" value={user?.email} />
                    <ProfileItem icon="school" label="Branch" value={userData?.branch} />
                    <ProfileItem icon="calendar" label="Year" value={userData?.year} />
                    <ProfileItem icon="book" label="Semester" value={userData?.semester} />
                    <ProfileItem icon="card" label="Student ID" value={userData?.studentid} />
                </View>
            )}
        </>
    );

    const renderFooter = () => (
        <>
            {userData?.isAdmin && (
                <TouchableOpacity
                    style={[styles.menuItem, isDarkMode && styles.menuItemDark]}
                    onPress={() => router.push('/admin/MaterialApprovals')}
                >
                    <View style={styles.menuItemContent}>
                        <Ionicons name="checkmark-circle" size={24} color={Colors.PRIMARY} />
                        <Text style={[styles.menuItemText, isDarkMode && styles.menuItemTextDark]}>
                            Material Approvals
                        </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={24} color="#666" />
                </TouchableOpacity>
            )}

            <TouchableOpacity 
                style={styles.signOutButton}
                onPress={handleSignOut}
            >
                <Ionicons name="log-out-outline" size={24} color={Colors.white} />
                <Text style={styles.signOutText}>Sign Out</Text>
            </TouchableOpacity>
        </>
    );

    return (
        <SafeAreaView style={[styles.container, isDarkMode && styles.containerDark]}>
            {userData?.isAdmin ? (
                <FlatList
                    data={users}
                    renderItem={renderUserItem}
                    keyExtractor={item => item.email}
                    ListHeaderComponent={renderHeader}
                    ListHeaderComponentStyle={styles.headerComponent}
                    ListFooterComponent={renderFooter}
                    ListFooterComponentStyle={styles.footerComponent}
                    contentContainerStyle={[
                        styles.flatListContent,
                        users.length === 0 && styles.emptyListContent
                    ]}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={() => (
                        <View style={styles.emptyContainer}>
                            <Ionicons 
                                name="people-outline" 
                                size={50} 
                                color={isDarkMode ? '#666' : '#999'} 
                            />
                            <Text style={[styles.emptyText, isDarkMode && styles.emptyTextDark]}>
                                No users found
                            </Text>
                        </View>
                    )}
                    refreshing={loading}
                    onRefresh={fetchAllUsers}
                />
            ) : (
                <FlatList
                    data={[]} // Empty data for non-admin users
                    renderItem={null}
                    ListHeaderComponent={renderHeader}
                    ListFooterComponent={renderFooter}
                    contentContainerStyle={styles.flatListContent}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </SafeAreaView>
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
    containerDark: {
        backgroundColor: '#1a1a1a',
    },
    flatListContent: {
        flexGrow: 1,
        paddingBottom: 20,
    },
    headerComponent: {
        marginBottom: 15,
    },
    footerComponent: {
        marginTop: 15,
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
    userItem: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 15,
        marginBottom: 10,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    userItemDark: {
        backgroundColor: '#333',
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 2,
    },
    userNameDark: {
        color: '#fff',
    },
    userEmail: {
        fontSize: 14,
        color: '#666',
        marginBottom: 2,
    },
    userEmailDark: {
        color: '#999',
    },
    userDetailsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 4,
    },
    userDetails: {
        fontSize: 12,
        color: '#888',
    },
    userDetailsDark: {
        color: '#777',
    },
    userActions: {
        flexDirection: 'row',
        gap: 8,
    },
    actionButton: {
        backgroundColor: Colors.PRIMARY,
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    actionButtonDark: {
        backgroundColor: '#444',
    },
    deleteButton: {
        backgroundColor: '#ff4444',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    menuItemDark: {
        borderBottomColor: '#2c2c2e',
    },
    menuItemContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    menuItemText: {
        fontSize: 16,
        color: '#333',
        marginLeft: 10,
    },
    menuItemTextDark: {
        color: '#fff',
    },
    emptyListContent: {
        flexGrow: 1,
        justifyContent: 'center',
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    emptyText: {
        fontSize: 16,
        color: '#666',
        marginTop: 10,
        textAlign: 'center',
    },
    emptyTextDark: {
        color: '#999',
    },
}); 