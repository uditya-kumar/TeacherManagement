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

  useRealtimeTeachers();

  const filteredTeachers = useMemo(() => {
    const list = (teachers ?? []) as Tables<"teachers">[];
    if (!search) return list;
    const s = search.toLowerCase();
    return list
      .filter((teacher: Tables<"teachers">) =>
        (teacher.full_name ?? "").toLowerCase().includes(s)
      )
      .sort((a: Tables<"teachers">, b: Tables<"teachers">) => {
        const nameA = a.full_name?.toLowerCase() ?? "";
        const nameB = b.full_name?.toLowerCase() ?? "";
        return nameA.localeCompare(nameB);
      });
  }, [search, teachers]);


  const clearSearch = () => {
    setSearch("");
  };

  const handleRateTeacher = (teacherId: string) => {
    // Clear potentially stale per-user rating to avoid brief flicker of old value
    if (profile?.id) {
      queryClient.removeQueries({
        queryKey: ["userRating", teacherId, profile.id],
        exact: true,
      });
      // Also clear ratings breakdown and list so view page recomputes freshly
      queryClient.removeQueries({ queryKey: ["ratingsBreakdown", teacherId], exact: true });
      queryClient.removeQueries({ queryKey: ["ratingsByTeacher", teacherId], exact: true });
    }

    // Navigate immediately for snappy UX, include `from` so we can return correctly
    router.push({ pathname: "/home/rate/[id]", params: { id: teacherId, from: "/home" } });

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
            if (error && error.code !== "PGRST116") throw new Error(error.message);
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
                "id, full_name, average_rating, rating_count, created_at, updated_at, status, cabin_no, mobile_no, created_by"
              )
              .eq("id", teacherId)
              .single();
            if (error) throw new Error(error.message);
            return data;
          },
        })
        .catch(() => {});
    }
  };

  const handleViewDetails = (teacherId: string) => {
    router.push(`/home/view/${teacherId}`);
  };

  const truncate = (str: string, n: number) =>
    str.length > n ? str.slice(0, n) + "..." : str;

  const onAddTeacher = () => {
    router.push(`/home/addTeacher`);
  };

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
    ({ item }: LegendListRenderItemProps<Tables<"teachers">>) => (
      <TeacherCard
        teacher={item}
        isFavorite={favoriteIds.includes(item.id)}
        isAlreadyRated={ratedTeacherIds.includes(item.id)}
        onToggleFavorite={() => toggleFavorite(item)}
        onRateTeacher={() => handleRateTeacher(item.id)}
        onViewDetails={() => handleViewDetails(item.id)}
      />
    ),
    [favoriteIds, toggleFavorite, ratedTeacherIds]
  );

  if (isLoading && (!teachers || (teachers as Tables<"teachers">[]).length === 0)) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large"/>
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
            <X size={22} color={colors.text} />
          </Pressable>
        )}
      </View>
      <LegendList
        ref={listRef}
        data={filteredTeachers}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        extraData={[favoriteIds, ratedTeacherIds]}
        ListEmptyComponent={renderEmptyComponent}
        ListHeaderComponent={
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
        }
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
    marginTop: 15,
    paddingBottom: 10,
  },
});

export default index;
