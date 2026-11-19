/**
 * "The files backend is down": a network failure (it isn't running, DNS, offline) or a gateway answering 502/503/504 for it.
 * It is told apart from every other failure so the UI can say "Service is not available" instead of showing a skeleton, an
 * empty folder or a raw `Failed to fetch`.
 */
export class ServiceUnavailableError extends Error {
	constructor(message = "The files service is not available.") {
		super(message);
		this.name = "ServiceUnavailableError";
	}
}

/** Statuses a gateway or proxy answers with when the service behind it is down. */
const GATEWAY_DOWN_STATUSES = new Set([502, 503, 504]);

// What browsers throw from fetch() when the request never reached a server.
const NETWORK_FAILURE = /failed to fetch|networkerror|load failed|fetch failed|network request failed|network error/i;

export function isServiceUnavailable(error: unknown): boolean {
	if (!(error instanceof Error)) return false;
	return error.name === "ServiceUnavailableError" || NETWORK_FAILURE.test(error.message);
}

/**
 * `fetch` that reports a down backend as a `ServiceUnavailableError`. The Hono client and the plain account/session requests
 * both go through it, so every query and mutation fails the same recognizable way.
 */
export async function serviceFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
	let response: Response;
	try {
		response = await fetch(input, init);
	} catch (error) {
		// An aborted request is a cancellation, not an outage.
		if (error instanceof DOMException && error.name === "AbortError") throw error;
		throw new ServiceUnavailableError();
	}
	if (GATEWAY_DOWN_STATUSES.has(response.status)) throw new ServiceUnavailableError();
	return response;
}
