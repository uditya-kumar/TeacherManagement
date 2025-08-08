import { supabase } from "@/libs/supabase";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Tables } from "@/types";

type Rating = Tables<"ratings">;

//Fetch all teachers list
export const useTeacherList = () =>
  useQuery({
    queryKey: ["teachers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("teachers")
        .select(
          "id, full_name, average_rating, rating_count, cabin_no, mobile_no, created_at, updated_at, status"
        );
      if (error) throw new Error(error.message);
      return data ?? [];
    },
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: "always",
    refetchOnMount: false,
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
    staleTime: Infinity,
    gcTime: 10 * 60_000,
    refetchOnWindowFocus: false,
  });

// fetching teacher details
export const useTeacher = (
  id: string,
  options?: {
    placeholderData?: Tables<"teachers"> | (() => Tables<"teachers"> | undefined);
  }
) =>
  useQuery({
    queryKey: ["teacher", id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("teachers")
        .select(
          "id, full_name, average_rating, rating_count, cabin_no, mobile_no, created_at, updated_at, status, created_by"
        )
        .eq("id", id) // id is now a UUID string
        .single();

      if (error) throw new Error(error.message);
      return data;
    },
    placeholderData:
      typeof options?.placeholderData === "function"
        ? (options?.placeholderData as () => Tables<"teachers"> | undefined)
        : (options?.placeholderData as Tables<"teachers"> | undefined),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

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
    staleTime: Infinity,
    gcTime: 10 * 60_000,
    refetchOnWindowFocus: false,
  });

// handling favorite toggle
export const useToggleFavoriteTeacher = (userId?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["toggleFavoriteTeacher", userId],
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
