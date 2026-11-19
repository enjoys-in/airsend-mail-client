import type { CreateS3AccountSchema, CreateTelegramAccountSchema, DriveProvider } from "@nimbus/_packages/shared";
import { providerToSlug } from "@nimbus/_packages/shared";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import env from "@nimbus/_packages/env/client";
import { useNavigate } from "@tanstack/react-router";

type CreatedAccount = { id: string; accountId: string; providerId: DriveProvider; nickname?: string | null };

async function postAccount(path: "s3" | "telegram", body: unknown, fallbackMessage: string): Promise<CreatedAccount> {
	const response = await fetch(`${env.VITE_BACKEND_URL}/api/account/${path}`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		credentials: "include",
		body: JSON.stringify(body),
	});
	const payload = (await response.json().catch(() => null)) as
		| (Partial<CreatedAccount> & { message?: string; data?: CreatedAccount })
		| null;
	if (!response.ok) throw new Error(payload?.message || fallbackMessage);
	// The backend answers with the account itself (some responses wrap it in `data`).
	const account = (payload?.data ?? payload) as CreatedAccount | null;
	if (!account?.accountId || !account.providerId) throw new Error(fallbackMessage);
	return account;
}

/** After an account is added: refresh the lists and open the new account's files. */
function useAfterConnect() {
	const queryClient = useQueryClient();
	const navigate = useNavigate();
	return async (account: CreatedAccount) => {
		await Promise.all([
			queryClient.invalidateQueries({ queryKey: ["accounts"] }),
			queryClient.invalidateQueries({ queryKey: ["user"] }),
		]);
		const providerSlug = providerToSlug(account.providerId);
		if (providerSlug) {
			navigate({
				to: "/dashboard/$providerSlug/$accountId",
				params: { providerSlug, accountId: account.accountId },
			});
		}
	};
}

/** POST /api/account/s3 - connect an S3-compatible bucket. */
export function useCreateS3Account() {
	const afterConnect = useAfterConnect();
	return useMutation({
		mutationFn: (data: CreateS3AccountSchema) =>
			postAccount(
				"s3",
				{ ...data, endpoint: data.endpoint || undefined, nickname: data.nickname || null },
				"Failed to add S3 account"
			),
		onSuccess: afterConnect,
	});
}

/** POST /api/account/telegram - connect a Telegram chat through a bot. */
export function useCreateTelegramAccount() {
	const afterConnect = useAfterConnect();
	return useMutation({
		mutationFn: (data: CreateTelegramAccountSchema) =>
			postAccount(
				"telegram",
				{ ...data, nickname: data.nickname || undefined },
				"Failed to add Telegram account"
			),
		onSuccess: afterConnect,
	});
}
