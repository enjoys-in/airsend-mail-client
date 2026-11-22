"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { isValidUUID, workspaceApi } from "../../api";
import type { LiveCallParticipant } from "../../chat-types";
import type { TranscriptLine } from "../types";

// ---------------------------------------------------------------------------
// useCaptionSync: shares my caption lines with the other people in the call and receives theirs.
//
// Transport: the call-signal channel the WebRTC code already uses (workspaceApi.sendCallSignal out, the window event
// 'airsend:call-signal' in) with signal_type 'caption'. It only works for workspace calls (callId is a UUID) and only
// between people who are in the room.
//
// NOTE: workspace-server currently accepts only offer / answer / ice-candidate in CallService.Signal and answers 400 for
// anything else. When it does, sharing is switched off for the session (`shareStatus: "unavailable"`) instead of retrying
// on every word; allow "caption" there (internal/service/call_service.go) to turn it on.
// ---------------------------------------------------------------------------

const MAX_LINES = 500;
const MAX_TEXT = 1000;
const INTERIM_SEND_MS = 700;
/** A remote interim line that stops being refreshed (speaker went quiet) disappears after this long. */
const INTERIM_TTL_MS = 5000;
const CAPTION_SIGNAL = "caption";

export type ShareStatus = "off" | "sharing" | "unavailable";

interface CaptionPayload {
  v: 1;
  id: string;
  text: string;
  at: number;
  final: boolean;
  speaker: string;
}

/** Set once the server has refused 'caption' signals; shared by every instance so nobody keeps trying. */
let serverRefusesCaptions = false;

const clean = (value: string, max: number) =>
  value
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .trim()
    .slice(0, max);

const sameEmail = (a?: string, b?: string) => !!a && !!b && a.trim().toLowerCase() === b.trim().toLowerCase();

export interface UseCaptionSyncOptions {
  /** Workspace call id; sharing is off unless it is a UUID. */
  callId?: string;
  selfEmail: string;
  selfName: string;
  peers: LiveCallParticipant[];
  /** My final lines (from useSpeechTranscription). */
  lines: TranscriptLine[];
  /** My words still being recognised (sent throttled, replaced as they grow). */
  interim?: string;
  enabled?: boolean;
}

export interface CaptionSync {
  /** Other people's final lines, oldest first (isSelf: false). */
  remoteLines: TranscriptLine[];
  /** Other people's words in progress, one per speaker (isFinal: false). */
  remoteInterim: TranscriptLine[];
  shareStatus: ShareStatus;
  clearRemote: () => void;
}

