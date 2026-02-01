import { supabase } from "@/libs/supabase";
import { useQuery, useMutation, useQueryClient, queryOptions } from "@tanstack/react-query";
import { Tables } from "@/types";

// ============================================================
// Query Options Factories (Best Practice for TanStack Query v5)
// ============================================================

/**
 * Query options for teacher list - reusable across components
 * Uses QueryClient defaults for staleTime, gcTime, refetchOnWindowFocus
 */
export const teacherListQueryOptions = () =>
  queryOptions({
    queryKey: ["teachers"] as const,
    queryFn: async (): Promise<Tables<"teachers">[]> => {
      const { data, error } = await supabase
        .from("teachers")
        .select(
          "id, full_name, average_rating, rating_count, cabin_no, mobile_no, created_at, updated_at, status, created_by"
        )
        .eq("status", "verified");
      if (error) throw new Error(error.message);
      return data ?? [];
    },
    // Uses defaults: staleTime: 5min, gcTime: 1hr
  });

/**
 * Query options for single teacher - supports placeholderData
 */
export const teacherQueryOptions = (
  id: string,
  placeholderData?: Tables<"teachers"> | (() => Tables<"teachers"> | undefined)
) =>
  queryOptions({
    queryKey: ["teacher", id] as const,
    enabled: !!id,
    queryFn: async (): Promise<Tables<"teachers">> => {
      const { data, error } = await supabase
        .from("teachers")
        .select(
          "id, full_name, average_rating, rating_count, cabin_no, mobile_no, created_at, updated_at, status, created_by"
        )
        .eq("id", id)
        .single();

      if (error) throw new Error(error.message);
      return data;
    },
    placeholderData:
      typeof placeholderData === "function"
        ? (placeholderData as () => Tables<"teachers"> | undefined)
        : (placeholderData as Tables<"teachers"> | undefined),
    // Uses defaults: staleTime: 5min, gcTime: 1hr
  });

/**
 * Query options for rated teacher IDs
 * staleTime: Infinity - This data rarely changes (only when user rates)
 * gcTime: Infinity - Keep in cache forever (small data)
 */
export const ratedTeacherIdsQueryOptions = (userId?: string) =>
  queryOptions({
    queryKey: ["ratedTeachers", userId] as const,
    enabled: !!userId,
    queryFn: async (): Promise<string[]> => {
      const { data, error } = await supabase
        .from("ratings")
        .select("teacher_id")
        .eq("user_id", userId!);

      if (error) throw new Error(error.message);
      return data.map((r) => r.teacher_id as string);
    },
    staleTime: Infinity, // Never stale - invalidated on rating
    gcTime: Infinity,    // Keep forever (consistent with staleTime)
  });

/**
 * Query options for favorite teacher IDs
 * staleTime: Infinity - Invalidated on toggle
 * gcTime: Infinity - Keep in cache forever (small data)
 */
export const favoriteTeacherIdsQueryOptions = (userId?: string) =>
  queryOptions({
    queryKey: ["favoriteTeachers", userId] as const,
    enabled: !!userId,
    queryFn: async (): Promise<string[]> => {
      const { data, error } = await supabase
        .from("teacher_favorites")
        .select("teacher_id")
        .eq("user_id", userId!);

      if (error) throw new Error(error.message);
      return data.map((r) => r.teacher_id as string);
    },
    staleTime: Infinity, // Never stale - invalidated on toggle
    gcTime: Infinity,    // Keep forever (consistent with staleTime)
  });

// ============================================================
// Hooks (using query options factories)
// ============================================================

/** Fetch all verified teachers */
export const useTeacherList = () => useQuery(teacherListQueryOptions());

/** Fetch teacher IDs rated by current user */
export const useUserRatedTeacherIds = (userId?: string) =>
  useQuery(ratedTeacherIdsQueryOptions(userId));

/** Fetch single teacher details */
export const useTeacher = (
  id: string,
  options?: {
    placeholderData?: Tables<"teachers"> | (() => Tables<"teachers"> | undefined);
  }
) => useQuery(teacherQueryOptions(id, options?.placeholderData));

/** Fetch favorite teacher IDs for current user */
export const useFavoriteTeacherIds = (userId?: string) =>
  useQuery(favoriteTeacherIdsQueryOptions(userId));

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

// Create teacher (pending) and optionally the creator's initial rating
export const useCreateTeacher = (userId?: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["createTeacher", userId],
    mutationFn: async ({
      full_name,
      cabin_no,
      mobile_no,
      initialRating,
      class_average,
    }: {
      full_name: string;
      cabin_no?: string;
      mobile_no?: string;
      initialRating?: {
        teaching: number;
        evaluation: number;
        behaviour: number;
        internals: number;
      };
      class_average?: string;
    }) => {
      if (!userId) throw new Error("No auth user");
      // 1) Insert teacher with pending status
      const { data: teacher, error: tErr } = await supabase
        .from("teachers")
        .insert({
          full_name,
          cabin_no: cabin_no ?? null,
          mobile_no: mobile_no ?? null,
          status: "pending",
          created_by: userId,
        })
        .select("*")
        .single();
      if (tErr) throw new Error(tErr.message);

      // 2) Optionally insert initial rating by creator
      if (initialRating && class_average) {
        const { error: rErr } = await supabase
          .from("ratings")
          .insert({
            teacher_id: teacher.id,
            user_id: userId,
            teaching: initialRating.teaching,
            evaluation: initialRating.evaluation,
            behaviour: initialRating.behaviour,
            internals: initialRating.internals,
            class_average,
          })
          .single();
        if (rErr) throw new Error(rErr.message);
      }

      return teacher as Tables<"teachers">;
    },
    onSuccess: () => {
      // refresh related lists
      queryClient.invalidateQueries({ queryKey: ["teachersCreated"] });
    },
  });
};
