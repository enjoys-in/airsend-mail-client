import { createAuthClient } from "better-auth/react";
import { polarClient } from "@polar-sh/better-auth";
import env from "@nimbus/_packages/env/client";

// Calls the files backend directly. It reads the AirSend `access_token` cookie (credentials are included), and its
// /api/auth/get-session answers from that token when AIRSEND_AUTH_ENABLED is on.
export const authClient = createAuthClient({
	baseURL: env.VITE_BACKEND_URL,
	fetchOptions: { credentials: "include" },
	callbackUrl: `${env.VITE_FRONTEND_URL}/dashboard`,
	// The generic-OAuth plugin is not used by the UI and is not exported by the installed better-auth.
	plugins: [polarClient()],
});
