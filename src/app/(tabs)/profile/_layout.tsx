import React from "react";
import { Stack } from "expo-router";
import Colors from "@/constants/Colors";
import { useColorScheme } from "@/components/useColorScheme";

export default function TabLayout() {
  const { colorScheme } = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTitleStyle: { color: colors.text },
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
