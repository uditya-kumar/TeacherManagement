import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  Pressable,
} from "react-native";
import React, { useMemo, useState } from "react";
import { X } from "lucide-react-native";
import Colors from "@/constants/Colors";
import TeacherCard from "@/components/TeacherCard";
import { teachers } from "@assets/data/teachers";
import { router } from "expo-router";
import { useFavorite } from "@/app/providers/FavoriteProvider";

const index = () => {
  const [search, setSearch] = useState("");
  const { favorites, toggleFavorite } = useFavorite();

  const filteredTeachers = useMemo(() => {
    return teachers.filter((teacher) =>
      teacher.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  const clearSearch = () => {
    setSearch("");
  };

  const handleRateTeacher = (teacherId: string) => {
    router.push(`/rate/${teacherId}`);
  };

  const handleViewDetails = (teacherId: string) => {
    router.push(`/view/${teacherId}`);
  };

  const renderHeader = useMemo(
    () => (
      <>
        <View style={styles.searchContainer}>
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search Teachers.."
            autoCorrect={false}
            style={styles.searchInput}
          />
          {search.length > 0 && (
            <Pressable onPress={clearSearch} style={styles.clearButton}>
              <X size={22} color="black" />
            </Pressable>
          )}
        </View>

        <View style={styles.headingContainer}>
          <Text style={styles.heading}>All Teachers</Text>
          <Text>{filteredTeachers.length} Teachers</Text>
        </View>
      </>
    ),
    [search]
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredTeachers}
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
        ListHeaderComponent={renderHeader}
        contentContainerStyle={{ gap: 25, paddingBottom: 10 }}
        keyboardShouldPersistTaps="handled"
        initialNumToRender={10}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  headingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 30,
  },
  heading: {
    fontSize: 17,
    fontWeight: "500",
  },
  searchInput: {
    marginTop: 10,
    height: 47,
    backgroundColor: Colors.light.background,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.light.borderColor,
    paddingLeft: 15,
    fontSize: 15,
  },
  clearButton: {
    position: "absolute",
    right: 15,
    top: "40%",
  },
  searchContainer: {
    position: "relative",
    marginTop: 10,
  },
});

export default index;
