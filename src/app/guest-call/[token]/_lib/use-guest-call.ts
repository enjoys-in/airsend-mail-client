"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Room } from "livekit-client";
import { getMeetApiUrl } from "@/app/v2/(version-2)/(home)/workspace/_lib/api";

export type GuestPhase = "form" | "joining" | "waiting" | "connecting" | "connected" | "denied" | "ended" | "error";

interface JoinInfo {
  url: string;
  token: string;
}

interface StatusBody {
  state: "waiting" | "admitted" | "denied" | "ended";
  join?: JoinInfo;
}

class GuestApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

const pollMs = 1500;

async function call<T>(path: string, init: { method?: string; token?: string; body?: unknown; keepalive?: boolean } = {}): Promise<T> {
  const base = getMeetApiUrl().replace(/\/+$/, "");
  const headers: Record<string, string> = {};
  if (init.token) headers.Authorization = `Bearer ${init.token}`;
  if (init.body) headers["Content-Type"] = "application/json";
  let response: Response;
  try {
    response = await fetch(`${base}/guest/v1${path}`, {
      method: init.method ?? "GET",
      headers,
      body: init.body ? JSON.stringify(init.body) : undefined,
      keepalive: init.keepalive,
    });
  } catch {
    throw new GuestApiError(0, "Could not reach the call service. Check your connection.");
  }
  if (response.status === 204) return undefined as T;
  const data = (await response.json().catch(() => ({}))) as { error?: string };
  if (!response.ok) throw new GuestApiError(response.status, data.error ?? `Request failed (${response.status})`);
  return data as T;
}

export function useGuestCall(linkToken: string) {
  const [phase, setPhase] = useState<GuestPhase>("form");
  const [message, setMessage] = useState("");
  const [muted, setMuted] = useState(false);
  const sessionRef = useRef("");
  const roomRef = useRef<Room | null>(null);
  const pollRef = useRef<number | undefined>(undefined);
  const audioRef = useRef<HTMLElement[]>([]);
  const connectingRef = useRef(false);
  const liveRef = useRef(false);

  const cleanup = useCallback(() => {
    liveRef.current = false;
    if (pollRef.current !== undefined) window.clearInterval(pollRef.current);
    pollRef.current = undefined;
    for (const element of audioRef.current) element.remove();
    audioRef.current = [];
    const room = roomRef.current;
    roomRef.current = null;
    if (room) void room.disconnect();
  }, []);

  const finish = useCallback(
    (next: GuestPhase, text = "") => {
      cleanup();
      setPhase(next);
      setMessage(text);
    },
    [cleanup],
  );

  const connectMedia = useCallback(
    async (join: JoinInfo) => {
      if (connectingRef.current) return;
      connectingRef.current = true;
      setPhase("connecting");
      try {
        const { Room, RoomEvent, Track } = await import("livekit-client");
        const room = new Room({ audioCaptureDefaults: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } });
        roomRef.current = room;
        room.on(RoomEvent.TrackSubscribed, (track) => {
          if (track.kind !== Track.Kind.Audio) return;
          const element = track.attach();
          element.style.display = "none";
          document.body.appendChild(element);
          audioRef.current.push(element);
        });
        room.on(RoomEvent.Disconnected, () => {
          if (liveRef.current) finish("ended", "The call has ended.");
        });
        await room.connect(join.url, join.token);
        await call("/connected", { method: "POST", token: sessionRef.current });
        await room.localParticipant.setMicrophoneEnabled(true);
        setPhase("connected");
      } catch (error) {
        const denied = error instanceof Error && /permission|denied|NotAllowed/i.test(`${error.name} ${error.message}`);
        finish("error", denied ? "Allow microphone access in your browser to join the call." : "Could not connect your audio to the call.");
      }
    },
    [finish],
  );

  const poll = useCallback(async () => {
    if (!liveRef.current) return;
    try {
      const status = await call<StatusBody>("/status", { token: sessionRef.current });
      if (!liveRef.current) return;
      if (status.state === "admitted" && status.join) void connectMedia(status.join);
      else if (status.state === "denied") finish("denied", "The host did not let you in.");
      else if (status.state === "ended") finish("ended", "The call has ended.");
    } catch (error) {
      if (error instanceof GuestApiError && error.status >= 400 && error.status < 500) {
        finish("ended", "The call has ended.");
      }
    }
  }, [connectMedia, finish]);

  const join = useCallback(
    async (name: string) => {
      setPhase("joining");
      setMessage("");
      try {
        const session = await call<{ session: string }>("/join", { method: "POST", body: { token: linkToken, name } });
        sessionRef.current = session.session;
        liveRef.current = true;
        setPhase("waiting");
        void poll();
        pollRef.current = window.setInterval(() => void poll(), pollMs);
      } catch (error) {
        setPhase("form");
        setMessage(error instanceof Error ? error.message : "Could not join this call.");
      }
    },
    [linkToken, poll],
  );

  const leave = useCallback(async () => {
    const session = sessionRef.current;
    cleanup();
    setPhase("ended");
    setMessage("You left the call.");
    if (session) await call("/leave", { method: "POST", token: session }).catch(() => undefined);
  }, [cleanup]);

  const toggleMute = useCallback(async () => {
    const room = roomRef.current;
    if (!room) return;
    const next = !muted;
    await room.localParticipant.setMicrophoneEnabled(!next);
    setMuted(next);
  }, [muted]);

  useEffect(() => {
    const onLeave = () => {
      if (sessionRef.current && liveRef.current) {
        void call("/leave", { method: "POST", token: sessionRef.current, keepalive: true }).catch(() => undefined);
      }
    };
    window.addEventListener("pagehide", onLeave);
    return () => {
      window.removeEventListener("pagehide", onLeave);
      onLeave();
      cleanup();
    };
  }, [cleanup]);

  return { phase, message, muted, join, leave, toggleMute };
}
