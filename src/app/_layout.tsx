import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider as NavigationThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
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

export default function RootLayout() {
  const [loaded, error] = useFonts({});

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

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

  return (
    <>
      <StatusBar style={isDark ? "light" : "dark"} />
      <NavigationThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
        <AuthProvider>
          <QueryProvider>
            <FavoriteProvider>
              <Stack>
                <Stack.Screen name="index" options={{ headerShown: false }} />
                <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              </Stack>
            </FavoriteProvider>
          </QueryProvider>
        </AuthProvider>
      </NavigationThemeProvider>
    </>
  );
}
