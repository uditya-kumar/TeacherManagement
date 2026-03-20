import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import React, { useCallback, useEffect, useState, useMemo } from "react";
import TeacherCard from "@/components/teacherManagement/TeacherCard";
import TeacherCardSkeleton from "@/components/teacherManagement/TeacherCardSkeleton";
import { useAuth } from "@/providers/AuthProvider";
import {
  useTeachersReviewedByUser,
  useDeleteUserRatingForTeacher,
} from "@/api/teachers/profile";
import Colors from "@/constants/Colors";
import { useColorScheme } from "@/components/useColorScheme";
import { router } from "expo-router";
import { Tables } from "@/types";
import { useFavorite } from "@/providers/FavoriteProvider";
import { LegendList, LegendListRenderItemProps } from "@legendapp/list";



const TeachersReviewed = () => {
  const { profile } = useAuth();
  const { colorScheme } = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const { favoriteIds, toggleFavorite } = useFavorite();

  // Convert to Set for O(1) lookup - memoized for stable reference
  const favoriteIdsSet = useMemo(() => new Set(favoriteIds), [favoriteIds]);

  const {
    data: teachers,
    isLoading,
    error,
  } = useTeachersReviewedByUser(profile?.id);
  const { mutate: deleteRating, isPending: deleting } =
    useDeleteUserRatingForTeacher(profile?.id);

  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());

  const handleToggleFavorite = useCallback((teacher: Tables<"teachers">) => {
    toggleFavorite(teacher);
  }, [toggleFavorite]);

  const handleRateTeacher = useCallback((teacherId: string) => {
    router.push({
      pathname: "/home/rate/[id]",
      params: { id: teacherId, from: "/profile/teachersReviewed" },
    });
  }, []);

  const handleDeleteRating = useCallback(
    (teacherId: string) => {
      Alert.alert(
        "Delete Rating",
        "Are you sure you want to delete your rating? This action cannot be undone.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: () => {
              setDeletingIds((prev) => new Set(prev).add(teacherId));
              deleteRating(
                { teacherId },
                {
                  onError: () =>
                    setDeletingIds((prev) => {
                      const next = new Set(prev);
                      next.delete(teacherId);
                      return next;
                    }),
                }
              );
            },
          },
        ]
      );
    },
    [deleteRating]
  );

  const handleViewDetails = useCallback((teacherId: string) => {
    router.push(`/home/view/${teacherId}`);
  }, []);

  // Memoized renderItem for performance
  const renderItem = useCallback(
    ({ item }: LegendListRenderItemProps<Tables<"teachers">>) => {
      const isDeletingThis = deletingIds.has(item.id);
      return (
        <TeacherCard
          teacher={item}
          favoriteIdsSet={favoriteIdsSet}
          onToggleFavorite={handleToggleFavorite}
          onRateTeacher={handleRateTeacher}
          onViewDetails={handleViewDetails}
          isAlreadyRated={true}
          showViewDetailsButton={false}
          secondaryButtonOverride={{
            text: "Delete Rating",
            textColor: "#FFFFFF",
            backgroundColor: isDeletingThis ? "#EF4444" : "#DC2626",
            borderColor: "#B91C1C",
            icon: "trash-2",
            onPress: () => handleDeleteRating(item.id),
            loading: isDeletingThis,
            hideIconOnLoading: true,
          }}
        />
      );
    },
    [deletingIds, favoriteIdsSet, handleToggleFavorite, handleRateTeacher, handleViewDetails, handleDeleteRating]
  );

  // Clear deleting flag when the item is actually removed from the list
  useEffect(() => {
    if (!teachers) return;
    setDeletingIds((prev) => {
      if (prev.size === 0) return prev;
      const next = new Set(prev);
      prev.forEach((id) => {
        if (!teachers.some((t) => t.id === id)) {
          next.delete(id);
        }
      });
      return next;
    });
  }, [teachers]);

  if (!profile?.id) {
    return (
      <Text style={{ margin: 16 }}>Please sign in to view this page.</Text>
    );
  }

  if (isLoading) {
    return (
      <ScrollView
        style={{ flex: 1, backgroundColor: colors.background }}
        contentContainerStyle={styles.skeletonContainer}
      >
        <TeacherCardSkeleton />
        <TeacherCardSkeleton />
        <TeacherCardSkeleton />
      </ScrollView>
    );
  }

  if (error) {
    return (
      <Text style={{ margin: 16 }}>Failed to load reviewed teachers.</Text>
    );
  }

  if (!teachers || teachers.length === 0) {
    const isDark = colorScheme === "dark";
    return (
      <View
        style={[styles.emptyContainer, { backgroundColor: colors.background }]}
      >
        <Text
          style={[styles.headerText, { color: isDark ? "#9ca3af" : "#6B7280" }]}
        >
          0 reviews
        </Text>
        <View style={styles.emptyStateContainer}>
          <Text
            style={[
              styles.emptyStateIcon,
              { color: isDark ? "#4b5563" : colors.borderColor },
            ]}
          >
            📝
          </Text>
          <Text
            style={[
              styles.emptyStateText,
              { color: isDark ? "#9ca3af" : "#6B7280" },
            ]}
          >
            You haven't reviewed any teacher yet
          </Text>
        </View>
      </View>
    );
  }

  return (
    <LegendList
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={[styles.container, { paddingBottom: 10 }]}
      data={teachers}
      keyExtractor={(t) => t.id}
      renderItem={renderItem}
      estimatedItemSize={180}
      recycleItems={true}
      extraData={favoriteIds}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  skeletonContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 16,
  },
  emptyContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  headerText: {
    paddingTop: 24,
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
  emptyStateIcon: {
    fontSize: 60,
  },
});

export default TeachersReviewed;
