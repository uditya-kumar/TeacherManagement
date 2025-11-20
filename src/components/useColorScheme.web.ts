// Re-export the custom theme hook for web
export { useTheme as useColorScheme } from '@/app/providers/ThemeProvider';

// Helper function to get just the color scheme value
export const useColorSchemeValue = () => {
  const { colorScheme } = useColorScheme();
  return colorScheme;
};
