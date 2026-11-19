import type { SessionUser } from "@/app/v2/(version-2)/(home)/files/_packages/auth/auth";
import { useQuery } from "@tanstack/react-query";
import { serviceFetch } from "@/app/v2/(version-2)/(home)/files/_lib/service-unavailable";
import env from "@/app/v2/(version-2)/(home)/files/_packages/env/client";

/**
 * The signed-in AirSend user, as the files backend sees them. There is no Nimbus sign-in: the backend verifies the AirSend
 * `access_token` cookie (shared JWT secret) and answers `GET /api/auth/get-session` from it - the user, the session and the
 * user's organization, or `null` when there is no valid token.
 */
export type OrganizationRole = "owner" | "admin" | "member";

/** Storage is configured per organization. Only owners and admins (`canManageStorage`) may change it. */
export type Organization = {
	id: string;
	name: string;
	role: OrganizationRole;
	canManageStorage: boolean;
};

export type Session = {
	user: SessionUser & { defaultAccountId?: string | null; defaultProviderId?: string | null };
	session: { id: string; userId: string; expiresAt?: string | Date };
	organization?: Organization | null;
};

export const SESSION_QUERY_KEY = ["session"] as const;

export const ORG_ONLY_MESSAGE = "Files are available to organization accounts only.";

/** The backend refused the request (403): the account is not in an organization, or has no files access. */
export class FilesForbiddenError extends Error {
	constructor(message: string = ORG_ONLY_MESSAGE) {
		super(message);
		this.name = "FilesForbiddenError";
	}
}

/**
 * Fetches the session. Resolves `null` when signed out (401); throws `FilesForbiddenError` on 403, `ServiceUnavailableError`
 * when the backend cannot be reached, and a plain Error for any other failure.
 */
export async function getSession(): Promise<Session | null> {
	const response = await serviceFetch(`${env.VITE_BACKEND_URL}/api/auth/get-session`, { credentials: "include" });
	if (response.status === 401) return null;
	if (response.status === 403) {
		const body = (await response.json().catch(() => null)) as { message?: string } | null;
		throw new FilesForbiddenError(body?.message || ORG_ONLY_MESSAGE);
	}
	if (!response.ok) throw new Error(`Failed to load the session (${response.status})`);
	const data = (await response.json().catch(() => null)) as Session | null;
	return data?.user ? data : null;
}

export function useSession() {
	const { data, isPending, error, refetch } = useQuery({
		queryKey: SESSION_QUERY_KEY,
		queryFn: getSession,
		// Short on purpose: a role change (published by airsend-api) is picked up on the next focus or within 15s.
		staleTime: 15_000,
		refetchOnWindowFocus: true,
		retry: false,
	});
	return { data: data ?? null, isPending, error: error as Error | null, refetch };
}

/** The user's organization and whether they may configure its storage (owner or admin). */
export function useOrganization() {
	const { data, isPending } = useSession();
	const organization = data?.organization ?? null;
	return { organization, canManageStorage: !!organization?.canManageStorage, isPending };
}
