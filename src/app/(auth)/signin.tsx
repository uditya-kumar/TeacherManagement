import { View, Text, useColorScheme, StyleSheet, Pressable, Image } from "react-native";
import React from "react";
import Colors from "@/constants/Colors";


const GoogleButton = ({ onPress }: { onPress: () => void }) => {
  return (
    <Pressable style={styles.button} onPress={onPress}>
      <View style={styles.content}>
        <Image
          source={require('@assets/images/googleLogo.png')}
          style={styles.icon}
        />
        <Text style={styles.text}>Continue with Google</Text>
      </View>
    </Pressable>
  );
};
const signin = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const signin = () => {
    console.log("Signing In");
  };
  return (
    <View style = {[styles.container, {backgroundColor: colors.background}]}>
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
    alignItems: 'center',
  },
    button: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 30,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
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
    width: '90%'
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    width: 20,
    height: 20,
    marginRight: 10,
  },
  text: {
    color: "#000",
    fontSize: 16,
    fontWeight: "500",
  },
})
export default signin;
