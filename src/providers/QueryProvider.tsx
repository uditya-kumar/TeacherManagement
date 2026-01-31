import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PropsWithChildren } from 'react';

/**
 * QueryClient with sensible defaults for React Native
 * 
 * - staleTime: 5 min - Data won't refetch for 5 minutes
 * - gcTime: 1 hour - Unused data stays in cache for 1 hour
 * - retry: 2 - Retry failed requests twice
 * - refetchOnWindowFocus: false - Don't refetch when app resumes (handled by realtime)
 * - refetchOnReconnect: true - Refetch when network reconnects
 */
const client = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,      // 5 minutes
      gcTime: 1000 * 60 * 60,        // 1 hour
      retry: 2,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      refetchOnMount: true,
    },
    mutations: {
      retry: 0,  // Don't retry mutations
    },
  },
});

export default function QueryProvider({ children }: PropsWithChildren) {
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}