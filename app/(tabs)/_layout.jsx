import { Tabs } from 'expo-router';
import Colors from '../../constant/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

export default function TabsLayout() {
    const { isDarkMode } = useTheme() || { isDarkMode: false }; // Fallback in case theme context is undefined

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: Colors.PRIMARY,
                tabBarInactiveTintColor: '#666',
                tabBarStyle: {
                    backgroundColor: isDarkMode ? '#1a1a1a' : Colors.white,
                    borderTopWidth: 1,
                    borderTopColor: isDarkMode ? '#333' : '#eee',
                },
            }}
        >
            {/* Home Tab */}
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Home',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="home-sharp" size={size} color={color} />
                    ),
                }}
            />

            {/* Search Tab */}
            <Tabs.Screen
                name="SearchScreen"
                options={{
                    title: 'Search',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="search-sharp" size={size} color={color} />
                    ),
                }}
            />

            {/* Semester Tab */}
            <Tabs.Screen
                name="semester"
                options={{
                    title: 'Semester',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="book-sharp" size={size} color={color} />
                    ),
                }}
            />

            {/* Wishlist Tab */}
            <Tabs.Screen
                name="wishlist"
                options={{
                    title: 'Wishlist',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="heart-sharp" size={size} color={color} />
                    ),
                }}
            />

            {/* Profile Tab */}
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Profile',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="person-sharp" size={size} color={color} />
                    ),
                }}
            />

            {/* Settings Tab */}
            <Tabs.Screen
                name="settings"
                options={{
                    title: 'Settings',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="settings-sharp" size={size} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}
