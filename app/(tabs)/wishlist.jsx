import { View, Text, FlatList, StyleSheet, TouchableOpacity, Linking, Alert } from 'react-native';
import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { db, auth } from '../../config/firebaseConfig';
import Header from '../components/Header';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

export default function WishlistScreen() {
    const { isDarkMode } = useTheme();
    const [wishlist, setWishlist] = useState([]);
    const userId = auth.currentUser?.uid;

    useEffect(() => {
        if (!userId) return;

        // ✅ Real-time listener for wishlist updates
        const wishlistRef = collection(db, `users/${userId}/wishlist`);
        const unsubscribe = onSnapshot(wishlistRef, (snapshot) => {
            const updatedWishlist = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setWishlist(updatedWishlist);
        });

        // Cleanup the listener when component unmounts
        return () => unsubscribe();
    }, [userId]);

    const removeFromWishlist = async (item) => {
        try {
            await deleteDoc(doc(db, `users/${userId}/wishlist`, item.id));
            Alert.alert("Removed", "Item removed from wishlist.");
        } catch (error) {
            console.error("Error removing from wishlist:", error);
            Alert.alert("Error", "Failed to remove item.");
        }
    };

    const openFile = async (fileUrl) => {
        if (!fileUrl) return Alert.alert('Error', 'File URL not available');
        await Linking.openURL(fileUrl);
    };

    return (
        <View style={[styles.container, isDarkMode && styles.containerDark]}>
            <Header title="Wishlist" showBack={false} />
            
            {wishlist.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Ionicons name="heart-dislike-outline" size={50} color="#888" />
                    <Text style={styles.emptyText}>Your wishlist is empty</Text>
                </View>
            ) : (
                <FlatList
                    data={wishlist}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <View style={[styles.item, isDarkMode && styles.itemDark]}>
                            <View style={styles.itemInfo}>
                                <Text style={[styles.title, isDarkMode && styles.textDark]}>{item.title}</Text>
                                <Text style={[styles.subtitle, isDarkMode && styles.textDark]}>
                                    📖 Subject: {item.subject || item.subjectName || "Unknown"}
                                </Text>
                            </View>
                            <View style={styles.actions}>
                                {/* ✅ View Button */}
                                <TouchableOpacity 
                                    style={styles.viewButton} 
                                    onPress={() => openFile(item.fileUrl)}
                                >
                                    <Ionicons name="eye-outline" size={22} color="#fff" />
                                    <Text style={styles.buttonText}>View</Text>
                                </TouchableOpacity>

                                {/* 🗑️ Delete Button */}
                                <TouchableOpacity 
                                    style={styles.deleteButton} 
                                    onPress={() => removeFromWishlist(item)}
                                >
                                    <Ionicons name="trash-outline" size={22} color="#fff" />
                                    <Text style={styles.buttonText}>Delete</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5' },
    containerDark: { backgroundColor: '#1a1a1a' },
    item: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: 15, 
        borderBottomWidth: 1, 
        borderBottomColor: '#ddd' 
    },
    itemDark: { borderBottomColor: '#444' },
    itemInfo: { flex: 1 },
    title: { fontSize: 16, fontWeight: 'bold' },
    subtitle: { fontSize: 14, color: '#666' },
    textDark: { color: '#fff' },
    actions: {
        flexDirection: 'row',
        gap: 10,
    },
    viewButton: {
        backgroundColor: '#4CAF50', // Green for View
        padding: 10,
        borderRadius: 5,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },
    deleteButton: {
        backgroundColor: '#ff4444', // Red for Delete
        padding: 10,
        borderRadius: 5,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },
    buttonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyText: { fontSize: 18, color: '#666', marginTop: 10 },
});
