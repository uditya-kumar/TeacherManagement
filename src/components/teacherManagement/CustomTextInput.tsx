import { StyleSheet, useColorScheme, TextInput } from "react-native";
import React from "react";
import Colors from "@/constants/Colors";

type CustomTextInputProps = {
  value: string,
  onChangeText: React.Dispatch<React.SetStateAction<string>>,
  placeholder: string,
  style?: object;

}

const CustomTextInput = ({value, onChangeText, placeholder, style}: CustomTextInputProps) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={colorScheme === "dark" ? "#9ca3af" : "#6b7280"}
      autoCorrect={false}
      style={[
        styles.searchInput,
        {
          backgroundColor: colors.cardBackground,
          borderColor: colors.borderColor,
          color: colors.text,
        },
        style,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  searchInput: {
    marginTop: 10,
    height: 47,
    borderRadius: 10,
    borderWidth: 1,
    paddingLeft: 15,
    fontSize: 15,
  },
});

export default CustomTextInput;
