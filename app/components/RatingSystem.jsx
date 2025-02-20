import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import React, { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../constant/Colors';
import { useTheme } from '../../context/ThemeContext';

export default function RatingSystem({ initialRating = 0, onRatingChange }) {
    const [rating, setRating] = useState(initialRating);
    const { isDarkMode } = useTheme();

    const handleRating = (value) => {
        setRating(value);
        if (onRatingChange) {
            onRatingChange(value);
        }
    };

    return (
        <View style={[
            styles.container,
            isDarkMode && styles.containerDark
        ]}>
            <Text style={[
                styles.title,
                isDarkMode && styles.titleDark
            ]}>Rate this material</Text>
            
            <View style={styles.starsContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                    <TouchableOpacity
                        key={star}
                        onPress={() => handleRating(star)}
                        style={styles.starButton}
                    >
                        <Ionicons
                            name={star <= rating ? 'star' : 'star-outline'}
                            size={30}
                            color={Colors.PRIMARY}
                        />
                    </TouchableOpacity>
                ))}
            </View>
            
            <Text style={[
                styles.ratingText,
                isDarkMode && styles.ratingTextDark
            ]}>
                {rating > 0 ? `${rating} out of 5` : 'Not rated yet'}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 15,
        backgroundColor: Colors.white,
        borderRadius: 15,
        margin: 15,
        alignItems: 'center',
    },
    containerDark: {
        backgroundColor: '#2c2c2e',
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
    },
    titleDark: {
        color: '#fff',
    },
    starsContainer: {
        flexDirection: 'row',
        marginVertical: 10,
    },
    starButton: {
        padding: 5,
    },
    ratingText: {
        fontSize: 14,
        color: '#666',
        marginTop: 5,
    },
    ratingTextDark: {
        color: '#999',
    },
}); 