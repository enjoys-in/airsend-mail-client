import { authHeaders, getMeetApiUrl } from "../../_lib/api";
import type { Colleague, IntercomCall, IntercomMe, JoinInfo, PhoneCall, PhoneVoicemail, VoiceOverview } from "./types";

export class VoiceApiError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = "VoiceApiError";
    this.status = status;
    this.code = code;
  }
}

async function request(path: string, init: RequestInit = {}): Promise<Response> {
  const base = getMeetApiUrl().replace(/\/+$/, "");
  const headers: Record<string, string> = { ...authHeaders() };
  if (init.body) headers["Content-Type"] = "application/json";

  let response: Response;
  try {
    response = await fetch(`${base}${path}`, { ...init, headers, credentials: "include" });
  } catch {
    throw new VoiceApiError(0, "NETWORK", "Could not reach the calling service. Check your connection.");
  }

  if (response.ok) return response;

  const body = (await response.json().catch(() => ({}))) as { error?: string; code?: string };
  throw new VoiceApiError(
    response.status,
    body.code ?? "ERROR",
    body.error ?? `Request failed (${response.status})`,
  );
}

async function json<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await request(path, init);
  return (await response.json()) as T;
}

export const voiceApi = {
  me: () => json<VoiceOverview>("/workspace/v1/me"),

  startCall: (input: { to: string; trunkId?: string; from?: string }) =>
    json<{ call: PhoneCall; join: JoinInfo }>("/workspace/v1/calls", {
      method: "POST",
      body: JSON.stringify(input),
    }),

  call: (id: string) => json<PhoneCall>(`/workspace/v1/calls/${id}`),

  calls: (limit = 30) => json<{ calls: PhoneCall[] }>(`/workspace/v1/calls?limit=${limit}`),

  hangup: async (id: string, options: { keepalive?: boolean } = {}) => {
    await request(`/workspace/v1/calls/${id}/hangup`, {
      method: "POST",
      ...(options.keepalive ? { keepalive: true } : {}),
    });
  },

  voicemails: () => json<{ voicemails: PhoneVoicemail[] }>("/workspace/v1/voicemails"),

  voicemailAudio: async (id: string): Promise<Blob> => {
    const response = await request(`/workspace/v1/voicemails/${id}/audio`);
    return response.blob();
  },

  deleteVoicemail: async (id: string) => {
    await request(`/workspace/v1/voicemails/${id}`, { method: "DELETE" });
  },
};

export const intercomApi = {
  me: () => json<IntercomMe>("/intercom/v1/me"),

  colleagues: () => json<{ colleagues: Colleague[] }>("/intercom/v1/colleagues"),

  startCall: (input: { to?: string; conversationId?: string; media?: "audio" | "video" }) =>
    json<{ call: IntercomCall; join: JoinInfo; to: { name: string; email: string; extension: string } | null }>("/intercom/v1/calls", {
      method: "POST",
      body: JSON.stringify(input),
    }),

  join: (id: string) =>
    json<{ call: IntercomCall; join: JoinInfo }>(`/intercom/v1/calls/${id}/join`, { method: "POST" }),

  activeCall: (conversationId: string) =>
    json<{ call: IntercomCall | null }>(`/intercom/v1/conversations/${encodeURIComponent(conversationId)}/call`),

  call: (id: string) => json<IntercomCall>(`/intercom/v1/calls/${id}`),

  answer: (id: string) =>
    json<{ call: IntercomCall; join: JoinInfo }>(`/intercom/v1/calls/${id}/answer`, { method: "POST" }),

  decline: async (id: string) => {
    await request(`/intercom/v1/calls/${id}/decline`, { method: "POST" });
  },

  hangup: async (id: string, options: { keepalive?: boolean } = {}) => {
    await request(`/intercom/v1/calls/${id}/hangup`, {
      method: "POST",
      ...(options.keepalive ? { keepalive: true } : {}),
    });
  },

  connected: async (id: string) => {
    await request(`/intercom/v1/calls/${id}/connected`, { method: "POST" });
  },

  guestLink: (id: string) =>
    json<{ token: string; expiresAt: string }>(`/intercom/v1/calls/${id}/guest-links`, { method: "POST" }),

  admitGuest: (id: string, guestId: string) =>
    json<{ participants: unknown[] }>(`/intercom/v1/calls/${id}/guests/${encodeURIComponent(guestId)}/admit`, { method: "POST" }),

  denyGuest: (id: string, guestId: string) =>
    json<{ participants: unknown[] }>(`/intercom/v1/calls/${id}/guests/${encodeURIComponent(guestId)}/deny`, { method: "POST" }),

  invite: (id: string, to: string) =>
    json<{ call: IntercomCall; invited: { name: string; email: string; extension: string } }>(
      `/intercom/v1/calls/${id}/invite`,
      { method: "POST", body: JSON.stringify({ to }) },
    ),

  ping: async () => {
    await request("/intercom/v1/presence", { method: "POST" });
  },

  streamUrl: () => `${getMeetApiUrl().replace(/\/+$/, "")}/intercom/v1/stream`,
};
