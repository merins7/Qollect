import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../constant/Colors';

const folders = [
    { id: 'syllabus', title: 'Syllabus', icon: 'document-text' },
    { id: 'notes', title: 'Notes', icon: 'book' },
    { id: 'pyq', title: 'Previous Year Questions', icon: 'help-circle' },
];

export default function SubjectFolders({ onPressFolder }) {
    return (
        <View style={styles.container}>
            {folders.map((folder) => (
                <TouchableOpacity
                    key={folder.id}
                    style={styles.folderCard}
                    onPress={() => onPressFolder(folder.id)}
                >
                    <View style={styles.iconContainer}>
                        <Ionicons name={folder.icon} size={32} color={Colors.PRIMARY} />
                    </View>
                    <View style={styles.textContainer}>
                        <Text style={styles.folderTitle}>{folder.title}</Text>
                        <Text style={styles.folderSubtitle}>View Materials</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={24} color="#666" />
                </TouchableOpacity>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 15,
    },
    folderCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.white,
        borderRadius: 12,
        padding: 15,
        marginBottom: 15,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.22,
        shadowRadius: 2.22,
    },
    iconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    textContainer: {
        flex: 1,
    },
    folderTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    folderSubtitle: {
        fontSize: 12,
        color: '#666',
        marginTop: 2,
    },
}); 