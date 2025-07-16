import { 
    View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity, 
    Linking, Alert 
} from 'react-native';
import React, { useState, useEffect } from 'react';
import { useLocalSearchParams } from 'expo-router';
import Header from '../../../components/Header';
import Colors from '../../../../constant/Colors';
import { useTheme } from '../../../../context/ThemeContext';
import { collection, query, where, getDocs, setDoc, doc, deleteDoc } from 'firebase/firestore';
import { db, auth } from '../../../../config/firebaseConfig';
import { Ionicons } from '@expo/vector-icons';
import RatingComponent from '../../../components/RatingComponent';

export default function MaterialDetail() {
    const { type, semester, subjectId, subjectName, materialName } = useLocalSearchParams();
    const { isDarkMode } = useTheme();
    const [materials, setMaterials] = useState([]);
    const [wishlist, setWishlist] = useState({});
    const userId = auth.currentUser?.uid;

    useEffect(() => {
        fetchMaterials();
        if (userId) fetchWishlist();
    }, []);

    const fetchMaterials = async () => {
        try {
            const materialsRef = collection(db, 'materials');
            const q = query(
                materialsRef,
                where('semester', '==', semester.toString()),
                where('subjectId', '==', subjectId),
                where('type', '==', type),
                where('status', '==', 'active')
            );
            
            const snapshot = await getDocs(q);
            const materialsList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            setMaterials(materialsList);
        } catch (error) {
            console.error('Error fetching materials:', error);
        }
    };

    const fetchWishlist = async () => {
        try {
            const wishlistRef = collection(db, `users/${userId}/wishlist`);
            const snapshot = await getDocs(wishlistRef);
            const wishlistItems = {};
            snapshot.docs.forEach(doc => {
                wishlistItems[doc.id] = true;
            });
            setWishlist(wishlistItems);
        } catch (error) {
            console.error('Error fetching wishlist:', error);
        }
    };

    const toggleWishlist = async (material) => {
        if (!userId) {
            Alert.alert("Login Required", "You need to log in to save materials to wishlist.");
            return;
        }

        if (!material.fileUrl) {
            Alert.alert("Error", "File URL is missing, cannot add to wishlist.");
            return;
        }

        const wishlistRef = doc(db, `users/${userId}/wishlist`, material.id);

        try {
            if (wishlist[material.id]) {
                await deleteDoc(wishlistRef);
                setWishlist(prev => ({ ...prev, [material.id]: false }));
            } else {
                await setDoc(wishlistRef, {
                    id: material.id,
                    title: material.title,
                    subjectName: material.subjectName || subjectName || "Unknown Subject",
                    fileUrl: material.fileUrl || "",
                    addedAt: new Date(),
                });
                setWishlist(prev => ({ ...prev, [material.id]: true }));
            }
        } catch (error) {
            console.error("Error updating wishlist:", error);
        }
    };

    const handleOpenMaterial = async (material) => {
        try {
            if (!material.fileUrl) {
                Alert.alert('Error', 'File URL not available');
                return;
            }
            await Linking.openURL(material.fileUrl);
        } catch (error) {
            console.error('Error opening material:', error);
            Alert.alert('Error', 'Failed to open material');
        }
    };

    const renderMaterialItem = ({ item }) => (
        <View style={[styles.materialCard, isDarkMode && styles.materialCardDark]}>
            <TouchableOpacity 
                style={styles.materialInfo}
                onPress={() => handleOpenMaterial(item)}
            >
                <Text style={[styles.materialTitle, isDarkMode && styles.textDark]}>{item.title}</Text>
                <Text style={[styles.uploadInfo, isDarkMode && styles.textDark]}>
                    Uploaded by: {item.uploadedBy}
                </Text>
                
                {/* ⭐ Rating Component */}
                <RatingComponent fileId={item.id} />
            </TouchableOpacity>

            {/* ❤️ Wishlist Button */}
            <TouchableOpacity onPress={() => toggleWishlist(item)}>
                <Ionicons 
                    name={wishlist[item.id] ? "heart" : "heart-outline"} 
                    size={26} 
                    color={wishlist[item.id] ? "red" : (isDarkMode ? '#fff' : '#666')}
                />
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={[styles.container, isDarkMode && styles.containerDark]}>
            <Header title={`${subjectName} - ${materialName}`} showBack={true} />
            <FlatList
                data={materials}
                renderItem={renderMaterialItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.list}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5' },
    containerDark: { backgroundColor: '#1a1a1a' },
    list: { padding: 15 },
    materialCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.white,
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
        elevation: 2,
        justifyContent: 'space-between',
    },
    materialCardDark: { backgroundColor: '#2c2c2e' },
    materialInfo: { flex: 1 },
    materialTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 5 },
    uploadInfo: { fontSize: 12, color: '#999' },
    textDark: { color: '#fff' },
});
