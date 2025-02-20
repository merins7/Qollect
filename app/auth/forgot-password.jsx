import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from 'react-native';
import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import Colors from '../../constant/Colors';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../config/firebaseConfig';

export default function ForgotPassword() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleResetPassword = async () => {
        if (!email) {
            alert('Please enter your email address');
            return;
        }

        setIsLoading(true);
        try {
            await sendPasswordResetEmail(auth, email);
            alert('Password reset email sent! Please check your inbox.');
            router.back(); // Go back to sign in page
        } catch (error) {
            let errorMessage = 'An error occurred. Please try again.';
            switch (error.code) {
                case 'auth/user-not-found':
                    errorMessage = 'No user found with this email address.';
                    break;
                case 'auth/invalid-email':
                    errorMessage = 'Please enter a valid email address.';
                    break;
                default:
                    console.error('Reset password error:', error);
            }
            alert(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Image 
                source={require('./../../assets/images/1.png')} 
                style={styles.logo} 
            />

            <Text style={styles.title}>Reset Password</Text>
            <Text style={styles.subtitle}>
                Enter your email address and we'll send you instructions to reset your password.
            </Text>

            <TextInput
                placeholder="Email"
                style={styles.textInput}
                onChangeText={setEmail}
                value={email}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!isLoading}
            />

            <TouchableOpacity
                style={[styles.button, isLoading && styles.buttonDisabled]}
                onPress={handleResetPassword}
                disabled={isLoading}
            >
                <Text style={styles.buttonText}>
                    {isLoading ? 'Sending...' : 'Reset Password'}
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.backButton}
                onPress={() => router.back()}
                disabled={isLoading}
            >
                <Text style={styles.backButtonText}>Back to Sign In</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 25,
        backgroundColor: Colors.white,
        alignItems: 'center',
    },
    logo: {
        width: 162,
        height: 195,
        marginTop: 20,
    },
    title: {
        fontSize: 30,
        fontFamily: 'outfit-bold',
        marginBottom: 10,
        fontWeight: 'bold',
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 30,
    },
    textInput: {
        borderWidth: 1,
        width: '100%',
        padding: 15,
        fontSize: 18,
        marginTop: 10,
        borderRadius: 8,
        borderColor: '#ddd',
    },
    button: {
        backgroundColor: Colors.PRIMARY,
        padding: 15,
        borderRadius: 10,
        width: '100%',
        marginTop: 20,
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    buttonText: {
        color: '#333',
        fontSize: 18,
        textAlign: 'center',
        fontWeight: 'bold',
    },
    backButton: {
        marginTop: 20,
        padding: 10,
    },
    backButtonText: {
        color: Colors.blue,
        fontSize: 16,
        fontWeight: 'bold',
    },
}); 