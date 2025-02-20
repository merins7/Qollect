import React, { useEffect, useState } from 'react';
import { Image, View, Dimensions, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import Colors from '../constant/Colors';
import { useRouter } from 'expo-router';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebaseConfig';

// Get screen dimensions
const { width, height } = Dimensions.get('window');

export default function LandingScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoading(false);
      if (user) {
        router.replace('/(tabs)');
      }
    });

    return () => unsubscribe();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.PRIMARY} />
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: width,
    height: height / 2,
  },
  contentContainer: {
    padding: 25,
    backgroundColor: Colors.PRIMARY,
    height: '100%',
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
  },
  description: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 30,
  },
  button: {
    padding: 15,
    backgroundColor: Colors.white,
    marginTop: 20,
    borderRadius: 10,
  },
  buttonText: {
    textAlign: 'center',
    fontSize: 18,
  }
}); 