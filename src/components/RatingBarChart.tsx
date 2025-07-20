import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Colors from '@/constants/Colors';
import { RatingBreakdown } from '@/types';

interface RatingBarChartProps {
  title: string;
  data: RatingBreakdown[];
}

const RatingBarChart: React.FC<RatingBarChartProps> = ({ title, data }) => {

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
          <Text style={styles.starNumber}>{breakdown.stars}</Text>
          <Text style={styles.starIcon}>⭐</Text>
        </View>
        
        <View style={styles.barContainer}>
          <View 
            style={[
              styles.bar, 
              { 
                width: `${breakdown.percentage}%`,
                backgroundColor: breakdown.percentage > 0 ? 'black' : '#E5E5E5'
              }
            ]} 
          />
        </View>
        
        <View style={styles.percentageContainer}>
          <Text style={styles.percentageText}>{breakdown.percentage}%</Text>
          <Text style={styles.countText}>({formatCount(breakdown.count)})</Text>
        </View>
      </View>
    );
  };

  // Sort data by stars in descending order (5, 4, 3, 2, 1)
  const sortedData = [...data].sort((a, b) => b.stars - a.stars);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.chartContainer}>
        {sortedData.map(renderStarRow)}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 15,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.light.borderColor
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: Colors.light.text,
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
    color: Colors.light.text,
    marginRight: 4,
  },
  starIcon: {
    fontSize: 12,
  },
  barContainer: {
    flex: 1,
    height: 16,
    backgroundColor: '#F0F0F0',
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
    color: Colors.light.text,
    marginRight: 4,
  },
  countText: {
    fontSize: 12,
    color: Colors.light.tabIconDefault,
  },
});

export default RatingBarChart;
