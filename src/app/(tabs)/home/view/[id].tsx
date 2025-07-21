import { View, Text, StyleSheet, ScrollView } from "react-native";
import React from "react";
import { router, useLocalSearchParams } from "expo-router";
import { teachers } from "@assets/data/teachers";
import TeacherCard from "@/components/teacherManagement/TeacherCard";
import RatingBarChart from "@/components/teacherManagement/RatingBarChart";
import Colors from "@/constants/Colors";
import { Teacher } from "@/types";
import { useFavorite } from "@/app/providers/FavoriteProvider";
import { useColorScheme } from "@/components/useColorScheme";

const ViewTeacherDetails = () => {
  const { id } = useLocalSearchParams();
  const teacher = teachers.find((item) => item.id === id);
  const { favorites, toggleFavorite } = useFavorite();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const handleRateTeacher = (teacherId: string) => {
    router.push(`/home/rate/${teacherId}`);
  };

  if (!teacher) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.text }]}>Teacher Not Found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={{ marginTop: 10 }}>
        <TeacherCard
          teacher={teacher as Teacher}
          isFavorite={favorites.includes(teacher)}
          onToggleFavorite={() => toggleFavorite(teacher)}
          onRateTeacher={() => handleRateTeacher(teacher.id)}
          showViewDetailsButton={false}
        />
      </View>

      <Text style={[styles.heading, { color: colors.text }]}>Rating Breakdown</Text>

      <RatingBarChart title="Teaching Quality" data={teacher.teachingQuality} />

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
      />
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
    textAlign: 'center',
    marginTop: 50,
  },
});
export default ViewTeacherDetails;
