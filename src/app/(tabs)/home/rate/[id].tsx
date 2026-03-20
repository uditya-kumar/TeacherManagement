import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import React, { useCallback, useEffect, useState, useMemo, useRef } from "react";
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
import { useDeleteUserRatingForTeacher } from "@/api/teachers/profile";
import { useAuth } from "@/providers/AuthProvider";
import { useQueryClient } from "@tanstack/react-query";

const RateTeacher = () => {
  const { id, from } = useLocalSearchParams<{ id: string; from?: string }>();
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
  const { mutate: deleteRating, isPending: isDeleting } =
    useDeleteUserRatingForTeacher(profile?.id);

  const { data: existingRating, isLoading: isLoadingRating } =
    useUserRatingForTeacher(id, profile?.id);

  const { colorScheme } = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const isDark = colorScheme === "dark";

  const [classAverage, setClassAverage] = useState<string>("");
  const [ratings, setRatings] = useState({
    teachingQuality: 0,
    evaluationMethods: 0,
    behaviorAttitude: 0,
    internalAssessment: 0,
  });

  // Use refs for values needed in submit callback to avoid dependency changes
  const ratingsRef = useRef(ratings);
  ratingsRef.current = ratings;
  const classAverageRef = useRef(classAverage);
  classAverageRef.current = classAverage;
  const teacherIdRef = useRef(teacher?.id);
  teacherIdRef.current = teacher?.id;
  const profileIdRef = useRef(profile?.id);
  profileIdRef.current = profile?.id;
  const existingRatingIdRef = useRef(existingRating?.id);
  existingRatingIdRef.current = existingRating?.id;

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

  // Memoize style objects
  const containerStyle = useMemo(() => [styles.container, { backgroundColor: colors.background }], [colors.background]);
  const scrollContentStyle = useMemo(() => [
    styles.scrollContent,
    isLoadingPage && styles.centerContent,
  ], [isLoadingPage]);
  const errorTextStyle = useMemo(() => [styles.errorText, { color: colors.error }], [colors.error]);

  // Memoize Stack.Screen options
  const screenOptions = useMemo(() => ({
    title: teacher ? `Rate ${teacher.full_name}` : "Rate",
    headerRight: undefined,
  }), [teacher]);

  const handleRating = useCallback((category: keyof typeof ratings, rating: number) => {
    setRatings((prev) => ({ ...prev, [category]: rating }));
  }, []);

  const onSubmitRating = useCallback(() => {
    setError("");

    const currentRatings = ratingsRef.current;
    const currentClassAverage = classAverageRef.current;
    const currentTeacherId = teacherIdRef.current;
    const currentProfileId = profileIdRef.current;
    const currentExistingRatingId = existingRatingIdRef.current;

    if (
      currentRatings.teachingQuality === 0 ||
      currentRatings.evaluationMethods === 0 ||
      currentRatings.behaviorAttitude === 0 ||
      currentRatings.internalAssessment === 0 ||
      !currentClassAverage
    ) {
      setError("Please provide all ratings");
      return;
    }

    if (!currentTeacherId) {
      setError("Missing teacher info.");
      return;
    }
    if (!currentProfileId) {
      setError("Missing user info.");
      return;
    }

    // Submit: if user has already rated, update, else insert
    upsertRating(
      {
        teacher_id: currentTeacherId,
        user_id: currentProfileId,
        teaching: currentRatings.teachingQuality,
        evaluation: currentRatings.evaluationMethods,
        behaviour: currentRatings.behaviorAttitude,
        internals: currentRatings.internalAssessment,
        class_average: currentClassAverage,
        existingRatingId: currentExistingRatingId,
      },
      {
        onSuccess: async () => {
          if (typeof from === "string") {
            if (from.startsWith("/home/view/")) {
              router.back();
              return;
            } else if (from === "/home/favorites") {
              router.back();
              return;
            } else if (from === "/home") {
              router.back();
              return;
            } else if (from === "/profile/teachersReviewed") {
              router.replace("/profile/teachersReviewed");
              return;
            } else if (from === "/profile/teachersCreated") {
              router.replace("/profile/teachersCreated");
              return;
            }
          }
          router.back();
        },
      }
    );
  }, [upsertRating, from]);

  const onDeleteRating = useCallback(() => {
    const currentTeacherId = teacherIdRef.current;
    if (!currentTeacherId) return;

    Alert.alert(
      "Delete Rating",
      "Are you sure you want to delete your rating? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            deleteRating(
              { teacherId: currentTeacherId },
              {
                onSuccess: async () => {
                  // Force refetch (not just invalidate) since the home page stays
                  // mounted and staleTime: Infinity prevents automatic refetch
                  await queryClient.refetchQueries({
                    queryKey: ["ratedTeachers", profileIdRef.current],
                  });
                  router.back();
                },
              }
            );
          },
        },
      ]
    );
  }, [deleteRating, queryClient]);

  return (
    <ScrollView
      style={containerStyle}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={scrollContentStyle}
    >
      <Stack.Screen options={screenOptions} />

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
            <Text style={errorTextStyle}>
              {error}
            </Text>
          )}

          <View style={styles.submitButtonWrapper}>
            <CustomButton
              text={existingRating ? "Update Rating" : "Submit Rating"}
              textColor="#FFFFFF"
              backgroundColor={colors.buttonBackground}
              onPress={onSubmitRating}
              paddingVertical={13}
              loading={isSubmitting}
            />
          </View>

          {existingRating && (
            <View style={styles.deleteButtonWrapper}>
              <CustomButton
                text="Delete Rating"
                textColor="#FFFFFF"
                backgroundColor={isDeleting ? "#EF4444" : "#DC2626"}
                onPress={onDeleteRating}
                paddingVertical={13}
                loading={isDeleting}
              />
            </View>
          )}
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
  submitButtonWrapper: {
    marginHorizontal: 15,
    marginTop: 15,
  },
  deleteButtonWrapper: {
    marginHorizontal: 15,
    marginTop: 15,
  },
});

export default React.memo(RateTeacher);
