import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { db } from '../../config/firebaseConfig';
import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';

export default function RatingComponent({ fileId }) {
    const [rating, setRating] = useState(0);
    const [averageRating, setAverageRating] = useState(null);
    const [userRating, setUserRating] = useState(null);

    useEffect(() => {
        fetchRating();
    }, []);

    const fetchRating = async () => {
        const fileRef = doc(db, 'materials', fileId);
        const fileSnap = await getDoc(fileRef);

        if (fileSnap.exists()) {
            const data = fileSnap.data();
            if (data.ratings && data.ratings.length > 0) {
                const total = data.ratings.reduce((sum, r) => sum + r, 0);
                setAverageRating((total / data.ratings.length).toFixed(1));
            } else {
                setAverageRating(null);
            }
        }
    };

    const submitRating = async (selectedRating) => {
        const fileRef = doc(db, 'materials', fileId);
        await updateDoc(fileRef, {
            ratings: arrayUnion(selectedRating)
        });
        setUserRating(selectedRating);
        fetchRating();
    };

    return (
        <View style={styles.container}>
            <Text style={styles.ratingText}>
                {averageRating ? `⭐ ${averageRating}` : 'No Ratings'}
            </Text>
            <View style={styles.starsContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                    <TouchableOpacity key={star} onPress={() => submitRating(star)}>
                        <Ionicons name={star <= userRating ? 'star' : 'star-outline'} size={20} color="gold" />
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
    ratingText: { fontSize: 14, fontWeight: 'bold', marginRight: 10 },
    starsContainer: { flexDirection: 'row' },
});
