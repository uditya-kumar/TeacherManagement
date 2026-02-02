import { View, Text, StyleSheet, Pressable } from "react-native";
import React from "react";
import { Feather } from "@expo/vector-icons";

// Define the props interface for the component
interface RatingCategoriesProps {
  ratings: {
    teachingQuality: number;
    evaluationMethods: number;
    behaviorAttitude: number;
    internalAssessment: number;
  };
  classAverage: string;
  onRatingChange: (
    category: keyof RatingCategoriesProps["ratings"],
    rating: number
  ) => void;
  onClassAverageChange: (value: string) => void;
  colors: {
    cardBackground: string;
    borderColor: string;
    text: string;
    starColor: string;
    error: string;
  };
  isDark: boolean;
}

const RatingCategories: React.FC<RatingCategoriesProps> = ({
  ratings,
  classAverage,
  onRatingChange,
  onClassAverageChange,
  colors,
  isDark,
}) => {
  const renderStarRating = (
    category: keyof typeof ratings,
    title: string,
    isLast: boolean = false
  ) => (
    <View
      style={[
        styles.ratingItem,
        !isLast && {
          ...styles.ratingItemWithBorder,
          borderBottomColor: isDark
            ? "rgba(75, 85, 99, 0.3)"
            : "rgba(229, 231, 235, 0.3)",
        },
      ]}
    >
      <Text style={[styles.categoryTitle, { color: colors.text }]}>
        {title}
      </Text>
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Pressable
            key={star}
            onPress={() => onRatingChange(category, star)}
            style={styles.starButton}
          >
            <Feather
              name="star"
              size={32}
              color={
                star <= ratings[category]
                  ? colors.starColor
                  : isDark
                  ? "#4b5563"
                  : colors.borderColor
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
      onPress={() => onClassAverageChange(value)}
    >
      <Feather
        name="circle"
        size={20}
        color={classAverage === value ? colors.text : (isDark ? "#6b7280" : colors.borderColor)}
      />
      <View style={styles.radioTextContainer}>
        <Text style={[styles.radioLabel, { color: colors.text }]}>{label}</Text>
        <Text
          style={[styles.radioRange, { color: isDark ? "#9ca3af" : "#6b7280" }]}
        >
          ({range})
        </Text>
      </View>
    </Pressable>
  );

  return (
    <View>
      {/* All Rating Categories in Single Container */}
      <View
        style={[
          styles.ratingsContainer,
          {
            backgroundColor: colors.cardBackground,
            borderColor: colors.borderColor,
          },
        ]}
      >
        {renderStarRating("teachingQuality", "Teaching Quality")}
        {renderStarRating("evaluationMethods", "Evaluation Methods")}
        {renderStarRating("behaviorAttitude", "Behavior & Attitude")}
        {renderStarRating("internalAssessment", "Internal Assessment", true)}
        <Text style={[styles.overallTitle, { color: colors.text }]}>
          Overall Class Average
        </Text>
        <View style={styles.radioContainer}>
          {renderRadioOption("low", "Low", "0-25")}
          {renderRadioOption("medium", "Medium", "25-35")}
          {renderRadioOption("high", "High", "35-50")}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
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
    marginVertical: 16,
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
});

export default RatingCategories;
