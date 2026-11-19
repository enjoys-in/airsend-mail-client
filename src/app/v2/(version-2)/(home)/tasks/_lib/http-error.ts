import i18n from "i18next";
import { ensureSession } from "./ensure-session";
import { signOutState } from "./sign-out-state";
import {
  type ApiErrorDetails,
  type ApiErrorIssue,
  parseApiErrorBody,
} from "./parse-api-error-body";

function fallbackMessage(status: number): string {
  if (status >= 500) {
    return i18n.t("common:error.messages.server", {
      defaultValue: "Server error. Please try again later.",
    });
  }
  return i18n.t("common:error.messages.unknown", {
    defaultValue: "An unexpected error occurred.",
  });
}

export class HttpError extends Error {
  status: number;
  code?: string;
  issues?: ApiErrorIssue[];
  missingPermissions?: string[];

  constructor(status: number, message: string, details: ApiErrorDetails = {}) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.code = details.code;
    this.issues = details.issues;
    this.missingPermissions = details.missingPermissions;
  }

  static async fromResponse(
    response: Pick<Response, "status" | "text">,
  ): Promise<HttpError> {
    const text = await response.text().catch(() => "");
    const body = parseApiErrorBody(text);
    const message =
      (body ? body.message : text).trim() || fallbackMessage(response.status);
    return new HttpError(response.status, message, body ?? {});
  }
}

export function isUnauthorizedError(error: unknown): boolean {
  if (typeof error !== "object" || error === null) return false;
  // Recognize HttpError-shaped values even when their prototype differs.
  const isHttpError =
    error instanceof HttpError ||
    ("name" in error && error.name === "HttpError");
  if (!isHttpError || !("status" in error) || error.status !== 401) {
    return false;
  }
  const code = "code" in error ? error.code : undefined;
  return code === undefined || code === "UNAUTHORIZED";
}

// Shared unauthorized handler for both the React Query error cache and direct fetcher calls
// (e.g. route loaders) that bypass the QueryCache. There is no sign-in screen, so a 401 means the
// session expired or was revoked: open a fresh one and refetch. Attempts are throttled so a
// backend that keeps answering 401 can't spin in a loop.
const RECOVERY_COOLDOWN_MS = 15_000;
let lastRecoveryAt = 0;
let onSessionRecovered: (() => void) | undefined;

// Registered by the query client (which imports this module, so it can't be imported back here).
export function setSessionRecoveredHandler(handler: () => void): void {
  onSessionRecovered = handler;
}

export function handleUnauthorized(): void {
  if (signOutState.isRedirecting) return;
  const now = Date.now();
  if (now - lastRecoveryAt < RECOVERY_COOLDOWN_MS) return;
  lastRecoveryAt = now;
  void ensureSession()
    .then(() => onSessionRecovered?.())
    .catch(() => {
      // Surfaced by the route error boundary on the next navigation / retry.
    });
}
