import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import React, { useState } from "react";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { teachers } from "@assets/data/teachers";
import Colors from "@/constants/Colors";
import { Star, Circle } from "lucide-react-native";
import CustomButton from "@/components/teacherManagement/Button";
import { useColorScheme } from "@/components/useColorScheme";

const RateTeacher = () => {
  const { id } = useLocalSearchParams();
  const teacher = teachers.find((item) => item.id === id);
  const [classAverage, setClassAverage] = useState<string>("");
  const [error, setError] = useState<string>("");
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const isDark = colorScheme === 'dark';

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

  const renderStarRating = (category: keyof typeof ratings, title: string, isLast: boolean = false) => (
    <View style={[
      styles.ratingItem, 
      !isLast && {
        ...styles.ratingItemWithBorder,
        borderBottomColor: isDark ? 'rgba(75, 85, 99, 0.3)' : 'rgba(229, 231, 235, 0.3)'
      }
    ]}>
      <Text style={[styles.categoryTitle, { color: colors.text }]}>{title}</Text>
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
                  ? colors.starColor
                  : (isDark ? '#4b5563' : colors.borderColor)
              }
              fill={
                star <= ratings[category]
                  ? colors.starColor
                  : "transparent"
              }
            />
          </Pressable>
        ))}
      </View>
      <View style={styles.numbersContainer}>
        {[1, 2, 3, 4, 5].map((num) => (
          <Text key={num} style={[styles.numberText, { color: colors.text }]}>
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
        color={isDark ? '#6b7280' : colors.borderColor}
        fill={classAverage === value ? colors.text : "transparent"}
      />
      <View style={styles.radioTextContainer}>
        <Text style={[styles.radioLabel, { color: colors.text }]}>{label}</Text>
        <Text style={[styles.radioRange, { color: isDark ? '#9ca3af' : '#6b7280' }]}>({range})</Text>
      </View>
    </Pressable>
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      <Stack.Screen options={{ title: `Rate ${teacher?.name}`, headerRight: undefined }} />

      {/* All Rating Categories in Single Container */}
      <View style={[
        styles.ratingsContainer,
        {
          backgroundColor: colors.cardBackground,
          borderColor: colors.borderColor,
        }
      ]}>
        {renderStarRating("teachingQuality", "Teaching Quality")}
        {renderStarRating("evaluationMethods", "Evaluation Methods")}
        {renderStarRating("behaviorAttitude", "Behavior & Attitude")}
        {renderStarRating("internalAssessment", "Internal Assessment", true)}
      </View>

      {/* Overall Class Average */}
      <View style={[
        styles.overallContainer,
        {
          backgroundColor: colors.cardBackground,
          borderColor: colors.borderColor,
        }
      ]}>
        <Text style={[styles.overallTitle, { color: colors.text }]}>Overall Class Average</Text>
        <View style={styles.radioContainer}>
          {renderRadioOption("low", "Low", "0-25")}
          {renderRadioOption("medium", "Medium", "25-35")}
          {renderRadioOption("high", "High", "35-50")}
        </View>
      </View>

      {/* Error Message */}
      {error && (
        <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
      )}
      
      {/* Submit Button */}
      <View style={{ marginHorizontal: 15, marginTop: 15 }}>
        <CustomButton
          text="Submit Rating"
          textColor="#FFFFFF"
          backgroundColor={isDark ? '#374151' : '#0C1120'}
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
  ratingsContainer: {
    padding: 16,
    marginTop: 10,
    borderWidth: 1,
    borderRadius: 10,
  },
  ratingItem: {
    paddingVertical: 16,
  },
  ratingItemWithBorder: {
    borderBottomWidth: 1,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: "600",
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
    textAlign: "center",
  },
  overallContainer: {
    paddingVertical: 16,
    paddingHorizontal: 0,
    marginTop: 10,
    borderWidth: 1,
    borderRadius: 10,
  },
  overallTitle: {
    fontSize: 16,
    fontWeight: "600",
    paddingHorizontal: 16,
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
    marginBottom: 2,
  },
  radioRange: {
    fontSize: 12,
  },
  errorText: {
    textAlign: "center",
    marginTop: 16,
    marginBottom: -8,
    fontWeight: "500",
    fontSize: 14,
  },
});

export default RateTeacher;
