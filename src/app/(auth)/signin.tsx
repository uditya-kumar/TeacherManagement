import {
  View,
  Text,
  useColorScheme,
  StyleSheet,
} from "react-native";
import React from "react";
import Colors from "@/constants/Colors";
import GoogleButton from "@/components/teacherManagement/GoogleButton";

const signin = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const signin = () => {
    console.log("Signing In");
  };
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.centerContent}>
        <Text style={styles.title}>Helooo</Text>
      </View>
      <View style={styles.bottomButton}>
        <GoogleButton onPress={signin} />
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
  }
});
export default signin;
