import { View, Text, StyleSheet } from 'react-native';
import React from 'react';
import Colors from '../../constant/Colors';
import { useTheme } from '../../context/ThemeContext';

export default function ProgressTracker({ progress }) {
    const { isDarkMode } = useTheme();

    return (
        <View style={[
            styles.container,
            isDarkMode && styles.containerDark
        ]}>
            <Text style={[
                styles.title,
                isDarkMode && styles.titleDark
            ]}>Your Progress</Text>
            
            <View style={styles.progressBar}>
                <View 
                    style={[
                        styles.progress,
                        { width: `${progress}%` }
                    ]} 
                />
            </View>
            
            <Text style={[
                styles.percentage,
                isDarkMode && styles.percentageDark
            ]}>{progress}% Complete</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 15,
        backgroundColor: Colors.white,
        borderRadius: 15,
        margin: 15,
    },
    containerDark: {
        backgroundColor: '#2c2c2e',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
    },
    titleDark: {
        color: '#fff',
    },
    progressBar: {
        height: 10,
        backgroundColor: '#f0f0f0',
        borderRadius: 5,
        overflow: 'hidden',
    },
    progress: {
        height: '100%',
        backgroundColor: Colors.PRIMARY,
    },
    percentage: {
        fontSize: 14,
        color: '#666',
        marginTop: 5,
        textAlign: 'center',
    },
    percentageDark: {
        color: '#999',
    },
}); 