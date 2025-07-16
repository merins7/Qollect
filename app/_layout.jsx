import { Stack } from 'expo-router';
import { ThemeProvider } from '../context/ThemeContext';
import { AuthProvider } from '../context/AuthContext';
import FirebaseInit from '../components/FirebaseInit';

export default function RootLayout() {
    return (
        <ThemeProvider>
            <AuthProvider>
                <FirebaseInit>
                    <Stack>
                        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                        <Stack.Screen name="auth/signIn" options={{ headerShown: false }} />
                        <Stack.Screen name="auth/signUp" options={{ headerShown: false }} />
                        <Stack.Screen name="auth/forgot-password" options={{ headerShown: false }} />
                        <Stack.Screen name="admin/MaterialApprovals" options={{ title: 'Material Approvals' }} />
                    </Stack>
                </FirebaseInit>
            </AuthProvider>
        </ThemeProvider>
    );
} 