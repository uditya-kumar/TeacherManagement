import { View, Text, StyleSheet, ScrollView } from "react-native";
import React from "react";
import { router, useLocalSearchParams } from "expo-router";
import { teachers } from "@assets/data/teachers";
import TeacherCard from "@/components/TeacherCard";
import RatingBarChart from "@/components/RatingBarChart";
import Colors from "@/constants/Colors";
import { Teacher } from "@/types";
import { useFavorite } from "@/app/providers/FavoriteProvider";

const ViewTeacherDetails = () => {
  const { id } = useLocalSearchParams();
  const teacher = teachers.find((item) => item.id === id);
  const { favorites, toggleFavorite } = useFavorite();

  const handleRateTeacher = (teacherId: string) => {
    router.push(`/rate/${teacherId}`);
  };

  if (!teacher) {
    return <Text>Teacher Not Found</Text>;
  }

  return (
    <ScrollView style={styles.container}>
      <View style={{ marginTop: 10 }}>
        <TeacherCard
          teacher={teacher as Teacher}
          isFavorite={favorites.includes(teacher)}
          onToggleFavorite={() => toggleFavorite(teacher)}
          onRateTeacher={() => handleRateTeacher(teacher.id)}
          showViewDetailsButton={false}
        />
      </View>

      <Text style={styles.heading}>Rating Breakdown</Text>

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
    backgroundColor: Colors.light.background,
    paddingHorizontal: 10,
  },
  heading: {
    fontWeight: "600",
    paddingTop: 25,
    fontSize: 20,
    color: Colors.light.text,
  },
});
export default ViewTeacherDetails;
