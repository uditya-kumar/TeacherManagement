import { View, Text, StyleSheet } from "react-native";
import React, { useCallback, useMemo } from "react";
import { router } from "expo-router";
import { useFavorite } from "../../../providers/FavoriteProvider";
import Colors from "@/constants/Colors";
import { Feather } from "@expo/vector-icons";
import TeacherCard from "@/components/teacherManagement/TeacherCard";
import { useColorScheme } from "@/components/useColorScheme";
import { Tables } from "@/types";
import { LegendList, LegendListRenderItemProps } from "@legendapp/list";

const Favorites = () => {
  const { favorites, toggleFavorite } = useFavorite();
  const { colorScheme } = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const isDark = colorScheme === "dark";

  // Theme-aware colors
  const secondaryTextColor = isDark ? "#9ca3af" : "#6B7280";

  // Memoize style objects
  const containerStyle = useMemo(() => [styles.container, { backgroundColor: colors.background }], [colors.background]);
  const emptyContainerStyle = useMemo(() => [styles.emptyContainer, { backgroundColor: colors.background }], [colors.background]);
  const headerTextStyle = useMemo(() => [styles.headerText, { color: secondaryTextColor }], [secondaryTextColor]);
  const emptyStateTextStyle = useMemo(() => [styles.emptyStateText, { color: secondaryTextColor }], [secondaryTextColor]);
  const emptyIconColor = isDark ? "#4b5563" : colors.borderColor;

  // Memoize ListHeaderComponent to prevent recreation
  const ListHeaderComponent = useMemo(() => (
    <Text style={headerTextStyle}>
      {favorites.length} teachers
    </Text>
  ), [headerTextStyle, favorites.length]);

  const handleToggleFavorite = useCallback((teacher: Tables<"teachers">) => {
    toggleFavorite(teacher);
  }, [toggleFavorite]);

  const handleRateTeacher = useCallback((teacherId: string) => {
    router.push({ pathname: "/home/rate/[id]", params: { id: teacherId, from: "/home/favorites" } });
  }, []);

  const handleViewDetails = useCallback((teacherId: string) => {
    router.push(`/home/view/${teacherId}`);
  }, []);

  // Stable keyExtractor
  const keyExtractor = useCallback((item: Tables<"teachers">) => item.id, []);

  // Memoized renderItem for performance
  const renderItem = useCallback(
    ({ item }: LegendListRenderItemProps<Tables<"teachers">>) => (
      <TeacherCard
        teacher={item}
        isFavorite={true}
        onToggleFavorite={handleToggleFavorite}
        onRateTeacher={handleRateTeacher}
        onViewDetails={handleViewDetails}
      />
    ),
    [handleToggleFavorite, handleRateTeacher, handleViewDetails]
  );

  // Memoize empty state to prevent recreation
  const EmptyState = useMemo(() => (
    <View style={emptyContainerStyle}>
      <Text style={headerTextStyle}>0 teachers</Text>
      <View style={styles.emptyStateContainer}>
        <Feather name="heart" size={70} color={emptyIconColor} />
        <Text style={emptyStateTextStyle}>
          Tap the heart icon on any teacher to add them to your favorites
        </Text>
      </View>
    </View>
  ), [emptyContainerStyle, headerTextStyle, emptyIconColor, emptyStateTextStyle]);

  if (favorites.length === 0) {
    return EmptyState;
  }

  return (
    <View style={containerStyle}>
      <LegendList
        data={favorites}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={ListHeaderComponent}
        recycleItems={true}
        estimatedItemSize={180}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  emptyContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  listContent: {
    gap: 16,
    paddingBottom: 10,
  },
  headerText: {
    paddingVertical: 20,
    fontSize: 17,
  },
  emptyStateContainer: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  emptyStateText: {
    paddingTop: 20,
    paddingHorizontal: 20,
    fontSize: 17,
    textAlign: "center",
  },
});

export default React.memo(Favorites);
