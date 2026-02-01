import { supabase } from "@/libs/supabase";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Tables } from "@/types";

// Query options factory for teachers reviewed by user
export const teachersReviewedQueryOptions = (userId?: string) => ({
  queryKey: ["teachersReviewed", userId] as const,
  enabled: !!userId,
  queryFn: async (): Promise<Tables<"teachers">[]> => {
    if (!userId) return [];

    // Single query with join - eliminates request waterfall!
    const { data, error } = await supabase
      .from("ratings")
      .select(
        `
        teacher_id,
        teachers!inner (
          id, full_name, average_rating, rating_count, 
          cabin_no, mobile_no, created_at, updated_at, status, created_by
        )
      `,
      )
      .eq("user_id", userId)
      .eq("teachers.status", "verified");

    if (error) throw new Error(error.message);

    // Extract teacher objects from the joined result
    return (data ?? []).map((r: any) => r.teachers as Tables<"teachers">);
  },
  // Uses default staleTime (5 min) and gcTime (1 hour)
});

export const useTeachersReviewedByUser = (userId?: string) =>
  useQuery(teachersReviewedQueryOptions(userId));

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
      queryClient.invalidateQueries({
        queryKey: ["userRating", teacherId, userId],
      });
      queryClient.invalidateQueries({ queryKey: ["ratedTeachers", userId] });
      queryClient.invalidateQueries({ queryKey: ["teachersReviewed", userId] });
      // ratingsByTeacher invalidation also refreshes breakdown (derived via select)
      queryClient.invalidateQueries({
        queryKey: ["ratingsByTeacher", teacherId],
      });
      queryClient.invalidateQueries({ queryKey: ["teacher", teacherId] });
      queryClient.invalidateQueries({ queryKey: ["teachers"] });
    },
  });
};

// Query options factory for teachers created by user
export const teachersCreatedQueryOptions = (userId?: string) => ({
  queryKey: ["teachersCreated", userId] as const,
  enabled: !!userId,
  queryFn: async (): Promise<Tables<"teachers">[]> => {
    if (!userId) return [];
    const { data, error } = await supabase
      .from("teachers")
      .select("*")
      .eq("created_by", userId)
      .order("full_name");
    if (error) throw new Error(error.message);
    return data ?? [];
  },
  // Uses default staleTime (5 min) and gcTime (1 hour)
});

export const useTeachersCreatedByUser = (userId?: string) =>
  useQuery(teachersCreatedQueryOptions(userId));

// Read-only status checker for a teacher's approval status
export const useApprovalPending = (teacherId?: string) =>
  useQuery({
    queryKey: ["approvalStatus", teacherId],
    enabled: !!teacherId,
    queryFn: async (): Promise<Tables<"teachers">["status"] | null> => {
      const { data, error } = await supabase
        .from("teachers")
        .select("status")
        .eq("id", teacherId!)
        .single();
      if (error) throw new Error(error.message);
      return data?.status ?? null;
    },
    staleTime: 30_000, // Check status more frequently
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
