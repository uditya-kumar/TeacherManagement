import { Tables } from "@/types";
import { supabase } from "@/libs/supabase";
import { useMutation, useQueryClient } from "@tanstack/react-query";

type BugReportInput = {
  title: string;
  description: string;
  steps_to_reproduce?: string;
  expected_behavior?: string;
  actual_behavior?: string;
  browser_info?: string;
};

type BugReportResponse = Tables<'bug_reports'>

export const useSubmitBugReport = (userId?: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["submitBugReport", userId],
    mutationFn: async (payload: BugReportInput) => {
      if (!userId) throw new Error("No user");
      const { data, error } = await supabase
        .from("bug_reports")
        .insert({
          user_id: userId,
          title: payload.title,
          description: payload.description,
          steps_to_reproduce: payload.steps_to_reproduce ?? null,
          expected_behavior: payload.expected_behavior ?? null,
          actual_behavior: payload.actual_behavior ?? null,
          browser_info: payload.browser_info ?? null,
        })
        .select("*")
        .single();
      if (error) throw new Error(error.message);
      return data as BugReportResponse;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bugReports", userId] });
    },
  });
};


