import {
  View,
  Text,
  useColorScheme,
  StyleSheet,
  Pressable,
  Image,
} from "react-native";
import React from "react";
import Colors from "@/constants/Colors";

const GoogleButton = ({ onPress }: { onPress: () => void }) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  return (
    <Pressable
      style={[
        styles.button,
        {
          borderColor: colors.borderColor,
          backgroundColor: colors.cardBackground,
        },
      ]}
      onPress={onPress}
    >
      <View style={styles.content}>
        <Image
          source={require("@assets/images/googleLogo.png")}
          style={styles.icon}
        />
        <Text style={[styles.text, { color: colors.text }]}>
          Continue with Google
        </Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    borderWidth: 1,
    borderRadius: 30,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
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
    fontSize: 16,
    fontWeight: "500",
  },
});
export default GoogleButton;
