import { View, Text, StyleSheet, ScrollView } from 'react-native';
import React from 'react';
import Header from './components/Header';
import Colors from '../constant/Colors';
import { useTheme } from '../context/ThemeContext';

export default function TermsOfServiceScreen() {
    const { isDarkMode } = useTheme();

    return (
        <View style={[
            styles.container,
            isDarkMode && { backgroundColor: '#1a1a1a' }
        ]}>
            <Header title="Terms of Service" showBack={true} />
            <ScrollView style={styles.content}>
                <Text style={[
                    styles.title,
                    isDarkMode && { color: '#fff' }
                ]}>Terms of Service</Text>

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
                    Welcome to Qollect. By using our application, you agree to these terms.
                </Text>

                <Text style={[
                    styles.heading,
                    isDarkMode && { color: '#fff' }
                ]}>1. User Accounts</Text>
                <Text style={[
                    styles.paragraph,
                    isDarkMode && { color: '#ddd' }
                ]}>
                    • Users must maintain accurate account information{'\n'}
                    • Users are responsible for account security{'\n'}
                    • Educational content must be appropriate and legal
                </Text>

                <Text style={[
                    styles.heading,
                    isDarkMode && { color: '#fff' }
                ]}>2. Content Guidelines</Text>
                <Text style={[
                    styles.paragraph,
                    isDarkMode && { color: '#ddd' }
                ]}>
                    • Share only educational materials you have rights to{'\n'}
                    • Respect intellectual property rights{'\n'}
                    • No inappropriate or harmful content
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