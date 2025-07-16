import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri, useAuthRequest, exchangeCodeAsync } from 'expo-auth-session';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GOOGLE_DRIVE_CONFIG } from '../config/googleDriveConfig';

WebBrowser.maybeCompleteAuthSession();

const TOKEN_KEY = '@google_drive_token';

const discovery = {
    authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenEndpoint: 'https://oauth2.googleapis.com/token',
};

export async function getAccessToken() {
    try {
        // Check if we have a stored token
        const storedToken = await AsyncStorage.getItem(TOKEN_KEY);
        if (storedToken) {
            const tokenData = JSON.parse(storedToken);
            if (tokenData.expiresAt > Date.now()) {
                return tokenData.accessToken;
            }
        }

        // If no valid token, authenticate
        const token = await authenticate();
        return token.accessToken;
    } catch (error) {
        console.error('Error getting access token:', error);
        throw error;
    }
}

async function authenticate() {
    try {
        const redirectUri = makeRedirectUri({
            scheme: 'qollect',
            path: 'oauth2redirect'
        });

        const authRequest = await useAuthRequest(
            {
                clientId: GOOGLE_DRIVE_CONFIG.clientId,
                scopes: GOOGLE_DRIVE_CONFIG.scopes,
                redirectUri,
            },
            discovery
        );

        const result = await authRequest.promptAsync();

        if (result.type === 'success') {
            const { code } = result.params;

            const tokenResult = await exchangeCodeAsync(
                {
                    code,
                    clientId: GOOGLE_DRIVE_CONFIG.clientId,
                    clientSecret: GOOGLE_DRIVE_CONFIG.clientSecret,
                    redirectUri,
                    extraParams: {
                        grant_type: 'authorization_code',
                    },
                },
                discovery
            );

            const expiresAt = Date.now() + (tokenResult.expiresIn * 1000);
            
            // Store the token
            await AsyncStorage.setItem(TOKEN_KEY, JSON.stringify({
                accessToken: tokenResult.accessToken,
                refreshToken: tokenResult.refreshToken,
                expiresAt,
            }));

            return {
                accessToken: tokenResult.accessToken,
                refreshToken: tokenResult.refreshToken,
                expiresAt,
            };
        } else {
            throw new Error('Authentication failed');
        }
    } catch (error) {
        console.error('Authentication error:', error);
        throw error;
    }
} 