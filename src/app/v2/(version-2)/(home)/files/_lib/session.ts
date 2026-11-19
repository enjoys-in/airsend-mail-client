import type { SessionUser } from "@nimbus/_packages/auth/auth";
import { useQuery } from "@tanstack/react-query";
import env from "@nimbus/_packages/env/client";

/**
 * The signed-in AirSend user, as the files backend sees them. There is no Nimbus sign-in: the backend verifies the AirSend
 * `access_token` cookie (shared JWT secret) and answers `GET /api/auth/get-session` from it - the user and session, or
 * `null` when there is no valid token.
 */
export type Session = {
	user: SessionUser & { defaultAccountId?: string | null; defaultProviderId?: string | null };
	session: { id: string; userId: string; expiresAt?: string | Date };
};

export const SESSION_QUERY_KEY = ["session"] as const;

/** Fetches the session. Resolves `null` when signed out; throws when the backend cannot be reached or errors. */
export async function getSession(): Promise<Session | null> {
	const response = await fetch(`${env.VITE_BACKEND_URL}/api/auth/get-session`, { credentials: "include" });
	if (response.status === 401 || response.status === 403) return null;
	if (!response.ok) throw new Error(`Failed to load the session (${response.status})`);
	const data = (await response.json().catch(() => null)) as Session | null;
	return data?.user ? data : null;
}

export function useSession() {
	const { data, isPending, error, refetch } = useQuery({
		queryKey: SESSION_QUERY_KEY,
		queryFn: getSession,
		staleTime: 60_000,
		retry: false,
	});
	return { data: data ?? null, isPending, error: error as Error | null, refetch };
}
