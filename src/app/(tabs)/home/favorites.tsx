import { View, Text, StyleSheet } from "react-native";
import React, { useCallback } from "react";
import { router} from "expo-router";
import { useFavorite } from "../../../providers/FavoriteProvider";
import Colors from "@/constants/Colors";
import { Heart } from "lucide-react-native";
import TeacherCard from "@/components/teacherManagement/TeacherCard";
import { useColorScheme } from "@/components/useColorScheme";
import { Tables } from "@/types";
import { LegendList, LegendListRenderItemProps } from "@legendapp/list";

const favorites = () => {
  const { favorites, toggleFavorite } = useFavorite();
  const { colorScheme } = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const isDark = colorScheme === "dark";

  // Theme-aware colors
  const secondaryTextColor = isDark ? "#9ca3af" : "#6B7280";

  const renderHeader = useCallback(() => {
    return (
      <Text style={[styles.headerText, { color: secondaryTextColor }]}>
        {favorites.length} teachers
      </Text>
    );
  }, [secondaryTextColor, favorites.length]);

  const handleToggleFavorite = useCallback((teacher: Tables<"teachers">) => {
    toggleFavorite(teacher);
  }, [toggleFavorite]);

  const handleRateTeacher = useCallback((teacherId: string) => {
    router.push({ pathname: "/home/rate/[id]", params: { id: teacherId, from: "/home/favorites" } });
  }, []);

  const handleViewDetails = useCallback((teacherId: string) => {
    router.push(`/home/view/${teacherId}`);
  }, []);

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

  if (favorites.length === 0) {
    return (
      <View
        style={[styles.emptyContainer, { backgroundColor: colors.background }]}
      >
        <Text style={[styles.headerText, { color: secondaryTextColor }]}>
          0 teachers
        </Text>

        <View style={styles.emptyStateContainer}>
          <Heart size={70} color={isDark ? "#4b5563" : colors.borderColor} />
          <Text style={[styles.emptyStateText, { color: secondaryTextColor }]}>
            Tap the heart icon on any teacher to add them to your favorites
          </Text>
        </View>
      </View>
    );
  } else {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <LegendList
          data={favorites}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={renderHeader}
          recycleItems={true}
        />
      </View>
    );
  }
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

export default favorites;
