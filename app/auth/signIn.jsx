import { View, Text, Image, TextInput, StyleSheet, Pressable, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import Colors from './../../constant/Colors';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../config/firebaseConfig';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '../../config/firebaseConfig';

export default function SignIn() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isAdmin, setIsAdmin] = useState(false);

    const handleSignIn = async () => {
        if (!email || !password) {
            alert('Please fill in all fields');
            return;
        }

        try {
            // Check if trying to sign in as admin
            if (isAdmin) {
                if (email !== 'zuck@gmail.com') {
                    alert('Invalid admin credentials');
                    return;
                }
            } else {
                // If trying to sign in as user, check if it's not the admin email
                if (email === 'zuck@gmail.com') {
                    alert('Please use admin login for admin account');
                    return;
                }
            }

            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            
            // After successful sign in, verify user type
            const userDoc = await getDoc(doc(db, 'users', email));
            const userData = userDoc.data();

            if (isAdmin && !userData?.isAdmin) {
                await auth.signOut();
                alert('This account does not have admin privileges');
                return;
            }

            if (!isAdmin && userData?.isAdmin) {
                await auth.signOut();
                alert('Please use admin login for admin account');
                return;
            }

            router.replace('/(tabs)');
        } catch (error) {
            alert(error.message);
        }
    };

    return (
        <View style={styles.container}>
            <Image source={require('./../../assets/images/1.png')} style={styles.logo} />

            <Text style={styles.title}>Welcome Back</Text>

            {/* User/Admin Toggle Button */}
            <TouchableOpacity 
                style={styles.toggleContainer}
                onPress={() => setIsAdmin(!isAdmin)}
            >
                <View style={[
                    styles.toggleOption,
                    !isAdmin && styles.toggleActive
                ]}>
                    <Text style={[
                        styles.toggleText,
                        !isAdmin && styles.toggleTextActive
                    ]}>User</Text>
                </View>
                <View style={[
                    styles.toggleOption,
                    isAdmin && styles.toggleActive
                ]}>
                    <Text style={[
                        styles.toggleText,
                        isAdmin && styles.toggleTextActive
                    ]}>Admin</Text>
                </View>
            </TouchableOpacity>

            <TextInput 
                placeholder='Email' 
                style={styles.textInput} 
                onChangeText={setEmail}
                value={email}
                keyboardType="email-address"
                autoCapitalize="none"
            />
            <TextInput 
                placeholder='Password' 
                style={styles.textInput} 
                secureTextEntry={true}
                onChangeText={setPassword}
                value={password}
            />

            <TouchableOpacity 
                style={styles.button}
                onPress={handleSignIn}
            >
                <Text style={styles.buttonText}>Sign In as {isAdmin ? 'Admin' : 'User'}</Text>
            </TouchableOpacity>

            {!isAdmin && (
                <>
                    <Pressable 
                        onPress={() => router.push('/auth/forgot-password')}
                        style={styles.forgotPasswordButton}
                    >
                        <Text style={styles.forgotPassword}>Forgot Password?</Text>
                    </Pressable>

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Don't have an account?</Text>
                        <Pressable onPress={() => router.replace('/auth/signUp')}>
                            <Text style={styles.signUpText}> Sign Up Here</Text>
                        </Pressable>
                    </View>
                </>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    toggleContainer: {
        flexDirection: 'row',
        backgroundColor: '#f0f0f0',
        borderRadius: 25,
        marginBottom: 20,
        padding: 4,
        width: '60%',
    },
    toggleOption: {
        flex: 1,
        padding: 10,
        borderRadius: 21,
        alignItems: 'center',
    },
    toggleActive: {
        backgroundColor: Colors.PRIMARY,
    },
    toggleText: {
        fontSize: 16,
        color: '#666',
        fontWeight: '600',
    },
    toggleTextActive: {
        color: '#333',
        fontWeight: 'bold',
    },
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1,
        padding: 25,
        backgroundColor: Colors.white
    },
    logo: {
        width: 162,
        height: 195,
        marginTop:20
        
    },
    title: {
        fontSize: 30,
        fontFamily: 'outfit-bold',
        marginBottom: 20,
        fontWeight:'bold'
    
    },
    textInput: {
        borderWidth: 1,
        width: '100%',
        padding: 8,
        fontSize: 18,
        marginTop: 10,
        borderRadius: 8
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
        textAlign: 'center'
    },
    forgotPassword: {
        color: Colors.blue,
        fontFamily: 'outfit-bold',
        marginTop: 10,
        fontWeight:'bold'
    
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
    signUpText: {
        color: Colors.blue,
        fontFamily: 'outfit-bold',
        fontWeight:'bold'
    },
    forgotPasswordButton: {
        marginTop: 10,
        padding: 10,
    },
});
