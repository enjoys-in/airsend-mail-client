// ============================================================================
// Retry policy for the outbox (text messages and file messages).
//
// Transient failures (offline, network error, timeout, 429, 5xx) are retried
// with exponential backoff; anything else (403, 400, ...) will not get better
// by itself, so the message is marked failed and the user can Retry / Discard.
// ============================================================================

/** After this many transient failures the message is marked failed (the user can still retry it). */
export const MAX_SEND_ATTEMPTS = 6;

const BASE_DELAY_MS = 2_000;
const MAX_DELAY_MS = 60_000;

/** 2s, 4s, 8s ... capped at 60s, with ±20% jitter so many clients don't retry in lockstep. */
export function retryDelay(attempts: number): number {
  const base = Math.min(MAX_DELAY_MS, BASE_DELAY_MS * 2 ** Math.max(0, attempts - 1));
  return Math.round(base * (0.8 + Math.random() * 0.4));
}

export const isOffline = () => typeof navigator !== "undefined" && navigator.onLine === false;

/** HTTP status of a failed call, when the error carries one (WorkspaceApiError / FilesApiError). */
function statusOf(err: unknown): number | undefined {
  const status = (err as { status?: unknown } | null)?.status;
  return typeof status === "number" ? status : undefined;
}

/** Worth retrying automatically? */
export function isTransient(err: unknown): boolean {
  if (isOffline()) return true;
  const status = statusOf(err);
  if (status === undefined || status === 0) return true; // network error / unreachable
  return status === 408 || status === 425 || status === 429 || status >= 500;
}

/** The files service answers 409 when the message already has its file (an earlier try succeeded). */
export const isAlreadyAttached = (err: unknown) => statusOf(err) === 409 && /already has a file/i.test(String(err));
