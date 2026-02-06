// components/Button.tsx
import React, { useMemo } from "react";
import { Text, StyleSheet, Pressable, ActivityIndicator, ViewStyle } from "react-native";
import { Feather } from "@expo/vector-icons";
import type { ComponentProps } from "react";

type FeatherIconName = ComponentProps<typeof Feather>["name"];
export type AllowedIconName = "plus" | "send" | "eye" | "user-check" | "trash-2";

interface ButtonProps {
  text: string;
  textColor: string;
  backgroundColor: string;
  borderColor?: string;
  icon?: AllowedIconName;
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
  // Memoize the base style to avoid recreating object on every render
  const baseStyle = useMemo<ViewStyle>(
    () => ({
      paddingVertical,
      backgroundColor,
      borderColor,
      borderWidth: borderColor !== "transparent" ? 1 : 0,
    }),
    [paddingVertical, backgroundColor, borderColor]
  );

  // Memoize text style to avoid inline object
  const textStyle = useMemo(
    () => [styles.text, { color: textColor }],
    [textColor]
  );

  // Show icon only when: icon is defined AND (not loading OR not hideIconOnLoading)
  const showIcon = icon && !(loading && hideIconOnLoading);

  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        baseStyle,
        pressed && styles.pressed,
      ]}
      onPress={!loading ? onPress : undefined}
    >
      {showIcon ? (
        <Feather name={icon} color={textColor} size={18} style={styles.icon} />
      ) : null}
      <Text style={textStyle}>{text}</Text>

      {loading ? (
        <ActivityIndicator
          size="small"
          color={textColor}
          style={styles.spinner}
        />
      ) : null}
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
  pressed: {
    opacity: 0.9,
  },
  spinner: {
    marginLeft: 10,
  },
  icon: {
    marginRight: 6,
  },
  text: {
    fontWeight: "600",
    fontSize: 14,
  },
});

export default React.memo(CustomButton);
