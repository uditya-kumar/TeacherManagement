import { supabase } from "@/libs/supabase";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Tables } from "@/types";

type Rating = Tables<"ratings">;

// fetch teacher ratings
export const useTeacherRatings = (teacherId: string) =>
  useQuery({
    queryKey: ["ratingsByTeacher", teacherId],
    enabled: !!teacherId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ratings")
        .select("*")
        .eq("teacher_id", teacherId);

      if (error) throw new Error(error.message);
      return (data ?? []) as Rating[];
    },
    staleTime: 60_000,
    refetchOnWindowFocus: false,
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
      if (error && error.code === "PGRST116") {
        // PGRST116 is the code for "exact one row not found"
        return null; // Return null instead of throwing an error
      }

      if (error) {
        throw new Error(error.message); // Throw for any other errors
      }

      return data;
    },
  });

// Insert teacher rating
export const useUpsertRating = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["upsertRating"],
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

    // Optimistic update: Before mutation, snapshot and update cache
    onMutate: async (variables) => {
      const { teacher_id, user_id, existingRatingId } = variables;
      const ratedKey = ["ratedTeachers", user_id];

      // Cancel ongoing queries to avoid overwrites
      await queryClient.cancelQueries({ queryKey: ratedKey });

      // Snapshot current ratedTeachers
      const previousRated: string[] | undefined =
        queryClient.getQueryData(ratedKey);

      let optimisticRated = previousRated ? [...previousRated] : [];

      // If this is a new rating (insert), optimistically add the teacher_id
      if (!existingRatingId && !optimisticRated.includes(teacher_id)) {
        optimisticRated.push(teacher_id);
      }

      // Set optimistic cache
      queryClient.setQueryData(ratedKey, optimisticRated);

      // Return snapshot for rollback
      return { previousRated, ratedKey };
    },

    // On error, rollback to snapshot
    onError: (_err, _variables, context) => {
      if (context?.previousRated && context?.ratedKey) {
        queryClient.setQueryData(context.ratedKey, context.previousRated);
      }
    },

    // On success, set individual rating data (as before)
    onSuccess: (newRating) => {
      if (!newRating) return;

      // Update the per-user rating cache for this teacher
      queryClient.setQueryData(
        ["userRating", newRating.teacher_id, newRating.user_id],
        newRating
      );

      // Merge into ratings list cache for the teacher if present
      queryClient.setQueryData(
        ["ratingsByTeacher", newRating.teacher_id],
        (old: Rating[] | undefined) => {
          if (!old) return [newRating as Rating];
          const index = old.findIndex((r) => r.id === newRating.id);
          if (index === -1) return [...old, newRating as Rating];
          const copy = [...old];
          copy[index] = newRating as Rating;
          return copy;
        }
      );
    },

    // Always invalidate/refetch for server sync (regardless of success/error)
    onSettled: (newRating, _error, variables) => {
      const teacherId = newRating?.teacher_id ?? variables?.teacher_id;
      const userId = newRating?.user_id ?? variables?.user_id;
      if (teacherId) {
        queryClient.invalidateQueries({ queryKey: ["teacher", teacherId] });
        queryClient.invalidateQueries({
          queryKey: ["ratingsByTeacher", teacherId],
        });
      }
      if (userId) {
        queryClient.invalidateQueries({ queryKey: ["ratedTeachers", userId] });
      }
      queryClient.invalidateQueries({ queryKey: ["teachers"] });
    },
  });
};
