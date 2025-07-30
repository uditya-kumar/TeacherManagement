import { supabase } from "@/libs/supabase";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Tables } from "@/types";

type Rating = Tables<"ratings">;

//Fetch all teachers list
export const useTeacherList = () =>
  useQuery({
    queryKey: ["teachers"],
    queryFn: async () => {
      const { data, error } = await supabase.from("teachers").select("*");
      if (error) throw new Error(error.message);
      return data ?? [];
    },
    staleTime: 0, // always fetch fresh when invalidated
    refetchOnWindowFocus: true,
  });

// ✅ New hook to fetch all rated teacher IDs by current user
export const useUserRatedTeacherIds = (userId?: string) =>
  useQuery({
    queryKey: ["ratedTeachers", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ratings")
        .select("teacher_id")
        .eq("user_id", userId!);

      if (error) throw new Error(error.message);
      return data.map((r) => r.teacher_id as string);
    },
  });

// fetching teacher details
export const useTeacher = (id: string) =>
  useQuery({
    queryKey: ["teacher", id],
    enabled: !!id, // only run when we actually have an ID
    queryFn: async () => {
      const { data, error } = await supabase
        .from("teachers")
        .select("*")
        .eq("id", id) // id is now a UUID string
        .single();

      if (error) throw new Error(error.message);
      return data;
    },
  });

// fetch teacher ratings
export const useTeacherRating = (id: string) =>
  useQuery({
    queryKey: ["ratings", id],
    enabled: !!id, // only run when we actually have an ID
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ratings")
        .select("*")
        .eq("teacher_id", id) // id is now a UUID string
        .single();

      if (error) throw new Error(error.message);
      return data;
    },
  });

// fetch existing rating by the current user for this teacher
export const useUserRatingForTeacher = (teacherId?: string, userId?: string) =>
  useQuery({
    queryKey: ["userRating", teacherId, userId],
    enabled: !!teacherId && !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ratings")
        .select("*")
        .eq("teacher_id", teacherId!)
        .eq("user_id", userId!)
        .single();

      // If no rating found, just return undefined (do NOT throw error)
      if (error) throw new Error(error.message);
      return data;
    },
  });

// Insert teacher rating
export const useUpsertRating = () => {
  const queryClient = useQueryClient();

  return useMutation({
    async mutationFn({
      teacher_id,
      user_id,
      teaching,
      evaluation,
      behaviour,
      internals,
      class_average,
      existingRatingId, // NEW: optional param
    }: {
      teacher_id: string;
      user_id: string;
      teaching: number;
      evaluation: number;
      behaviour: number;
      internals: number;
      class_average: string;
      existingRatingId?: string; // if exists, perform update
    }) {
      let result;
      if (existingRatingId) {
        result = await supabase
          .from("ratings")
          .update({
            teaching,
            evaluation,
            behaviour,
            internals,
            class_average,
          })
          .eq("id", existingRatingId)
          .single();
      } else {
        result = await supabase
          .from("ratings")
          .insert({
            teacher_id,
            user_id,
            teaching,
            evaluation,
            behaviour,
            internals,
            class_average,
          })
          .single();
      }

      const { data: updatedRating, error } = result;
      if (error) throw new Error(error.message);
      return updatedRating as Rating;
    },

    onSuccess: (newRating) => {
      if (!newRating) return;

      queryClient.setQueryData(
        ["userRating", newRating.teacher_id, newRating.user_id],
        newRating
      );
      queryClient.setQueryData(["ratings", newRating.teacher_id], newRating);

      queryClient.invalidateQueries({ queryKey: ["teachers"] });
      queryClient.invalidateQueries({ queryKey: ["ratedTeachers", newRating.user_id] });
    },
  });
};

// Fetch user favorite marked teachers
export const useFavoriteTeacherIds = (userId?: string) =>
  useQuery({
    queryKey: ["favoriteTeachers", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("teacher_favorites")
        .select("teacher_id")
        .eq("user_id", userId!);

      if (error) throw new Error(error.message);
      return data.map((r) => r.teacher_id as string);
    },
  });

// handling favorite toggle
export const useToggleFavoriteTeacher = (userId?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    // 1️⃣ The actual server request
    mutationFn: async ({
      teacherId,
      isFavorite,
    }: {
      teacherId: string;
      isFavorite: boolean;
    }) => {
      if (!userId) throw new Error("No auth user");
      if (isFavorite) {
        // Already favorite → upsert (idempotent)
        const { error } = await supabase
          .from("teacher_favorites")
          .upsert(
            { teacher_id: teacherId, user_id: userId },
            { onConflict: "user_id,teacher_id" }
          );
        if (error) throw error;
      } else {
        // Remove favorite
        const { error } = await supabase
          .from("teacher_favorites")
          .delete()
          .eq("teacher_id", teacherId)
          .eq("user_id", userId);
        if (error) throw error;
      }
    },

    // 2️⃣ Before the mutation fires, optimistically update the cache
    onMutate: async ({ teacherId, isFavorite }) => {
      const key = ["favoriteTeachers", userId];
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: key });

      // Snapshot the previous value
      const previous: string[] | undefined = queryClient.getQueryData(key);

      // Compute the new optimistic value
      const newIds = isFavorite
        ? [...(previous ?? []), teacherId]
        : (previous ?? []).filter((id) => id !== teacherId);

      // Optimistically update the cache
      queryClient.setQueryData(key, newIds);

      // Return context containing the snapshot, so we can rollback if needed
      return { previous };
    },
    // 3️⃣ On error, rollback to the snapshot
    onError: (_err, _variables, context: any) => {
      const key = ["favoriteTeachers", userId];
      if (context?.previous) {
        queryClient.setQueryData(key, context.previous);
      }
    },
    // 4️⃣ In any case, refetch so we're in sync with the server
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["favoriteTeachers", userId] });
    },
  });
};
