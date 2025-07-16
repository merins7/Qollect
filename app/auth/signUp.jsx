import { View, Text, Image, TextInput, StyleSheet, Pressable, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import Colors from './../../constant/Colors';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../../config/firebaseConfig';
import { Picker } from '@react-native-picker/picker';

const BRANCHES = [
    { label: 'Select Branch', value: '' },
    { label: 'Information Technology', value: 'IT' },
    { label: 'Computer Science', value: 'CS' },
    { label: 'Safety and Fire', value: 'SF' },
    { label: 'Electronics and Communication', value: 'EC' },
    { label: 'Electrical and Electronics', value: 'EE' },
    { label: 'Civil', value: 'CE' },
    { label: 'Mechanical', value: 'ME' }
];

export default function SignUp() {
    const router = useRouter();
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [branch, setBranch] = useState('');
    const [semester, setSemester] = useState('');
    const [year, setYear] = useState('');
    const [studentid, setStudentID] = useState('');

    const CreateNewAccount = () => {
        if (!email || !password || !fullName || !branch || !semester || !year || !studentid) {
            alert('Please fill in all fields');
            return;
        }

        createUserWithEmailAndPassword(auth, email, password)
            .then(async (userCredential) => {
                const user = userCredential.user;
                try {
                    await SaveUser(user);
                    await auth.signOut();
                    alert('Account created successfully! Please sign in.');
                    router.replace('/auth/signIn');
                } catch (error) {
                    console.error("Error in signup process:", error);
                    alert("Error during signup. Please try again.");
                }
            })
            .catch((error) => {
                alert(error.message);
                console.error('Signup error:', error);
            });
    }

    const SaveUser = async (user) => {
        try {
            const userRef = doc(db, 'users', user.email);
            await setDoc(userRef, {
                name: fullName,
                email: email,
                member: false,
                uid: user.uid,
                branch: branch,
                semester: semester,
                year: year,
                studentid: studentid,
                createdAt: serverTimestamp(),
                isAdmin: false // explicitly set non-admin status
            }, { merge: true }); // use merge to avoid overwriting existing data
            console.log("User data saved successfully!");
        } catch (error) {
            console.error("Error saving user data:", error);
            throw error; // propagate error to handle it in the calling function
        }
    }

    return (
        <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
        >
            <ScrollView 
                contentContainerStyle={styles.scrollContainer}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.container}>
                    <Image source={require('./../../assets/images/1.png')}
                        style={styles.logo}
                    />
                    <Text style={styles.title}>Create New Account</Text>

                    <TextInput 
                        placeholder='Full Name' 
                        onChangeText={(value) => setFullName(value)} 
                        style={styles.textInput}
                        autoCapitalize="words"
                    />
                    <TextInput 
                        placeholder='Email' 
                        onChangeText={(value) => setEmail(value)} 
                        style={styles.textInput}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                    <TextInput 
                        placeholder='Password' 
                        onChangeText={(value) => setPassword(value)} 
                        style={styles.textInput} 
                        secureTextEntry={true}
                    />

                    <View style={styles.pickerContainer}>
                        <Picker
                            selectedValue={branch}
                            onValueChange={(itemValue) => setBranch(itemValue)}
                            style={styles.picker}
                            mode="dropdown"
                        >
                            {BRANCHES.map((item) => (
                                <Picker.Item 
                                    key={item.value} 
                                    label={item.label} 
                                    value={item.value}
                                    enabled={!!item.value}
                                    style={styles.pickerItem}
                                />
                            ))}
                        </Picker>
                    </View>

                    <TextInput 
                        placeholder='Semester' 
                        onChangeText={(value) => setSemester(value)} 
                        style={styles.textInput}
                        keyboardType="numeric"
                        maxLength={1}
                    />
                    <TextInput 
                        placeholder='Year' 
                        onChangeText={(value) => setYear(value)} 
                        style={styles.textInput}
                        keyboardType="numeric"
                        maxLength={4}
                    />
                    <TextInput 
                        placeholder='Student ID' 
                        onChangeText={(value) => setStudentID(value)} 
                        style={styles.textInput}
                    />

                    <TouchableOpacity
                        onPress={CreateNewAccount}
                        style={styles.button}
                    >
                        <Text style={styles.buttonText}>Create Account</Text>
                    </TouchableOpacity>

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Already have an account?</Text>
                        <Pressable onPress={() => router.replace('/auth/signIn')}>
                            <Text style={styles.signInText}>Sign In Here</Text>
                        </Pressable>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    scrollContainer: {
        flexGrow: 1,
    },
    container: {
        flex: 1,
        padding: 25,
        backgroundColor: Colors.white,
        alignItems: 'center',
    },
    logo: {
        width: 162,
        height: 195,
    },
    title: {
        fontSize: 30,
        fontFamily: 'outfit-bold',
        marginBottom: 20,
        fontWeight: 'bold'
    },
    textInput: {
        borderWidth: 1,
        width: '100%',
        padding: 8,
        fontSize: 18,
        marginTop: 10,
        borderRadius: 8,
        borderColor: '#ddd'
    },
    pickerContainer: {
        width: '100%',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        marginTop: 10,
        overflow: 'hidden',
        backgroundColor: '#fff'
    },
    picker: {
        width: '100%',
        height: 50,
    },
    pickerItem: {
        fontSize: 18,
    },
    button: {
        padding: 15,
        backgroundColor: Colors.PRIMARY,
        width: '100%',
        marginTop: 15,
        borderRadius: 10
    },
    buttonText: {
        fontFamily: 'outfit',
        fontSize: 20,
        textAlign: 'center',
        fontWeight: 'bold'
    },
    footer: {
        display: 'flex',
        flexDirection: 'row',
        gap: 5,
        marginTop: 10
    },
    footerText: {
        fontFamily: 'outfit',
        fontSize: 15,
        fontWeight: 'bold'
    },
    signInText: {
        color: Colors.blue,
        fontFamily: 'outfit-bold',
        fontWeight: 'bold'
    }
});
