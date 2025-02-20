import { View, Text, StyleSheet, TouchableOpacity, TextInput, Modal, Alert, ActivityIndicator } from 'react-native';
import React, { useState, useEffect } from 'react';
import { Picker } from '@react-native-picker/picker';
import * as DocumentPicker from 'expo-document-picker';
import Colors from '../../constant/Colors';
import { doc, setDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage, auth } from '../../config/firebaseConfig';
import { useTheme } from '../../context/ThemeContext';
import { IT_SUBJECTS } from '../../config/subjectsData';

const SEMESTERS = Array.from({ length: 8 }, (_, i) => ({
    label: `Semester ${i + 1}`,
    value: `${i + 1}`
}));

const MATERIAL_TYPES = [
    { label: 'Notes', value: 'notes' },
    { label: 'Previous Year Questions', value: 'pyq' },
    { label: 'Syllabus', value: 'syllabus' }
];

export default function UploadForm({ visible, onClose }) {
    const { isDarkMode } = useTheme();
    const [file, setFile] = useState(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [uploading, setUploading] = useState(false);
    const [semester, setSemester] = useState('');
    const [subject, setSubject] = useState('');
    const [materialType, setMaterialType] = useState('');
    const [availableSubjects, setAvailableSubjects] = useState([]);

    useEffect(() => {
        if (semester) {
            const subjects = IT_SUBJECTS[semester] || [];
            setAvailableSubjects(subjects);
            setSubject(''); // Reset subject when semester changes
        }
    }, [semester]);

    const pickDocument = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ['application/pdf'],
                copyToCacheDirectory: true
            });

            if (!result.canceled && result.assets && result.assets[0]) {
                setFile(result.assets[0]);
            }
        } catch (error) {
            console.error('Error picking document:', error);
            Alert.alert('Error', 'Failed to pick document');
        }
    };

    const handleUpload = async () => {
        if (!file || !title || !semester || !subject || !materialType) {
            Alert.alert('Error', 'Please fill in all fields and select a file');
            return;
        }

        try {
            setUploading(true);

            // Create a unique filename to avoid conflicts
            const timestamp = Date.now();
            const fileExtension = file.name.split('.').pop();
            const uniqueFileName = `${timestamp}.${fileExtension}`;
            const storagePath = `materials/${semester}/${subject}/${uniqueFileName}`;

            // 1. Upload file to Firebase Storage
            const fileRef = ref(storage, storagePath);
            
            // Convert URI to blob
            const response = await fetch(file.uri);
            if (!response.ok) {
                throw new Error('Failed to fetch file');
            }
            
            const blob = await response.blob();
            if (!blob) {
                throw new Error('Failed to create blob');
            }

            // Upload blob to Firebase Storage
            try {
                await uploadBytes(fileRef, blob);
                console.log('File uploaded successfully');
            } catch (uploadError) {
                console.error('Upload error details:', uploadError);
                throw new Error(`Upload failed: ${uploadError.message}`);
            }

            // Get download URL
            let downloadURL;
            try {
                downloadURL = await getDownloadURL(fileRef);
                console.log('Download URL obtained:', downloadURL);
            } catch (urlError) {
                console.error('Get URL error:', urlError);
                throw new Error('Failed to get download URL');
            }

            // 2. Add document to Firestore
            const materialRef = collection(db, 'materials');
            await addDoc(materialRef, {
                title,
                description,
                type: materialType,
                fileUrl: downloadURL,
                fileName: file.name,
                fileSize: file.size,
                uploadedBy: auth.currentUser.email,
                uploadedAt: serverTimestamp(),
                semester: semester,
                subjectId: subject,
                storagePath: storagePath
            });

            Alert.alert('Success', 'Material uploaded successfully');
            resetForm();
            onClose();
        } catch (error) {
            console.error('Upload error:', error);
            Alert.alert(
                'Error',
                'Failed to upload material: ' + (error.message || 'Unknown error')
            );
        } finally {
            setUploading(false);
        }
    };

    const resetForm = () => {
        setFile(null);
        setTitle('');
        setDescription('');
        setSemester('');
        setSubject('');
        setMaterialType('');
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={[
                styles.modalContainer,
                isDarkMode && styles.modalContainerDark
            ]}>
                <View style={[
                    styles.modalContent,
                    isDarkMode && styles.modalContentDark
                ]}>
                    <Text style={[
                        styles.title,
                        isDarkMode && styles.titleDark
                    ]}>Upload Material</Text>

                    <View style={[
                        styles.pickerContainer,
                        isDarkMode && styles.pickerContainerDark
                    ]}>
                        <Picker
                            selectedValue={semester}
                            onValueChange={setSemester}
                            style={[styles.picker, isDarkMode && styles.pickerDark]}
                        >
                            <Picker.Item label="Select Semester" value="" />
                            {SEMESTERS.map(sem => (
                                <Picker.Item 
                                    key={sem.value} 
                                    label={sem.label} 
                                    value={sem.value}
                                />
                            ))}
                        </Picker>
                    </View>

                    <View style={[
                        styles.pickerContainer,
                        isDarkMode && styles.pickerContainerDark
                    ]}>
                        <Picker
                            selectedValue={subject}
                            onValueChange={setSubject}
                            style={[styles.picker, isDarkMode && styles.pickerDark]}
                            enabled={semester !== ''}
                        >
                            <Picker.Item label="Select Subject" value="" />
                            {availableSubjects.map(sub => (
                                <Picker.Item 
                                    key={sub.id} 
                                    label={sub.name} 
                                    value={sub.id}
                                />
                            ))}
                        </Picker>
                    </View>

                    <View style={[
                        styles.pickerContainer,
                        isDarkMode && styles.pickerContainerDark
                    ]}>
                        <Picker
                            selectedValue={materialType}
                            onValueChange={setMaterialType}
                            style={[styles.picker, isDarkMode && styles.pickerDark]}
                        >
                            <Picker.Item label="Select Material Type" value="" />
                            {MATERIAL_TYPES.map(type => (
                                <Picker.Item 
                                    key={type.value} 
                                    label={type.label} 
                                    value={type.value}
                                />
                            ))}
                        </Picker>
                    </View>

                    <TextInput
                        style={[
                            styles.input,
                            isDarkMode && styles.inputDark
                        ]}
                        placeholder="Title"
                        placeholderTextColor={isDarkMode ? '#999' : '#666'}
                        value={title}
                        onChangeText={setTitle}
                    />

                    <TextInput
                        style={[
                            styles.input,
                            styles.descriptionInput,
                            isDarkMode && styles.inputDark
                        ]}
                        placeholder="Description (optional)"
                        placeholderTextColor={isDarkMode ? '#999' : '#666'}
                        value={description}
                        onChangeText={setDescription}
                        multiline
                    />

                    <TouchableOpacity
                        style={styles.fileButton}
                        onPress={pickDocument}
                    >
                        <Text style={styles.fileButtonText}>
                            {file ? file.name : 'Select PDF File'}
                        </Text>
                    </TouchableOpacity>

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={[styles.button, styles.cancelButton]}
                            onPress={() => {
                                resetForm();
                                onClose();
                            }}
                            disabled={uploading}
                        >
                            <Text style={styles.buttonText}>Cancel</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.button,
                                styles.uploadButton,
                                uploading && styles.disabledButton
                            ]}
                            onPress={handleUpload}
                            disabled={uploading}
                        >
                            <Text style={styles.buttonText}>
                                {uploading ? 'Uploading...' : 'Upload'}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {uploading && (
                        <ActivityIndicator 
                            size="large" 
                            color={Colors.PRIMARY} 
                            style={styles.loader} 
                        />
                    )}
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        width: '90%',
        backgroundColor: Colors.white,
        borderRadius: 15,
        padding: 20,
        elevation: 5,
    },
    modalContentDark: {
        backgroundColor: '#2c2c2e',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#333',
    },
    titleDark: {
        color: '#fff',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        marginBottom: 15,
        fontSize: 16,
    },
    inputDark: {
        borderColor: '#666',
        color: '#fff',
        backgroundColor: '#1c1c1e',
    },
    descriptionInput: {
        height: 100,
        textAlignVertical: 'top',
    },
    fileButton: {
        backgroundColor: '#f0f0f0',
        padding: 15,
        borderRadius: 8,
        marginBottom: 20,
    },
    fileButtonText: {
        textAlign: 'center',
        color: '#666',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    button: {
        flex: 1,
        padding: 15,
        borderRadius: 8,
        marginHorizontal: 5,
    },
    uploadButton: {
        backgroundColor: Colors.PRIMARY,
    },
    cancelButton: {
        backgroundColor: '#666',
    },
    buttonText: {
        color: Colors.white,
        textAlign: 'center',
        fontWeight: 'bold',
    },
    disabledButton: {
        opacity: 0.5,
    },
    loader: {
        marginTop: 20,
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        marginBottom: 15,
        backgroundColor: '#fff',
    },
    pickerContainerDark: {
        borderColor: '#666',
        backgroundColor: '#1c1c1e',
    },
    picker: {
        height: 50,
    },
    pickerDark: {
        color: '#fff',
    },
}); 