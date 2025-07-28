import { supabase } from "@/libs/supabase";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export const useTeacherList = () =>
  useQuery({
    queryKey: ["teachers"],
    queryFn: async () => {
      const { data, error } = await supabase.from("teachers").select("*");
      if (error) throw new Error(error.message);
      return data ?? [];
    },
  });

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

export const useToggleFavoriteTeacher = (userId?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      teacherId,
      isFavorite,
    }: {
      teacherId: string;
      isFavorite: boolean;
    }) => {
      if (!userId) throw new Error("No auth user");

      if (isFavorite) { // If the desired state is "favorite", add the record
        const { error } = await supabase
          .from("teacher_favorites")
          .upsert(
            { teacher_id: teacherId, user_id: userId },
            { onConflict: "user_id,teacher_id" }
          );
        if (error) throw error;
      } else { // If the desired state is "not favorite", delete the record
        const { error } = await supabase
          .from("teacher_favorites")
          .delete()
          .eq("teacher_id", teacherId)
          .eq("user_id", userId);
        if (error) throw error;
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["favoriteIds", userId] });
    },
  });
};
