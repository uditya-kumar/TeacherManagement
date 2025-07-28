import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
} from "react-native";
import React, { useMemo, useState } from "react";
import { X, UserPlus } from "lucide-react-native";
import Colors from "@/constants/Colors";
import TeacherCard from "@/components/teacherManagement/TeacherCard";
import { router } from "expo-router";
import { useFavorite } from "@/app/providers/FavoriteProvider";
import CustomButton from "@/components/teacherManagement/Button";
import { useColorScheme } from "@/components/useColorScheme";
import CustomTextInput from "@/components/teacherManagement/CustomTextInput";
import { useTeacherList } from "@/api/teachers";
import {
  LegendList,
  LegendListRenderItemProps,
  LegendListRef,
} from "@legendapp/list";
import { useRef, useCallback } from "react";


const index = () => {
  const [search, setSearch] = useState("");
  const { favorites, favoriteIds, toggleFavorite } = useFavorite();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const listRef = useRef<LegendListRef | null>(null); // For scroll control (optional)

  // fetch teacher data from database
  const { data: teachers, error, isLoading } = useTeacherList();

  const filteredTeachers = useMemo(() => {
    return (teachers ?? []).filter(
      (teacher) =>
        typeof teacher.full_name === "string" &&
        teacher.full_name.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, teachers]);

  const clearSearch = () => {
  setSearch("");
  // Reset scroll to top after state update
  setTimeout(() => {
    listRef.current?.scrollToOffset?.({ offset: 0, animated: false });
  }, 0);
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

  // Memoized renderItem for performance
  const renderItem = useCallback(
  ({ item }: LegendListRenderItemProps<any>) => (
    <TeacherCard
      teacher={item}
      isFavorite={favoriteIds.includes(item.id)}
      onToggleFavorite={() => toggleFavorite(item)}
      onRateTeacher={() => handleRateTeacher(item.id)}
      onViewDetails={() => handleViewDetails(item.id)}
    />
  ),
  [favoriteIds, toggleFavorite]
);

  if (isLoading) {
    return <ActivityIndicator />;
  }

  if (error || !teachers) {
    return <Text>Failed to fetch teachers</Text>;
  }
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LegendList
        ref={listRef}
        data={filteredTeachers}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        extraData={favoriteIds}              
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyComponent}
        contentContainerStyle={[{ gap: 25, paddingBottom: 10 }]}
        keyboardShouldPersistTaps="handled"
        recycleItems={true}
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
    marginTop: 27,
    marginVertical: 22,
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
    marginTop: 20,
  },
});

export default index;
