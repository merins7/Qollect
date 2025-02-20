import { Stack } from 'expo-router';
import { ThemeProvider } from '../context/ThemeContext';
import FirebaseInit from '../components/FirebaseInit';

export default function RootLayout() {
    return (
        <ThemeProvider>
            <FirebaseInit>
                <Stack screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="index" />
                    <Stack.Screen name="(tabs)" />
                    <Stack.Screen name="auth/signIn" />
                    <Stack.Screen name="auth/signUp" />
                    <Stack.Screen name="privacy-policy" />
                    <Stack.Screen name="terms-of-service" />
                    <Stack.Screen name="semester/subject/[id]" />
                    <Stack.Screen name="semester/subject/material/[type]" />
                </Stack>
            </FirebaseInit>
        </ThemeProvider>
    );
} 