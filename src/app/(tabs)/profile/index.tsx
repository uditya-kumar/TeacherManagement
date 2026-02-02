import React, { useState, useCallback } from "react";
import { Image } from "expo-image";
import { View, Text, StyleSheet, Pressable, Switch } from "react-native";
import * as WebBrowser from "expo-web-browser";
import { router } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { Feather, Ionicons, MaterialIcons } from "@expo/vector-icons";
import Colors from "@/constants/Colors";
import { useTheme } from "@/providers/ThemeProvider";
import { useAuth } from "@/providers/AuthProvider";
import { supabase } from "@/libs/supabase";
import Skeleton from "@/components/teacherManagement/Skeleton";

const ProfilePage = () => {
  const { colorScheme, toggleTheme } = useTheme();
  const colors = Colors[colorScheme ?? "light"];
  const isDark = colorScheme === "dark";
  const { profile, loading: profileLoading } = useAuth();
  const [avatarError, setAvatarError] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  // Prevent stacking by resetting guard when this screen gains focus
  useFocusEffect(
    useCallback(() => {
      setIsNavigating(false);
    }, [])
  );

  const navigateOnce = useCallback(
    (path: Parameters<typeof router.push>[0]) => {
      if (isNavigating) return;
      setIsNavigating(true);
      router.push(path);
    },
    [isNavigating]
  );

  const handleSignOut = useCallback(async () => {
    await supabase.auth.signOut();
    router.replace("/");
  }, []);

  // Theme-aware colors
  const iconColor = colors.text;
  const chevronColor = isDark ? "#9ca3af" : "#6b7280";
  const profileCircleBackground = isDark ? "#374151" : "#000000";
  const profileCircleIconColor = isDark ? "#e5e7eb" : "#ffffff";

  // Check if profile data is still loading
  const isProfileLoading = profileLoading || !profile;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Avatar - Skeleton or actual content */}
      {isProfileLoading ? (
        <Skeleton width={100} height={100} borderRadius={50} />
      ) : (
        <View
          style={[
            styles.profileCircle,
            { backgroundColor: profileCircleBackground },
          ]}
        >
          {profile?.avatar_url && !avatarError ? (
            <Image
              source={{ uri: profile.avatar_url }}
              style={styles.avatar}
              contentFit="cover"
              onError={() => setAvatarError(true)}
            />
          ) : (
            <Feather name="user" color={profileCircleIconColor} size={37} />
          )}
        </View>
      )}

      {/* Username - Skeleton or actual content */}
      {isProfileLoading ? (
        <Skeleton width={120} height={20} borderRadius={6} style={{ marginTop: 10 }} />
      ) : (
        <Text style={[styles.username, { color: colors.text }]}>
          {profile?.full_name}
        </Text>
      )}

      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.cardBackground,
            borderColor: colors.borderColor,
          },
        ]}
      >
        {/* Teachers Reviewed */}
        <Pressable
          disabled={isNavigating}
          style={[styles.row, { borderBottomColor: colors.borderColor }]}
          onPress={() => navigateOnce("/profile/teachersReviewed")}
        >
          <View style={styles.rowLeft}>
            <Feather name="book-open" size={20} color={iconColor} style={styles.icon} />
            <Text style={[styles.rowText, { color: colors.text }]}>
              Teachers Reviewed
            </Text>
          </View>
          <Feather name="chevron-right" size={20} color={chevronColor} />
        </Pressable>

        {/* Teachers Created */}
        <Pressable
          disabled={isNavigating}
          style={[styles.row, { borderBottomColor: colors.borderColor }]}
          onPress={() => navigateOnce("/profile/teachersCreated")}
        >
          <View style={styles.rowLeft}>
            <Feather name="plus" size={20} color={iconColor} style={styles.icon} />
            <Text style={[styles.rowText, { color: colors.text }]}>
              Teachers Created
            </Text>
          </View>
          <Feather name="chevron-right" size={20} color={chevronColor} />
        </Pressable>

        {/* Theme Toggle */}
        <View
          style={[styles.row, { borderBottomColor: colors.borderColor }]}
        >
          <View style={styles.rowLeft}>
            {isDark ? (
              <Feather name="moon" size={20} color={iconColor} style={styles.icon} />
            ) : (
              <Feather name="sun" size={20} color={iconColor} style={styles.icon} />
            )}
            <Text style={[styles.rowText, { color: colors.text }]}>
              Theme
            </Text>
          </View>
          <View style={styles.themeToggleRight}>
            <Text style={[styles.themeLabel, { color: isDark ? "#9ca3af" : "#6b7280" }]}>
              {isDark ? "Dark" : "Light"}
            </Text>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: "#767577", true: "#009dffff" }}
              thumbColor={isDark ? "#ffffffff" : "#f4f3f4"}
            />
          </View>
        </View>

        {/* Report Bug */}
        <Pressable
          disabled={isNavigating}
          style={[styles.row, { borderBottomColor: colors.borderColor }]}
          onPress={() => navigateOnce("/profile/reportBug")}
        >
          <View style={styles.rowLeft}>
            <Ionicons name="bug-outline" size={20} color={iconColor} style={styles.icon} />
            <Text style={[styles.rowText, { color: colors.text }]}>
              Report a Bug
            </Text>
          </View>
          <Feather name="chevron-right" size={20} color={chevronColor} />
        </Pressable>

        {/* About Dev */}
        <Pressable
          disabled={isNavigating}
          style={[styles.row, styles.lastRow]}
          onPress={() => WebBrowser.openBrowserAsync("https://github.com/uditya2004")}
        >
          <View style={styles.rowLeft}>
            <Feather name="info" size={20} color={iconColor} style={styles.icon} />
            <Text style={[styles.rowText, { color: colors.text }]}>
              About DEV
            </Text>
          </View>
          <Feather name="chevron-right" size={20} color={chevronColor} />
        </Pressable>
      </View>

      <Pressable
        style={styles.signOutButton}
        onPress={handleSignOut}
      >
        <View style={styles.rowLeft}>
          <Feather name="log-out" size={20} color={colors.error} style={styles.icon} />
          <Text style={[styles.signOutText, { color: colors.error }]}>
            Sign Out
          </Text>
        </View>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  profileCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  username: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: "600",
  },
  card: {
    width: "100%",
    marginTop: 24,
    borderWidth: 1,
    borderRadius: 12,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 22,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  lastRow: {
    borderBottomWidth: 0,
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    marginRight: 12,
  },
  rowText: {
    fontSize: 16,
  },
  themeToggleRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  themeLabel: {
    fontSize: 14,
    fontWeight: "500",
  },
  rowRightText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  signOutButton: {
    marginTop: 30,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: "600",
  },
});

export default ProfilePage;
