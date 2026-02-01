import React from "react";
import { View, StyleSheet } from "react-native";
import Skeleton from "./Skeleton";
import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";

const RatingBarChartSkeleton: React.FC = () => {
  const { colorScheme } = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const renderSkeletonRow = (index: number) => {
    // Varying widths to make it look more natural
    const barWidths = [75, 45, 25, 15, 10];
    
    return (
      <View key={index} style={styles.starRow}>
        {/* Star label container */}
        <View style={styles.starLabelContainer}>
          <Skeleton width={14} height={14} borderRadius={4} />
          <Skeleton width={12} height={12} borderRadius={2} style={{ marginLeft: 4 }} />
        </View>
        
        {/* Bar container */}
        <View style={styles.barContainer}>
          <Skeleton 
            width={`${barWidths[index]}%`} 
            height={16} 
            borderRadius={8} 
          />
        </View>
        
        {/* Percentage container */}
        <View style={styles.percentageContainer}>
          <Skeleton width={32} height={14} borderRadius={4} />
          <Skeleton width={28} height={12} borderRadius={4} style={{ marginLeft: 4 }} />
        </View>
      </View>
    );
  };

  return (
    <View style={[
      styles.container,
      {
        backgroundColor: colors.cardBackground,
        borderColor: colors.borderColor,
      }
    ]}>
      {/* Title */}
      <Skeleton width={140} height={16} borderRadius={4} style={styles.title} />
      
      {/* Chart rows */}
      <View style={styles.chartContainer}>
        {[0, 1, 2, 3, 4].map(renderSkeletonRow)}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 15,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
  },
  title: {
    marginBottom: 12,
  },
  chartContainer: {
    gap: 8,
  },
  starRow: {
    flexDirection: "row",
    alignItems: "center",
    height: 24,
  },
  starLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: 40,
  },
  barContainer: {
    flex: 1,
    height: 16,
    borderRadius: 8,
    marginHorizontal: 12,
    overflow: "hidden",
  },
  percentageContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: 80,
    justifyContent: "flex-start",
  },
});

export default React.memo(RatingBarChartSkeleton);
