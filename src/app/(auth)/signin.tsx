import { View, Text, useColorScheme, StyleSheet, Alert } from "react-native";
import React from "react";
import Colors from "@/constants/Colors";
import GoogleButton from "@/components/teacherManagement/GoogleButton";
import { googleSignIn } from "@/libs/auth";

const Signin = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const onSignin = async () => {
    try {
      await googleSignIn();
      Alert.alert("Success", "You are now signed in!");
    } catch (err: any) {
      console.error("OAuth error:", err);
      Alert.alert("Error", err.message);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.centerContent}>
        <Text style={styles.title}>Helooo</Text>
      </View>
      <View style={styles.bottomButton}>
        <GoogleButton onPress={onSignin} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  bottomButton: {
    paddingBottom: 40,
    width: "90%",
  },
});
export default Signin;
