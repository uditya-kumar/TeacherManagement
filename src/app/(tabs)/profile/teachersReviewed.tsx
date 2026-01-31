import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
} from "react-native";
import React, { useCallback, useEffect, useState } from "react";
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



const TeachersReviewed = () => {
  const { profile } = useAuth();
  const { colorScheme } = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const {
    data: teachers,
    isLoading,
    error,
  } = useTeachersReviewedByUser(profile?.id);
  const { mutate: deleteRating, isPending: deleting } =
    useDeleteUserRatingForTeacher(profile?.id);

  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());

  // No-op callback for toggleFavorite since favorites aren't used here
  const handleToggleFavorite = useCallback((_teacher: Tables<"teachers">) => {}, []);

  const handleRateTeacher = useCallback((teacherId: string) => {
    router.push({
      pathname: "/home/rate/[id]",
      params: { id: teacherId, from: "/profile/teachersReviewed" },
    });
  }, []);

  const handleDeleteRating = useCallback(
    (teacherId: string) => {
      setDeletingIds((prev) => new Set(prev).add(teacherId));
      deleteRating(
        { teacherId },
        {
          // Keep spinner until item disappears; only clear early on error
          onError: () =>
            setDeletingIds((prev) => {
              const next = new Set(prev);
              next.delete(teacherId);
              return next;
            }),
        }
      );
    },
    [deleteRating]
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
    <FlatList
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={[styles.container, { paddingBottom: 10 }]}
      data={teachers}
      keyExtractor={(t) => t.id}
      renderItem={({ item }) => {
        const isDeletingThis = deletingIds.has(item.id);
        return (
          <View style={{ marginBottom: 16 }}>
            <TeacherCard
              teacher={item}
              isFavorite={false}
              onToggleFavorite={handleToggleFavorite}
              onRateTeacher={handleRateTeacher}
              isAlreadyRated={true}
              showViewDetailsButton={false}
              secondaryButtonOverride={{
                text: "Delete Rating",
                textColor: "#FFFFFF",
                backgroundColor: isDeletingThis ? "#EF4444" : "#DC2626",
                borderColor: "#B91C1C",
                icon: "Trash2",
                onPress: () => handleDeleteRating(item.id),
                loading: isDeletingThis,
                hideIconOnLoading: true,
              }}
            />
          </View>
        );
      }}
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