export function useCaptionSync({
  callId,
  selfEmail,
  selfName,
  peers,
  lines,
  interim = "",
  enabled = true,
}: UseCaptionSyncOptions): CaptionSync {
  const [remoteLines, setRemoteLines] = useState<TranscriptLine[]>([]);
  const [remoteInterimMap, setRemoteInterimMap] = useState<Record<string, TranscriptLine>>({});
  const [refused, setRefused] = useState(serverRefusesCaptions);

  const canShare = enabled && !!callId && isValidUUID(callId) && !!selfEmail;

  const latest = useRef({ callId, selfEmail, selfName, peers, canShare });
  latest.current = { callId, selfEmail, selfName, peers, canShare };

  const send = useCallback((payload: CaptionPayload) => {
    const { callId: id, selfEmail: me, peers: others, canShare: allowed } = latest.current;
    if (!allowed || !id || serverRefusesCaptions) return;
    for (const peer of others) {
      if (!peer.email || sameEmail(peer.email, me)) continue;
      workspaceApi.sendCallSignal(id, peer.email, CAPTION_SIGNAL, payload, me).catch((failure: unknown) => {
        const message = failure instanceof Error ? failure.message : String(failure);
        // The server only relays WebRTC signals today: stop for this session instead of failing on every word.
        if (/signal_type|offer, answer|bad.?input|\b400\b/i.test(message)) {
          serverRefusesCaptions = true;
          setRefused(true);
        }
      });
    }
  }, []);

  // ── outgoing: my final lines
  const sentIds = useRef<Set<string>>(new Set());
  const interimTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    for (const line of lines) {
      if (sentIds.current.has(line.id)) continue;
      sentIds.current.add(line.id);
      if (interimTimer.current) {
        clearTimeout(interimTimer.current);
        interimTimer.current = null;
      }
      send({ v: 1, id: line.id, text: clean(line.text, MAX_TEXT), at: line.at, final: true, speaker: clean(selfName, 80) });
    }
    // keep the dedupe set bounded
    if (sentIds.current.size > MAX_LINES * 2) sentIds.current = new Set(lines.map((l) => l.id));
  }, [lines, selfName, send]);

  // ── outgoing: my words in progress, throttled
  const pendingInterim = useRef("");
  useEffect(() => {
    pendingInterim.current = interim;
    if (!interim || interimTimer.current) return;
    interimTimer.current = setTimeout(() => {
      interimTimer.current = null;
      const text = clean(pendingInterim.current, MAX_TEXT);
      if (!text) return;
      send({ v: 1, id: `interim:${latest.current.selfEmail}`, text, at: Date.now(), final: false, speaker: clean(latest.current.selfName, 80) });
    }, INTERIM_SEND_MS);
  }, [interim, send]);

  useEffect(
    () => () => {
      if (interimTimer.current) clearTimeout(interimTimer.current);
    },
    [],
  );

  // ── incoming
  useEffect(() => {
    if (!canShare || typeof window === "undefined") return;

    const onSignal = (event: Event) => {
      const detail = (event as CustomEvent).detail as
        | { call_id?: string; from_email?: string; signal_type?: string; payload?: unknown }
        | undefined;
      if (!detail || detail.signal_type !== CAPTION_SIGNAL || detail.call_id !== callId) return;
      const from = typeof detail.from_email === "string" ? detail.from_email : "";
      if (!from || sameEmail(from, selfEmail)) return;

      let raw = detail.payload;
      if (typeof raw === "string") {
        try {
          raw = JSON.parse(raw);
        } catch {
          return;
        }
      }
      if (!raw || typeof raw !== "object") return;
      const data = raw as Partial<CaptionPayload>;
      if (typeof data.text !== "string" || typeof data.id !== "string") return;

      const text = clean(data.text, MAX_TEXT);
      if (!text) return;
      const known = latest.current.peers.find((p) => sameEmail(p.email, from));
      const speaker =
        (typeof data.speaker === "string" && clean(data.speaker, 80)) || known?.name || from.split("@")[0] || "Participant";
      const now = Date.now();
      // never trust a far-future clock from another machine
      const at = typeof data.at === "number" && Number.isFinite(data.at) ? Math.min(data.at, now + 5000) : now;

      if (data.final) {
        const line: TranscriptLine = {
          id: `${from.toLowerCase()}:${clean(data.id, 120)}`,
          speakerId: from.toLowerCase(),
          speaker,
          text,
          at,
          isFinal: true,
          isSelf: false,
        };
        setRemoteLines((previous) => (previous.some((l) => l.id === line.id) ? previous : [...previous, line].slice(-MAX_LINES)));
        // the final line replaces that speaker's words in progress
        setRemoteInterimMap((previous) => {
          if (!(line.speakerId in previous)) return previous;
          const next = { ...previous };
          delete next[line.speakerId];
          return next;
        });
      } else {
        const key = from.toLowerCase();
        setRemoteInterimMap((previous) => ({
          ...previous,
          [key]: { id: `interim:${key}`, speakerId: key, speaker, text, at: now, isFinal: false, isSelf: false },
        }));
      }
    };

    window.addEventListener("airsend:call-signal", onSignal);
    return () => window.removeEventListener("airsend:call-signal", onSignal);
  }, [canShare, callId, selfEmail]);

  // drop words in progress from speakers who went quiet
  const hasInterim = Object.keys(remoteInterimMap).length > 0;
  useEffect(() => {
    if (!hasInterim) return;
    const timer = setInterval(() => {
      const cutoff = Date.now() - INTERIM_TTL_MS;
      setRemoteInterimMap((previous) => {
        const entries = Object.entries(previous).filter(([, line]) => line.at >= cutoff);
        return entries.length === Object.keys(previous).length ? previous : Object.fromEntries(entries);
      });
    }, 1500);
    return () => clearInterval(timer);
  }, [hasInterim]);

  const clearRemote = useCallback(() => {
    setRemoteLines([]);
    setRemoteInterimMap({});
  }, []);

  const hasPeers = peers.some((p) => p.email && !sameEmail(p.email, selfEmail));
  const shareStatus: ShareStatus = !canShare || !hasPeers ? "off" : refused || serverRefusesCaptions ? "unavailable" : "sharing";

  return {
    remoteLines,
    remoteInterim: Object.values(remoteInterimMap),
    shareStatus,
    clearRemote,
  };
}
