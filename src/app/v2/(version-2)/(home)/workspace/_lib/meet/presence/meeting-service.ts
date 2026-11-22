// Typed fetchers for the ../meeting server (meet.airsend.in): room info and who is in the room right now.
// Every function resolves to `null` when the server cannot be reached (offline, CORS, 5xx, bad JSON) so callers can fall
// back to the workspace roster; a definite answer ("no such room", "ended") is a value, not an error.

import { getAuthToken, getMeetApiUrl } from "../../api";

export interface MeetingRoomInfo {
  exists: boolean;
  ended: boolean;
  title?: string;
  status?: string;
  hostName?: string;
  isLocked?: boolean;
}

/** One person in the room, exactly as GET /api/rooms/:roomId/presence returns it (no email: identity is the participant id). */
export interface MeetingPresenceEntry {
  identity: string;
  name: string;
  isHost: boolean;
  joinedAt: string;
}

export interface MeetingRoomPresence {
  exists: boolean;
  ended: boolean;
  /** Present when the room exists. */
  roomId?: string;
  count: number;
  hostName?: string;
  participants: MeetingPresenceEntry[];
}

async function meetGet(path: string, signal?: AbortSignal): Promise<Response | null> {
  try {
    const headers: Record<string, string> = { Accept: "application/json" };
    const token = getAuthToken();
    if (token) headers.Authorization = `Bearer ${token}`;
    return await fetch(`${getMeetApiUrl().replace(/\/+$/, "")}${path}`, { headers, credentials: "include", signal });
  } catch {
    return null; // offline / blocked / aborted
  }
}

async function readJson(res: Response): Promise<Record<string, unknown> | null> {
  try {
    const body: unknown = await res.json();
    return body && typeof body === "object" ? (body as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

const str = (value: unknown): string | undefined => (typeof value === "string" && value.trim() ? value.trim() : undefined);

/** The server answers 404 with `{ code: "MEETING_ENDED" | "MEETING_NOT_FOUND" }`. */
async function missingRoom(res: Response): Promise<{ exists: false; ended: boolean }> {
  const body = await readJson(res);
  return { exists: false, ended: body?.code === "MEETING_ENDED" };
}

export async function fetchRoomInfo(roomId: string, signal?: AbortSignal): Promise<MeetingRoomInfo | null> {
  const res = await meetGet(`/api/rooms/${encodeURIComponent(roomId)}`, signal);
  if (!res) return null;
  if (res.status === 404) return missingRoom(res).then((m) => ({ ...m }));
  if (!res.ok) return null;
  const body = await readJson(res);
  if (!body) return null;
  return {
    exists: body.exists !== false,
    ended: false,
    title: str(body.title),
    status: str(body.status),
    hostName: str(body.hostName),
    isLocked: typeof body.isLocked === "boolean" ? body.isLocked : undefined,
  };
}

export async function fetchRoomPresence(roomId: string, signal?: AbortSignal): Promise<MeetingRoomPresence | null> {
  const res = await meetGet(`/api/rooms/${encodeURIComponent(roomId)}/presence`, signal);
  if (!res) return null;
  if (res.status === 404) {
    const missing = await missingRoom(res);
    return { ...missing, count: 0, participants: [] };
  }
  if (!res.ok) return null;
  const body = await readJson(res);
  if (!body) return null;

  const participants: MeetingPresenceEntry[] = Array.isArray(body.participants)
    ? body.participants.flatMap((raw): MeetingPresenceEntry[] => {
        const p = raw as Record<string, unknown> | null;
        const identity = str(p?.identity);
        if (!p || !identity) return [];
        return [{ identity, name: str(p.name) ?? "Guest", isHost: p.isHost === true, joinedAt: str(p.joinedAt) ?? "" }];
      })
    : [];

  return {
    exists: true,
    ended: false,
    roomId: str(body.roomId),
    count: typeof body.count === "number" ? body.count : participants.length,
    hostName: str(body.hostName),
    participants,
  };
}
