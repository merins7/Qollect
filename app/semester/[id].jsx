import { View, StyleSheet, SafeAreaView, Text } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Header from '../components/Header';
import SubjectList from '../components/SubjectList';
import { IT_SUBJECTS } from '../../config/subjectsData';

export default function SemesterDetail() {
    const { id, scheme } = useLocalSearchParams(); // ✅ Get URL params
    const router = useRouter();
    const [subjects, setSubjects] = useState([]);

    useEffect(() => {
        if (!id || !scheme) return;

        console.log("📌 Semester ID:", id);  
        console.log("📌 Scheme:", scheme);  
        console.log("📌 Available Schemes in IT_SUBJECTS:", Object.keys(IT_SUBJECTS)); // Debugging
        console.log("📌 Available Semesters for Scheme:", IT_SUBJECTS[scheme] ? Object.keys(IT_SUBJECTS[scheme]) : "Not Found");

        const schemeSubjects = IT_SUBJECTS[scheme] || {};  
        const semesterSubjects = schemeSubjects[id] || [];

        console.log("📌 Subjects for Semester", id, "under Scheme", scheme, ":", semesterSubjects); // Debugging

        setSubjects(semesterSubjects);
    }, [id, scheme]);

    const handleSubjectSelect = (subject) => {
        router.push({
            pathname: `/semester/subject/${subject.id}`,
            params: { 
                id: subject.id,
                semester: id,
                subjectName: subject.name,
                scheme,
            }
        });
    };

    return (
        <SafeAreaView style={styles.container}>
            <Header title={`Semester ${id} (${scheme} Scheme)`} showBack={true} />
            {subjects.length > 0 ? (
                <SubjectList 
                    subjects={subjects} 
                    onSelectSubject={handleSubjectSelect}
                />
            ) : (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>
                        ⚠️ No subjects available for this scheme.
                    </Text>
                </View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyText: {
        fontSize: 16,
        color: '#666',
    },
});
