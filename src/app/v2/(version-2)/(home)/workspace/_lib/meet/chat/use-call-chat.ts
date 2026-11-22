"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { isValidUUID, workspaceApi } from "../../api";
import type { LiveCallParticipant } from "../../chat-types";

// ---------------------------------------------------------------------------
// useCallChat: the in-call chat. Messages go to everyone in the call over the call-signal channel the WebRTC code already
// uses (workspaceApi.sendCallSignal out, the window event 'airsend:call-signal' in) with signal_type 'chat'. Like captions,
// they are ephemeral: nothing is stored, people who join later do not see earlier messages.
//
// It only reaches other people in workspace calls (the call id is a UUID) who are in the room. In any other case the message
// is still shown to the sender, and `status` says it is local so the UI can say so instead of pretending.
// ---------------------------------------------------------------------------

const MAX_MESSAGES = 200;
const MAX_TEXT = 1000;
const CHAT_SIGNAL = "chat";

export interface CallChatMessage {
  id: string;
  sender: string;
  senderEmail: string;
  text: string;
  /** ms since epoch */
  at: number;
  isSelf: boolean;
}

/** sharing: delivered to the others. local: only you can see it (not a workspace call). unavailable: the server refused chat signals. */
export type CallChatStatus = "sharing" | "local" | "unavailable";

interface ChatPayload {
  v: 1;
  id: string;
  text: string;
  at: number;
  speaker: string;
}

/** Set once the server has refused 'chat' signals; shared by every instance so nobody keeps trying. */
let serverRefusesChat = false;

const clean = (value: string, max: number) =>
  value
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .trim()
    .slice(0, max);

const sameEmail = (a?: string, b?: string) => !!a && !!b && a.trim().toLowerCase() === b.trim().toLowerCase();

export interface UseCallChatOptions {
  callId?: string;
  selfEmail: string;
  selfName: string;
  /** Everyone else in the call (messages are sent to each of them). */
  peers: LiveCallParticipant[];
  enabled?: boolean;
}

export interface CallChat {
  messages: CallChatMessage[];
  send: (text: string) => void;
  status: CallChatStatus;
  /** Messages from others since `markRead` was last called. */
  unread: number;
  markRead: () => void;
}

export function useCallChat({ callId, selfEmail, selfName, peers, enabled = true }: UseCallChatOptions): CallChat {
  const [messages, setMessages] = useState<CallChatMessage[]>([]);
  const [refused, setRefused] = useState(serverRefusesChat);
  const [unread, setUnread] = useState(0);

  const canShare = enabled && !!callId && isValidUUID(callId) && !!selfEmail;

  const latest = useRef({ callId, selfEmail, selfName, peers, canShare });
  latest.current = { callId, selfEmail, selfName, peers, canShare };

  const seen = useRef<Set<string>>(new Set());
  const push = useCallback((message: CallChatMessage) => {
    if (seen.current.has(message.id)) return;
    seen.current.add(message.id);
    setMessages((previous) => [...previous, message].sort((a, b) => a.at - b.at).slice(-MAX_MESSAGES));
  }, []);

  // ── incoming
  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;
    const onSignal = (event: Event) => {
      const data = (event as CustomEvent).detail as
        | { call_id?: string; from_email?: string; signal_type?: string; payload?: Partial<ChatPayload> }
        | undefined;
      if (!data || data.signal_type !== CHAT_SIGNAL || data.call_id !== latest.current.callId) return;
      if (!data.from_email || sameEmail(data.from_email, latest.current.selfEmail)) return;
      const payload = data.payload;
      if (!payload || typeof payload.text !== "string" || typeof payload.id !== "string") return;
      const text = clean(payload.text, MAX_TEXT);
      if (!text) return;
      push({
        id: payload.id.slice(0, 80),
        sender: clean(typeof payload.speaker === "string" ? payload.speaker : "", 80) || data.from_email.split("@")[0],
        senderEmail: data.from_email,
        text,
        at: typeof payload.at === "number" && Number.isFinite(payload.at) ? payload.at : Date.now(),
        isSelf: false,
      });
      setUnread((count) => count + 1);
    };
    window.addEventListener("airsend:call-signal", onSignal);
    return () => window.removeEventListener("airsend:call-signal", onSignal);
  }, [enabled, push]);

  // ── outgoing
  const send = useCallback(
    (raw: string) => {
      const text = clean(raw, MAX_TEXT);
      if (!text) return;
      const { callId: id, selfEmail: me, selfName: name, peers: others, canShare: allowed } = latest.current;
      const payload: ChatPayload = {
        v: 1,
        id: `${me || "me"}:${Date.now().toString(36)}:${Math.random().toString(36).slice(2, 8)}`,
        text,
        at: Date.now(),
        speaker: clean(name, 80),
      };
      push({ id: payload.id, sender: name || "You", senderEmail: me, text, at: payload.at, isSelf: true });
      if (!allowed || !id || serverRefusesChat) return;
      for (const peer of others) {
        if (!peer.email || sameEmail(peer.email, me)) continue;
        workspaceApi.sendCallSignal(id, peer.email, CHAT_SIGNAL, payload, me).catch((failure: unknown) => {
          const message = failure instanceof Error ? failure.message : String(failure);
          // An older workspace-server only relays WebRTC signals: stop trying for this session.
          if (/signal_type|offer, answer|bad.?input|\b400\b/i.test(message)) {
            serverRefusesChat = true;
            setRefused(true);
          }
        });
      }
    },
    [push]
  );

  const markRead = useCallback(() => setUnread(0), []);

  const status: CallChatStatus = !callId || !isValidUUID(callId) ? "local" : refused ? "unavailable" : "sharing";
  return { messages, send, status, unread, markRead };
}
