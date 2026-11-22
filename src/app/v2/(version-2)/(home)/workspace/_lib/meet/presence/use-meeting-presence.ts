"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { isValidUUID, workspaceApi, type ServerCallRoomParticipant } from "../../api";
import { useChatStore } from "../../chat-store";
import type { MeetingPresence, PresenceParticipant } from "../types";
import {
  fetchRoomInfo,
  fetchRoomPresence,
  type MeetingRoomInfo,
  type MeetingRoomPresence,
} from "./meeting-service";

// ---------------------------------------------------------------------------
// useMeetingPresence: who is in this meeting right now, from real sources only.
//   1. the ../meeting server (GET /api/rooms/:id/presence), the LiveKit room behind meet.airsend.in
//   2. the workspace server's call roster (only for UUID call ids; the call APIs ignore anything else)
// merged by email / identity. The organiser comes from the workspace Meeting record, else the meeting server's host
// name, else the participant who is the host; it is never invented. Nobody is counted who has not actually joined.
// ---------------------------------------------------------------------------

export interface UseMeetingPresenceOptions {
  roomId: string;
  selfEmail?: string;
  selfName?: string;
  enabled?: boolean;
  /** Poll interval while the tab is visible. */
  pollMs?: number;
}

const MAX_BACKOFF_MS = 60_000;

const norm = (value?: string | null) => (value ?? "").trim().toLowerCase();

function fromWorkspace(p: ServerCallRoomParticipant, selfEmail: string): PresenceParticipant {
  return {
    id: p.id,
    name: p.display_name || p.user_email,
    email: p.user_email,
    isHost: p.role === "host",
    isSelf: !!selfEmail && norm(p.user_email) === selfEmail,
    micMuted: p.is_muted,
    cameraOff: p.is_camera_off,
  };
}

