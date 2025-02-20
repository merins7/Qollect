import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import React from 'react';
import Colors from '../../constant/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';

export default function Header({ title, email, showBack = false }) {
    const router = useRouter();
    const { isDarkMode } = useTheme();

    return (
        <View style={[
            styles.headerContainer,
            isDarkMode && { backgroundColor: '#333' }
        ]}>
            <View style={styles.header}>
                {showBack && (
                    <TouchableOpacity 
                        onPress={() => router.back()}
                        style={styles.backButton}
                    >
                        <Ionicons name="arrow-back" size={24} color={isDarkMode ? '#fff' : '#333'} />
                    </TouchableOpacity>
                )}
                <View style={styles.titleContainer}>
                    <Text style={[
                        styles.title,
                        isDarkMode && { color: '#fff' }
                    ]}>{title}</Text>
                    {email && <Text style={styles.subtitle}>{email}</Text>}
                </View>
                <TouchableOpacity 
                    style={styles.profileButton}
                    onPress={() => router.push('/profile')}
                >
                    <Ionicons name="person-circle" size={30} color={isDarkMode ? '#fff' : '#333'} />
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    headerContainer: {
        backgroundColor: Colors.PRIMARY,
        paddingTop: 40, // for status bar
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
    },
    backButton: {
        padding: 5,
    },
    titleContainer: {
        flex: 1,
        marginLeft: 10,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
    subtitle: {
        fontSize: 14,
        color: '#666',
        marginTop: 2,
    },
    profileButton: {
        padding: 5,
    },
}); 