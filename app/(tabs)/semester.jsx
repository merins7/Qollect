import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import React, { useState } from 'react';
import Colors from '../../constant/Colors';
import { useTheme } from '../../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import UploadForm from '../components/UploadForm';
import SemesterGrid from '../components/SemesterGrid';

export default function Index() {
    const { isDarkMode } = useTheme();
    const [isUploadFormVisible, setIsUploadFormVisible] = useState(false);

    return (
        <View style={[styles.container, isDarkMode && styles.containerDark]}>
            <ScrollView 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Semester Grid */}
                <SemesterGrid />
            </ScrollView>

            {/* Upload Button */}
            <TouchableOpacity 
                style={styles.uploadButton}
                onPress={() => setIsUploadFormVisible(true)}
            >
                <Ionicons name="cloud-upload" size={24} color={Colors.white} />
            </TouchableOpacity>

            {/* Upload Form Modal */}
            <UploadForm 
                visible={isUploadFormVisible}
                onClose={() => setIsUploadFormVisible(false)}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    containerDark: {
        backgroundColor: '#1a1a1a',
    },
    scrollContent: {
        flexGrow: 1,
        paddingBottom: 80, // Add padding for upload button
    },
    uploadButton: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: Colors.PRIMARY,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    }
}); 