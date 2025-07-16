import { useState, useEffect } from 'react';
import { Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import { GOOGLE_DRIVE_CONFIG } from '../config/googleDriveConfig';

WebBrowser.maybeCompleteAuthSession();

const TOKEN_KEY = '@google_drive_token';

// Initialize Google Sign In
GoogleSignin.configure({
  webClientId: GOOGLE_DRIVE_CONFIG.clientId, // your web client id
  offlineAccess: true,
  scopes: GOOGLE_DRIVE_CONFIG.scopes,
});

export function useGoogleAuth() {
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        checkStoredToken();
    }, []);

    const checkStoredToken = async () => {
        try {
            const storedToken = await AsyncStorage.getItem(TOKEN_KEY);
            if (storedToken) {
                const tokenData = JSON.parse(storedToken);
                if (tokenData.expiresAt > Date.now()) {
                    setToken(tokenData.accessToken);
                }
            }
        } catch (error) {
            console.error('Error checking stored token:', error);
            setError(error);
        } finally {
            setLoading(false);
        }
    };

    const signIn = async () => {
        try {
            setLoading(true);
            setError(null);

            await GoogleSignin.hasPlayServices();
            const userInfo = await GoogleSignin.signIn();
            const tokens = await GoogleSignin.getTokens();
            
            const expiresAt = Date.now() + (3600 * 1000); // 1 hour expiration
            const tokenData = {
                accessToken: tokens.accessToken,
                expiresAt,
            };

            await AsyncStorage.setItem(TOKEN_KEY, JSON.stringify(tokenData));
            setToken(tokens.accessToken);
        } catch (error) {
            console.error('Sign-in error:', error);
            if (error.code === statusCodes.SIGN_IN_CANCELLED) {
                setError('Sign in was cancelled');
            } else if (error.code === statusCodes.IN_PROGRESS) {
                setError('Sign in is already in progress');
            } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
                setError('Play services not available');
            } else {
                setError(error.message || 'An unknown error occurred');
            }
        } finally {
            setLoading(false);
        }
    };

    const signOut = async () => {
        try {
            setLoading(true);
            await GoogleSignin.signOut();
            await AsyncStorage.removeItem(TOKEN_KEY);
            setToken(null);
        } catch (error) {
            console.error('Sign-out error:', error);
            setError(error.message || 'Failed to sign out');
        } finally {
            setLoading(false);
        }
    };

    const isSignedIn = async () => {
        try {
            return await GoogleSignin.isSignedIn();
        } catch (error) {
            console.error('isSignedIn error:', error);
            return false;
        }
    };

    return {
        token,
        loading,
        error,
        signIn,
        signOut,
        isSignedIn,
    };
} 