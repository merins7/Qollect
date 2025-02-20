import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import React, { useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Header from '../../components/Header';
import Colors from '../../../constant/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../context/ThemeContext';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../../config/firebaseConfig';
import UploadForm from '../../components/UploadForm';

const MATERIAL_TYPES = [
    {
        id: 'notes',
        title: 'Notes',
        icon: 'book-outline',
        color: '#4CAF50'
    },
    {
        id: 'pyq',
        title: 'Previous Year Questions',
        icon: 'document-text-outline',
        color: '#2196F3'
    },
    {
        id: 'syllabus',
        title: 'Syllabus',
        icon: 'list-outline',
        color: '#FF9800'
    }
];

export default function SubjectDetail() {
    const { id, semester, subjectName } = useLocalSearchParams();
    const router = useRouter();
    const { isDarkMode } = useTheme();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleMaterialPress = async (materialType) => {
        try {
            setLoading(true);
            // Check if materials exist
            const materialsRef = collection(db, `subjects/${id}/materials`);
            const q = query(materialsRef, where('type', '==', materialType.id));
            const snapshot = await getDocs(q);
            
            router.push({
                pathname: '/semester/subject/material/[type]',
                params: {
                    type: materialType.id,
                    semester,
                    subjectId: id,
                    subjectName,
                    materialName: materialType.title,
                    hasContent: !snapshot.empty
                }
            });
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={[
            styles.container,
            isDarkMode && styles.containerDark
        ]}>
            <Header title={subjectName} showBack={true} />
            <View style={styles.content}>
                {MATERIAL_TYPES.map((material) => (
                    <TouchableOpacity
                        key={material.id}
                        style={[
                            styles.materialCard,
                            isDarkMode && styles.materialCardDark
                        ]}
                        onPress={() => handleMaterialPress(material)}
                    >
                        <View style={[styles.iconContainer, { backgroundColor: material.color }]}>
                            <Ionicons name={material.icon} size={32} color="#fff" />
                        </View>
                        <View style={styles.textContainer}>
                            <Text style={[
                                styles.materialTitle,
                                isDarkMode && styles.materialTitleDark
                            ]}>{material.title}</Text>
                            <Text style={[
                                styles.materialSubtitle,
                                isDarkMode && styles.materialSubtitleDark
                            ]}>View {material.title}</Text>
                        </View>
                        <Ionicons 
                            name="chevron-forward" 
                            size={24} 
                            color={isDarkMode ? '#fff' : '#666'} 
                        />
                    </TouchableOpacity>
                ))}
            </View>
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
        padding: 15,
    },
    materialCard: {
        backgroundColor: Colors.white,
        borderRadius: 12,
        padding: 15,
        marginBottom: 15,
        flexDirection: 'row',
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.22,
        shadowRadius: 2.22,
    },
    materialCardDark: {
        backgroundColor: '#2c2c2e',
    },
    iconContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    textContainer: {
        flex: 1,
    },
    materialTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    materialTitleDark: {
        color: '#fff',
    },
    materialSubtitle: {
        fontSize: 14,
        color: '#666',
        marginTop: 4,
    },
    materialSubtitleDark: {
        color: '#999',
    },
}); 