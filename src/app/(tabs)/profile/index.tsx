import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
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

const ProfilePage = () => {
  return (
    <View style={styles.container}>
      <View style={styles.profileCircle}>
        <User color="#ffffff" size={37} />
      </View>
      <Text style={styles.username}>uditya.23bce10497</Text>

      <View style={styles.card}>
        <Pressable style={styles.row}>
          <View style={styles.rowLeft}>
            <BookOpen size={20} color="#000" style={styles.icon} />
            <Text style={styles.rowText}>Teachers Reviewed</Text>
          </View>
          <ChevronRight size={20} color="#6b7280" />
        </Pressable>

        <Pressable style={styles.row}>
          <View style={styles.rowLeft}>
            <Plus size={20} color="#000" style={styles.icon} />
            <Text style={styles.rowText}>Teachers Created</Text>
          </View>
          <ChevronRight size={20} color="#6b7280" />
        </Pressable>

        <Pressable style={styles.row}>
          <View style={styles.rowLeft}>
            <Bug size={20} color="#000" style={styles.icon} />
            <Text style={styles.rowText}>Report a Bug</Text>
          </View>
          <ChevronRight size={20} color="#6b7280" />
        </Pressable>

        <Pressable style={styles.row}>
          <View style={styles.rowLeft}>
            <Info size={20} color="#000" style={styles.icon} />
            <Text style={styles.rowText}>About DEV</Text>
          </View>
          <ChevronRight size={20} color="#6b7280" />
        </Pressable>
      </View>

      <Pressable style={styles.signOutButton}>
        <View style={styles.rowLeft}>
          <LogOut size={20} color="#ef4444" style={styles.icon} />
          <Text style={styles.signOutText}>Sign Out</Text>
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
    backgroundColor: Colors.light.background,
    alignItems: "center",
    justifyContent: "center",
  },
  profileCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "black",
    justifyContent: "center",
    alignItems: "center",
  },
  username: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
  },
  card: {
    width: "100%",
    marginTop: 24,
    borderWidth: 1,
    borderColor: Colors.light.borderColor,
    borderRadius: 12,
    backgroundColor: Colors.light.background,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 22,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.borderColor,
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
    color: "#000000",
  },
  rowRightText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000000",
  },
  signOutButton: {
    marginTop: 30,
  },
  signOutText: {
    fontSize: 16,
    color: Colors.light.error,
    fontWeight: "600",
  },
});

export default ProfilePage;
