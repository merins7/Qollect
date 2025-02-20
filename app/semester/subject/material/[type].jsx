import { View, Text, StyleSheet, SafeAreaView, FlatList } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useLocalSearchParams } from 'expo-router';
import Header from '../../../components/Header';
import Colors from '../../../../constant/Colors';
import { useTheme } from '../../../../context/ThemeContext';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../../../config/firebaseConfig';
import MaterialCard from '../../../components/MaterialCard';
import { useRouter } from 'expo-router';
import { Alert } from 'react-native';

export default function MaterialDetail() {
    const { type, semester, subjectName, materialName, subjectId } = useLocalSearchParams();
    const { isDarkMode } = useTheme();
    const [materials, setMaterials] = useState([]);
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMaterials();
    }, []);

    const fetchMaterials = async () => {
        try {
            setLoading(true);
            const materialsRef = collection(db, 'materials');
            const q = query(
                materialsRef, 
                where('subjectId', '==', subjectId),
                where('type', '==', type)
            );
            
            const snapshot = await getDocs(q);
            const fetchedMaterials = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            console.log('Fetched materials:', fetchedMaterials);
            setMaterials(fetchedMaterials);
        } catch (error) {
            console.error('Error fetching materials:', error);
            Alert.alert('Error', 'Failed to fetch materials');
        } finally {
            setLoading(false);
        }
    };

    const handleMaterialPress = (material) => {
        router.push({
            pathname: '/semester/subject/material/[type]',
            params: {
                type: material.type,
                semester,
                subjectId: subjectId,
                subjectName,
                materialName: material.title,
                hasContent: true
            }
        });
    };

    return (
        <SafeAreaView style={[
            styles.container,
            isDarkMode && styles.containerDark
        ]}>
            <Header title={`${subjectName} - ${materialName}`} showBack={true} />
            {loading ? (
                <View style={styles.content}>
                    <Text style={[
                        styles.message,
                        isDarkMode && styles.messageDark
                    ]}>Loading materials...</Text>
                </View>
            ) : materials.length > 0 ? (
                <FlatList
                    data={materials}
                    renderItem={({ item }) => (
                        <MaterialCard material={item} onPress={() => handleMaterialPress(item)} />
                    )}
                    keyExtractor={item => item.id}
                />
            ) : (
                <View style={styles.content}>
                    <Text style={[
                        styles.message,
                        isDarkMode && styles.messageDark
                    ]}>No {materialName} available yet.</Text>
                </View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    containerDark: {
        backgroundColor: '#1a1a1a',
    },
    content: {
        flex: 1,
        padding: 15,
        justifyContent: 'center',
        alignItems: 'center',
    },
    message: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    },
    messageDark: {
        color: '#999',
    }
}); 