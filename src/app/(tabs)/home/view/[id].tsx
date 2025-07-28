import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import React from "react";
import { router, useLocalSearchParams } from "expo-router";
import TeacherCard from "@/components/teacherManagement/TeacherCard";
import RatingBarChart from "@/components/teacherManagement/RatingBarChart";
import Colors from "@/constants/Colors";
import { useFavorite } from "@/app/providers/FavoriteProvider";
import { useColorScheme } from "@/components/useColorScheme";
import { useTeacher, useTeacherRating } from "@/api/teachers";

const ViewTeacherDetails = () => {
  const { favorites, favoriteIds, toggleFavorite } = useFavorite();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const { id } = useLocalSearchParams<{ id: string }>();

  if (!id) {
    return <ActivityIndicator />;
  }

  const { data: teacher, error, isLoading } = useTeacher(id);
  // const { data: teacherRatings, error: ratingError } = useTeacherRating(id);

  if (isLoading) {
    return <ActivityIndicator />;
  }

  console.log(error?.message);
  console.log("teacher is:- " + teacher);

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
        />
      </View>

      <Text style={[styles.heading, { color: colors.text }]}>
        Rating Breakdown
      </Text>

      {/* <RatingBarChart title="Teaching Quality" data={teacherRatings?.teaching} />

      <RatingBarChart
        title="Evaluation Fairness"
        data={teacher.evaluationFairness}
      />

      <RatingBarChart
        title="Behavior & Attitude"
        data={teacher.behaviorAttitude}
      />

      <RatingBarChart
        title="Internal Assessment"
        data={teacher.internalAssessment}
      /> */}
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
