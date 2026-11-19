import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { isServiceUnavailable } from "@/app/v2/(version-2)/(home)/files/_lib/service-unavailable";
import { useState, type ReactNode } from "react";

export function ReactQueryProvider({ children }: { children: ReactNode }) {
	// Create a new QueryClient instance for each session with better configuration
	const [queryClient] = useState(
		() =>
			new QueryClient({
				defaultOptions: {
					queries: {
						staleTime: 15 * 60 * 1000, // 15 minutes
						refetchOnWindowFocus: false,
						// A down backend is reported straight away (no retry loop behind a spinner); other failures retry as before.
						retry: (failureCount: number, error: Error) => !isServiceUnavailable(error) && failureCount < 3,
					},
				},
			})
	);

	return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
