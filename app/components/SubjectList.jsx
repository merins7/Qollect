import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../constant/Colors';
import { IT_SUBJECTS } from '../../config/subjectsData';

export default function SubjectList({ semester, onSelectSubject }) {
    const subjects = IT_SUBJECTS[semester] || [];

    return (
        <ScrollView style={styles.container}>
            {subjects.map((subject) => (
                <TouchableOpacity
                    key={subject.id}
                    style={styles.subjectCard}
                    onPress={() => onSelectSubject(subject)}
                >
                    <View style={styles.iconContainer}>
                        <Ionicons name="book" size={32} color={Colors.PRIMARY} />
                    </View>
                    <View style={styles.textContainer}>
                        <Text style={styles.subjectName}>{subject.name}</Text>
                        {subject.code && (
                            <Text style={styles.subjectCode}>{subject.code}</Text>
                        )}
                    </View>
                    <Ionicons name="chevron-forward" size={24} color="#666" />
                </TouchableOpacity>
            ))}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 15,
    },
    subjectCard: {
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
    subjectName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    subjectCode: {
        fontSize: 14,
        color: '#666',
        marginTop: 2,
    },
}); 