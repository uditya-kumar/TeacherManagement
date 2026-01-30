// Re-export the custom theme hook so all existing imports continue to work
export { useTheme as useColorScheme } from '@/providers/ThemeProvider';

// Helper function to get just the color scheme value
export const useColorSchemeValue = () => {
  const { colorScheme } = useColorScheme();
  return colorScheme;
};
