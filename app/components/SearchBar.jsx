import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import React, { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../constant/Colors';
import { useTheme } from '../../context/ThemeContext';

export default function SearchBar({ onSearch, onFilter }) {
    const [searchQuery, setSearchQuery] = useState('');
    const { isDarkMode } = useTheme();

    const handleSearch = (text) => {
        setSearchQuery(text);
        onSearch(text);
    };

    return (
        <View style={[
            styles.container,
            isDarkMode && styles.containerDark
        ]}>
            <View style={[
                styles.searchContainer,
                isDarkMode && styles.searchContainerDark
            ]}>
                <Ionicons 
                    name="search" 
                    size={20} 
                    color={isDarkMode ? '#fff' : '#666'} 
                />
                <TextInput
                    style={[
                        styles.input,
                        isDarkMode && styles.inputDark
                    ]}
                    placeholder="Search materials..."
                    placeholderTextColor={isDarkMode ? '#999' : '#666'}
                    value={searchQuery}
                    onChangeText={handleSearch}
                />
            </View>
            <TouchableOpacity 
                style={styles.filterButton}
                onPress={onFilter}
            >
                <Ionicons 
                    name="filter" 
                    size={24} 
                    color={Colors.PRIMARY} 
                />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        padding: 15,
        alignItems: 'center',
    },
    containerDark: {
        backgroundColor: '#1a1a1a',
    },
    searchContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
        borderRadius: 10,
        padding: 10,
        marginRight: 10,
    },
    searchContainerDark: {
        backgroundColor: '#333',
    },
    input: {
        flex: 1,
        marginLeft: 10,
        fontSize: 16,
        color: '#333',
    },
    inputDark: {
        color: '#fff',
    },
    filterButton: {
        padding: 10,
        backgroundColor: '#f0f0f0',
        borderRadius: 10,
    },
}); 