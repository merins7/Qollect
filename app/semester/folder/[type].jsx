import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { Header } from '../../components/Header';
import Colors from '../../../constant/Colors';

const getFolderTitle = (type) => {
    switch (type) {
        case 'syllabus':
            return 'Syllabus';
        case 'notes':
            return 'Notes';
        case 'pyq':
            return 'Previous Year Questions';
        default:
            return 'Materials';
    }
};

export default function FolderDetail() {
    const { type, semester } = useLocalSearchParams();
    const title = getFolderTitle(type);

    return (
        <SafeAreaView style={styles.container}>
            <Header title={`Semester ${semester} - ${title}`} />
            <View style={styles.content}>
                <Text style={styles.text}>Content for {title}</Text>
                {/* Add your folder-specific content here */}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    content: {
        flex: 1,
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        fontSize: 16,
        color: '#666',
    },
}); 