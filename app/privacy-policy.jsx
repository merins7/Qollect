import { View, Text, StyleSheet, ScrollView } from 'react-native';
import React from 'react';
import Header from './components/Header';
import Colors from '../constant/Colors';
import { useTheme } from '../context/ThemeContext';

export default function PrivacyPolicyScreen() {
    const { isDarkMode } = useTheme();

    return (
        <View style={[
            styles.container,
            isDarkMode && { backgroundColor: '#1a1a1a' }
        ]}>
            <Header title="Privacy Policy" showBack={true} />
            <ScrollView style={styles.content}>
                <Text style={[
                    styles.title,
                    isDarkMode && { color: '#fff' }
                ]}>Privacy Policy for Qollect</Text>
                
                <Text style={[
                    styles.section,
                    isDarkMode && { color: '#fff' }
                ]}>
                    Last updated: {new Date().toLocaleDateString()}
                </Text>

                <Text style={[
                    styles.paragraph,
                    isDarkMode && { color: '#ddd' }
                ]}>
                    Qollect is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our application.
                </Text>

                <Text style={[
                    styles.heading,
                    isDarkMode && { color: '#fff' }
                ]}>Information We Collect</Text>
                <Text style={[
                    styles.paragraph,
                    isDarkMode && { color: '#ddd' }
                ]}>
                    • User profile information{'\n'}
                    • Educational materials and documents{'\n'}
                    • Usage data and preferences{'\n'}
                    • Device information
                </Text>

                <Text style={[
                    styles.heading,
                    isDarkMode && { color: '#fff' }
                ]}>How We Use Your Information</Text>
                <Text style={[
                    styles.paragraph,
                    isDarkMode && { color: '#ddd' }
                ]}>
                    • To provide and maintain our service{'\n'}
                    • To improve user experience{'\n'}
                    • To manage user accounts{'\n'}
                    • To store and share educational materials
                </Text>
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
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#333',
    },
    heading: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 20,
        marginBottom: 10,
        color: '#333',
    },
    section: {
        fontSize: 14,
        color: '#666',
        marginBottom: 20,
    },
    paragraph: {
        fontSize: 16,
        lineHeight: 24,
        color: '#444',
        marginBottom: 15,
    },
}); 