import React, { useState, useCallback, useRef } from 'react';
import { 
  View, FlatList, Text, StyleSheet, TextInput, TouchableOpacity, 
  KeyboardAvoidingView, Platform, Animated, ActivityIndicator 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Colors from '../../constant/Colors';
import { IT_SUBJECTS } from '../../config/subjectsData';
import { useTheme } from '../../context/ThemeContext';

// Default Scheme
const DEFAULT_SCHEME = '2023';

const SearchScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedScheme, setSelectedScheme] = useState(DEFAULT_SCHEME);
  const [filteredSubjects, setFilteredSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const scaleValue = useRef(new Animated.Value(1)).current;

  // Get subjects based on selected scheme with error handling
  const getSubjects = useCallback((scheme) => {
    try {
      if (!IT_SUBJECTS[scheme]) {
        console.warn(`No subjects found for scheme: ${scheme}`);
        return [];
      }
      return Object.entries(IT_SUBJECTS[scheme]).flatMap(([semester, subjects]) =>
        subjects.map(subject => ({ ...subject, semester }))
      );
    } catch (error) {
      console.error('Error getting subjects:', error);
      return [];
    }
  }, []);

  // Update filtered subjects when scheme changes
  const updateSubjects = useCallback((scheme) => {
    setLoading(true);
    try {
      const subjects = getSubjects(scheme);
      setFilteredSubjects(subjects);
    } catch (error) {
      console.error('Error updating subjects:', error);
      setFilteredSubjects([]);
    } finally {
      setLoading(false);
    }
  }, [getSubjects]);

  // Load subjects initially
  React.useEffect(() => {
    updateSubjects(selectedScheme);
  }, [selectedScheme, updateSubjects]);

  // Debounced search handler
  const handleSearch = useCallback((query) => {
    setSearchQuery(query);
    setLoading(true);

    try {
      const allSubjects = getSubjects(selectedScheme);
      const filtered = allSubjects.filter((subject) =>
        subject.name.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredSubjects(filtered);
    } catch (error) {
      console.error('Error during search:', error);
      setFilteredSubjects([]);
    } finally {
      setLoading(false);
    }
  }, [selectedScheme, getSubjects]);

  const handleSubjectPress = useCallback((subject) => {
    if (!subject?.id || !subject?.semester) {
      console.error('Invalid subject data:', subject);
      return;
    }

    Animated.sequence([
      Animated.timing(scaleValue, { 
        toValue: 0.95, 
        duration: 100, 
        useNativeDriver: true 
      }),
      Animated.timing(scaleValue, { 
        toValue: 1, 
        duration: 100, 
        useNativeDriver: true 
      }),
    ]).start(() => {
      router.push({
        pathname: '/semester/subject/[id]',
        params: { 
          id: subject.id, 
          semester: subject.semester, 
          subjectName: subject.name,
          scheme: selectedScheme 
        }
      });
    });
  }, [router, selectedScheme]);

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={[
        styles.container,
        isDarkMode && styles.containerDark
      ]}
    >
      {/* Scheme Selector */}
      <View style={[styles.schemeContainer, isDarkMode && styles.schemeContainerDark]}>
        {['2019', '2023'].map((scheme) => (
          <TouchableOpacity
            key={scheme}
            style={[
              styles.schemeButton,
              selectedScheme === scheme && styles.schemeButtonActive,
              isDarkMode && styles.schemeButtonDark
            ]}
            onPress={() => {
              setSelectedScheme(scheme);
              updateSubjects(scheme);
            }}
          >
            <Text style={[
              styles.schemeText,
              selectedScheme === scheme && styles.schemeTextActive,
              isDarkMode && styles.schemeTextDark
            ]}>
              Scheme {scheme}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Search Bar */}
      <View style={[styles.searchContainer, isDarkMode && styles.searchContainerDark]}>
        <Ionicons 
          name="search-outline" 
          size={24} 
          color={isDarkMode ? Colors.white : Colors.PRIMARY} 
        />
        <TextInput
          style={[styles.input, isDarkMode && styles.inputDark]}
          placeholder="Search subjects..."
          placeholderTextColor={isDarkMode ? '#666' : Colors.GRAY}
          value={searchQuery}
          onChangeText={handleSearch}
        />
      </View>

      {/* Loading Indicator */}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.PRIMARY} />
        </View>
      )}

      {/* Subject List */}
      {!loading && (
        filteredSubjects.length > 0 ? (
          <FlatList
            data={filteredSubjects}
            keyExtractor={(item) => `${item.semester}-${item.id}`}
            renderItem={({ item }) => (
              <TouchableOpacity 
                onPress={() => handleSubjectPress(item)} 
                activeOpacity={0.7}
              >
                <Animated.View style={[
                  styles.itemContainer, 
                  { transform: [{ scale: scaleValue }] },
                  isDarkMode && styles.itemContainerDark
                ]}>
                  <Text style={[styles.subjectName, isDarkMode && styles.subjectNameDark]}>
                    {item.name}
                  </Text>
                  <Text style={[styles.semesterText, isDarkMode && styles.semesterTextDark]}>
                    Semester: {item.semester}
                  </Text>
                </Animated.View>
              </TouchableOpacity>
            )}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons 
              name="sad-outline" 
              size={50} 
              color={isDarkMode ? Colors.white : Colors.GRAY} 
            />
            <Text style={[styles.emptyText, isDarkMode && styles.emptyTextDark]}>
              No subjects found
            </Text>
          </View>
        )
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    backgroundColor: '#f5f5f5',
  },
  containerDark: {
    backgroundColor: '#1a1a1a',
  },
  schemeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 10,
    marginHorizontal: 15,
    backgroundColor: '#f3f3f3',
    padding: 5,
    borderRadius: 15,
  },
  schemeContainerDark: {
    backgroundColor: '#333',
  },
  schemeButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 10,
  },
  schemeButtonActive: {
    backgroundColor: Colors.PRIMARY,
  },
  schemeButtonDark: {
    backgroundColor: '#444',
  },
  schemeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
  },
  schemeTextActive: {
    color: '#fff',
  },
  schemeTextDark: {
    color: '#fff',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginHorizontal: 15,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 4,
  },
  searchContainerDark: {
    backgroundColor: '#333',
    borderColor: '#444',
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    paddingBottom: 20,
  },
  itemContainer: {
    padding: 15,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginHorizontal: 15,
    marginVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 5,
    borderLeftColor: Colors.PRIMARY,
  },
  itemContainerDark: {
    backgroundColor: '#333',
    borderLeftColor: Colors.PRIMARY,
  },
  subjectName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  subjectNameDark: {
    color: '#fff',
  },
  semesterText: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  semesterTextDark: {
    color: '#999',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
  },
  emptyTextDark: {
    color: '#999',
  },
});

export default SearchScreen;
