import { View, Text, TouchableOpacity, StyleSheet, Dimensions, ScrollView } from 'react-native';
import React, { useState, useEffect } from 'react';
import Colors from '../../constant/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { auth, db } from '../../config/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

const { width } = Dimensions.get('window');
const GRID_SIZE = width / 2 - 30; // 2 columns with padding

export default function SemesterGrid({ onPressSemester }) {
    const router = useRouter();
    const user = auth.currentUser;
    const [userName, setUserName] = useState('');
    const semesters = Array.from({ length: 8 }, (_, i) => i + 1);

    useEffect(() => {
        fetchUserName();
    }, []);

    const fetchUserName = async () => {
        if (user?.email) {
            try {
                const userDoc = await getDoc(doc(db, 'users', user.email));
                if (userDoc.exists()) {
                    setUserName(userDoc.data().name);
                }
            } catch (error) {
                console.error('Error fetching user name:', error);
                // Handle error gracefully
                setUserName('Student');
            }
        }
    };

    const handlePress = (semester) => {
        if (onPressSemester) {
            onPressSemester(semester);
        } else {
            router.push({
                pathname: '/semester/[id]',
                params: { id: semester }
            });
        }
    };

    return (
        <ScrollView 
            style={styles.mainContainer}
            showsVerticalScrollIndicator={false}
        >
            <View style={styles.welcomeContainer}>
                <Text style={styles.welcomeText}>
                    Hi {userName || 'Student'}! 👋
                </Text>
                <Text style={styles.subtitleText}>
                    Welcome to your study materials hub
                </Text>
                <Text style={styles.descriptionText}>
                    Access notes, previous year papers, and study materials for all semesters
                </Text>
            </View>

            <View style={styles.container}>
                {semesters.map((sem) => (
                    <TouchableOpacity
                        key={sem}
                        style={styles.semesterBox}
                        onPress={() => handlePress(sem)}
                    >
                        <Ionicons name="folder" size={40} color={Colors.PRIMARY} />
                        <Text style={styles.semesterText}>Semester {sem}</Text>
                        <Text style={styles.subText}>View Materials</Text>
                    </TouchableOpacity>
                ))}
            </View>
            
            {/* Add bottom padding for better scrolling */}
            <View style={styles.bottomPadding} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
    },
    welcomeContainer: {
        padding: 20,
        backgroundColor: Colors.PRIMARY + '10',
        marginBottom: 10,
        marginHorizontal: 15,
        borderRadius: 15,
        marginTop: 15,
    },
    welcomeText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.PRIMARY,
        marginBottom: 5,
    },
    subtitleText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 5,
    },
    descriptionText: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
    },
    container: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        padding: 15,
    },
    semesterBox: {
        width: GRID_SIZE,
        height: GRID_SIZE,
        backgroundColor: Colors.white,
        borderRadius: 15,
        marginBottom: 20,
        padding: 15,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    semesterText: {
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 10,
        color: '#333',
    },
    subText: {
        fontSize: 12,
        color: '#666',
        marginTop: 5,
    },
    bottomPadding: {
        height: 20, // Add some bottom padding for better scrolling
    }
}); 