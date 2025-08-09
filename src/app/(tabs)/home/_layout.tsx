import React from "react";
import { Link, Stack } from "expo-router";
import { Pressable } from "react-native";
import { FolderHeart } from "lucide-react-native";
import Colors from "@/constants/Colors";
import { useColorScheme } from "@/components/useColorScheme";



export default function TabLayout() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTitleStyle: { color: colors.text },
        headerTintColor: colors.text,
        headerRight: () => (
          <Link href="/home/favorites" asChild>
            <Pressable>
              {({ pressed }) => (
                <FolderHeart
                  size={25}
                  color={colors.text}
                  style={{ marginRight: 15, opacity: pressed ? 0.5 : 1 }}
                />
              )}
            </Pressable>
          </Link>
        ),
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
