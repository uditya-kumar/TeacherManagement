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
        .eq("user_id", userId)
      if (ratingsError) throw new Error(ratingsError.message);
      const teacherIds = (ratings ?? []).map((r) => r.teacher_id as string);
      if (teacherIds.length === 0) return [] as Tables<"teachers">[];

      // Fetch teachers by IDs
      const { data: teachers, error: teachersError } = await supabase
        .from("teachers")
        .select(
          "id, full_name, average_rating, rating_count, cabin_no, mobile_no, created_at, updated_at, status, created_by"
        )
        .in("id", teacherIds)
        .eq("status", "verified");
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
      // ratingsByTeacher invalidation also refreshes breakdown (derived via select)
      queryClient.invalidateQueries({ queryKey: ["ratingsByTeacher", teacherId] });
      queryClient.invalidateQueries({ queryKey: ["teacher", teacherId] });
      queryClient.invalidateQueries({ queryKey: ["teachers"] });
    },
  });
};

export const useTeachersCreatedByUser = (userId?: string) =>
  useQuery({
    queryKey: ["teachersCreated", userId],
    enabled: !!userId,
    queryFn: async () => {
      if (!userId) return [] as Tables<"teachers">[];
      const { data, error } = await supabase
        .from("teachers")
        .select("*")
        .eq("created_by", userId)
        .order("full_name");
      if (error) throw new Error(error.message);
      return (data ?? []) as Tables<"teachers">[];
    },
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    refetchOnWindowFocus: false,
  });

// Read-only status checker for a teacher's approval status
export const useApprovalPending = (teacherId?: string) =>
  useQuery({
    queryKey: ["approvalStatus", teacherId],
    enabled: !!teacherId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("teachers")
        .select("status")
        .eq("id", teacherId as string)
        .single();
      if (error) throw new Error(error.message);
      return (data?.status ?? null) as Tables<"teachers">["status"] | null;
    },
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });

// Delete the teacher row (only works if row is pending enforced at DB level)
export const useDeleteTeacher = (userId?: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["deleteTeacher", userId],
    mutationFn: async ({ teacherId }: { teacherId: string }) => {
      const { error } = await supabase
        .from("teachers")
        .delete()
        .eq("id", teacherId)
        .eq("status", "pending");
      if (error) throw new Error(error.message);
      return { teacherId };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teachersCreated", userId] });
      queryClient.invalidateQueries({ queryKey: ["teachers"] });
    },
  });
};


