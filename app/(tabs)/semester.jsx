import { View, StyleSheet } from 'react-native';
import React from 'react';
import Header from '../components/Header';
import SemesterGrid from '../components/SemesterGrid';
import { useTheme } from '../../context/ThemeContext';

export default function SemesterScreen() {
    const { isDarkMode } = useTheme();

    return (
        <View style={[
            styles.container,
            isDarkMode && { backgroundColor: '#1a1a1a' }
        ]}>
            <Header title="Qollect" />
            <SemesterGrid />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
}); 