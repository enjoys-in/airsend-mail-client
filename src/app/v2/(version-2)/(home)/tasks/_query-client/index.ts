import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";
import {
  handleUnauthorized,
  isUnauthorizedError,
  setSessionRecoveredHandler,
} from "@tasks/_lib/http-error";
import { isForbiddenOrNotFound } from "@tasks/_lib/is-forbidden-or-not-found";
import { isRestoredPending } from "@tasks/_lib/query-restore-state";

// TanStack raises these before any fetcher-level message exists; CORS rejections
// from the browser also surface here. Avoid retrying those automatically.
function isNetworkError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  return (
    error.message.includes("Failed to fetch") ||
    error.message.includes("NetworkError") ||
    error.message.includes("Load failed") ||
    error.message.includes("CORS")
  );
}

const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        // Keep the 401 in query state so polling guards stay stopped while
        // navigation completes. Better Auth's session is a separate store.
        handleUnauthorized();
      }
    },
  }),
  mutationCache: new MutationCache({
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        handleUnauthorized();
      }
    },
  }),
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnMount: (query) => (isRestoredPending(query.queryHash) ? "always" : false),
      retry: (failureCount, error) =>
        isNetworkError(error) ||
        isUnauthorizedError(error) ||
        isForbiddenOrNotFound(error)
          ? false
          : failureCount < 2,
    },
    mutations: {
      retry: false,
    },
  },
});

// After a 401 the session is re-opened silently; refetch everything that failed.
setSessionRecoveredHandler(() => {
  void queryClient.invalidateQueries();
});

export default queryClient;
