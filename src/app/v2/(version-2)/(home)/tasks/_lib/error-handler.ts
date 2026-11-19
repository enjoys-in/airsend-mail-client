export type ApiError = {
  message: string;
  type: "unavailable" | "network" | "cors" | "auth" | "server" | "unknown";
  status?: number;
  originalError?: Error;
};

// What browsers throw from fetch() when the request never reached a server.
const NETWORK_FAILURE =
  /failed to fetch|networkerror|load failed|fetch failed|network request failed|network error/i;
// Statuses a gateway or proxy answers with when the service behind it is down.
const GATEWAY_DOWN_STATUSES = new Set([502, 503, 504]);

/** The tasks backend is down: the request never reached it, or a gateway answered for it. */
export function isServiceUnavailable(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const status = (error as { status?: unknown }).status;
  if (typeof status === "number" && GATEWAY_DOWN_STATUSES.has(status)) {
    return true;
  }
  if (error.name === "SessionBootstrapError") {
    return (error as { reason?: unknown }).reason === "unreachable";
  }
  return NETWORK_FAILURE.test(error.message);
}

export function parseApiError(error: unknown): ApiError {
  if (isServiceUnavailable(error)) {
    return {
      message: "common:error.serviceUnavailable.message",
      type: "unavailable",
      originalError: error as Error,
    };
  }
  if (error instanceof Error) {
    if (
      error.message.includes("Failed to fetch") ||
      error.message.includes("NetworkError") ||
      error.message.includes("CORS")
    ) {
      return {
        message: "common:error.messages.cors",
        type: "cors",
        originalError: error,
      };
    }

    if (
      error.message.includes("Load failed") ||
      error.message.includes("fetch") ||
      error.message.includes("network") ||
      error.message.includes("connection")
    ) {
      return {
        message: "common:error.messages.network",
        type: "network",
        originalError: error,
      };
    }

    if (
      error.message.includes("401") ||
      error.message.includes("unauthorized") ||
      error.message.includes("authentication")
    ) {
      return {
        message: "common:error.messages.auth",
        type: "auth",
        status: 401,
        originalError: error,
      };
    }

    // Check for server errors
    if (
      error.message.includes("500") ||
      error.message.includes("server error") ||
      error.message.includes("internal")
    ) {
      return {
        message: "common:error.messages.server",
        type: "server",
        status: 500,
        originalError: error,
      };
    }

    // Don't surface `error.message` here: this branch covers both genuine
    // API unknowns and any non-API error passed in (e.g. a React render
    // error bubbled up to ErrorBoundary), and a raw `error.message` from
    // the latter can leak internal implementation details to end users.
    // Keep the original error for local diagnostics without exposing it.
    return {
      message: "common:error.messages.unknown",
      type: "unknown",
      originalError: error,
    };
  }

  return {
    message: "common:error.messages.unknown",
    type: "unknown",
  };
}

export function getCorsTroubleshootingSteps(): string[] {
  return [
    "common:error.troubleshootingSteps.cors.checkApiRunning",
    "common:error.troubleshootingSteps.cors.checkApiUrl",
    "common:error.troubleshootingSteps.cors.verifyCorsOrigins",
    "common:error.troubleshootingSteps.cors.checkProtocol",
    "common:error.troubleshootingSteps.cors.checkAccessibility",
  ];
}

export function getNetworkTroubleshootingSteps(): string[] {
  return [
    "common:error.troubleshootingSteps.network.checkConnection",
    "common:error.troubleshootingSteps.network.verifyApiRunning",
    "common:error.troubleshootingSteps.network.tryRefresh",
    "common:error.troubleshootingSteps.network.checkFirewall",
  ];
}
