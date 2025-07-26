import { Redirect } from 'expo-router';
import { useAuth } from './providers/AuthProvider';
import { ActivityIndicator } from 'react-native';

// This route catches the root path ("/") and immediately redirects the user
// to our intended initial screen. Adjust the destination as needed.
export default function Index() {
  const { session, loading } = useAuth();
  console.log('Index render:', { session, loading });

  if (loading) {
    console.log('Auth is loading, showing ActivityIndicator');
    return <ActivityIndicator />;
  }

  if (session) {
    console.log('Session found, redirecting to (tabs)');
    return <Redirect href={'/(tabs)/home'} />;
  }

  console.log('No session, redirecting to (auth)');
  return <Redirect href={'/(auth)/signin'} />;
} 