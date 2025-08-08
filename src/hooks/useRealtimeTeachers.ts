import { useEffect, useRef, useState } from "react";
import { supabase } from "@/libs/supabase";
import { useQueryClient } from "@tanstack/react-query";
import { Tables } from "@/types";

// Module-level singleton and flags (persist across hook calls/mounts, reset on full reload)
let teachersChannel: ReturnType<typeof supabase.channel> | null = null;
let isListenerAdded = false;

export const useRealtimeTeachers = () => {
  const queryClient = useQueryClient();
  const [realtimeStatus, setRealtimeStatus] = useState<string | null>(null);
  const subscribedRef = useRef(false);

  useEffect(() => {
    if (subscribedRef.current) return;

    if (!teachersChannel) {
      teachersChannel = supabase.channel("realtime:public:teachers");
    }

    if (!isListenerAdded) {
      teachersChannel.on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "teachers",
        },
        (payload) => {
          const eventType = payload.eventType as
            | "INSERT"
            | "UPDATE"
            | "DELETE"
            | "TRUNCATE";

          const newRow = payload.new as Tables<"teachers"> | null;
          const oldRow = payload.old as Tables<"teachers"> | null;

          // Merge changes directly into the teachers list cache
          queryClient.setQueryData(
            ["teachers"],
            (current: Tables<"teachers">[] | undefined) => {
              if (!current) return current;
              switch (eventType) {
                case "INSERT": {
                  if (newRow && !current.some((t) => t.id === newRow.id)) {
                    return [newRow, ...current];
                  }
                  return current.map((t) => (t.id === newRow?.id ? { ...t, ...newRow } : t));
                }
                case "UPDATE": {
                  if (!newRow) return current;
                  return current.map((t) => (t.id === newRow.id ? { ...t, ...newRow } : t));
                }
                case "DELETE": {
                  if (!oldRow) return current;
                  return current.filter((t) => t.id !== oldRow.id);
                }
                default:
                  return current;
              }
            }
          );

          // Also keep individual teacher cache in sync
          if ((eventType === "INSERT" || eventType === "UPDATE") && newRow) {
            queryClient.setQueryData(["teacher", newRow.id], (cur: Tables<"teachers"> | undefined) => ({
              ...(cur ?? {} as any),
              ...newRow,
            }));
          }
          if (eventType === "DELETE" && oldRow) {
            queryClient.removeQueries({ queryKey: ["teacher", oldRow.id], exact: true });
          }
        }
      );
      isListenerAdded = true;
    }

    teachersChannel.subscribe((status) => {
      setRealtimeStatus(status);
    });

    subscribedRef.current = true;

    return () => {
      teachersChannel?.unsubscribe();
    };
  }, [queryClient]);

  return { status: realtimeStatus };
};
