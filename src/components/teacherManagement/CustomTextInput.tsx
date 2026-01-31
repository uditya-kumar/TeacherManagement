import { StyleSheet, TextInput } from "react-native";
import React from "react";
import Colors from "@/constants/Colors";
import { useColorScheme } from "@/components/useColorScheme";

type CustomTextInputProps = {
  value: string,
  onChangeText: React.Dispatch<React.SetStateAction<string>>,
  placeholder: string,
  style?: object;
  editable?: boolean;
}

const CustomTextInput = ({value, onChangeText, placeholder, style, editable = true}: CustomTextInputProps) => {
  const { colorScheme } = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={colorScheme === "dark" ? "#9ca3af" : "#6b7280"}
      autoCorrect={false}
      editable={editable}
      style={[
        styles.searchInput,
        {
          backgroundColor: colors.cardBackground,
          borderColor: colors.borderColor,
          color: colors.text,
          opacity: editable ? 1 : 0.6,
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
