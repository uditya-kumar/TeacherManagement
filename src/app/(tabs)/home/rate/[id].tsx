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
import { useTeacher } from "@/api/teachers";
import {
  useUserRatingForTeacher,
  useUpsertRating,
} from "@/api/teachers/rating";
import { useAuth } from "@/app/providers/AuthProvider";
import { useQueryClient } from "@tanstack/react-query";

const RateTeacher = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [error, setError] = useState<string>("");

  const queryClient = useQueryClient();
  const { data: teacher, isLoading: isLoadingTeacher } = useTeacher(id!, {
    placeholderData: () =>
      (queryClient.getQueryData(["teachers"]) as Array<any> | undefined)?.find(
        (t) => t.id === id
      ),
  });
  const { profile } = useAuth();
  const { mutate: upsertRating, isPending: isSubmitting } = useUpsertRating();

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
    // Only set when we have a definitive value (null = no rating, object = data)
    if (existingRating === null) {
      setRatings({
        teachingQuality: 0,
        evaluationMethods: 0,
        behaviorAttitude: 0,
        internalAssessment: 0,
      });
      setClassAverage("");
    } else if (existingRating) {
      setRatings({
        teachingQuality: existingRating.teaching ?? 0,
        evaluationMethods: existingRating.evaluation ?? 0,
        behaviorAttitude: existingRating.behaviour ?? 0,
        internalAssessment: existingRating.internals ?? 0,
      });
      setClassAverage(existingRating.class_average ?? "");
    }
  }, [existingRating]);

  const isLoadingPage = isLoadingTeacher || isLoadingRating || !teacher;

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
      contentContainerStyle={[
        styles.scrollContent,
        isLoadingPage && styles.centerContent,
      ]}
    >
      <Stack.Screen
        options={{
          title: teacher ? `Rate ${teacher.full_name}` : "Rate",
          headerRight: undefined,
        }}
      />

      {isLoadingPage ? (
        <ActivityIndicator size="large" />
      ) : (
        <>
          <RatingCategories
            ratings={ratings}
            classAverage={classAverage}
            onRatingChange={handleRating}
            onClassAverageChange={setClassAverage}
            colors={colors}
            isDark={isDark}
          />

          {error && (
            <Text style={[styles.errorText, { color: colors.error }]}>
              {error}
            </Text>
          )}

          <View style={{ marginHorizontal: 15, marginTop: 15 }}>
            <CustomButton
              text="Submit Rating"
              textColor="#FFFFFF"
              backgroundColor={isDark ? "#374151" : "#0C1120"}
              icon="SendHorizontal"
              onPress={onSubmitRating}
              paddingVertical={13}
              loading={isSubmitting}
            />
          </View>
        </>
      )}
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
  centerContent: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
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