export function useMeetingPresence({
  roomId,
  selfEmail = "",
  selfName = "",
  enabled = true,
  pollMs = 5000,
}: UseMeetingPresenceOptions): MeetingPresence {
  const [info, setInfo] = useState<MeetingRoomInfo | null>(null);
  const [live, setLive] = useState<MeetingRoomPresence | null>(null);
  const [roster, setRoster] = useState<ServerCallRoomParticipant[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();
  const [nonce, setNonce] = useState(0);

  const meetings = useChatStore((s) => s.meetings);
  // The WS handler adds call.joined / call.left participants to the store without tagging the call, so the store is only
  // used as a signal ("something changed, re-read the roster now"), never as the roster itself.
  const storeSignal = useChatStore((s) => s.callParticipants.map((p) => `${p.id}:${p.email}`).join("|"));

  const selfKey = norm(selfEmail);
  const selfRef = useRef(selfEmail);
  selfRef.current = selfEmail;
  const isWorkspaceCall = isValidUUID(roomId);

  const refresh = useCallback(() => setNonce((n) => n + 1), []);

  // The loop. Restarts (and fetches immediately) when the room changes, on refresh(), and when the WS roster changes.
  useEffect(() => {
    if (!enabled || !roomId) {
      setLoading(false);
      return;
    }
    let stopped = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let controller: AbortController | undefined;
    let failures = 0;
    let first = true;

    const tick = async (): Promise<boolean> => {
      controller?.abort();
      controller = new AbortController();
      const { signal } = controller;
      const email = selfRef.current;

      const [infoRes, liveRes, rosterRes] = await Promise.allSettled([
        first ? fetchRoomInfo(roomId, signal) : Promise.resolve(undefined),
        fetchRoomPresence(roomId, signal),
        isWorkspaceCall && email ? workspaceApi.getCallParticipants(roomId, email) : Promise.resolve(undefined),
      ]);
      if (stopped || signal.aborted) return true;

      let reachedSomething = false;
      if (infoRes.status === "fulfilled" && infoRes.value !== undefined) {
        if (infoRes.value) reachedSomething = true;
        setInfo(infoRes.value);
      }
      if (liveRes.status === "fulfilled") {
        if (liveRes.value) reachedSomething = true;
        setLive(liveRes.value);
      }
      if (rosterRes.status === "fulfilled" && rosterRes.value !== undefined) {
        reachedSomething = true;
        setRoster(rosterRes.value.filter((p) => !p.left_at));
      }
      setError(reachedSomething ? undefined : "Could not load who is in this meeting");
      first = false;
      setLoading(false);
      return reachedSomething;
    };

    const schedule = (delay: number) => {
      timer = setTimeout(async () => {
        if (stopped) return;
        if (typeof document !== "undefined" && document.hidden) {
          schedule(pollMs); // paused while the tab is hidden; resumes immediately on visibilitychange
          return;
        }
        const ok = await tick();
        failures = ok ? 0 : failures + 1;
        if (!stopped) schedule(Math.min(pollMs * 2 ** failures, MAX_BACKOFF_MS));
      }, delay);
    };

    const onVisible = () => {
      if (document.visibilityState !== "visible" || stopped) return;
      if (timer) clearTimeout(timer);
      schedule(0);
    };

    schedule(0);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      stopped = true;
      if (timer) clearTimeout(timer);
      controller?.abort();
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [roomId, enabled, pollMs, nonce, isWorkspaceCall, storeSignal]);

  // A different room starts from nothing (never show the previous room's people).
  useEffect(() => {
    setInfo(null);
    setLive(null);
    setRoster(null);
    setError(undefined);
    setLoading(true);
  }, [roomId]);

  return useMemo<MeetingPresence>(() => {
    // Merge: workspace roster first (it knows mic / camera / role), then meeting-server entries not already listed.
    const merged = new Map<string, PresenceParticipant>();
    for (const p of roster ?? []) merged.set(norm(p.user_email) || p.id, fromWorkspace(p, selfKey));
    for (const p of live?.participants ?? []) {
      const key = norm(p.identity);
      if (merged.has(key)) {
        const existing = merged.get(key)!;
        if (p.isHost && !existing.isHost) merged.set(key, { ...existing, isHost: true });
        continue;
      }
      merged.set(key, {
        id: p.identity,
        name: p.name,
        isHost: p.isHost,
        isSelf: !!selfKey && key === selfKey,
      });
    }
    const participants = [...merged.values()].map((p) =>
      p.isSelf && (!p.name || p.name === "You") && selfName ? { ...p, name: selfName } : p,
    );

    // Organiser: the workspace Meeting record, else the meeting server's host, else whoever is the host. Never made up.
    const record = meetings.find((m) => m.id === roomId || (m.meetingUrl && m.meetingUrl.includes(roomId)));
    const hostEntry = participants.find((p) => p.isHost);
    let organizer: MeetingPresence["organizer"] = null;
    if (record?.organizerName) {
      organizer = {
        name: record.organizerName,
        email: record.organizerId?.includes("@") ? record.organizerId : participants.find((p) => p.name === record.organizerName)?.email,
      };
    } else if (live?.hostName || info?.hostName) {
      const name = (live?.hostName || info?.hostName) as string;
      organizer = { name, email: participants.find((p) => p.isHost && p.name === name)?.email };
    } else if (hostEntry) {
      organizer = { name: hostEntry.name, email: hostEntry.email };
    }

    const ended = !!(live?.ended || info?.ended);
    const answered = live?.exists === false || info?.exists === false;
    const source: MeetingPresence["source"] = live ? "meeting" : roster ? "workspace" : "none";

    return {
      loading,
      exists: ended || answered ? false : info || live || roster ? true : null,
      ended,
      title: info?.title || record?.title,
      organizer,
      participants,
      count: participants.length,
      source,
      error,
      refresh,
    };
  }, [roster, live, info, meetings, roomId, selfKey, selfName, loading, error, refresh]);
}
