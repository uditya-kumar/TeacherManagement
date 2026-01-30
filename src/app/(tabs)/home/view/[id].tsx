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
import { useFavorite } from "@/providers/FavoriteProvider";
import { useColorScheme } from "@/components/useColorScheme";
import { useTeacher, useUserRatedTeacherIds } from "@/api/teachers";
import { useTeacherRatingsBreakdown } from "@/api/teachers/rating";
import { useAuth } from "@/providers/AuthProvider";
import { useQueryClient } from "@tanstack/react-query";
import { Tables } from "@/types";

const ViewTeacherDetails = () => {
  const { favoriteIds, toggleFavorite } = useFavorite();
  const { colorScheme } = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const { id } = useLocalSearchParams<{ id: string }>();
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  // All hooks must be called before any conditional returns
  const { data: teacher, error, isLoading } = useTeacher(id ?? "");
  const { data: breakdown, isLoading: isLoadingBreakdown, refetch: refetchBreakdown } = useTeacherRatingsBreakdown(id ?? "");
  const { data: ratedTeacherIds = [] } = useUserRatedTeacherIds(profile?.id);

  const handleToggleFavorite = useCallback((teacher: Tables<"teachers">) => {
    toggleFavorite(teacher);
  }, [toggleFavorite]);

  const handleRateTeacher = useCallback((teacherId: string) => {
    // Clear potentially stale per-user rating and aggregates to avoid flicker
    if (profile?.id) {
      queryClient.removeQueries({ queryKey: ["userRating", teacherId, profile.id], exact: true });
      queryClient.removeQueries({ queryKey: ["ratingsByTeacher", teacherId], exact: true });
      queryClient.removeQueries({ queryKey: ["ratingsBreakdown", teacherId], exact: true });
    }
    router.push({ pathname: "/home/rate/[id]", params: { id: teacherId, from: `/home/view/${teacherId}` } });
  }, [profile?.id, queryClient]);

  useFocusEffect(
    useCallback(() => {
      // Refetch breakdown whenever this screen gains focus to ensure freshness after rating updates
      if (id) refetchBreakdown();
    }, [refetchBreakdown, id])
  );

  // Conditional returns AFTER all hooks
  if (!id) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large"/>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large"/>
      </View>
    );
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

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={styles.teacherCardWrapper}>
        <TeacherCard
          teacher={teacher}
          isFavorite={favoriteIds.includes(teacher.id)}
          onToggleFavorite={handleToggleFavorite}
          onRateTeacher={handleRateTeacher}
          isAlreadyRated={ratedTeacherIds.includes(teacher.id)}
          showViewDetailsButton={false}
        />
      </View>

      <Text style={[styles.heading, { color: colors.text }]}>Rating Breakdown</Text>

      {isLoadingBreakdown ? (
        <ActivityIndicator style={styles.breakdownLoader} />
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
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  teacherCardWrapper: {
    marginTop: 10,
  },
  breakdownLoader: {
    marginTop: 12,
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
