import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import React, { useEffect, useState } from "react";
import { router, Stack, useLocalSearchParams } from "expo-router";
import Colors from "@/constants/Colors";
import CustomButton from "@/components/teacherManagement/Button";
import RatingCategories from "@/components/teacherManagement/RatingCategories";
import { useColorScheme } from "@/components/useColorScheme";
import { useTeacherList } from "@/api/teachers";
import {
  useUserRatingForTeacher,
  useUpsertRating,
} from "@/api/teachers/rating";
import { useAuth } from "@/app/providers/AuthProvider";

const RateTeacher = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [error, setError] = useState<string>("");

  const { data: teachers, isLoading: isLoadingTeachersList } = useTeacherList();
  const teacher = teachers?.find((t: { id: string }) => t.id === id);
  const { profile } = useAuth();
  const { mutate: upsertRating } = useUpsertRating();

  const { data: existingRating, isLoading: isLoadingRating } =
    useUserRatingForTeacher(id, profile?.id);

  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const isDark = colorScheme === "dark";

  const [classAverage, setClassAverage] = useState<string>("");
  const [ratings, setRatings] = useState({
    teachingQuality: 0,
    evaluationMethods: 0,
    behaviorAttitude: 0,
    internalAssessment: 0,
  });

  useEffect(() => {
    if (existingRating) {
      setRatings({
        teachingQuality: existingRating.teaching ?? 0,
        evaluationMethods: existingRating.evaluation ?? 0,
        behaviorAttitude: existingRating.behaviour ?? 0,
        internalAssessment: existingRating.internals ?? 0,
      });
      setClassAverage(existingRating.class_average ?? "");
    }
  }, [existingRating]);

  if (isLoadingTeachersList || isLoadingRating) {
    return <ActivityIndicator style={{ marginTop: 50 }} />;
  }

  const handleRating = (category: keyof typeof ratings, rating: number) => {
    setRatings((prev) => ({ ...prev, [category]: rating }));
  };

  const onSubmitRating = () => {
    setError("");

    if (
      ratings.teachingQuality === 0 ||
      ratings.evaluationMethods === 0 ||
      ratings.behaviorAttitude === 0 ||
      ratings.internalAssessment === 0 ||
      !classAverage
    ) {
      setError("Please provide all ratings");
      return;
    }

    if (!teacher?.id) {
      setError("Missing teacher info.");
      return;
    }
    if (!profile?.id) {
      setError("Missing user info.");
      return;
    }

    // Submit: if user has already rated, update, else insert
    upsertRating(
      {
        teacher_id: teacher.id,
        user_id: profile.id,
        teaching: ratings.teachingQuality,
        evaluation: ratings.evaluationMethods,
        behaviour: ratings.behaviorAttitude,
        internals: ratings.internalAssessment,
        class_average: classAverage,
        existingRatingId: existingRating?.id, // only set if exists
      },
      {
        onSuccess: async () => {
          router.back();
        },
      }
    );
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      <Stack.Screen
        options={{
          title: `Rate ${teacher?.full_name}`,
          headerRight: undefined,
        }}
      />

      {/* rating categories component rendering */}
      <RatingCategories
        ratings={ratings}
        classAverage={classAverage}
        onRatingChange={handleRating}
        onClassAverageChange={setClassAverage}
        colors={colors}
        isDark={isDark}
      />

      {/* Error Message */}
      {error && (
        <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
      )}

      {/* Submit Button */}
      <View style={{ marginHorizontal: 15, marginTop: 15 }}>
        <CustomButton
          text="Submit Rating"
          textColor="#FFFFFF"
          backgroundColor={isDark ? "#374151" : "#0C1120"}
          icon="SendHorizontal"
          onPress={onSubmitRating}
          paddingVertical={13}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  errorText: {
    textAlign: "center",
    marginTop: 20,
    marginBottom: -8,
    fontWeight: "500",
    fontSize: 14,
  },
});

export default RateTeacher;
