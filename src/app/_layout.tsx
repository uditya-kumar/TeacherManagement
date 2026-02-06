import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider as NavigationThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useMemo } from "react";
import "react-native-reanimated";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { ThemeProvider, useTheme } from "../providers/ThemeProvider";
import FavoriteProvider from "../providers/FavoriteProvider";
import AuthProvider from "../providers/AuthProvider";
import QueryProvider from "../providers/QueryProvider";

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  // Start the app at the root index screen. It will handle redirecting based on auth state.
  initialRouteName: "(tabs)",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Memoize static screen options to prevent new object references
const rootScreenOptions = { animation: 'simple_push' as const };
const hiddenHeaderOptions = { headerShown: false };

export default function RootLayout() {
  useEffect(() => {
    // Hide splash screen once the app is ready
    SplashScreen.hideAsync();
  }, []);

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <ThemedApp />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

function ThemedApp() {
  const { colorScheme } = useTheme();
  const isDark = colorScheme === "dark";

  // Memoize the navigation theme to prevent re-renders
  const navigationTheme = useMemo(
    () => (isDark ? DarkTheme : DefaultTheme),
    [isDark]
  );

  return (
    <>
      <StatusBar style={isDark ? "light" : "dark"} />
      <NavigationThemeProvider value={navigationTheme}>
        <AuthProvider>
          <QueryProvider>
            <FavoriteProvider>
              <Stack screenOptions={rootScreenOptions}>
                <Stack.Screen name="index" options={hiddenHeaderOptions} />
                <Stack.Screen name="(auth)" options={hiddenHeaderOptions} />
                <Stack.Screen name="(tabs)" options={hiddenHeaderOptions} />
              </Stack>
            </FavoriteProvider>
          </QueryProvider>
        </AuthProvider>
      </NavigationThemeProvider>
    </>
  );
}
