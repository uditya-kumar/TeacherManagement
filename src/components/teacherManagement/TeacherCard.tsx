import { View, Text, StyleSheet, Pressable, Animated } from "react-native";
import React, { useRef } from "react";
import Colors from "@/constants/Colors";
import { Star, Phone, MapPin, Heart } from "lucide-react-native";
import CustomButton from "./Button";
import { useColorScheme } from "@/components/useColorScheme";
import { Tables } from "@/types";

type TeacherCard = {
  teacher: Tables<'teachers'>;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onRateTeacher: () => void;
  onViewDetails?: () => void;
  showViewDetailsButton?: boolean;
};
const TeacherCard = ({
  teacher,
  isFavorite,
  onToggleFavorite,
  onRateTeacher,
  onViewDetails,
  showViewDetailsButton = true,
}: TeacherCard) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const isDark = colorScheme === "dark";
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Theme-aware colors for better contrast
  const iconColor = isDark ? "#9ca3af" : "#6b7280";
  const detailsColor = isDark ? "#d1d5db" : "#6b7280";

  const animateHeart = () => {
    scaleAnim.setValue(1.5);
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 20,
      bounciness: 12,
    }).start();
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.cardBackground,
          borderColor: colors.borderColor,
        },
      ]}
    >
      <View style={styles.header}>
        <Text style={[styles.teacherName, { color: colors.text }]}>
          {teacher.full_name}
        </Text>
        <Pressable
          onPress={() => {
            animateHeart();
            onToggleFavorite();
          }}
          style={({ pressed }) => [
            styles.heartButton,
            { opacity: pressed ? 0.7 : 1 },
          ]}
        >
          <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <Heart
              size={22}
              color={isFavorite ? "#E91E63" : iconColor}
              fill={isFavorite ? "#E91E63" : "transparent"}
            />
          </Animated.View>
        </Pressable>
      </View>
      <View style={styles.ratingContainer}>
        <Star size={20} color={colors.starColor} fill={colors.starColor} />

        {teacher.rating_count === 0 ? (
          <Text
            style={[
              styles.details,
              { color: detailsColor, paddingLeft: 10, fontWeight: "600" },
            ]}
          >
            No Reviews
          </Text>
        ) : (
          <>
            <Text style={[styles.ratingText, { color: colors.text }]}>
              {Number(teacher.average_rating).toFixed(1)}
            </Text>
            <Text style={[styles.details, { color: detailsColor }]}>
              ({teacher.rating_count} reviews)
            </Text>
          </>
        )}
      </View>
      <View style={styles.detailsContainer}>
        <View style={styles.detailRow}>
          <MapPin size={15} color={iconColor} style={styles.icon} />
          <Text style={[styles.details, { color: detailsColor }]}>
            {teacher.cabin_no?.trim() || "N/A"}
          </Text>
        </View>

        <View style={styles.detailRowWithMargin}>
          <Phone size={15} color={iconColor} style={styles.icon} />
          <Text style={[styles.details, { color: detailsColor }]} selectable>
            {teacher.mobile_no?.trim() || "N/A"}
          </Text>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <CustomButton
          text="Rate Teacher"
          textColor="#FFFFFF"
          backgroundColor={isDark ? "#374151" : "#0C1120"}
          icon="UserCheck"
          onPress={onRateTeacher}
          paddingVertical={11}
        />
        {showViewDetailsButton && (
          <CustomButton
            text="View Details"
            textColor={isDark ? colors.text : "#0C1120"}
            backgroundColor={isDark ? "transparent" : "#FFFFFF"}
            borderColor={colors.borderColor}
            icon="Eye"
            onPress={onViewDetails}
            paddingVertical={11}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderWidth: 1,
    borderRadius: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  teacherName: {
    fontWeight: "600",
    fontSize: 18,
  },
  ratingContainer: {
    flexDirection: "row",
    marginTop: 10,
    alignItems: "center",
  },
  ratingText: {
    marginRight: 10,
    marginLeft: 10,
    fontSize: 16,
    fontWeight: "500",
  },
  detailsContainer: {
    marginTop: 20,
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  detailRowWithMargin: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  icon: {
    marginRight: 10,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  details: {
    // Color will be set dynamically
  },
  heartButton: {
    padding: 4,
  },
});

export default TeacherCard;
