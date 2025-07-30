// src/hooks/useRealtimeTeachers.ts
import { useEffect } from "react";
import { supabase } from "@/libs/supabase";
import { useQueryClient } from "@tanstack/react-query";

export const useRealtimeTeachers = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel("teachers-realtime")
      .on(
        "postgres_changes",
        {
          event: "*", // listen to INSERT, UPDATE, DELETE
          schema: "public",
          table: "ratings", // the table that affects ratings
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["teachers"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
};
