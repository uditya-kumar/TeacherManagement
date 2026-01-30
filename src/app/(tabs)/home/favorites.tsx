import { View, Text, StyleSheet, FlatList } from "react-native";
import React from "react";
import { router} from "expo-router";
import { useFavorite } from "../../../providers/FavoriteProvider";
import Colors from "@/constants/Colors";
import { Heart } from "lucide-react-native";
import TeacherCard from "@/components/teacherManagement/TeacherCard";
import { useColorScheme } from "@/components/useColorScheme";

const favorites = () => {
  const { favorites, toggleFavorite } = useFavorite();
  const { colorScheme } = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const isDark = colorScheme === "dark";

  // Theme-aware colors
  const secondaryTextColor = isDark ? "#9ca3af" : "#6B7280";

  const renderHeader = () => {
    return (
      <Text style={[styles.headerText, { color: secondaryTextColor }]}>
        {favorites.length} teachers
      </Text>
    );
  };

  const handleRateTeacher = (teacherId: string) => {
    router.push({ pathname: "/home/rate/[id]", params: { id: teacherId, from: "/home/favorites" } });
  };

  const handleViewDetails = (teacherId: string) => {
    router.push(`/home/view/${teacherId}`);
  };

  if (favorites.length === 0) {
    return (
      <View
        style={[styles.emptyContainer, { backgroundColor: colors.background }]}
      >
        <Text style={[styles.headerText, { color: secondaryTextColor }]}>
          0 teachers
        </Text>

        <View style={styles.emptyStateContainer}>
          <Heart size={70} color={isDark ? "#4b5563" : colors.borderColor} />
          <Text style={[styles.emptyStateText, { color: secondaryTextColor }]}>
            Tap the heart icon on any teacher to add them to your favorites
          </Text>
        </View>
      </View>
    );
  } else {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <FlatList
          data={favorites}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TeacherCard
              teacher={item}
              isFavorite={true}
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
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  headerText: {
    paddingTop: 24,
    fontSize: 17,
  },
  emptyStateContainer: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  emptyStateText: {
    paddingTop: 20,
    paddingHorizontal: 20,
    fontSize: 17,
    textAlign: "center",
  },
});

export default favorites;
