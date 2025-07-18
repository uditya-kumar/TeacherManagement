// components/Button.tsx
import React from 'react';
import { Text, StyleSheet, Pressable } from 'react-native';
import * as LucideIcons from 'lucide-react-native';
import { LucideIcon } from 'lucide-react-native';

interface ButtonProps {
  text: string;
  textColor: string;
  backgroundColor: string;
  borderColor?: string;
  icon: keyof typeof LucideIcons;
  onPress?: () => void;
}

const CustomButton: React.FC<ButtonProps> = ({
  text,
  textColor,
  backgroundColor,
  borderColor = 'transparent',
  icon,
  onPress,
}) => {
  const IconComponent = LucideIcons[icon] as LucideIcon;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor,
          borderColor,
          borderWidth: borderColor !== 'transparent' ? 1 : 0,
          opacity: pressed ? 0.9 : 1
        },
      ]}
      onPress={onPress}
    >
      <IconComponent color={textColor} size={18} style={styles.icon} />
      <Text style={[styles.text, { color: textColor }]}>{text}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
  },
  icon: {
    marginRight: 10,
  },
  text: {
    fontWeight: '600',
    fontSize: 14,
  },
});

export default CustomButton;
