import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
} from "react-native";
import React, { useMemo, useState } from "react";
import { Feather } from "@expo/vector-icons";
import Colors from "@/constants/Colors";
import TeacherCard from "@/components/teacherManagement/TeacherCard";
import TeacherCardSkeleton from "@/components/teacherManagement/TeacherCardSkeleton";
import { router } from "expo-router";
import { useFavorite } from "@/providers/FavoriteProvider";
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
import { Tables } from "@/types";
import { useRealtimeTeachers } from "@/hooks/useRealtimeTeachers";
import { useUserRatedTeacherIds } from "@/api/teachers";
import { useAuth } from "@/providers/AuthProvider"; // if not already imported
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/libs/supabase";

// Utility function moved outside component to avoid recreation on each render
const truncate = (str: string, n: number) =>
  str.length > n ? str.slice(0, n) + "..." : str;

const index = () => {
  const [search, setSearch] = useState("");
  const { favoriteIds, toggleFavorite } = useFavorite();
  const { colorScheme } = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const listRef = useRef<LegendListRef | null>(null); // For scroll control (optional)
  const { data: teachers, error, isLoading } = useTeacherList();
  const { profile } = useAuth();
  const { data: ratedTeacherIds = [] } = useUserRatedTeacherIds(profile?.id);
  const queryClient = useQueryClient();

  // Convert arrays to Sets for O(1) lookup - memoized to maintain stable references
  const favoriteIdsSet = useMemo(() => new Set(favoriteIds), [favoriteIds]);
  const ratedIdsSet = useMemo(() => new Set(ratedTeacherIds), [ratedTeacherIds]);

  useRealtimeTeachers();

  const filteredTeachers = useMemo(() => {
    const list = (teachers ?? []) as Tables<"teachers">[];
    if (!search) return list;
    const s = search.toLowerCase();
    return list
      .filter((teacher: Tables<"teachers">) =>
        (teacher.full_name ?? "").toLowerCase().includes(s),
      )
      .sort((a: Tables<"teachers">, b: Tables<"teachers">) => {
        const nameA = a.full_name?.toLowerCase() ?? "";
        const nameB = b.full_name?.toLowerCase() ?? "";
        return nameA.localeCompare(nameB);
      });
  }, [search, teachers]);

  const clearSearch = useCallback(() => {
    setSearch("");
  }, []);

  const handleRateTeacher = useCallback(
    (teacherId: string) => {
      // Clear potentially stale per-user rating to avoid brief flicker of old value
      if (profile?.id) {
        queryClient.removeQueries({
          queryKey: ["userRating", teacherId, profile.id],
          exact: true,
        });
        // Clear ratings list (breakdown is derived from this via select)
        queryClient.removeQueries({
          queryKey: ["ratingsByTeacher", teacherId],
          exact: true,
        });
      }

      // Navigate immediately for snappy UX, include `from` so we can return correctly
      router.push({
        pathname: "/home/rate/[id]",
        params: { id: teacherId, from: "/home" },
      });

      // Fire-and-forget prefetch to warm cache without blocking navigation
      if (profile?.id) {
        queryClient
          .prefetchQuery({
            queryKey: ["userRating", teacherId, profile.id],
            queryFn: async () => {
              const { data, error } = await supabase
                .from("ratings")
                .select("*")
                .eq("teacher_id", teacherId)
                .eq("user_id", profile.id)
                .maybeSingle();
              if (error && error.code !== "PGRST116")
                throw new Error(error.message);
              return data ?? null;
            },
          })
          .catch(() => {});

        queryClient
          .prefetchQuery({
            queryKey: ["teacher", teacherId],
            queryFn: async () => {
              const { data, error } = await supabase
                .from("teachers")
                .select(
                  "id, full_name, average_rating, rating_count, created_at, updated_at, status, cabin_no, mobile_no, created_by",
                )
                .eq("id", teacherId)
                .single();
              if (error) throw new Error(error.message);
              return data;
            },
          })
          .catch(() => {});
      }
    },
    [profile?.id, queryClient],
  );

  const handleViewDetails = useCallback((teacherId: string) => {
    router.push(`/home/view/${teacherId}`);
  }, []);

  const onAddTeacher = useCallback(() => {
    router.push(`/home/addTeacher`);
  }, []);

  // Memoized empty component to prevent recreation on each render
  const renderEmptyComponent = useMemo(
    () => (
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
          <Feather name="user-plus" size={40} color="#9ca3af" />
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
          icon="plus"
          onPress={onAddTeacher}
          paddingVertical={13}
        />
      </View>
    ),
    [colors.background, colorScheme, search, onAddTeacher]
  );

  // Stable callback for toggleFavorite that receives the teacher
  const handleToggleFavorite = useCallback(
    (teacher: Tables<"teachers">) => {
      toggleFavorite(teacher);
    },
    [toggleFavorite],
  );

  // Memoized renderItem for performance
  // By passing Sets instead of doing .includes() here, the renderItem callback stays stable
  // The lookup happens inside TeacherCard, so only the affected card re-renders on favorite toggle
  const renderItem = useCallback(
    ({ item }: LegendListRenderItemProps<Tables<"teachers">>) => (
      <TeacherCard
        teacher={item}
        favoriteIdsSet={favoriteIdsSet}
        ratedIdsSet={ratedIdsSet}
        onToggleFavorite={handleToggleFavorite}
        onRateTeacher={handleRateTeacher}
        onViewDetails={handleViewDetails}
      />
    ),
    [
      favoriteIdsSet,
      ratedIdsSet,
      handleToggleFavorite,
      handleRateTeacher,
      handleViewDetails,
    ],
  );

  // Memoized header component to prevent recreation on each render
  const listHeaderComponent = useMemo(
    () => (
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
    ),
    [search, colors.text, filteredTeachers.length]
  );

  if (
    isLoading &&
    (!teachers || (teachers as Tables<"teachers">[]).length === 0)
  ) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.searchContainer}>
          <CustomTextInput
            value=""
            onChangeText={() => {}}
            placeholder="Search Teachers.."
            editable={false}
          />
        </View>
        <View style={styles.headingContainer}>
          <Text style={[styles.heading, { color: colors.text }]}>All Teachers</Text>
        </View>
        <ScrollView
          contentContainerStyle={styles.skeletonList}
          showsVerticalScrollIndicator={false}
        >
          <TeacherCardSkeleton />
          <TeacherCardSkeleton />
          <TeacherCardSkeleton />
          <TeacherCardSkeleton />
        </ScrollView>
      </View>
    );
  }

  if (error || !teachers) {
    return <Text>Failed to fetch teachers</Text>;
  }
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.searchContainer}>
        <CustomTextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search Teachers.."
        />

        {search.length > 0 && (
          <Pressable onPress={clearSearch} style={styles.clearButton}>
            <Feather name="x" size={22} color={colors.text} />
          </Pressable>
        )}
      </View>
      <LegendList
        ref={listRef}
        data={filteredTeachers}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        extraData={[favoriteIdsSet, ratedIdsSet]}
        ListEmptyComponent={renderEmptyComponent}
        ListHeaderComponent={listHeaderComponent}
        contentContainerStyle={styles.listContent}
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
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    gap: 25,
    paddingBottom: 10,
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
    marginTop: 15,
    paddingBottom: 10,
  },
  skeletonList: {
    gap: 25,
    paddingBottom: 20,
  },
});

export default index;
