import React from "react";
import { View, StyleSheet } from "react-native";
import Skeleton from "./Skeleton";
import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";

const TeacherCardSkeleton: React.FC = () => {
  const { colorScheme } = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

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
      {/* Header: Name and Heart */}
      <View style={styles.header}>
        <Skeleton width="60%" height={22} borderRadius={6} />
        <Skeleton width={24} height={24} borderRadius={12} />
      </View>

      {/* Rating row */}
      <View style={styles.ratingContainer}>
        <Skeleton width={20} height={20} borderRadius={4} />
        <Skeleton width={30} height={18} borderRadius={4} style={{ marginLeft: 8 }} />
        <Skeleton width={80} height={16} borderRadius={4} style={{ marginLeft: 8 }} />
      </View>

      {/* Details rows */}
      <View style={styles.detailsContainer}>
        <View style={styles.detailRow}>
          <Skeleton width={15} height={15} borderRadius={4} />
          <Skeleton width={100} height={14} borderRadius={4} style={{ marginLeft: 8 }} />
        </View>
        <View style={[styles.detailRow, { marginLeft: 20 }]}>
          <Skeleton width={15} height={15} borderRadius={4} />
          <Skeleton width={120} height={14} borderRadius={4} style={{ marginLeft: 8 }} />
        </View>
      </View>

      {/* Buttons */}
      <View style={styles.buttonContainer}>
        <Skeleton width="48%" height={44} borderRadius={10} />
        <Skeleton width="48%" height={44} borderRadius={10} />
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
    marginBottom: 12,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  detailsContainer: {
    flexDirection: "row",
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
});

export default React.memo(TeacherCardSkeleton);
