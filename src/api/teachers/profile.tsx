import { supabase } from "@/libs/supabase";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Tables } from "@/types";

export const useTeachersReviewedByUser = (userId?: string) =>
  useQuery({
    queryKey: ["teachersReviewed", userId],
    enabled: !!userId,
    queryFn: async () => {
      if (!userId) return [] as Tables<"teachers">[];
      // Get teacher_ids the user has rated
      const { data: ratings, error: ratingsError } = await supabase
        .from("ratings")
        .select("teacher_id")
        .eq("user_id", userId);
      if (ratingsError) throw new Error(ratingsError.message);
      const teacherIds = (ratings ?? []).map((r) => r.teacher_id as string);
      if (teacherIds.length === 0) return [] as Tables<"teachers">[];

      // Fetch teachers by IDs
      const { data: teachers, error: teachersError } = await supabase
        .from("teachers")
        .select(
          "id, full_name, average_rating, rating_count, cabin_no, mobile_no, created_at, updated_at, status, created_by"
        )
        .in("id", teacherIds);
      if (teachersError) throw new Error(teachersError.message);
      return (teachers ?? []) as Tables<"teachers">[];
    },
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    refetchOnWindowFocus: false,
  });

export const useDeleteUserRatingForTeacher = (userId?: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["deleteUserRating", userId],
    mutationFn: async ({ teacherId }: { teacherId: string }) => {
      if (!userId) throw new Error("No user");
      const { error } = await supabase
        .from("ratings")
        .delete()
        .eq("teacher_id", teacherId)
        .eq("user_id", userId);
      if (error) throw new Error(error.message);
      return { teacherId };
    },
    onSuccess: (_data, variables) => {
      const teacherId = variables.teacherId;
      // Invalidate caches impacted by rating removal
      queryClient.invalidateQueries({ queryKey: ["userRating", teacherId, userId] });
      queryClient.invalidateQueries({ queryKey: ["ratedTeachers", userId] });
      queryClient.invalidateQueries({ queryKey: ["teachersReviewed", userId] });
      queryClient.invalidateQueries({ queryKey: ["ratingsByTeacher", teacherId] });
      queryClient.invalidateQueries({ queryKey: ["ratingsBreakdown", teacherId] });
      queryClient.invalidateQueries({ queryKey: ["teacher", teacherId] });
      queryClient.invalidateQueries({ queryKey: ["teachers"] });
    },
  });
};


