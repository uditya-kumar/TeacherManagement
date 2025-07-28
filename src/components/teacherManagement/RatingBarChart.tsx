import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Colors from '@/constants/Colors';
import { RatingBreakdown } from '@/types';
import { useColorScheme } from '@/components/useColorScheme';

type RatingBarChartProps = {
  title: string;
  data: RatingBreakdown[];
}

const RatingBarChart = ({ title, data }: RatingBarChartProps) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const isDark = colorScheme === 'dark';

  // Theme-aware colors
  const barBackgroundColor = isDark ? '#374151' : '#F0F0F0';
  const activeBarColor = isDark ? colors.text : '#000000';
  const inactiveBarColor = isDark ? '#4b5563' : '#E5E5E5';
  const secondaryTextColor = isDark ? '#9ca3af' : colors.tabIconDefault;

  const formatCount = (count: number): string => {
    if (count >= 1000000000) {
      const value = count / 1000000000;
      return (value % 1 === 0 ? value.toFixed(0) : value.toFixed(1)) + 'B';
    } else if (count >= 1000000) {
      const value = count / 1000000;
      return (value % 1 === 0 ? value.toFixed(0) : value.toFixed(1)) + 'M';
    } else if (count >= 1000) {
      const value = count / 1000;
      return (value % 1 === 0 ? value.toFixed(0) : value.toFixed(1)) + 'k';
    }
    return count.toString();
  };
  
  const renderStarRow = (breakdown: RatingBreakdown) => {
    return (
      <View key={breakdown.stars} style={styles.starRow}>
        <View style={styles.starLabelContainer}>
          <Text style={[styles.starNumber, { color: colors.text }]}>{breakdown.stars}</Text>
          <Text style={styles.starIcon}>⭐</Text>
        </View>
        
        <View style={[styles.barContainer, { backgroundColor: barBackgroundColor }]}>
          <View 
            style={[
              styles.bar, 
              { 
                width: `${breakdown.percentage}%`,
                backgroundColor: breakdown.percentage > 0 ? activeBarColor : inactiveBarColor
              }
            ]} 
          />
        </View>
        
        <View style={styles.percentageContainer}>
          <Text style={[styles.percentageText, { color: colors.text }]}>{breakdown.percentage}%</Text>
          <Text style={[styles.countText, { color: secondaryTextColor }]}>({formatCount(breakdown.count)})</Text>
        </View>
      </View>
    );
  };

  // Sort data by stars in descending order (5, 4, 3, 2, 1)
  const sortedData = [...data].sort((a, b) => b.stars - a.stars);

  return (
    <View style={[
      styles.container,
      {
        backgroundColor: colors.cardBackground,
        borderColor: colors.borderColor,
      }
    ]}>
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      <View style={styles.chartContainer}>
        {sortedData.map(renderStarRow)}
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
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  chartContainer: {
    gap: 8,
  },
  starRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 24,
  },
  starLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 40,
  },
  starNumber: {
    fontSize: 14,
    fontWeight: '500',
    marginRight: 4,
  },
  starIcon: {
    fontSize: 12,
  },
  barContainer: {
    flex: 1,
    height: 16,
    borderRadius: 8,
    marginHorizontal: 12,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    borderRadius: 8,
    minWidth: 2,
  },
  percentageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 80,
    justifyContent: 'flex-start',
  },
  percentageText: {
    fontSize: 14,
    fontWeight: '500',
    marginRight: 4,
  },
  countText: {
    fontSize: 12,
  },
});

export default RatingBarChart;
