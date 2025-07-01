// src/lib/react-query.ts
import { QueryClient } from "@tanstack/react-query";

/**
 * One instance for the entire browser tab ‒ prevents memory leaks
 * when React refreshes during dev or when you navigate between routes.
 */

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000, // 1 minute
      refetchOnWindowFocus: false, // avoid refetching on focus
    },
  },
});
