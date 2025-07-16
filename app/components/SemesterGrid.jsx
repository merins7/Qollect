import { 
    View, Text, TouchableOpacity, StyleSheet, Dimensions, ScrollView 
} from 'react-native';
import React, { useState, useEffect } from 'react';
import Colors from '../../constant/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { auth, db } from '../../config/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { useTheme } from '../../context/ThemeContext';

const { width } = Dimensions.get('window');
const GRID_SIZE = width / 2 - 30; // 2 columns with padding

export default function SemesterGrid({ onPressSemester }) {
    const router = useRouter();
    const { isDarkMode } = useTheme();
    const user = auth.currentUser;
    const [userName, setUserName] = useState('');
    const [selectedScheme, setSelectedScheme] = useState('2019'); // Default scheme

    const semesters = Array.from({ length: 8 }, (_, i) => i + 1);

    useEffect(() => {
        fetchUserName();
    }, []);

    const fetchUserName = async () => {
        if (user?.email) {
            try {
                const userDocRef = doc(db, 'users', user.email);
                const userDocSnap = await getDoc(userDocRef);
                
                if (userDocSnap.exists()) {
                    setUserName(userDocSnap.data().name);
                } else {
                    console.log('No user document found');
                    setUserName('Student');
                }
            } catch (error) {
                console.error('Error fetching user name:', error);
                setUserName('Student');
            }
        } else {
            setUserName('Student');
        }
    };

    const handlePress = (semester) => {
        if (onPressSemester) {
            onPressSemester(semester, selectedScheme);
        } else {
            router.push({
                pathname: '/semester/[id]',
                params: { id: semester, scheme: selectedScheme } // ✅ Pass the scheme here
            });
        }
    };

    return (
        <ScrollView 
            style={[styles.mainContainer, isDarkMode && styles.darkBackground]}
            showsVerticalScrollIndicator={false}
        >
            {/* Welcome Message */}
            <View style={[styles.welcomeContainer, isDarkMode && styles.welcomeContainerDark]}>
                <Text style={[styles.welcomeText, isDarkMode && styles.textDark]}>
                    Hi {userName || 'Student'}! 👋
                </Text>
                <Text style={[styles.subtitleText, isDarkMode && styles.textDark]}>
                    Welcome to your study materials hub
                </Text>
                <Text style={[styles.descriptionText, isDarkMode && styles.textDark]}>
                    Access notes, previous year papers, and study materials for all semesters
                </Text>
            </View>

            {/* Scheme Selector */}
            <View style={styles.schemeContainer}>
                <TouchableOpacity
                    style={[styles.schemeButton, selectedScheme === '2019' && styles.schemeButtonActive]}
                    onPress={() => setSelectedScheme('2019')}
                >
                    <Text style={[styles.schemeText, selectedScheme === '2019' && styles.schemeTextActive]}>Scheme 2019</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.schemeButton, selectedScheme === '2023' && styles.schemeButtonActive]}
                    onPress={() => setSelectedScheme('2023')}
                >
                    <Text style={[styles.schemeText, selectedScheme === '2023' && styles.schemeTextActive]}>Scheme 2023</Text>
                </TouchableOpacity>
            </View>

            {/* Semester Grid */}
            <View style={styles.container}>
                {semesters.map((sem) => (
                    <TouchableOpacity
                        key={sem}
                        style={[styles.semesterBox, isDarkMode && styles.semesterBoxDark]}
                        onPress={() => handlePress(sem)}
                    >
                        <Ionicons name="folder" size={40} color={Colors.PRIMARY} />
                        <Text style={[styles.semesterText, isDarkMode && styles.textDark]}>Semester {sem}</Text>
                        <Text style={[styles.subText, isDarkMode && styles.textDark]}>View Materials</Text>
                    </TouchableOpacity>
                ))}
            </View>
            
            {/* Bottom Padding */}
            <View style={styles.bottomPadding} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
    },
    darkBackground: {
        backgroundColor: '#1a1a1a',
    },
    welcomeContainer: {
        padding: 20,
        backgroundColor: Colors.PRIMARY + '10',
        marginBottom: 10,
        marginHorizontal: 15,
        borderRadius: 15,
        marginTop: 15,
    },
    welcomeContainerDark: {
        backgroundColor: '#333',
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
    textDark: {
        color: '#fff',
    },
    schemeContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginVertical: 10,
    },
    schemeButton: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 10,
        backgroundColor: '#e0e0e0',
        marginHorizontal: 10,
    },
    schemeButtonActive: {
        backgroundColor: Colors.PRIMARY,
    },
    schemeText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#666',
    },
    schemeTextActive: {
        color: 'white',
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
    semesterBoxDark: {
        backgroundColor: '#2c2c2e',
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
