import { useEffect, useRef, useState } from "react";
import { supabase } from "@/libs/supabase";
import { useQueryClient } from "@tanstack/react-query";

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
        () => {
          queryClient.invalidateQueries({ queryKey: ["teachers"] });
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
