// Types only: the session user the backend returns (better-auth `user`, or the AirSend identity when the backend runs
// with AIRSEND_AUTH_ENABLED). The server-side auth setup stays in the backend repo.
export type SessionUser = {
	id: string;
	name: string;
	email: string;
	emailVerified?: boolean;
	image?: string | null;
	createdAt?: Date | string;
	updatedAt?: Date | string;
};
