import React from "react";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Link, Stack, Tabs } from "expo-router";
import { Pressable } from "react-native";

import Colors from "@/constants/Colors";
import { useColorScheme } from "@/components/useColorScheme";
import { useClientOnlyValue } from "@/components/useClientOnlyValue";

// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>["name"];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTitleStyle: { color: colors.text },
      }}
    >
      <Stack.Screen name="index" options={{ title: "Profile" }} />
      <Stack.Screen name="reportBug" options={{ title: "Report Bug" }} />
      <Stack.Screen name="teachersCreated" options={{ title: "Teachers Created" }} />
      <Stack.Screen name="teachersReviewed" options={{ title: "Teachers Reviewed" }} />
    </Stack>
  );
}
