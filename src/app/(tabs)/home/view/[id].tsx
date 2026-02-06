import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from "react-native";
import React, { useCallback, useMemo, useRef } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import TeacherCard from "@/components/teacherManagement/TeacherCard";
import TeacherCardSkeleton from "@/components/teacherManagement/TeacherCardSkeleton";
import RatingBarChart from "@/components/teacherManagement/RatingBarChart";
import RatingBarChartSkeleton from "@/components/teacherManagement/RatingBarChartSkeleton";
import Colors from "@/constants/Colors";
import { useFavorite } from "@/providers/FavoriteProvider";
import { useColorScheme } from "@/components/useColorScheme";
import { useTeacher, useUserRatedTeacherIds } from "@/api/teachers";
import { useTeacherRatingsBreakdown } from "@/api/teachers/rating";
import { useAuth } from "@/providers/AuthProvider";
import { useQueryClient } from "@tanstack/react-query";
import { Tables } from "@/types";

// Memoized skeleton loading component to avoid re-creating JSX
const LoadingSkeleton = React.memo(({ containerStyle, headingStyle }: { 
  containerStyle: object; 
  headingStyle: object;
}) => (
  <ScrollView style={containerStyle}>
    <View style={styles.teacherCardWrapper}>
      <TeacherCardSkeleton />
    </View>
    <Text style={headingStyle}>Rating Breakdown</Text>
    <RatingBarChartSkeleton />
    <RatingBarChartSkeleton />
    <RatingBarChartSkeleton />
    <RatingBarChartSkeleton />
  </ScrollView>
));

const ViewTeacherDetails = () => {
  const { favoriteIds, toggleFavorite } = useFavorite();
  const { colorScheme } = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const { id } = useLocalSearchParams<{ id: string }>();
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  
  // Use ref for profile.id to avoid callback recreation
  const profileIdRef = useRef(profile?.id);
  profileIdRef.current = profile?.id;

  // All hooks must be called before any conditional returns
  const { data: teacher, error, isLoading } = useTeacher(id ?? "");
  const { data: breakdown, isLoading: isLoadingBreakdown, refetch: refetchBreakdown } = useTeacherRatingsBreakdown(id ?? "");
  const { data: ratedTeacherIds = [] } = useUserRatedTeacherIds(profile?.id);

  // Convert to Sets for O(1) lookup
  const favoriteIdsSet = useMemo(() => new Set(favoriteIds), [favoriteIds]);
  const ratedIdsSet = useMemo(() => new Set(ratedTeacherIds), [ratedTeacherIds]);

  // Memoize style objects to prevent recreation
  const containerStyle = useMemo(() => [styles.container, { backgroundColor: colors.background }], [colors.background]);
  const headingStyle = useMemo(() => [styles.heading, { color: colors.text }], [colors.text]);

  const handleToggleFavorite = useCallback((teacher: Tables<"teachers">) => {
    toggleFavorite(teacher);
  }, [toggleFavorite]);

  const handleRateTeacher = useCallback((teacherId: string) => {
    // Clear potentially stale per-user rating and aggregates to avoid flicker
    const currentProfileId = profileIdRef.current;
    if (currentProfileId) {
      queryClient.removeQueries({ queryKey: ["userRating", teacherId, currentProfileId], exact: true });
      // Clear ratings list (breakdown is derived from this via select)
      queryClient.removeQueries({ queryKey: ["ratingsByTeacher", teacherId], exact: true });
    }
    router.push({ pathname: "/home/rate/[id]", params: { id: teacherId, from: `/home/view/${teacherId}` } });
  }, [queryClient]);

  useFocusEffect(
    useCallback(() => {
      // Refetch breakdown whenever this screen gains focus to ensure freshness after rating updates
      if (id) refetchBreakdown();
    }, [refetchBreakdown, id])
  );

  // Conditional returns AFTER all hooks
  if (!id || isLoading) {
    return <LoadingSkeleton containerStyle={containerStyle} headingStyle={headingStyle} />;
  }

  if (error) {
    return <Text>Failed to Fetch teachers</Text>;
  }

  if (!teacher) {
    return (
      <View style={containerStyle}>
        <Text style={[styles.errorText, { color: colors.text }]}>
          Teacher Not Found
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={containerStyle}>
      <View style={styles.teacherCardWrapper}>
        <TeacherCard
          teacher={teacher}
          favoriteIdsSet={favoriteIdsSet}
          ratedIdsSet={ratedIdsSet}
          onToggleFavorite={handleToggleFavorite}
          onRateTeacher={handleRateTeacher}
          showViewDetailsButton={false}
        />
      </View>

      <Text style={headingStyle}>Rating Breakdown</Text>

      {isLoadingBreakdown ? (
        <>
          <RatingBarChartSkeleton />
          <RatingBarChartSkeleton />
          <RatingBarChartSkeleton />
          <RatingBarChartSkeleton />
        </>
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

export default React.memo(ViewTeacherDetails);
