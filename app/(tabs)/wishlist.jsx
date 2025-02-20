import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import Colors from '../../constant/Colors';
import { Ionicons } from '@expo/vector-icons';
import { db, auth } from '../../config/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { useRouter } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';

export default function WishlistScreen() {
    const [wishlistItems, setWishlistItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const { isDarkMode } = useTheme();

    useEffect(() => {
        fetchWishlist();
    }, []);

    const fetchWishlist = async () => {
        try {
            const userDoc = await getDoc(doc(db, 'users', auth.currentUser.email));
            const wishlist = userDoc.data()?.wishlist || [];
            
            // Fetch details for each wishlisted item
            const items = await Promise.all(
                wishlist.map(async (id) => {
                    const materialDoc = await getDoc(doc(db, 'materials', id));
                    return { id, ...materialDoc.data() };
                })
            );
            
            setWishlistItems(items);
        } catch (error) {
            console.error('Error fetching wishlist:', error);
        } finally {
            setLoading(false);
        }
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity 
            style={[
                styles.itemCard,
                isDarkMode && { backgroundColor: '#333' }
            ]}
            onPress={() => router.push(`/material/${item.id}`)}
        >
            <View style={styles.itemInfo}>
                <Text style={[
                    styles.itemName,
                    isDarkMode && { color: '#fff' }
                ]}>{item.name}</Text>
                <Text style={styles.itemSubject}>{item.subject}</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#666" />
        </TouchableOpacity>
    );

    return (
        <View style={[
            styles.container,
            isDarkMode && { backgroundColor: '#1a1a1a' }
        ]}>
            <Header title="My Wishlist" />
            {wishlistItems.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Ionicons name="heart-outline" size={64} color={Colors.PRIMARY} />
                    <Text style={[
                        styles.emptyText,
                        isDarkMode && { color: '#fff' }
                    ]}>Your wishlist is empty</Text>
                </View>
            ) : (
                <FlatList
                    data={wishlistItems}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.list}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    list: {
        padding: 15,
    },
    itemCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.white,
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.22,
        shadowRadius: 2.22,
    },
    itemInfo: {
        flex: 1,
    },
    itemName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    itemSubject: {
        fontSize: 14,
        color: '#666',
        marginTop: 4,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    emptyText: {
        fontSize: 18,
        color: '#666',
        marginTop: 10,
    },
}); 