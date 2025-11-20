import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  FlatList,
} from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import TeacherCard from "@/components/teacherManagement/TeacherCard";
import { useAuth } from "@/app/providers/AuthProvider";
import { UserPlus } from "lucide-react-native";
import {
  useTeachersCreatedByUser,
  useDeleteTeacher,
} from "@/api/teachers/profile";
import Colors from "@/constants/Colors";
import { useColorScheme } from "@/components/useColorScheme";
import { router } from "expo-router";
import { Tables } from "@/types";



const TeachersCreated = () => {
  const { profile } = useAuth();
  const { colorScheme } = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const {
    data: teachers,
    isLoading,
    error,
  } = useTeachersCreatedByUser(profile?.id);
  const { mutate: deletePending } = useDeleteTeacher(profile?.id);

  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());

  const handleRateTeacher = useCallback((teacherId: string) => {
    router.push({
      pathname: "/home/rate/[id]",
      params: { id: teacherId, from: "/profile/teachersCreated" },
    });
  }, []);

  const handleViewDetails = useCallback((teacherId: string) => {
    router.push(`/home/view/${teacherId}`);
  }, []);

  const handleDeleteTeacher = useCallback(
    (teacherId: string) => {
      setDeletingIds((prev) => {
        const next = new Set(prev);
        next.add(teacherId);
        return next;
      });
      deletePending(
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
    [deletePending]
  );

  // Clear deleting flag only when the item is actually removed from the list
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
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
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
    <FlatList
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={[styles.container, { paddingBottom: 10 }]}
      data={teachers as Tables<"teachers">[]}
      keyExtractor={(t) => t.id}
      renderItem={({ item }) => {
        const isDeletingThis = deletingIds.has(item.id);
        return (
          <View style={{ marginBottom: 16 }}>
            <TeacherCard
              teacher={item}
              isFavorite={false}
              onToggleFavorite={() => {}}
              onRateTeacher={() => handleRateTeacher(item.id)}
              onViewDetails={() => handleViewDetails(item.id)}
              isAlreadyRated={true}
              showViewDetailsButton={item.status === "verified"}
              secondaryButtonOverride={
                item.status === "pending"
                  ? {
                      text: "Delete Teacher",
                      textColor: "#FFFFFF",
                      backgroundColor: isDeletingThis ? "#EF4444" : "#DC2626",
                      borderColor: "#B91C1C",
                      icon: "Trash2",
                      onPress: () => handleDeleteTeacher(item.id),
                      loading: isDeletingThis,
                      hideIconOnLoading: true,
                    }
                  : undefined
              }
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
