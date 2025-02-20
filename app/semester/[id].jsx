import { View, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Colors from '../../constant/Colors';
import SubjectList from '../components/SubjectList';
import UploadForm from '../components/UploadForm';
import { Ionicons } from '@expo/vector-icons';

export default function SemesterDetail() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [isUploadFormVisible, setIsUploadFormVisible] = useState(false);

    const handleSubjectSelect = (subject) => {
        router.push({
            pathname: '/semester/subject/[id]',
            params: { 
                id: subject.id,
                semester: id,
                subjectName: subject.name
            }
        });
    };

    return (
        <SafeAreaView style={styles.container}>
            <SubjectList 
                semester={id} 
                onSelectSubject={handleSubjectSelect}
            />
            
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
                semester={id}
            />
        </SafeAreaView>
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
        backgroundColor: Colors.PRIMARY,
        width: 60,
        height: 60,
        borderRadius: 30,
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