import { supabase } from "@/libs/supabase";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export const useTeacherList = () => {
  return useQuery({
    queryKey: ["teachers"],
    queryFn: async () => {
      const { data, error } = await supabase.from("teachers").select("*");
      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
  });
};



