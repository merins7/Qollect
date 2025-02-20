import { LogBox } from 'react-native';

// Ignore specific warnings
LogBox.ignoreLogs([
    'Firestore (11.2.0): enableIndexedDbPersistence()',
    'Route "./components/Header.jsx" is missing',
]); 