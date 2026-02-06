import React, { useMemo, useCallback } from "react";
import { Link, Stack } from "expo-router";
import { Pressable, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Colors from "@/constants/Colors";
import { useColorScheme } from "@/components/useColorScheme";

export default function HomeLayout() {
  const { colorScheme } = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  // Memoize header styles to prevent new object references
  const headerStyle = useMemo(() => ({
    backgroundColor: colors.background,
  }), [colors.background]);

  const headerTitleStyle = useMemo(() => ({
    color: colors.text,
  }), [colors.text]);

  // Memoize headerRight to prevent re-renders
  const headerRight = useCallback(() => (
    <Link href="/home/favorites" asChild>
      <Pressable>
        {({ pressed }) => (
          <MaterialCommunityIcons
            name="folder-heart-outline"
            size={27}
            color={colors.text}
            style={[styles.headerIcon, { opacity: pressed ? 0.5 : 1 }]}
          />
        )}
      </Pressable>
    </Link>
  ), [colors.text]);

  return (
    <Stack
      screenOptions={{
        headerStyle,
        headerTitleStyle,
        headerTintColor: colors.text,
        headerRight,
      }}
    >
      <Stack.Screen name="index" options={{ title: "Teacher Directory" }} />
      <Stack.Screen name="view/[id]" options={{ title: "View Detail" }} />
      <Stack.Screen name="rate/[id]" options={{ title: "Rate" }} />
      <Stack.Screen
        name="favorites"
        options={{ title: "Favorite Teachers", headerRight: undefined }}
      />
      <Stack.Screen
        name="addTeacher"
        options={{ title: "Add Teacher", headerRight: undefined }}
      />
    </Stack>
  );
}

const styles = StyleSheet.create({
  headerIcon: {
    marginRight: 15,
  },
});
