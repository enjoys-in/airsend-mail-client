// Types only: the session user the files backend returns from `GET /api/auth/get-session`. The backend builds it from the
// AirSend JWT (shared secret); there is no Nimbus sign-in or better-auth session.
export type SessionUser = {
	id: string;
	name: string;
	email: string;
	emailVerified?: boolean;
	image?: string | null;
	createdAt?: Date | string;
	updatedAt?: Date | string;
};
