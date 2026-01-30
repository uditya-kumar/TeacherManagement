import { View, Text, StyleSheet } from "react-native";
import { Image } from "expo-image";
import React, { useState } from "react";
import Colors from "@/constants/Colors";
import GoogleButton from "@/components/teacherManagement/GoogleButton";
import { googleSignIn } from "@/libs/auth";
import Toast from "@/components/teacherManagement/Toast";
import { subscribeToast } from "@/libs/toastService";

const Signin = () => {
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastDuration, setToastDuration] = useState(1500);

  React.useEffect(() => {
    const unsubscribe = subscribeToast((message, duration = 1500) => {
      setToastMessage(message);
      setToastDuration(duration);
      setToastVisible(true);
    });
    return unsubscribe;
  }, []);

  const onSignin = async () => {
    try {
      await googleSignIn();
    } catch (err: any) {
      // Error messages are already shown via toast in auth.ts
      // Silent catch - no need to log or show anything
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

      <Toast
        visible={toastVisible}
        message={toastMessage}
        durationMs={toastDuration}
        onHide={() => setToastVisible(false)}
      />
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
