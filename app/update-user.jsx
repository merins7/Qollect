import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import Colors from '../constant/Colors';
import { Header } from './components/Header';

export default function UpdateUser() {
    const { email } = useLocalSearchParams();
    const router = useRouter();
    const [userData, setUserData] = useState(null);
    const [name, setName] = useState('');
    const [branch, setBranch] = useState('');
    const [year, setYear] = useState('');
    const [semester, setSemester] = useState('');
    const [studentid, setStudentId] = useState('');

    useEffect(() => {
        fetchUserData();
    }, []);

    const fetchUserData = async () => {
        try {
            const userDoc = await getDoc(doc(db, 'users', email));
            if (userDoc.exists()) {
                const data = userDoc.data();
                setUserData(data);
                setName(data.name || '');
                setBranch(data.branch || '');
                setYear(data.year || '');
                setSemester(data.semester || '');
                setStudentId(data.studentid || '');
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
            Alert.alert('Error', 'Failed to fetch user data');
        }
    };

    const handleUpdate = async () => {
        try {
            await updateDoc(doc(db, 'users', email), {
                name,
                branch,
                year,
                semester,
                studentid
            });
            Alert.alert('Success', 'User updated successfully');
            router.back();
        } catch (error) {
            console.error('Error updating user:', error);
            Alert.alert('Error', 'Failed to update user');
        }
    };

    return (
        <View style={styles.container}>
            <Header title="Update User" showBack={true} />
            <ScrollView style={styles.content}>
                <TextInput
                    style={styles.input}
                    placeholder="Full Name"
                    value={name}
                    onChangeText={setName}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Branch"
                    value={branch}
                    onChangeText={setBranch}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Year"
                    value={year}
                    onChangeText={setYear}
                    keyboardType="numeric"
                />
                <TextInput
                    style={styles.input}
                    placeholder="Semester"
                    value={semester}
                    onChangeText={setSemester}
                    keyboardType="numeric"
                />
                <TextInput
                    style={styles.input}
                    placeholder="Student ID"
                    value={studentid}
                    onChangeText={setStudentId}
                />
                <TouchableOpacity
                    style={styles.updateButton}
                    onPress={handleUpdate}
                >
                    <Text style={styles.updateButtonText}>Update User</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    content: {
        padding: 20,
    },
    input: {
        backgroundColor: Colors.white,
        padding: 15,
        borderRadius: 10,
        marginBottom: 15,
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    updateButton: {
        backgroundColor: Colors.PRIMARY,
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 10,
    },
    updateButtonText: {
        color: Colors.white,
        fontSize: 16,
        fontWeight: 'bold',
    },
}); 