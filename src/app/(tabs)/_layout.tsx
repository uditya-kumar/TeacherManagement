import React from 'react';
import { User, Home } from 'lucide-react-native';
import { Tabs, Redirect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { View } from 'react-native';
import { useAuth } from "../../providers/AuthProvider";
import { ActivityIndicator } from 'react-native';
import AppToast from '@/components/teacherManagement/Toast';
import { useEffect, useState } from 'react';
import { subscribeToast } from '@/libs/toastService';

// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
const TabBarIcon = ({ name, color }: { name: 'home' | 'user'; color: string }) => {
  const size = 20;
  if (name === 'home') return <Home color={color} size={size} />;
  return <User color={color} size={size} />;
};


export default function TabLayout() {
  const { colorScheme } = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const insets = useSafeAreaInsets();

  const { session, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large"/>
      </View>
    );
  }

  if (!session) {
    return <Redirect href={'/(auth)/signin'} />;
  }

  return (
    <View style={{ backgroundColor: colors.background, flex: 1 }}>
    <Tabs
      screenOptions={{
        popToTopOnBlur: true,
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
        }
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
    <RootToastHost />
    </View>
  );
}

function RootToastHost() {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [duration, setDuration] = useState(1500);

  useEffect(() => {
    const unsub = subscribeToast((msg, duration) => {
      setMessage(msg);
      setDuration(duration ?? 1500);
      setVisible(true);
    });
    return unsub;
  }, []);

  return (
    <AppToast
      visible={visible}
      message={message}
      durationMs={duration}
      onHide={() => setVisible(false)}
    />
  );
}
