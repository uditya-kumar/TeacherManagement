// components/Button.tsx
import React from "react";
import { Text, StyleSheet, Pressable, ActivityIndicator } from "react-native";
import * as LucideIcons from "lucide-react-native";
import { LucideIcon } from "lucide-react-native";

interface ButtonProps {
  text: string;
  textColor: string;
  backgroundColor: string;
  borderColor?: string;
  icon: keyof typeof LucideIcons;
  onPress?: () => void;
  paddingVertical?: number;
  loading?: boolean;
  hideIconOnLoading?: boolean;
}

const CustomButton: React.FC<ButtonProps> = ({
  text,
  textColor,
  backgroundColor,
  borderColor = "transparent",
  icon,
  onPress,
  paddingVertical = 11,
  loading = false,
  hideIconOnLoading = false,
}) => {
  const IconComponent = LucideIcons[icon] as LucideIcon;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        {
          paddingVertical,
          backgroundColor,
          borderColor,
          borderWidth: borderColor !== "transparent" ? 1 : 0,
          opacity: pressed ? 0.9 : 1,
        },
      ]}
      onPress={!loading ? onPress : undefined}
    >
      {!(loading && hideIconOnLoading) && (
        <IconComponent color={textColor} size={18} style={styles.icon} />
      )}
      <Text style={[styles.text, { color: textColor }]}>{text}</Text>

      {loading && (
        <ActivityIndicator
          size="small"
          color={textColor}
          style={styles.spinner}
        />
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    borderRadius: 10,
    justifyContent: "center",
  },
  spinner: {
    marginLeft: 10, // ← push spinner to right of text
  },
  icon: {
    marginRight: 10,
  },
  text: {
    fontWeight: "600",
    fontSize: 14,
  },
});

export default CustomButton;
