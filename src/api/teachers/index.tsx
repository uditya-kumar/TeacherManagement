import { supabase } from "@/libs/supabase";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

//Fetch all teachers list
export const useTeacherList = () =>
  useQuery({
    queryKey: ["teachers"],
    queryFn: async () => {
      const { data, error } = await supabase.from("teachers").select("*");
      if (error) throw new Error(error.message);
      return data ?? [];
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


// Insert teacher rating
export const useSubmitRating = () => {
  const queryClient = useQueryClient();

  return useMutation({
    async mutationFn(data: {
      teacher_id: string;
      user_id: string;
      teaching: number;
      evaluation: number;
      behaviour: number;
      internals: number;
      class_average: string;
    }) {
      const { data: newRating, error } = await supabase
        .from("ratings")
        .insert({
          teacher_id: data.teacher_id,
          user_id: data.user_id,
          teaching: data.teaching,
          evaluation: data.evaluation,
          behaviour: data.behaviour,
          internals: data.internals,
          class_average: data.class_average,
        })
        .single(); // assuming you want a single inserted row

      if (error) {
        throw new Error(error.message);
      }

      return newRating;
    },

    // Optional: Refetch any relevant queries or handle caching
    // onSuccess: () => {
    //   queryClient.invalidateQueries({ queryKey: ["ratings"] });
    // },
  });
};


// Fetch user favorite marked teachers
export const useFavoriteTeacherIds = (userId?: string) =>
  useQuery({
    queryKey: ["favoriteIds", userId],
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
      const key = ["favoriteIds", userId];
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
      const key = ["favoriteIds", userId];
      if (context?.previous) {
        queryClient.setQueryData(key, context.previous);
      }
    },
    // 4️⃣ In any case, refetch so we're in sync with the server
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["favoriteIds", userId] });
    },
  });
};
