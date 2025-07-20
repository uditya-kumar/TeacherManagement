import { View, Text, StyleSheet, FlatList } from "react-native";
import React from "react";
import { router, Stack } from "expo-router";
import { useFavorite } from "../../providers/FavoriteProvider";
import Colors from "@/constants/Colors";
import { Heart } from "lucide-react-native";
import TeacherCard from "@/components/teacherManagement/TeacherCard"

const favorites = () => {
  const { favorites, toggleFavorite } = useFavorite();

  const renderHeader = () => {
    return (
      <Text
        style={{
          paddingTop: 24,
          fontSize: 17,
          color: "#6B7280",
        }}
      >
        {favorites.length} teachers
      </Text>
    );
  };

  const handleRateTeacher = (teacherId: string) => {
    router.push(`/home/rate/${teacherId}`);
  };

  const handleViewDetails = (teacherId: string) => {
    router.push(`/home/view/${teacherId}`);
  };

  if (favorites.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text
          style={{
            paddingTop: 24,
            fontSize: 17,
            color: "#6B7280",
          }}
        >
          0 teachers
        </Text>

        <View
          style={{ alignItems: "center", justifyContent: "center", flex: 1 }}
        >
          <Heart size={70} color={Colors.light.borderColor} />
          <Text
            style={{
              paddingTop: 20,
              paddingHorizontal: 20,
              fontSize: 17,
              textAlign: "center",
              color: "#6B7280",
            }}
          >
            Tap the heart icon on any teacher to add them to your favorites
          </Text>
        </View>
      </View>
    );
  } else {
    return (
      <View style={styles.emptyContainer}>
        <FlatList
          data={favorites}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TeacherCard
              teacher={item}
              isFavorite={favorites.includes(item)}
              onToggleFavorite={() => toggleFavorite(item)}
              onRateTeacher={() => handleRateTeacher(item.id)}
              onViewDetails={() => handleViewDetails(item.id)}
            />
          )}
          contentContainerStyle={{ gap: 25, paddingBottom: 10 }}
          ListHeaderComponent={renderHeader}
          initialNumToRender={10}
        />
      </View>
    );
  }
};

const styles = StyleSheet.create({
  emptyContainer: {
    flex: 1,
    paddingHorizontal: 16,
    backgroundColor: Colors.light.background,
  },
});

export default favorites;
