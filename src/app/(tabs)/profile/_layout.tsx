import React, { useMemo } from "react";
import { Stack } from "expo-router";
import Colors from "@/constants/Colors";
import { useColorScheme } from "@/components/useColorScheme";

export default function ProfileLayout() {
  const { colorScheme } = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  // Memoize header styles to prevent new object references
  const headerStyle = useMemo(() => ({
    backgroundColor: colors.background,
  }), [colors.background]);

  const headerTitleStyle = useMemo(() => ({
    color: colors.text,
  }), [colors.text]);

  return (
    <Stack
      screenOptions={{
        headerStyle,
        headerTitleStyle,
      }}
    >
      <Stack.Screen name="index" options={{ title: "Profile" }} />
      <Stack.Screen name="reportBug" options={{ title: "Report Bug" }} />
      <Stack.Screen
        name="teachersCreated"
        options={{ title: "Teachers Created" }}
      />
      <Stack.Screen
        name="teachersReviewed"
        options={{ title: "Teachers Reviewed" }}
      />
    </Stack>
  );
}
