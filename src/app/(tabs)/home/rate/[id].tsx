import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import React, { useState } from "react";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { teachers } from "@assets/data/teachers";
import Colors from "@/constants/Colors";
import { Star, Circle } from "lucide-react-native";
import CustomButton from "@/components/Button";

const RateTeacher = () => {
  const { id } = useLocalSearchParams();
  const teacher = teachers.find((item) => item.id === id);
  const [classAverage, setClassAverage] = useState<string>("");
  const [error, setError] = useState<string>("");

  const [ratings, setRatings] = useState({
    teachingQuality: 0,
    evaluationMethods: 0,
    behaviorAttitude: 0,
    internalAssessment: 0,
  });

  const onSubmitRating = () => {
    setError("");
    // Validation
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
    console.log("Submitting rating...");
    router.back();
  };

  const handleRating = (category: keyof typeof ratings, rating: number) => {
    setRatings((prev) => ({ ...prev, [category]: rating }));
  };

  const renderStarRating = (category: keyof typeof ratings, title: string) => (
    <View style={styles.ratingContainer}>
      <Text style={styles.categoryTitle}>{title}</Text>
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Pressable
            key={star}
            onPress={() => handleRating(category, star)}
            style={styles.starButton}
          >
            <Star
              size={32}
              color={
                star <= ratings[category]
                  ? Colors.light.starColor
                  : Colors.light.borderColor
              }
              fill={
                star <= ratings[category]
                  ? Colors.light.starColor
                  : "transparent"
              }
            />
          </Pressable>
        ))}
      </View>
      <View style={styles.numbersContainer}>
        {[1, 2, 3, 4, 5].map((num) => (
          <Text key={num} style={styles.numberText}>
            {num}
          </Text>
        ))}
      </View>
    </View>
  );

  const renderRadioOption = (value: string, label: string, range: string) => (
    <Pressable
      style={styles.radioOption}
      onPress={() => setClassAverage(value)}
    >
      <Circle
        size={20}
        color={Colors.light.borderColor}
        fill={classAverage === value ? "black" : "transparent"}
      />
      <View style={styles.radioTextContainer}>
        <Text style={styles.radioLabel}>{label}</Text>
        <Text style={styles.radioRange}>({range})</Text>
      </View>
    </Pressable>
  );

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      <Stack.Screen options={{ title: `Rate ${teacher?.name}` }} />

      {/*Rating*/}
      {renderStarRating("teachingQuality", "Teaching Quality")}
      {renderStarRating("evaluationMethods", "Evaluation Methods")}
      {renderStarRating("behaviorAttitude", "Behavior & Attitude")}
      {renderStarRating("internalAssessment", "Internal Assessment")}

      {/* Overall Class Average */}
      <View style={styles.overallContainer}>
        <Text style={styles.overallTitle}>Overall Class Average</Text>
        <View style={styles.radioContainer}>
          {renderRadioOption("low", "Low", "0-25")}
          {renderRadioOption("medium", "Medium", "25-35")}
          {renderRadioOption("high", "High", "35-50")}
        </View>
      </View>

      {/* Error Message */}
      <Text style={styles.errorText}>{error}</Text>
      {/* Submit Button */}
      <View style={{ marginHorizontal: 15, marginTop: 15 }}>
        <CustomButton
          text="Submit Rating"
          textColor="#FFFFFF"
          backgroundColor="#0C1120"
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
    backgroundColor: Colors.light.background,
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  ratingContainer: {
    backgroundColor: Colors.light.cardBackground,
    padding: 16,
    marginTop: 10,
    borderColor: Colors.light.borderColor,
    borderRadius: 10,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.light.text,
    marginBottom: 12,
  },
  starsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  starButton: {
    padding: 4,
  },
  numbersContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 8,
  },
  numberText: {
    fontSize: 12,
    color: Colors.light.text,
    textAlign: "center",
  },
  overallContainer: {
    backgroundColor: Colors.light.cardBackground,
    paddingVertical: 16,
    paddingHorizontal: 0,
    marginTop: 10,
    borderRadius: 10,
  },
  overallTitle: {
    fontSize: 16,
    fontWeight: "600",
    paddingHorizontal: 16,
    color: Colors.light.text,
    marginBottom: 16,
  },
  radioContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  radioOption: {
    alignItems: "center",
    flex: 1,
    marginTop: 10,
  },
  radioTextContainer: {
    alignItems: "center",
    marginTop: 8,
  },
  radioLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.light.text,
    marginBottom: 2,
  },
  radioRange: {
    fontSize: 12,
    color: Colors.light.text,
  },
  errorText: {
    color: "red",
    textAlign: "center",
    marginTop: 16,
    marginBottom: -8,
    fontWeight: "500",
  },
});

export default RateTeacher;
