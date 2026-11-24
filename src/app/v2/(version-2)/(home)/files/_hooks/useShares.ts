import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAccountProvider } from "@/app/v2/(version-2)/(home)/files/_components/providers/account-provider";
import { toast } from "sonner";
import { FILES_REFRESH_MS } from "@/app/v2/(version-2)/(home)/files/_lib/files-list-cache";

// Sharing a file of the open storage account: public links and sharing with people (files server /api/shares).

export interface ShareLink {
	id: string;
	token: string;
	fileId: string;
	name: string;
	createdBy: string;
	createdAt: string;
	expiresAt: string | null;
	downloadCount: number;
	/** Absolute public download link. */
	url: string;
}

export interface ShareUser {
	id: string;
	kind: "drive" | "workspace";
	fileId: string;
	name: string;
	mimeType: string;
	size: number;
	sharedBy: string;
	sharedWith: string;
	createdAt: string;
}

export type SharedWithMe = ShareUser & { providerId?: string; accountId?: string };

type Client = any; // the RPC client is untyped (see _utils/client.ts)

/** Runs a request and returns its JSON, or throws the server's own message. */
async function call<T>(clientPromise: Promise<Client>, run: (client: Client) => Promise<Response>): Promise<T> {
	const res = await run(await clientPromise);
	if (!res.ok) {
		const body = (await res.json().catch(() => null)) as { message?: string } | null;
		throw new Error(body?.message || `Request failed (${res.status})`);
	}
	return (res.status === 204 ? null : await res.json()) as T;
}

/** The share API's address of a file in the open storage account. */
function useTarget(fileId: string) {
	const { clientPromise, providerId, accountId } = useAccountProvider();
	const target = { kind: "drive" as const, providerId: providerId ?? "", accountId: accountId ?? "", fileId };
	return { clientPromise, target, ready: !!providerId && !!accountId };
}

const fail = (err: unknown) => toast.error(err instanceof Error ? err.message : "Something went wrong");

export function useShareLinks(fileId: string, enabled: boolean) {
	const { clientPromise, target, ready } = useTarget(fileId);
	const key = ["shareLinks", target.accountId, fileId];
	const qc = useQueryClient();
	const list = useQuery({
		queryKey: key,
		queryFn: () => call<ShareLink[]>(clientPromise, c => c.api.shares.links.$get({ query: target })),
		enabled: enabled && ready,
	});
	const refresh = () => void qc.invalidateQueries({ queryKey: key });
	const create = useMutation({
		mutationFn: (expiresInDays: number | null) =>
			call<ShareLink>(clientPromise, c => c.api.shares.links.$post({ json: { ...target, expiresInDays } })),
		onSuccess: refresh,
		onError: fail,
	});
	const revoke = useMutation({
		mutationFn: (id: string) => call(clientPromise, c => c.api.shares.links[":id"].$delete({ param: { id } })),
		onSuccess: refresh,
		onError: fail,
	});
	return { list, create, revoke };
}

export function useSharePeople(fileId: string, enabled: boolean) {
	const { clientPromise, target, ready } = useTarget(fileId);
	const key = ["shareUsers", target.accountId, fileId];
	const qc = useQueryClient();
	const list = useQuery({
		queryKey: key,
		queryFn: () => call<ShareUser[]>(clientPromise, c => c.api.shares.users.$get({ query: target })),
		enabled: enabled && ready,
	});
	const refresh = () => void qc.invalidateQueries({ queryKey: key });
	const share = useMutation({
		mutationFn: (emails: string[]) =>
			call<ShareUser[]>(clientPromise, c => c.api.shares.users.$post({ json: { ...target, emails } })),
		onSuccess: refresh,
		onError: fail,
	});
	const remove = useMutation({
		mutationFn: (id: string) => call(clientPromise, c => c.api.shares.users[":id"].$delete({ param: { id } })),
		onSuccess: refresh,
		onError: fail,
	});
	return { list, share, remove };
}

export function useSharedWithMe(enabled: boolean) {
	const { clientPromise } = useAccountProvider();
	const list = useQuery({
		queryKey: ["sharedWithMe"],
		queryFn: () => call<SharedWithMe[]>(clientPromise, c => c.api.shares["with-me"].$get()),
		enabled,
		refetchInterval: FILES_REFRESH_MS,
	});
	const download = useMutation({
		mutationFn: async (item: SharedWithMe) => {
			const client: Client = await clientPromise;
			const res: Response = await client.api.shares["with-me"][":id"].download.$get({ param: { id: item.id } });
			if (!res.ok) throw new Error(res.status === 404 ? "This file is no longer shared" : "Download failed");
			saveBlob(await res.blob(), item.name);
		},
		onError: fail,
	});
	return { list, download };
}

export function saveBlob(blob: Blob, name: string) {
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = name;
	document.body.appendChild(a);
	a.click();
	a.remove();
	URL.revokeObjectURL(url);
}
