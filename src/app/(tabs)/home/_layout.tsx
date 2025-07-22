import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Link, Stack, Tabs } from 'expo-router';
import { Pressable } from 'react-native';
import { FolderHeart } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';

// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
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
      <Stack.Screen name="favorites" options={{ title: "Favorite Teachers", headerRight: undefined }} />
      <Stack.Screen name="addTeacher" options={{ title: "Add Teacher", headerRight: undefined }} />
    </Stack>
  );
}
