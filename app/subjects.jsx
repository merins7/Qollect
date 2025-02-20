import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import { Header } from './components/Header';
import Colors from '../constant/Colors';
import { Ionicons } from '@expo/vector-icons';

export default function SubjectsScreen() {
    const { semester } = useLocalSearchParams();
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSubjects();
    }, [semester]);

    const fetchSubjects = async () => {
        try {
            const q = query(
                collection(db, 'subjects'),
                where('semester', '==', parseInt(semester))
            );
            const querySnapshot = await getDocs(q);
            const subjectsList = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setSubjects(subjectsList);
        } catch (error) {
            console.error('Error fetching subjects:', error);
        } finally {
            setLoading(false);
        }
    };

    const renderSubject = ({ item }) => (
        <TouchableOpacity style={styles.subjectCard}>
            <View style={styles.subjectIcon}>
                <Ionicons name="book" size={24} color={Colors.PRIMARY} />
            </View>
            <View style={styles.subjectInfo}>
                <Text style={styles.subjectName}>{item.name}</Text>
                <Text style={styles.subjectCode}>{item.code}</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#666" />
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <Header title={`Semester ${semester}`} showBack={true} />
            {loading ? (
                <ActivityIndicator size="large" color={Colors.PRIMARY} />
            ) : (
                <FlatList
                    data={subjects}
                    renderItem={renderSubject}
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
    subjectCard: {
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
    subjectIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.PRIMARY + '20',
        justifyContent: 'center',
        alignItems: 'center',
    },
    subjectInfo: {
        flex: 1,
        marginLeft: 15,
    },
    subjectName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    subjectCode: {
        fontSize: 14,
        color: '#666',
        marginTop: 2,
    },
}); 