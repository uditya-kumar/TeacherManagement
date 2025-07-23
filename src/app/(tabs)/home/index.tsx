import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  Pressable,
} from "react-native";
import React, { useMemo, useState } from "react";
import { X, UserPlus } from "lucide-react-native";
import Colors from "@/constants/Colors";
import TeacherCard from "@/components/teacherManagement/TeacherCard";
import { teachers } from "@assets/data/teachers";
import { router } from "expo-router";
import { useFavorite } from "@/app/providers/FavoriteProvider";
import CustomButton from "@/components/teacherManagement/Button";
import { useColorScheme } from "@/components/useColorScheme";
import CustomTextInput from "@/components/teacherManagement/CustomTextInput";

const index = () => {
  const [search, setSearch] = useState("");
  const { favorites, toggleFavorite } = useFavorite();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const filteredTeachers = useMemo(() => {
    return teachers.filter((teacher) =>
      teacher.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  const clearSearch = () => {
    setSearch("");
  };

  const handleRateTeacher = (teacherId: string) => {
    router.push(`/home/rate/${teacherId}`);
  };

  const handleViewDetails = (teacherId: string) => {
    router.push(`/home/view/${teacherId}`);
  };

  const truncate = (str: string, n: number) =>
    str.length > n ? str.slice(0, n) + "..." : str;

  const onAddTeacher = () => {
    router.push(`/home/addTeacher`);
  };

  const renderHeader = useMemo(
    () => (
      <>
        <View style={styles.searchContainer}>
          
          <CustomTextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search Teachers.."
          />

          {search.length > 0 && (
            <Pressable onPress={clearSearch} style={styles.clearButton}>
              <X size={22} color={colors.text} />
            </Pressable>
          )}
        </View>

        <View style={styles.headingContainer}>
          {search.length > 0 ? (
            <Text style={[styles.heading, { color: colors.text }]}>
              Results for {truncate(search, 8)}
            </Text>
          ) : (
            <Text style={[styles.heading, { color: colors.text }]}>
              All Teachers
            </Text>
          )}
          <Text style={{ color: colors.text }}>
            {filteredTeachers.length} Teachers
          </Text>
        </View>
      </>
    ),
    [search, colors, colorScheme]
  );

  const renderEmptyComponent = () => (
    <View
      style={[
        styles.noTeacherContainer,
        { backgroundColor: colors.background, marginTop: 25 },
      ]}
    >
      <View
        style={[
          styles.icon,
          { backgroundColor: colorScheme === "dark" ? "#374151" : "#f4f4f4ff" },
        ]}
      >
        <UserPlus size={40} color="#9ca3af" />
      </View>
      <Text
        style={{
          color: colorScheme === "dark" ? "#9ca3af" : "#6b7280",
          fontSize: 17,
          textAlign: "center",
          paddingBottom: 15,
        }}
      >
        We couldn't find any teacher matching "{search}"
      </Text>

      {/* Add teacher Button */}
      <CustomButton
        text="Add Teacher"
        textColor="#FFFFFF"
        backgroundColor={colorScheme === "dark" ? "#1f2937" : "#0C1120"}
        icon="Plus"
        onPress={onAddTeacher}
        paddingVertical={13}
      />
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
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
        ListEmptyComponent={renderEmptyComponent}
        contentContainerStyle={[{ gap: 25, paddingBottom: 10 }]}
        keyboardShouldPersistTaps="handled"
        initialNumToRender={10}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    flex: 1,
  },
  noTeacherContainer: {
    flex: 1,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  headingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 30,
  },
  icon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  heading: {
    fontSize: 17,
    fontWeight: "500",
  },
  searchInput: {
    marginTop: 10,
    height: 47,
    borderRadius: 10,
    borderWidth: 1,
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
