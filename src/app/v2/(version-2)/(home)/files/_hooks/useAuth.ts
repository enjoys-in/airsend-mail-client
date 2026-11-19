import { type DriveProvider } from "@nimbus/_packages/shared";
import { authClient } from "@nimbus/_packages/auth/auth-client";
import { useNavigate } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import env from "@nimbus/_packages/env/client";
import { FILES_BASE_PATH } from "@nimbus/_lib/base-path";
import { toast } from "sonner";

// Simple error handler
const handleAuthError = (error: unknown, defaultMessage: string): string => {
	if (error instanceof Error) {
		return error.message || defaultMessage;
	}
	return defaultMessage;
};

// Social auth hook: links a storage provider (Google Drive, OneDrive, ...). AirSend owns sign-in, sign-up, sign-out and
// passwords, so the Nimbus hooks for those are gone.
export const useSocialAuth = () => {
	const navigate = useNavigate();

	return useMutation({
		mutationFn: async (options: { provider: DriveProvider; callbackURL?: string }) => {
			const isLoggedIn = await authClient.getSession();
			const action = isLoggedIn.data?.session ? "link" : "signin";
			const providerName = options.provider.charAt(0).toUpperCase() + options.provider.slice(1);

			const authPromise =
				action === "link"
					? authClient.linkSocial({
							provider: options.provider,
							callbackURL: options.callbackURL || `${env.VITE_FRONTEND_URL}${FILES_BASE_PATH}/dashboard`,
						})
					: authClient.signIn.social({
							provider: options.provider,
							callbackURL: `${env.VITE_FRONTEND_URL}${FILES_BASE_PATH}/dashboard`,
						});

			return toast.promise(authPromise, {
				loading: action === "link" ? `Linking ${providerName} account...` : `Signing in with ${providerName}...`,
				success: action === "link" ? `Successfully linked ${providerName} account` : `Signed in with ${providerName}`,
				error: error => handleAuthError(error, `${options.provider} authentication failed`),
			});
		},
		onSuccess: () => {
			navigate({ to: "/dashboard" });
		},
	});
};
