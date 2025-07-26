import { useAuth } from '../providers/AuthProvider';
import { Redirect, Stack } from 'expo-router';

export default function AuthLayout() {
  const { session } = useAuth();

  if (session) {
    return <Redirect href={'/(tabs)/home'} />;
  }

  return (
    <Stack>
      <Stack.Screen name="signin" options={{ headerShown: false }}/>
    </Stack>
  );
}