import { View, Text, StyleSheet, Pressable, Animated } from "react-native";
import React, { useRef, useCallback } from "react";
import Colors from "@/constants/Colors";
import { Star, Phone, MapPin, Heart } from "lucide-react-native";
import CustomButton from "./Button";
import { useColorScheme } from "@/components/useColorScheme";
import { Tables } from "@/types";
import type { AllowedIconName } from "./Button";

type TeacherCardProps = {
  teacher: Tables<'teachers'>;
  isFavorite: boolean;
  onToggleFavorite: (teacher: Tables<'teachers'>) => void;
  onRateTeacher: (teacherId: string) => void;
  onViewDetails?: (teacherId: string) => void;
  showViewDetailsButton?: boolean;
  isAlreadyRated?: boolean;
  secondaryButtonOverride?: {
    text: string;
    textColor: string;
    backgroundColor: string;
    borderColor?: string;
    icon: AllowedIconName;
    onPress: () => void;
    loading?: boolean;
    hideIconOnLoading?: boolean;
  };
};
const TeacherCard = ({
  teacher,
  isFavorite,
  onToggleFavorite,
  onRateTeacher,
  onViewDetails,
  showViewDetailsButton = true,
  isAlreadyRated,
  secondaryButtonOverride,
}: TeacherCardProps) => {
  const { colorScheme } = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const isDark = colorScheme === "dark";
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Theme-aware colors for better contrast
  const iconColor = isDark ? "#9ca3af" : "#6b7280";
  const detailsColor = isDark ? "#d1d5db" : "#6b7280";

  // Stable callbacks that call parent handlers with teacher/id
  const handleToggleFavorite = useCallback(() => {
    onToggleFavorite(teacher);
  }, [onToggleFavorite, teacher]);

  const handleRateTeacher = useCallback(() => {
    onRateTeacher(teacher.id);
  }, [onRateTeacher, teacher.id]);

  const handleViewDetails = useCallback(() => {
    onViewDetails?.(teacher.id);
  }, [onViewDetails, teacher.id]);

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
            handleToggleFavorite();
          }}
          style={({ pressed }: { pressed: boolean }) => [
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
          text={isAlreadyRated ? "Update Rating" : "Rate Teacher"}
          textColor="#FFFFFF"
          backgroundColor={isDark ? colors.buttonBackground : colors.buttonBackground}
          icon="UserCheck"
          onPress={handleRateTeacher}
          paddingVertical={11}
        />
        {secondaryButtonOverride ? (
          <View style={styles.secondaryButtonWrapper}>
            <CustomButton
              text={secondaryButtonOverride.text}
              textColor={secondaryButtonOverride.textColor}
              backgroundColor={secondaryButtonOverride.backgroundColor}
              borderColor={secondaryButtonOverride.borderColor}
              icon={secondaryButtonOverride.icon}
              onPress={secondaryButtonOverride.onPress}
              paddingVertical={11}
              loading={secondaryButtonOverride.loading}
              hideIconOnLoading={secondaryButtonOverride.hideIconOnLoading}
            />
          </View>
        ) : (
          showViewDetailsButton && (
            <View style={styles.secondaryButtonWrapper}>
              <CustomButton
                text="View Details"
                textColor={isDark ? colors.text : "#0C1120"}
                backgroundColor={isDark ? "transparent" : "#FFFFFF"}
                borderColor={colors.borderColor}
                icon="Eye"
                onPress={handleViewDetails}
                paddingVertical={11}
              />
            </View>
          )
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
  },
  secondaryButtonWrapper: {
    marginLeft: 10,
  },
  details: {
    // Color will be set dynamically
  },
  heartButton: {
    padding: 4,
  },
});

export default React.memo(TeacherCard);
