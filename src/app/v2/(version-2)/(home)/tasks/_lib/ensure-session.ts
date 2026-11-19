import { authClient } from "./auth-client";

// Tasks lives inside the AirSend shell, where the user is already signed in, so there is no
// Kaneo sign-in screen. The tasks backend accepts the AirSend `access_token` (the Next.js proxy
// forwards the cookie / Bearer header) and answers `get-session` with a session for that user.
// This only confirms it before the app renders; anything that goes wrong surfaces as a
// `SessionBootstrapError` so the route error boundary can show a retry state.

export type Session = NonNullable<
  Awaited<ReturnType<typeof authClient.getSession>>["data"]
>;

export type SessionBootstrapReason = "unreachable" | "rejected";

export class SessionBootstrapError extends Error {
  readonly reason: SessionBootstrapReason;

  constructor(reason: SessionBootstrapReason, message: string) {
    super(message);
    this.name = "SessionBootstrapError";
    this.reason = reason;
  }
}

export function isSessionBootstrapError(
  error: unknown,
): error is SessionBootstrapError {
  return error instanceof Error && error.name === "SessionBootstrapError";
}

type AuthFailure = { status?: number; message?: string } | null | undefined;

// better-auth reports failures in `error` instead of throwing. A missing session is `data: null`
// with no error; 429/5xx/network failures (status 0 or undefined) are real failures.
function isUnreachable(error: AuthFailure) {
  if (!error) return false;
  const status = error.status ?? 0;
  return status === 0 || status === 429 || status >= 500;
}

async function bootstrap(): Promise<Session> {
  let existing: Awaited<ReturnType<typeof authClient.getSession>>;
  try {
    existing = await authClient.getSession({
      query: { disableCookieCache: true },
    });
  } catch (error) {
    throw new SessionBootstrapError(
      "unreachable",
      error instanceof Error ? error.message : "Could not reach the tasks service.",
    );
  }
  if (existing.data) return existing.data;
  if (isUnreachable(existing.error)) {
    throw new SessionBootstrapError(
      "unreachable",
      existing.error?.message || "Could not reach the tasks service.",
    );
  }

  throw new SessionBootstrapError(
    "rejected",
    "The tasks service did not accept your AirSend session.",
  );
}

let inflight: Promise<Session> | null = null;

// Concurrent callers (route preloads, StrictMode double effects, a burst of 401s) share one
// attempt.
export function ensureSession(): Promise<Session> {
  inflight ??= bootstrap().finally(() => {
    inflight = null;
  });
  return inflight;
}
