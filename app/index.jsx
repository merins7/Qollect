import React, { useEffect, useState } from 'react';
import { Image, View, Dimensions, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import Colors from '../constant/Colors';
import { useRouter } from 'expo-router';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../config/firebaseConfig';

// Get screen dimensions
const { width, height } = Dimensions.get('window');

export default function LandingScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        setIsLoading(false);
        if (user) {
          // Verify user document exists
          const userDocRef = doc(db, 'users', user.email);
          const userDocSnap = await getDoc(userDocRef);
          
          if (!userDocSnap.exists()) {
            // Create user document if it doesn't exist
            await setDoc(userDocRef, {
              email: user.email,
              name: user.displayName || 'User',
              createdAt: serverTimestamp(),
              isAdmin: false,
              member: false,
            });
            console.log('Created new user document');
          }
          router.replace('/(tabs)');
        }
      } catch (error) {
        console.error('Error in auth state change:', error);
        Alert.alert(
          'Error',
          'There was a problem accessing your account. Please try again.'
        );
      }
    });

    return () => unsubscribe();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.PRIMARY} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Image
          source={require('./../assets/images/note.jpg')}
          style={styles.image}
        />
        <View style={styles.contentContainer}>
          <Text style={styles.title}>Welcome to Qollect</Text>
          <Text style={styles.description}>
            A one-stop platform to upload, organize, and access your study materials 📚, 
            including notes, PDFs, videos 🎥, and past question papers 📝, anytime, anywhere.
          </Text>

          <TouchableOpacity 
            style={styles.button}
            onPress={() => router.push('/auth/signUp')}
          >
            <Text style={styles.buttonText}>Get Started</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.button}
            onPress={() => router.push('/auth/signIn')}
          >
            <Text style={styles.buttonText}>Already have an Account?</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.PRIMARY,
  },
  content: {
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: width,
    height: height / 2,
    resizeMode: 'cover',
  },
  contentContainer: {
    padding: 25,
    backgroundColor: Colors.PRIMARY,
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    marginTop: -30,
    minHeight: height / 2,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
    color: Colors.black,
  },
  description: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 30,
    color: Colors.white,
    lineHeight: 22,
  },
  button: {
    padding: 15,
    backgroundColor: Colors.white,
    marginTop: 20,
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonText: {
    textAlign: 'center',
    fontSize: 18,
    color: Colors.PRIMARY,
    fontWeight: 'bold',
  }
}); 