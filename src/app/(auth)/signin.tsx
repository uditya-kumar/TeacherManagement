import { View, Text, StyleSheet, Image } from "react-native";
import React from "react";
import Colors from "@/constants/Colors";
import GoogleButton from "@/components/teacherManagement/GoogleButton";
import { googleSignIn } from "@/libs/auth";

const Signin = () => {
  const onSignin = async () => {
    try {
      await googleSignIn();
    } catch (err: any) {
      console.error("OAuth error:", err);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.centerContent}>
        <Image
          source={require("@assets/images/onboarding.png")}
          style={styles.logo}
        />
        <Text style={styles.title}>Welcome to Vitsify</Text>
        <Text style={styles.subtitle}>
          Find your teacher’s cabin, get in touch, rate them, and see what
          others think
        </Text>
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
    backgroundColor: Colors.light.background,
  },
  logo: {
    width: 350,
    height: 350,
    borderRadius: 100,
    marginBottom: 20,
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#0F172A",
    fontFamily: "Montserrat-SemiBold",
  },
  subtitle: {
    fontSize: 15,
    fontFamily: "Montserrat-Regular",
    textAlign: "center",
    marginTop: 12,
    paddingHorizontal: 17,
    color: "#0F172A",
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 100,
  },
  bottomButton: {
    paddingBottom: 40,
    width: "90%",
  },
});
export default Signin;
