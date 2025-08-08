import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import React, { useCallback } from "react";
import TeacherCard from "@/components/teacherManagement/TeacherCard";
import { useAuth } from "@/app/providers/AuthProvider";
import { useTeachersReviewedByUser, useDeleteUserRatingForTeacher } from "@/api/teachers/profile";
import Colors from "@/constants/Colors";
import { useColorScheme } from "@/components/useColorScheme";
import { router } from "expo-router";

const TeachersReviewed = () => {
  const { profile } = useAuth();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"]; 

  const { data: teachers, isLoading, error } = useTeachersReviewedByUser(profile?.id);
  const { mutate: deleteRating, isPending: deleting } = useDeleteUserRatingForTeacher(profile?.id);

  const handleRateTeacher = useCallback((teacherId: string) => {
    router.push(`/home/rate/${teacherId}`);
  }, []);

  const handleDeleteRating = useCallback(
    (teacherId: string) => {
      deleteRating({ teacherId });
    },
    [deleteRating]
  );

  if (!profile?.id) {
    return <Text style={{ margin: 16 }}>Please sign in to view this page.</Text>;
  }

  if (isLoading) {
    return <ActivityIndicator style={{ marginTop: 30 }} />;
  }

  if (error) {
    return <Text style={{ margin: 16 }}>Failed to load reviewed teachers.</Text>;
  }

  if (!teachers || teachers.length === 0) {
    const isDark = colorScheme === "dark";
    return (
      <View style={[styles.emptyContainer, { backgroundColor: colors.background }]}> 
        <Text style={[styles.headerText, { color: isDark ? "#9ca3af" : "#6B7280" }]}>0 reviews</Text>
        <View style={styles.emptyStateContainer}>
          <Text style={[styles.emptyStateIcon, { color: isDark ? "#4b5563" : colors.borderColor }]}>📝</Text>
          <Text style={[styles.emptyStateText, { color: isDark ? "#9ca3af" : "#6B7280" }]}>You haven't reviewed any teacher yet</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {teachers.map((teacher) => (
        <View key={teacher.id} style={{ marginBottom: 16 }}>
          <TeacherCard
            teacher={teacher}
            isFavorite={false}
            onToggleFavorite={() => {}}
            onRateTeacher={() => handleRateTeacher(teacher.id)}
            isAlreadyRated={true}
            showViewDetailsButton={false}
            secondaryButtonOverride={{
              text: "Delete Rating",
              textColor: "#FFFFFF",
              backgroundColor: deleting ? "#EF4444" : "#DC2626",
              borderColor: "#B91C1C",
              icon: "Trash2",
              onPress: () => handleDeleteRating(teacher.id),
              loading: deleting,
              hideIconOnLoading: true,
            }}
          />
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
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
