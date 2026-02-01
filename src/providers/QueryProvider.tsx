import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PropsWithChildren } from 'react';
import { showToast } from '@/libs/toastService';

/**
 * QueryClient with sensible defaults for React Native
 * 
 * - staleTime: 5 min - Data won't refetch for 5 minutes
 * - gcTime: 1 hour - Unused data stays in cache for 1 hour
 * - Smart retry - Don't retry on 404s or client errors
 * - refetchOnWindowFocus: false - Don't refetch when app resumes (handled by realtime)
 * - refetchOnReconnect: true - Refetch when network reconnects
 */
const client = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,      // 5 minutes
      gcTime: 1000 * 60 * 60,        // 1 hour
      // Smart retry: Don't retry on 404s or client errors (4xx)
      retry: (failureCount, error) => {
        // Don't retry on client errors (4xx)
        if (error instanceof Error) {
          const message = error.message.toLowerCase();
          if (
            message.includes('not found') ||
            message.includes('unauthorized') ||
            message.includes('forbidden') ||
            message.includes('pgrst116') // Supabase "row not found"
          ) {
            return false;
          }
        }
        // Retry up to 2 times for other errors (network issues, 5xx)
        return failureCount < 2;
      },
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      refetchOnMount: true,
    },
    mutations: {
      retry: 0,  // Don't retry mutations
      // Global mutation error handler
      onError: (error) => {
        const message = error instanceof Error ? error.message : 'Something went wrong';
        showToast(message, 2500);
        console.error('[Mutation Error]', error);
      },
    },
  },
});

export default function QueryProvider({ children }: PropsWithChildren) {
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}