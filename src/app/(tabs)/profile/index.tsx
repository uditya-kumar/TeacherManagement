import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Link, router } from "expo-router";
import {
  User,
  BookOpen,
  Plus,
  Bug,
  Info,
  LogOut,
  ChevronRight,
} from "lucide-react-native";
import Colors from "@/constants/Colors";
import { useColorScheme } from "@/components/useColorScheme";

const ProfilePage = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const isDark = colorScheme === 'dark';

  // Theme-aware colors
  const iconColor = colors.text;
  const chevronColor = isDark ? '#9ca3af' : '#6b7280';
  const profileCircleBackground = isDark ? '#374151' : '#000000';
  const profileCircleIconColor = isDark ? '#e5e7eb' : '#ffffff';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[
        styles.profileCircle,
        { backgroundColor: profileCircleBackground }
      ]}>
        <User color={profileCircleIconColor} size={37} />
      </View>
      <Text style={[styles.username, { color: colors.text }]}>uditya.23bce10497</Text>

      <View style={[
        styles.card,
        {
          backgroundColor: colors.cardBackground,
          borderColor: colors.borderColor,
        }
      ]}>

        {/* Teachers Reviewed */}
        <Pressable style={[
          styles.row,
          { borderBottomColor: colors.borderColor }
        ]}
        onPress={() => router.push('/profile/teachersReviewed')}
        >
          <View style={styles.rowLeft}>
            <BookOpen size={20} color={iconColor} style={styles.icon} />
            <Text style={[styles.rowText, { color: colors.text }]}>Teachers Reviewed</Text>
          </View>
          <ChevronRight size={20} color={chevronColor} />
        </Pressable>
        
        {/* Teachers Created */}
        <Pressable style={[
          styles.row,
          { borderBottomColor: colors.borderColor }
        ]}
        onPress={() => router.push('/profile/teachersCreated')}
        >
          <View style={styles.rowLeft}>
            <Plus size={20} color={iconColor} style={styles.icon} />
            <Text style={[styles.rowText, { color: colors.text }]}>Teachers Created</Text>
          </View>
          <ChevronRight size={20} color={chevronColor} />
        </Pressable>
        
        {/* Report Bug */}
        <Pressable style={[
          styles.row,
          { borderBottomColor: colors.borderColor }
        ]}
        onPress={() => router.push('/profile/reportBug')}
        >
          <View style={styles.rowLeft}>
            <Bug size={20} color={iconColor} style={styles.icon} />
            <Text style={[styles.rowText, { color: colors.text }]}>Report a Bug</Text>
          </View>
          <ChevronRight size={20} color={chevronColor} />
        </Pressable>

        {/* About Dev */}
        <Pressable style={[styles.row, styles.lastRow]}>
          <View style={styles.rowLeft}>
            <Info size={20} color={iconColor} style={styles.icon} />
            <Text style={[styles.rowText, { color: colors.text }]}>About DEV</Text>
          </View>
          <ChevronRight size={20} color={chevronColor} />
        </Pressable>
      </View>

      <Pressable style={styles.signOutButton} onPress={() => console.log('signing out')}>
        <View style={styles.rowLeft}>
          <LogOut size={20} color={colors.error} style={styles.icon} />
          <Text style={[styles.signOutText, { color: colors.error }]}>Sign Out</Text>
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
