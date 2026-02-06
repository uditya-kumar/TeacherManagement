import React, { memo, useMemo, useEffect, useState, useCallback } from 'react';
import { Feather } from '@expo/vector-icons';
import { Tabs, Redirect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuth } from "../../providers/AuthProvider";
import AppToast from '@/components/teacherManagement/Toast';
import { subscribeToast } from '@/libs/toastService';

// Memoized tab icon to prevent unnecessary re-renders
const TAB_ICON_SIZE = 20;
const TabBarIcon = memo(({ name, color }: { name: 'home' | 'user'; color: string }) => {
  return <Feather name={name} color={color} size={TAB_ICON_SIZE} />;
});
TabBarIcon.displayName = 'TabBarIcon';


export default function TabLayout() {
  const { colorScheme } = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const insets = useSafeAreaInsets();

  const { session, loading } = useAuth();

  // ALL HOOKS MUST BE CALLED BEFORE ANY CONDITIONAL RETURNS
  // Memoize tabBarStyle to prevent new object on every render
  const tabBarStyle = useMemo(() => ({
    height: 60 + insets.bottom,
    paddingBottom: insets.bottom,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: 1,
    borderColor: colorScheme === 'dark' ? Colors.dark.borderColor : Colors.light.borderColor,
    backgroundColor: colors.background,
  }), [insets.bottom, colorScheme, colors.background]);

  // Memoize icon render functions to prevent new references
  const renderHomeIcon = useCallback(({ color }: { color: string }) => (
    <TabBarIcon name="home" color={color} />
  ), []);

  const renderProfileIcon = useCallback(({ color }: { color: string }) => (
    <TabBarIcon name="user" color={color} />
  ), []);

  // Conditional returns AFTER all hooks
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large"/>
      </View>
    );
  }

  if (!session) {
    return <Redirect href={'/(auth)/signin'} />;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
    <Tabs
      screenOptions={{
        // Removed popToTopOnBlur - it causes full re-renders on tab switch
        tabBarActiveTintColor: colors.text,
        tabBarStyle,
        tabBarLabelStyle: styles.tabBarLabel,
        // Lazy load screens - don't mount until first visit
        lazy: true,
      }}>
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          animation: "fade", // Lighter animation than "shift"
          headerShown: false,
          tabBarIcon: renderHomeIcon,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          animation: "fade", // Lighter animation than "shift"
          headerShown: false,
          tabBarIcon: renderProfileIcon,
        }}
      />
    </Tabs>
    <RootToastHost />
    </View>
  );
}

// Memoized toast host to prevent re-renders from parent
const RootToastHost = memo(function RootToastHost() {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [duration, setDuration] = useState(1500);

  useEffect(() => {
    const unsub = subscribeToast((msg, dur) => {
      setMessage(msg);
      setDuration(dur ?? 1500);
      setVisible(true);
    });
    return unsub;
  }, []);

  // Stable callback reference
  const handleHide = useCallback(() => setVisible(false), []);

  return (
    <AppToast
      visible={visible}
      message={message}
      durationMs={duration}
      onHide={handleHide}
    />
  );
});

// Hoisted static styles (per skills best practice)
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabBarLabel: {
    fontSize: 12,
  },
});
