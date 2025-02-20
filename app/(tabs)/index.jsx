import { View, StyleSheet, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import Header from '../components/Header';
import SemesterGrid from '../components/SemesterGrid';
import { useTheme } from '../../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../constant/Colors';
import UploadForm from '../components/UploadForm';

export default function HomeScreen() {
    const { isDarkMode } = useTheme();
    const [isUploadFormVisible, setIsUploadFormVisible] = useState(false);

    return (
        <View style={[
            styles.container,
            isDarkMode && { backgroundColor: '#1a1a1a' }
        ]}>
            <Header title="Qollect" />
            <SemesterGrid />
            
            {/* Upload Button */}
            <TouchableOpacity 
                style={styles.uploadButton}
                onPress={() => setIsUploadFormVisible(true)}
            >
                <Ionicons name="cloud-upload" size={24} color={Colors.white} />
            </TouchableOpacity>

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
    },
}); 