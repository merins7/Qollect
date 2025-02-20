import { View, Text, StyleSheet, TouchableOpacity, Switch, ScrollView, Alert, ActivityIndicator } from 'react-native';
import React, { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../constant/Colors';
import Header from '../components/Header';
import * as ImagePicker from 'expo-image-picker';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../config/firebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { sendPasswordResetEmail } from 'firebase/auth';
import { useRouter } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';

export default function SettingsScreen() {
    const router = useRouter();
    const { isDarkMode, toggleDarkMode } = useTheme();
    const [notifications, setNotifications] = useState(true);
    const [loading, setLoading] = useState(true);
    const [userData, setUserData] = useState(null);

    useEffect(() => {
        loadUserData();
    }, []);

    const loadUserData = async () => {
        try {
            if (auth.currentUser) {
                const userDoc = await getDoc(doc(db, 'users', auth.currentUser.email));
                if (userDoc.exists()) {
                    setUserData(userDoc.data());
                }
            }
            setLoading(false);
        } catch (error) {
            console.error('Error loading user data:', error);
            setLoading(false);
        }
    };

    const handleNotifications = async (value) => {
        try {
            setNotifications(value);
            await AsyncStorage.setItem('notifications', value.toString());
            
            if (auth.currentUser) {
                await updateDoc(doc(db, 'users', auth.currentUser.email), {
                    notifications: value,
                    updatedAt: new Date().toISOString()
                });
            }
        } catch (error) {
            console.error('Error updating notifications:', error);
            Alert.alert('Error', 'Failed to update notification settings');
        }
    };

    const handleDarkMode = async (value) => {
        try {
            toggleDarkMode(value);
            await AsyncStorage.setItem('darkMode', value.toString());
            
            if (auth.currentUser) {
                await updateDoc(doc(db, 'users', auth.currentUser.email), {
                    darkMode: value,
                    updatedAt: new Date().toISOString()
                });
            }
        } catch (error) {
            console.error('Error updating dark mode:', error);
            Alert.alert('Error', 'Failed to update dark mode setting');
        }
    };

    const handleChangePassword = async () => {
        try {
            if (!auth.currentUser?.email) {
                Alert.alert('Error', 'Please sign in first');
                return;
            }
            await sendPasswordResetEmail(auth, auth.currentUser.email);
            Alert.alert('Success', 'Password reset email sent. Please check your inbox.');
        } catch (error) {
            console.error('Error sending reset email:', error);
            Alert.alert('Error', 'Failed to send reset email');
        }
    };

    const handlePrivacyPolicy = () => {
        router.push('/privacy-policy');
    };

    const handleTerms = () => {
        router.push('/terms-of-service');
    };

    const handleSignOut = async () => {
        try {
            await auth.signOut();
            router.replace('/'); // This will take user back to landing page
        } catch (error) {
            console.error('Sign out error:', error);
            Alert.alert('Error', 'Failed to sign out');
        }
    };

    const SettingItem = ({ icon, title, value, onPress, type = 'arrow' }) => (
        <TouchableOpacity 
            style={[
                styles.settingItem,
                isDarkMode && styles.settingItemDark
            ]} 
            onPress={type === 'arrow' ? onPress : null}
        >
            <View style={styles.settingLeft}>
                <Ionicons 
                    name={icon} 
                    size={24} 
                    color={isDarkMode ? Colors.PRIMARY : Colors.PRIMARY} 
                />
                <Text style={[
                    styles.settingText,
                    isDarkMode && styles.settingTextDark
                ]}>{title}</Text>
            </View>
            {type === 'arrow' && (
                <Ionicons 
                    name="chevron-forward" 
                    size={24} 
                    color={isDarkMode ? '#fff' : '#666'} 
                />
            )}
            {type === 'switch' && (
                <Switch
                    value={value}
                    onValueChange={onPress}
                    trackColor={{ false: '#767577', true: Colors.PRIMARY }}
                    thumbColor={value ? '#fff' : '#f4f3f4'}
                />
            )}
            {type === 'text' && (
                <Text style={[
                    styles.settingValue,
                    isDarkMode && styles.settingValueDark
                ]}>{value}</Text>
            )}
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <View style={styles.container}>
                <Header title="Settings" />
                <ActivityIndicator size="large" color={Colors.PRIMARY} />
            </View>
        );
    }

    return (
        <View style={[
            styles.container,
            isDarkMode && styles.containerDark
        ]}>
            <Header title="Settings" />
            <ScrollView>
                <View style={[
                    styles.section,
                    isDarkMode && styles.sectionDark
                ]}>
                    <Text style={[
                        styles.sectionTitle,
                        isDarkMode && styles.sectionTitleDark
                    ]}>Profile Details</Text>
                    <View style={styles.profileDetails}>
                        <Text style={[styles.profileLabel, isDarkMode && styles.profileLabelDark]}>
                            Name: {userData?.name || 'Not set'}
                        </Text>
                        <Text style={[styles.profileLabel, isDarkMode && styles.profileLabelDark]}>
                            Email: {userData?.email || 'Not set'}
                        </Text>
                        <Text style={[styles.profileLabel, isDarkMode && styles.profileLabelDark]}>
                            Branch: {userData?.branch || 'Not set'}
                        </Text>
                        <Text style={[styles.profileLabel, isDarkMode && styles.profileLabelDark]}>
                            Semester: {userData?.semester || 'Not set'}
                        </Text>
                        <Text style={[styles.profileLabel, isDarkMode && styles.profileLabelDark]}>
                            Student ID: {userData?.studentid || 'Not set'}
                        </Text>
                    </View>
                </View>

                <View style={[
                    styles.section,
                    isDarkMode && styles.sectionDark
                ]}>
                    <Text style={[
                        styles.sectionTitle,
                        isDarkMode && styles.sectionTitleDark
                    ]}>Preferences</Text>
                    <SettingItem 
                        icon="moon-outline" 
                        title="Dark Mode" 
                        type="switch"
                        value={isDarkMode}
                        onPress={handleDarkMode}
                    />
                    <SettingItem 
                        icon="notifications-outline" 
                        title="Notifications" 
                        type="switch"
                        value={notifications}
                        onPress={handleNotifications}
                    />
                </View>

                <View style={[
                    styles.section,
                    isDarkMode && styles.sectionDark
                ]}>
                    <Text style={[
                        styles.sectionTitle,
                        isDarkMode && styles.sectionTitleDark
                    ]}>Account</Text>
                    <SettingItem 
                        icon="key-outline" 
                        title="Change Password" 
                        onPress={handleChangePassword}
                    />
                </View>

                <View style={[
                    styles.section,
                    isDarkMode && styles.sectionDark
                ]}>
                    <Text style={[
                        styles.sectionTitle,
                        isDarkMode && styles.sectionTitleDark
                    ]}>About</Text>
                    <SettingItem 
                        icon="shield-checkmark-outline" 
                        title="Privacy Policy" 
                        onPress={handlePrivacyPolicy}
                    />
                    <SettingItem 
                        icon="document-text-outline" 
                        title="Terms of Service" 
                        onPress={handleTerms}
                    />
                    <SettingItem 
                        icon="information-circle-outline" 
                        title="App Version" 
                        value="1.0.0"
                        type="text"
                    />
                </View>

                <TouchableOpacity 
                    style={[styles.signOutButton, isDarkMode && styles.signOutButtonDark]}
                    onPress={handleSignOut}
                >
                    <Text style={[styles.signOutText, isDarkMode && styles.signOutTextDark]}>
                        Sign Out
                    </Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    containerDark: {
        backgroundColor: '#1a1a1a',
    },
    section: {
        backgroundColor: Colors.white,
        margin: 15,
        borderRadius: 15,
        padding: 10,
    },
    sectionDark: {
        backgroundColor: '#2c2c2e',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#666',
        marginLeft: 10,
        marginBottom: 10,
    },
    sectionTitleDark: {
        color: '#fff',
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    settingItemDark: {
        borderBottomColor: '#333',
    },
    settingLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    settingText: {
        fontSize: 16,
        marginLeft: 15,
        color: '#333',
    },
    settingTextDark: {
        color: '#fff',
    },
    settingValue: {
        fontSize: 14,
        color: '#666',
    },
    settingValueDark: {
        color: '#999',
    },
    profileDetails: {
        padding: 15,
    },
    profileLabel: {
        fontSize: 16,
        color: '#333',
        marginBottom: 8,
    },
    profileLabelDark: {
        color: '#fff',
    },
    signOutButton: {
        backgroundColor: '#ff4444',
        padding: 15,
        borderRadius: 10,
        marginHorizontal: 15,
        marginTop: 20,
        marginBottom: 30,
    },
    signOutButtonDark: {
        backgroundColor: '#cc0000',
    },
    signOutText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    signOutTextDark: {
        color: '#fff',
    },
}); 