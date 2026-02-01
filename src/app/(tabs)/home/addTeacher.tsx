import { View, Text, StyleSheet, ScrollView} from "react-native";
import React, { useState } from "react";
import RatingCategories from "@/components/teacherManagement/RatingCategories";
import Colors from "@/constants/Colors";
import { useColorScheme } from "@/components/useColorScheme";
import CustomButton from "@/components/teacherManagement/Button";
import { router } from "expo-router";
import CustomTextInput from "@/components/teacherManagement/CustomTextInput";
import { useAuth } from "@/providers/AuthProvider";
import { useCreateTeacher } from "@/api/teachers";
import { showToast } from "@/libs/toastService";

const addTeacher = () => {
  const NAME_MIN_LEN = 3;
  const NAME_MAX_LEN = 60;
  const NAME_REGEX = /^[A-Za-z. ]+$/; // alphabets, dot and space only
  const CABIN_REGEX = /^[A-Za-z0-9- ]+$/; // letters, numbers, hyphen and space only
  const CABIN_MAX_LEN = 15;
  const [classAverage, setClassAverage] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [teacherName, setTeacherName] = useState<string>("");
  const [mobileNumber, setMobileNumber] = useState<string>("");
  const [cabinNumber, setCabinNumber] = useState<string>("");
  const [ratings, setRatings] = useState({
    teachingQuality: 0,
    evaluationMethods: 0,
    behaviorAttitude: 0,
    internalAssessment: 0,
  });

  const { colorScheme } = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const isDark = colorScheme === "dark";
  const { profile } = useAuth();
  const { mutate: createTeacher, isPending } = useCreateTeacher(profile?.id);

  const handleRating = (category: keyof typeof ratings, rating: number) => {
    setRatings((prev) => ({ ...prev, [category]: rating }));
  };

  const onAddTeacher = () => {
    setError("");
    const nameForValidation = teacherName.trim();
    const nameForSubmit = teacherName.trimEnd(); // remove trailing spaces only before saving
    const cabinForValidation = cabinNumber.trim();
    const cabinForSubmit = cabinNumber.toUpperCase(); // auto-capitalize before saving

    if (!nameForValidation) {
      setError("Enter Teacher Name");
      return;
    }
    if (!NAME_REGEX.test(nameForValidation)) {
      setError("Name can contain only letters, spaces and dots");
      return;
    }
    if (
      nameForValidation.length < NAME_MIN_LEN ||
      nameForValidation.length > NAME_MAX_LEN
    ) {
      setError(`Name must be ${NAME_MIN_LEN}-${NAME_MAX_LEN} characters long`);
      return;
    }
    if (mobileNumber) {
      if (!/^[0-9]+$/.test(mobileNumber)) {
        setError("Mobile number can only be numbers");
        return;
      }
      if (mobileNumber.length !== 10) {
        setError("Mobile number must be 10 digits");
        return;
      }
    }
    if (cabinForValidation && !CABIN_REGEX.test(cabinForValidation)) {
      setError("Cabin number can contain only letters, numbers, hyphen and spaces");
      return;
    }
    if (cabinForValidation && cabinForValidation.length > CABIN_MAX_LEN) {
      setError(`Cabin number can't be more than ${CABIN_MAX_LEN} characters`);
      return;
    }
    // Ratings are now optional - but if any rating is provided, all must be provided
    const ratingValues = [
      ratings.teachingQuality,
      ratings.evaluationMethods,
      ratings.behaviorAttitude,
      ratings.internalAssessment,
    ];
    const hasAnyRating = ratingValues.some((r) => r > 0) || classAverage;
    const hasAllRatings =
      ratingValues.every((r) => r > 0) && classAverage;

    if (hasAnyRating && !hasAllRatings) {
      setError("Please provide all the Ratings");
      return;
    }

    createTeacher(
      {
        full_name: nameForSubmit,
        mobile_no: mobileNumber,
        cabin_no: cabinForSubmit,
        initialRating: hasAllRatings
          ? {
              teaching: ratings.teachingQuality,
              evaluation: ratings.evaluationMethods,
              behaviour: ratings.behaviorAttitude,
              internals: ratings.internalAssessment,
            }
          : undefined,
        class_average: hasAllRatings ? classAverage : undefined,
      },
      {
        onSuccess: () => {
          router.replace("/home");
          setTimeout(() => {
            showToast(
              "Teacher Added Successfully, waiting for Admin to Approve",
              3000
            );
          }, 200);
        },
        onError: (e) => setError(e instanceof Error ? e.message : "Failed"),
      }
    );
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      <Text style={[styles.label, { color: colors.text }]}>Teacher Name *</Text>

      <CustomTextInput
        value={teacherName}
        onChangeText={setTeacherName}
        placeholder="Enter Teacher's Full Name"
      />

      <Text style={[styles.label, { color: colors.text }]}>
        Mobile Number (Optional)
      </Text>

      <CustomTextInput
        value={mobileNumber}
        onChangeText={setMobileNumber}
        placeholder="Enter Mobile Number"
      />

      <Text style={[styles.label, { color: colors.text }]}>
        Cabin Number (Optional)
      </Text>
      <CustomTextInput
        value={cabinNumber}
        onChangeText={setCabinNumber}
        placeholder="Enter Cabin Number"
      />

      <Text style={[styles.label, { color: colors.text }]}>Rate Teacher (Optional)</Text>
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
          text="Create Teacher"
          textColor="#FFFFFF"
          backgroundColor={isDark ? "#374151" : "#0C1120"}
          icon="SendHorizontal"
          onPress={onAddTeacher}
          paddingVertical={13}
          loading={isPending}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  errorText: {
    textAlign: "center",
    marginTop: 20,
    marginBottom: -8,
    fontWeight: "500",
    fontSize: 14,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 25,
  },
  searchInput: {
    marginTop: 10,
    height: 47,
    borderRadius: 10,
    borderWidth: 1,
    paddingLeft: 15,
    fontSize: 15,
  },
});

export default addTeacher;
