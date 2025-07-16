import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator, SafeAreaView, Platform, Linking } from 'react-native';
import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, updateDoc, deleteDoc, addDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../config/firebaseConfig';
import Colors from '../../constant/Colors';
import { useTheme } from '../../context/ThemeContext';
import * as FileSystem from 'expo-file-system';
import { auth } from '../../config/firebaseConfig';
import { useRouter } from 'expo-router';

export default function MaterialApprovals() {
    const [pendingMaterials, setPendingMaterials] = useState([]);
    const [loading, setLoading] = useState(true);
    const { isDarkMode } = useTheme();
    const router = useRouter();

    useEffect(() => {
        const checkAuth = async () => {
            if (!auth.currentUser) {
                Alert.alert('Error', 'Please sign in to access this page');
                router.replace('/auth/signIn');
                return;
            }
            
            // Check if user is admin
            const userDoc = await getDoc(doc(db, 'users', auth.currentUser.email));
            if (!userDoc.exists() || !userDoc.data().isAdmin) {
                Alert.alert('Error', 'You do not have permission to access this page');
                router.back();
                return;
            }
            
            fetchPendingMaterials();
        };

        checkAuth();
    }, [router]);

    const fetchPendingMaterials = async () => {
        try {
            const q = query(
                collection(db, 'materialRequests'),
                where('status', '==', 'pending')
            );
            const querySnapshot = await getDocs(q);
            const materials = [];
            querySnapshot.forEach((doc) => {
                materials.push({ id: doc.id, ...doc.data() });
            });
            setPendingMaterials(materials);
        } catch (error) {
            console.error('Error fetching materials:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (material) => {
        try {
            if (!auth.currentUser) {
                Alert.alert('Error', 'Please sign in to approve materials');
                return;
            }

            setLoading(true);

            // Add to materials collection
            await addDoc(collection(db, 'materials'), {
                title: material.title,
                description: material.description,
                type: material.type,
                semester: material.semester,
                subjectId: material.subjectId,
                fileUrl: material.fileUrl,
                uploadedBy: material.uploadedBy,
                approvedBy: auth.currentUser.email,
                approvedAt: serverTimestamp(),
                status: 'active',
                source: 'google_drive'
            });

            // Update request status
            await updateDoc(doc(db, 'materialRequests', material.id), {
                status: 'approved',
                approvedBy: auth.currentUser.email,
                approvedAt: serverTimestamp()
            });

            Alert.alert('Success', 'Material approved');
            fetchPendingMaterials();
        } catch (error) {
            console.error('Error approving material:', error);
            Alert.alert(
                'Error',
                'Failed to approve material. Please try again.'
            );
        } finally {
            setLoading(false);
        }
    };

    const handleReject = async (material) => {
        Alert.alert(
            'Confirm Rejection',
            'Are you sure you want to reject this material?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Reject',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            setLoading(true);
                            await updateDoc(doc(db, 'materialRequests', material.id), {
                                status: 'rejected'
                            });
                            Alert.alert('Success', 'Material rejected');
                            fetchPendingMaterials();
                        } catch (error) {
                            console.error('Error rejecting material:', error);
                            Alert.alert('Error', 'Failed to reject material');
                        } finally {
                            setLoading(false);
                        }
                    }
                }
            ]
        );
    };

    const handleViewPDF = async (fileUrl) => {
        try {
            if (!fileUrl) {
                Alert.alert('Error', 'No PDF file URL available');
                return;
            }
            
            // Open the PDF URL in the device's default browser or PDF viewer
            const supported = await Linking.canOpenURL(fileUrl);
            if (supported) {
                await Linking.openURL(fileUrl);
            } else {
                Alert.alert('Error', 'Cannot open PDF file');
            }
        } catch (error) {
            console.error('Error opening PDF:', error);
            Alert.alert('Error', 'Failed to open PDF file');
        }
    };

    const renderItem = ({ item }) => (
        <View style={[styles.card, isDarkMode && styles.cardDark]}>
            <Text style={[styles.title, isDarkMode && styles.textDark]}>{item.title}</Text>
            <Text style={[styles.details, isDarkMode && styles.textDark]}>
                Semester {item.semester} - {item.subjectId}
            </Text>
            <Text style={[styles.details, isDarkMode && styles.textDark]}>
                Type: {item.type}
            </Text>
            <Text style={[styles.details, isDarkMode && styles.textDark]}>
                Uploaded by: {item.uploadedBy}
            </Text>
            <Text style={[styles.details, isDarkMode && styles.textDark]}>
                File: {item.fileName}
            </Text>

            <View style={styles.buttonContainer}>
                <TouchableOpacity 
                    style={[styles.button, styles.viewButton]}
                    onPress={() => handleViewPDF(item.fileUrl)}
                >
                    <Text style={styles.buttonText}>View PDF</Text>
                </TouchableOpacity>
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

    const Header = () => (
        <View style={styles.header}>
            <Text style={[styles.headerText, isDarkMode && styles.textDark]}>
                Material Approvals
            </Text>
        </View>
    );

    return (
        <SafeAreaView style={[styles.container, isDarkMode && styles.containerDark]}>
            <Header />
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={Colors.PRIMARY} />
                </View>
            ) : (
                <>
                    <Text style={[styles.subHeader, isDarkMode && styles.textDark]}>
                        Pending Approvals ({pendingMaterials.length})
                    </Text>
                    {pendingMaterials.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <Text style={[styles.emptyText, isDarkMode && styles.textDark]}>
                                No pending materials to approve
                            </Text>
                        </View>
                    ) : (
                        <FlatList
                            data={pendingMaterials}
                            renderItem={renderItem}
                            keyExtractor={item => item.id}
                            contentContainerStyle={styles.list}
                        />
                    )}
                </>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        padding: 15,
    },
    containerDark: {
        backgroundColor: '#1a1a1a',
    },
    header: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        backgroundColor: Colors.white,
    },
    headerText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    card: {
        backgroundColor: Colors.white,
        borderRadius: 10,
        padding: 15,
        marginBottom: 15,
        elevation: 2,
    },
    cardDark: {
        backgroundColor: '#2c2c2e',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#333',
    },
    details: {
        fontSize: 14,
        color: '#666',
        marginBottom: 5,
    },
    textDark: {
        color: '#fff',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 15,
        gap: 8,
    },
    button: {
        flex: 1,
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
    },
    viewButton: {
        backgroundColor: Colors.PRIMARY,
        opacity: 0.8,
    },
    approveButton: {
        backgroundColor: Colors.PRIMARY,
    },
    rejectButton: {
        backgroundColor: '#dc3545',
    },
    buttonText: {
        color: Colors.white,
        fontWeight: 'bold',
    },
    noMaterials: {
        textAlign: 'center',
        fontSize: 16,
        color: '#666',
        marginTop: 20,
    },
    list: {
        paddingBottom: 20,
    },
    subHeader: {
        fontSize: 18,
        fontWeight: '500',
        padding: 15,
        color: '#333',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    emptyText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    }
}); 