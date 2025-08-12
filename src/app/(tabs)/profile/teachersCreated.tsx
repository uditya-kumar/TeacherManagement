import { View, Text, ActivityIndicator, StyleSheet, ScrollView } from "react-native";
import React, { useCallback } from "react";
import TeacherCard from "@/components/teacherManagement/TeacherCard";
import { useAuth } from "@/app/providers/AuthProvider";
import { UserPlus } from 'lucide-react-native';
import {
  useTeachersCreatedByUser,
  useDeleteTeacher,
} from "@/api/teachers/profile";
import Colors from "@/constants/Colors";
import { useColorScheme } from "@/components/useColorScheme";
import { router } from "expo-router";

const TeachersCreated = () => {
  const { profile } = useAuth();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const {
    data: teachers,
    isLoading,
    error,
  } = useTeachersCreatedByUser(profile?.id);
  const { mutate: deletePending, isPending: deleting } = useDeleteTeacher(
    profile?.id
  );

  const handleRateTeacher = useCallback((teacherId: string) => {
    router.push({ pathname: "/home/rate/[id]", params: { id: teacherId, from: "/profile/teachersCreated" } });
  }, []);

  const handleViewDetails = useCallback((teacherId: string) => {
    router.push(`/home/view/${teacherId}`);
  }, []);

  const handleDeleteTeacher = useCallback(
    (teacherId: string) => {
      deletePending({ teacherId });
    },
    [deletePending]
  );

  if (!profile?.id) {
    return (
      <Text style={{ margin: 16 }}>Please sign in to view this page.</Text>
    );
  }

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large"/>
      </View>
    );
  }

  if (error) {
    return <Text style={{ margin: 16 }}>Failed to load teachers.</Text>;
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
          0 teachers
        </Text>
        <View style={styles.emptyStateContainer}>
          <UserPlus size={44} color={isDark ? "#9ca3af" : "#6B7280"} />
          <Text
            style={[
              styles.emptyStateText,
              { color: isDark ? "#9ca3af" : "#6B7280" },
            ]}
          >
            You haven't created any teacher yet
          </Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={[styles.container, { paddingBottom: 10 }]}
    > 
      {teachers.map((teacher) => (
        <View key={teacher.id} style={{ marginBottom: 16 }}>
          <TeacherCard
            teacher={teacher}
            isFavorite={false}
            onToggleFavorite={() => {}}
            onRateTeacher={() => handleRateTeacher(teacher.id)}
            onViewDetails={() => handleViewDetails(teacher.id)}
            isAlreadyRated={true}
            showViewDetailsButton={teacher.status === "verified"}
            secondaryButtonOverride={
              teacher.status === "pending"
                ? {
                    text: "Delete Teacher",
                    textColor: "#FFFFFF",
                    backgroundColor: deleting ? "#EF4444" : "#DC2626",
                    borderColor: "#B91C1C",
                    icon: "Trash2",
                    onPress: () => handleDeleteTeacher(teacher.id),
                    loading: deleting,
                    hideIconOnLoading: true,
                  }
                : undefined
            }
          />
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
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

export default TeachersCreated;
