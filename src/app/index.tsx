import { Redirect } from 'expo-router';
import { useAuth } from './providers/AuthProvider';
import { ActivityIndicator } from 'react-native';

// This route catches the root path ("/") and immediately redirects the user
// to our intended initial screen. Adjust the destination as needed.
export default function Index() {
  const { session, loading } = useAuth();

  if (loading) {
    return <ActivityIndicator />;
  }

  if (session) {
    return <Redirect href={'/(tabs)/home'} />;
  }

  return <Redirect href={'/(auth)/signin'} />;
} 