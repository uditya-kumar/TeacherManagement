import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import React, { useCallback } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import TeacherCard from "@/components/teacherManagement/TeacherCard";
import RatingBarChart from "@/components/teacherManagement/RatingBarChart";
import Colors from "@/constants/Colors";
import { useFavorite } from "@/app/providers/FavoriteProvider";
import { useColorScheme } from "@/components/useColorScheme";
import { useTeacher, useUserRatedTeacherIds } from "@/api/teachers";
import { useTeacherRatingsBreakdown } from "@/api/teachers/rating";
import { useAuth } from "@/app/providers/AuthProvider";
import { useQueryClient } from "@tanstack/react-query";

const ViewTeacherDetails = () => {
  const { favorites, favoriteIds, toggleFavorite } = useFavorite();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const { id } = useLocalSearchParams<{ id: string }>();

  if (!id) {
    return <ActivityIndicator />;
  }

  const { data: teacher, error, isLoading } = useTeacher(id);
  const { data: breakdown, isLoading: isLoadingBreakdown, refetch: refetchBreakdown } = useTeacherRatingsBreakdown(id);
  const { profile } = useAuth();
  const { data: ratedTeacherIds = [] } = useUserRatedTeacherIds(profile?.id);
  const queryClient = useQueryClient();

  useFocusEffect(
    useCallback(() => {
      // Refetch breakdown whenever this screen gains focus to ensure freshness after rating updates
      refetchBreakdown();
    }, [refetchBreakdown])
  );

  if (isLoading) {
    return <ActivityIndicator />;
  }

  

  if (error) {
    return <Text>Failed to Fetch teachers</Text>;
  }

  if (!teacher) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.text }]}>
          Teacher Not Found
        </Text>
      </View>
    );
  }

  if (!teacher) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.text }]}>
          Teacher Not Found
        </Text>
      </View>
    );
  }

  const handleRateTeacher = (teacherId: string) => {
    // Clear potentially stale per-user rating and aggregates to avoid flicker
    if (profile?.id) {
      queryClient.removeQueries({ queryKey: ["userRating", teacherId, profile.id], exact: true });
      queryClient.removeQueries({ queryKey: ["ratingsByTeacher", teacherId], exact: true });
      queryClient.removeQueries({ queryKey: ["ratingsBreakdown", teacherId], exact: true });
    }
    router.push(`/home/rate/${teacherId}`);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={{ marginTop: 10 }}>
        <TeacherCard
          teacher={teacher}
          isFavorite={favoriteIds.includes(teacher.id)}
          onToggleFavorite={() => toggleFavorite(teacher)}
          onRateTeacher={() => handleRateTeacher(teacher.id)}
          isAlreadyRated={ratedTeacherIds.includes(teacher.id)}
          showViewDetailsButton={false}
        />
      </View>

      <Text style={[styles.heading, { color: colors.text }]}>Rating Breakdown</Text>

      {isLoadingBreakdown ? (
        <ActivityIndicator style={{ marginTop: 12 }} />
      ) : (
        <>
          <RatingBarChart title="Teaching Quality" data={breakdown?.teaching ?? []} />
          <RatingBarChart title="Evaluation Fairness" data={breakdown?.evaluation ?? []} />
          <RatingBarChart title="Behavior & Attitude" data={breakdown?.behaviour ?? []} />
          <RatingBarChart title="Internal Assessment" data={breakdown?.internals ?? []} />
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  heading: {
    fontWeight: "600",
    paddingTop: 25,
    fontSize: 20,
  },
  errorText: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 50,
  },
});
export default ViewTeacherDetails;
