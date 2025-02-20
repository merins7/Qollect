import { View, Text, TouchableOpacity, StyleSheet, Alert, Linking } from 'react-native';
import React from 'react';
import Colors from '../../constant/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

export default function MaterialCard({ material, onPress }) {
    const { isDarkMode } = useTheme();

    const handleMaterialPress = async (material) => {
        try {
            // Open the file URL
            if (material.fileUrl) {
                await Linking.openURL(material.fileUrl);
            }
        } catch (error) {
            console.error('Error opening material:', error);
            Alert.alert('Error', 'Failed to open material');
        }
    };

    return (
        <TouchableOpacity 
            style={[
                styles.card,
                isDarkMode && styles.cardDark
            ]} 
            onPress={() => handleMaterialPress(material)}
        >
            <View style={styles.contentContainer}>
                <View style={[styles.iconContainer, { backgroundColor: material.color }]}>
                    <Ionicons name={material.icon} size={24} color="#fff" />
                </View>
                <View style={styles.textContainer}>
                    <Text style={[
                        styles.title,
                        isDarkMode && styles.titleDark
                    ]}>{material.title}</Text>
                    <Text style={[
                        styles.subtitle,
                        isDarkMode && styles.subtitleDark
                    ]}>View {material.title}</Text>
                </View>
            </View>
            <Ionicons 
                name="chevron-forward" 
                size={24} 
                color={isDarkMode ? '#fff' : '#666'} 
            />
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: Colors.white,
        borderRadius: 12,
        padding: 15,
        marginBottom: 15,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.22,
        shadowRadius: 2.22,
    },
    cardDark: {
        backgroundColor: '#2c2c2e',
    },
    contentContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    textContainer: {
        flex: 1,
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    titleDark: {
        color: '#fff',
    },
    subtitle: {
        fontSize: 14,
        color: '#666',
        marginTop: 4,
    },
    subtitleDark: {
        color: '#999',
    },
}); 