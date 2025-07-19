import { View, Text, StyleSheet, Pressable } from "react-native";
import React, { useState } from "react";
import Colors from "@/constants/Colors";
import { Star, Phone, MapPin, Heart } from "lucide-react-native";
import CustomButton from "./Button";
import { Teacher } from "@/types";

type TeacherCard = {
  teacher: Teacher;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onRateTeacher: () => void;
  onViewDetails: () => void;
};
const TeacherCard = ({
  teacher,
  isFavorite,
  onToggleFavorite,
  onRateTeacher,
  onViewDetails,
}: TeacherCard) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.teacherName}>{teacher.name}</Text>
        <Pressable
          onPress={onToggleFavorite}
          style={({ pressed }) => [
            styles.heartButton,
            { opacity: pressed ? 0.7 : 1 },
          ]}
        >
          <Heart
            size={22}
            color={isFavorite ? "#E91E63" : "gray"}
            fill={isFavorite ? "#E91E63" : "transparent"}
          />
        </Pressable>
      </View>
      <View style={styles.ratingContainer}>
        <Star
          size={20}
          color={Colors.light.starColor}
          fill={Colors.light.starColor}
        />
        <Text style={styles.ratingText}>{teacher.rating}</Text>
        <Text style={styles.details}>({teacher.totalRatings} reviews)</Text>
      </View>
      <View style={styles.detailsContainer}>
        <View style={styles.detailRow}>
          <MapPin size={15} color="gray" style={styles.icon} />
          <Text style={styles.details}>{teacher.cabinNumber}</Text>
        </View>

        <View style={styles.detailRowWithMargin}>
          <Phone size={15} color="gray" style={styles.icon} />
          <Text style={styles.details} selectable>
            {teacher.mobileNumber}
          </Text>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <CustomButton
          text="Rate Teacher"
          textColor="#FFFFFF"
          backgroundColor="#0C1120"
          icon="UserCheck"
          onPress={onRateTeacher}
          paddingVertical={11}
        />
        <CustomButton
          text="View Details"
          textColor="#0C1120"
          backgroundColor="#FFFFFF"
          borderColor="#E5E7EB"
          icon="Eye"
          onPress={onViewDetails}
          paddingVertical={11}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.light.cardBackground,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.light.borderColor,
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
    color: "gray",
  },
  heartButton: {
    padding: 4,
  },
});

export default TeacherCard;
