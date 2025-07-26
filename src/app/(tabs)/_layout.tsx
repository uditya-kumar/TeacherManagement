import React from 'react';
import Feather from '@expo/vector-icons/Feather';
import { Tabs, Redirect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';
import { View } from 'react-native';
import { useAuth } from "../providers/AuthProvider";
import { ActivityIndicator } from 'react-native';

// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
function TabBarIcon(props: {
  name: React.ComponentProps<typeof Feather>['name'];
  color: string;
}) {
  return <Feather size={17} style={{ marginBottom: -3 }} {...props} />;
}


export default function TabLayout() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const insets = useSafeAreaInsets();

  const { session, loading } = useAuth();
  console.log('(tabs)/_layout render:', { session, loading });

  if (loading) {
    console.log('(tabs)/_layout: Auth is loading, showing ActivityIndicator');
    return <ActivityIndicator />;
  }

  if (!session) {
    console.log('No session in (tabs)/_layout, redirecting to /auth/signin');
    return <Redirect href={'/(auth)/signin'} />;
  }

  return (
    <View style={{ backgroundColor: colors.background, flex: 1 }}>
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.text,
         tabBarStyle: {
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          borderTopWidth: 1,
          borderColor: colorScheme === 'dark' ? Colors.dark.borderColor : Colors.light.borderColor,
          backgroundColor: colors.background, 
        },
        tabBarLabelStyle: {
          fontSize: 12,
        },
        // Disable the static render of the header on web
        // to prevent a hydration error in React Navigation v6.
        headerShown: useClientOnlyValue(false, true),
      }}>
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          headerShown: false,
          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          headerShown: false,
          tabBarIcon: ({ color }) => <TabBarIcon name="user" color={color} />,
        }}
      />
    </Tabs>
    </View>
  );
}
