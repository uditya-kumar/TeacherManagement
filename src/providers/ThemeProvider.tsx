import React, { createContext, useContext, useState, useEffect } from "react";
import { ColorSchemeName, useColorScheme as useDeviceColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

type ThemeContextType = {
  colorScheme: ColorSchemeName;
  toggleTheme: () => void;
  setTheme: (theme: "light" | "dark" | "system") => void;
  themePreference: "light" | "dark" | "system";
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = "@theme_preference";

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const deviceColorScheme = useDeviceColorScheme();
  const [themePreference, setThemePreference] = useState<"light" | "dark" | "system">("system");
  const [isLoaded, setIsLoaded] = useState(false);

  // Load theme preference from storage
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (savedTheme === "light" || savedTheme === "dark" || savedTheme === "system") {
          setThemePreference(savedTheme);
        }
      } catch (error) {
        console.error("Failed to load theme preference:", error);
      } finally {
        setIsLoaded(true);
      }
    };
    loadTheme();
  }, []);

  // Save theme preference to storage
  const saveTheme = async (theme: "light" | "dark" | "system") => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch (error) {
      console.error("Failed to save theme preference:", error);
    }
  };

  const setTheme = (theme: "light" | "dark" | "system") => {
    setThemePreference(theme);
    saveTheme(theme);
  };

  const toggleTheme = () => {
    const newTheme = themePreference === "dark" ? "light" : "dark";
    setTheme(newTheme);
  };

  // Determine the actual color scheme to use
  const colorScheme: ColorSchemeName =
    themePreference === "system" ? deviceColorScheme : themePreference;

  if (!isLoaded) {
    return null;
  }

  return (
    <ThemeContext.Provider
      value={{
        colorScheme,
        toggleTheme,
        setTheme,
        themePreference,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
