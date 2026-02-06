import { View, Text, StyleSheet, Pressable } from "react-native";
import React, { useCallback, useMemo } from "react";
import { FontAwesome } from "@expo/vector-icons";

// Hoist constant arrays outside component to prevent recreation
const STAR_RATINGS = [1, 2, 3, 4, 5] as const;

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

// Memoized Star Rating Row Component
interface StarRatingRowProps {
  category: keyof RatingCategoriesProps["ratings"];
  title: string;
  rating: number;
  onRatingChange: (category: keyof RatingCategoriesProps["ratings"], rating: number) => void;
  textColor: string;
  starColor: string;
  emptyStarColor: string;
  borderStyle: object | null;
}

const StarRatingRow = React.memo<StarRatingRowProps>(({
  category,
  title,
  rating,
  onRatingChange,
  textColor,
  starColor,
  emptyStarColor,
  borderStyle,
}) => {
  const handlePress = useCallback((star: number) => {
    onRatingChange(category, star);
  }, [onRatingChange, category]);

  return (
    <View style={[styles.ratingItem, borderStyle]}>
      <Text style={[styles.categoryTitle, { color: textColor }]}>{title}</Text>
      <View style={styles.starsContainer}>
        {STAR_RATINGS.map((star) => (
          <Pressable
            key={star}
            onPress={() => handlePress(star)}
            style={styles.starButton}
          >
            <FontAwesome
              name={star <= rating ? "star" : "star-o"}
              size={32}
              color={star <= rating ? starColor : emptyStarColor}
            />
          </Pressable>
        ))}
      </View>
      <View style={styles.numbersContainer}>
        {STAR_RATINGS.map((num) => (
          <Text key={num} style={[styles.numberText, { color: textColor }]}>
            {num}
          </Text>
        ))}
      </View>
    </View>
  );
});

// Memoized Radio Option Component
interface RadioOptionProps {
  value: string;
  label: string;
  range: string;
  isSelected: boolean;
  onPress: (value: string) => void;
  textColor: string;
  selectedColor: string;
  unselectedColor: string;
  rangeColor: string;
}

const RadioOption = React.memo<RadioOptionProps>(({
  value,
  label,
  range,
  isSelected,
  onPress,
  textColor,
  selectedColor,
  unselectedColor,
  rangeColor,
}) => {
  const handlePress = useCallback(() => {
    onPress(value);
  }, [onPress, value]);

  return (
    <Pressable style={styles.radioOption} onPress={handlePress}>
      <FontAwesome
        name="circle"
        size={20}
        color={isSelected ? selectedColor : unselectedColor}
      />
      <View style={styles.radioTextContainer}>
        <Text style={[styles.radioLabel, { color: textColor }]}>{label}</Text>
        <Text style={[styles.radioRange, { color: rangeColor }]}>({range})</Text>
      </View>
    </Pressable>
  );
});

const RatingCategories: React.FC<RatingCategoriesProps> = ({
  ratings,
  classAverage,
  onRatingChange,
  onClassAverageChange,
  colors,
  isDark,
}) => {
  // Memoize derived colors
  const emptyStarColor = isDark ? "#4b5563" : colors.borderColor;
  const radioUnselectedColor = isDark ? "#343639" : colors.borderColor;
  const rangeColor = isDark ? "#9ca3af" : "#6b7280";
  
  // Memoize border style
  const borderStyle = useMemo(() => ({
    ...styles.ratingItemWithBorder,
    borderBottomColor: isDark ? "rgba(75, 85, 99, 0.3)" : "rgba(229, 231, 235, 0.3)",
  }), [isDark]);

  // Memoize container style
  const containerStyle = useMemo(() => [
    styles.ratingsContainer,
    {
      backgroundColor: colors.cardBackground,
      borderColor: colors.borderColor,
    },
  ], [colors.cardBackground, colors.borderColor]);

  // Memoize overall title style
  const overallTitleStyle = useMemo(() => [styles.overallTitle, { color: colors.text }], [colors.text]);

  return (
    <View>
      <View style={containerStyle}>
        <StarRatingRow
          category="teachingQuality"
          title="Teaching Quality"
          rating={ratings.teachingQuality}
          onRatingChange={onRatingChange}
          textColor={colors.text}
          starColor={colors.starColor}
          emptyStarColor={emptyStarColor}
          borderStyle={borderStyle}
        />
        <StarRatingRow
          category="evaluationMethods"
          title="Evaluation Methods"
          rating={ratings.evaluationMethods}
          onRatingChange={onRatingChange}
          textColor={colors.text}
          starColor={colors.starColor}
          emptyStarColor={emptyStarColor}
          borderStyle={borderStyle}
        />
        <StarRatingRow
          category="behaviorAttitude"
          title="Behavior & Attitude"
          rating={ratings.behaviorAttitude}
          onRatingChange={onRatingChange}
          textColor={colors.text}
          starColor={colors.starColor}
          emptyStarColor={emptyStarColor}
          borderStyle={borderStyle}
        />
        <StarRatingRow
          category="internalAssessment"
          title="Internal Assessment"
          rating={ratings.internalAssessment}
          onRatingChange={onRatingChange}
          textColor={colors.text}
          starColor={colors.starColor}
          emptyStarColor={emptyStarColor}
          borderStyle={null}
        />
        
        <Text style={overallTitleStyle}>
          Overall Class Average
        </Text>
        
        <View style={styles.radioContainer}>
          <RadioOption
            value="low"
            label="Low"
            range="0-25"
            isSelected={classAverage === "low"}
            onPress={onClassAverageChange}
            textColor={colors.text}
            selectedColor={colors.text}
            unselectedColor={radioUnselectedColor}
            rangeColor={rangeColor}
          />
          <RadioOption
            value="medium"
            label="Medium"
            range="25-35"
            isSelected={classAverage === "medium"}
            onPress={onClassAverageChange}
            textColor={colors.text}
            selectedColor={colors.text}
            unselectedColor={radioUnselectedColor}
            rangeColor={rangeColor}
          />
          <RadioOption
            value="high"
            label="High"
            range="35-50"
            isSelected={classAverage === "high"}
            onPress={onClassAverageChange}
            textColor={colors.text}
            selectedColor={colors.text}
            unselectedColor={radioUnselectedColor}
            rangeColor={rangeColor}
          />
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

export default React.memo(RatingCategories);
