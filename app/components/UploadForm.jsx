import { 
    View, Text, StyleSheet, TouchableOpacity, TextInput, Modal, 
    Alert, ActivityIndicator, Platform 
} from 'react-native';
import React, { useState, useEffect } from 'react';
import { Picker } from '@react-native-picker/picker';
import Colors from '../../constant/Colors';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../config/firebaseConfig';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { IT_SUBJECTS } from '../../config/subjectsData';

const SCHEMES = [
    { label: 'Scheme 2019', value: '2019' },
    { label: 'Scheme 2023', value: '2023' }
];

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
    const { user, userProfile, isAuthenticated } = useAuth();

    const [scheme, setScheme] = useState('');
    const [semester, setSemester] = useState('');
    const [subject, setSubject] = useState('');
    const [materialType, setMaterialType] = useState('');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [googleDriveLink, setGoogleDriveLink] = useState('');
    const [uploading, setUploading] = useState(false);
    const [availableSubjects, setAvailableSubjects] = useState([]);

    // Fetch subjects based on scheme & semester
    useEffect(() => {
        if (scheme && semester) {
            const subjects = IT_SUBJECTS[scheme]?.[semester] || [];
            setAvailableSubjects(subjects);
            setSubject('');
        }
    }, [scheme, semester]);

    const resetForm = () => {
        setScheme('');
        setSemester('');
        setSubject('');
        setMaterialType('');
        setTitle('');
        setDescription('');
        setGoogleDriveLink('');
    };

    const validateGoogleDriveLink = (link) => {
        // Check if the link is a valid Google Drive link
        const googleDriveRegex = /^https:\/\/drive\.google\.com\/(file\/d\/|open\?id=|uc\?id=)/;
        return googleDriveRegex.test(link);
    };

    const handleUpload = async () => {
        if (!isAuthenticated || !user) {
            Alert.alert('Authentication Required', 'Please sign in to upload materials');
            onClose();
            return;
        }

        // Validation checks
        const validations = [
            { condition: !scheme, message: 'Please select a scheme' },
            { condition: !semester, message: 'Please select a semester' },
            { condition: !subject, message: 'Please select a subject' },
            { condition: !materialType, message: 'Please select a material type' },
            { condition: !title.trim(), message: 'Please enter a title' },
            { condition: !googleDriveLink.trim(), message: 'Please enter a Google Drive share link' },
            { condition: !validateGoogleDriveLink(googleDriveLink.trim()), message: 'Please enter a valid Google Drive link' }
        ];

        for (const validation of validations) {
            if (validation.condition) {
                Alert.alert('Invalid Input', validation.message);
                return;
            }
        }

        try {
            setUploading(true);

            // Create Firestore entry
            const materialData = {
                title: title.trim(),
                description: description.trim() || '',
                type: materialType,
                scheme,
                semester: semester.toString(),
                subjectId: subject,
                fileUrl: googleDriveLink.trim(),
                uploadedBy: user.uid,
                uploaderEmail: user.email,
                uploaderName: userProfile?.displayName || user.email,
                status: 'pending',
                createdAt: serverTimestamp(),
                lastUpdated: serverTimestamp(),
                source: 'google_drive',
                metadata: {
                    platform: Platform.OS,
                    timestamp: new Date().toISOString()
                }
            };

            await addDoc(collection(db, 'materialRequests'), materialData);

            Alert.alert('Success', 'Your material has been submitted for approval.');
            resetForm();
            onClose();
        } catch (error) {
            console.error('Upload error:', error);
            Alert.alert('Upload Failed', 'There was a problem submitting your material.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
            <View style={[styles.modalContainer, isDarkMode && styles.modalContainerDark]}>
                <View style={[styles.modalContent, isDarkMode && styles.modalContentDark]}>
                    <Text style={[styles.title, isDarkMode && styles.titleDark]}>Upload Material</Text>

                    {/* Scheme Selector */}
                    <Picker selectedValue={scheme} onValueChange={setScheme} style={styles.picker}>
                        <Picker.Item label="Select Scheme" value="" />
                        {SCHEMES.map(({ label, value }) => <Picker.Item key={value} label={label} value={value} />)}
                    </Picker>

                    {/* Semester Selector */}
                    <Picker selectedValue={semester} onValueChange={setSemester} style={styles.picker}>
                        <Picker.Item label="Select Semester" value="" />
                        {SEMESTERS.map(({ label, value }) => <Picker.Item key={value} label={label} value={value} />)}
                    </Picker>

                    {/* Subject Selector */}
                    <Picker selectedValue={subject} onValueChange={setSubject} style={styles.picker} enabled={semester !== ''}>
                        <Picker.Item label="Select Subject" value="" />
                        {availableSubjects.map(({ id, name }) => <Picker.Item key={id} label={name} value={id} />)}
                    </Picker>

                    {/* Material Type Selector */}
                    <Picker selectedValue={materialType} onValueChange={setMaterialType} style={styles.picker}>
                        <Picker.Item label="Select Material Type" value="" />
                        {MATERIAL_TYPES.map(({ label, value }) => <Picker.Item key={value} label={label} value={value} />)}
                    </Picker>

                    <TextInput style={styles.input} placeholder="Title" value={title} onChangeText={setTitle} />
                    <TextInput style={styles.input} placeholder="Description (optional)" value={description} onChangeText={setDescription} multiline />
                    <TextInput style={styles.input} placeholder="Google Drive Link *" value={googleDriveLink} onChangeText={setGoogleDriveLink} />

                    <TouchableOpacity style={styles.uploadButton} onPress={handleUpload} disabled={uploading}>
                        <Text style={styles.buttonText}>{uploading ? 'Uploading...' : 'Submit'}</Text>
                    </TouchableOpacity>

                    {uploading && <ActivityIndicator size="large" color={Colors.PRIMARY} style={styles.loader} />}
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
    modalContent: { width: '90%', backgroundColor: Colors.white, borderRadius: 15, padding: 20 },
    title: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
    input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 15 },
    uploadButton: { backgroundColor: Colors.PRIMARY, padding: 15, borderRadius: 8 },
    buttonText: { textAlign: 'center', fontWeight: 'bold', color: '#fff' },
});
