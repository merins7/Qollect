import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { collection, query, where, getDocs, updateDoc, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../config/firebaseConfig';
import Colors from '../../constant/Colors';
import { uploadToGoogleDrive } from '../../utils/googleDriveUtils';

export default function MaterialRequests() {
    const [pendingRequests, setPendingRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPendingRequests();
    }, []);

    const fetchPendingRequests = async () => {
        try {
            const q = query(
                collection(db, 'materialRequests'),
                where('status', '==', 'pending')
            );
            const querySnapshot = await getDocs(q);
            const requests = [];
            querySnapshot.forEach((doc) => {
                requests.push({ id: doc.id, ...doc.data() });
            });
            setPendingRequests(requests);
        } catch (error) {
            console.error('Error fetching requests:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (request) => {
        try {
            setLoading(true);
            
            // Upload to Google Drive
            const driveResponse = await uploadToGoogleDrive({
                fileUri: request.fileUri,
                fileName: request.fileName,
                mimeType: request.mimeType,
                metadata: {
                    semester: request.semester,
                    subject: request.subjectName,
                    materialType: request.materialType
                }
            });

            // Update request status
            await updateDoc(doc(db, 'materialRequests', request.id), {
                status: 'approved',
                approvedAt: serverTimestamp(),
                driveFileId: driveResponse.fileId,
                driveFileUrl: driveResponse.webViewLink
            });

            // Create approved material document
            await setDoc(doc(db, 'materials', request.id), {
                ...request,
                status: 'active',
                fileUrl: driveResponse.webViewLink,
                driveFileId: driveResponse.fileId,
                approvedAt: serverTimestamp()
            });

            Alert.alert('Success', 'Material approved and uploaded');
            fetchPendingRequests();
        } catch (error) {
            console.error('Approval error:', error);
            Alert.alert('Error', 'Failed to approve material');
        } finally {
            setLoading(false);
        }
    };

    const handleReject = async (request) => {
        try {
            await updateDoc(doc(db, 'materialRequests', request.id), {
                status: 'rejected',
                rejectedAt: serverTimestamp()
            });
            Alert.alert('Success', 'Material request rejected');
            fetchPendingRequests();
        } catch (error) {
            console.error('Rejection error:', error);
            Alert.alert('Error', 'Failed to reject material');
        }
    };

    const renderItem = ({ item }) => (
        <View style={styles.requestCard}>
            <Text style={styles.fileName}>{item.fileName}</Text>
            <Text style={styles.details}>
                Semester {item.semester} - {item.subjectName}
            </Text>
            <Text style={styles.details}>Type: {item.materialType}</Text>
            <Text style={styles.submitter}>
                Submitted by: {item.submittedBy}
            </Text>
            
            <View style={styles.actionButtons}>
                <TouchableOpacity 
                    style={[styles.button, styles.approveButton]}
                    onPress={() => handleApprove(item)}
                >
                    <Text style={styles.buttonText}>Approve</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={[styles.button, styles.rejectButton]}
                    onPress={() => handleReject(item)}
                >
                    <Text style={styles.buttonText}>Reject</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Pending Material Requests</Text>
            {loading ? (
                <ActivityIndicator size="large" color={Colors.PRIMARY} />
            ) : (
                <FlatList
                    data={pendingRequests}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.list}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    // ... styles
}); 