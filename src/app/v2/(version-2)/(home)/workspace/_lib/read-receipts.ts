"use client";

// ============================================================================
// Read receipts.
//
// The workspace server stores, per conversation, how far each member has read
// (read_at). When I read a conversation the client announces it over the
// WebSocket (`conversation.read`); everyone in it gets the same event back and
// updates here. On opening a conversation the stored positions are loaded.
// A message of mine counts as "seen" once another member's read_at >= its time.
// ============================================================================

import { create } from "zustand";
import { workspaceApi, isValidUUID } from "./api";
import type { ReadReceipts } from "./chat-types";

export type ConversationKind = "channel" | "dm";

interface ReceiptsState {
  byConversation: Record<string, ReadReceipts>;
  /** Record that `email` has read `conversationId` up to `readAt` (never moves backwards). */
  apply: (conversationId: string, email: string, readAt: string) => void;
  load: (kind: ConversationKind, conversationId: string, me: string) => Promise<void>;
}

const later = (a: string | undefined, b: string) => (!a || Date.parse(b) > Date.parse(a) ? b : a);

export const useReadReceipts = create<ReceiptsState>()((set, get) => ({
  byConversation: {},

  apply: (conversationId, email, readAt) => {
    if (!conversationId || !email || !Number.isFinite(Date.parse(readAt))) return;
    const key = email.toLowerCase();
    const current = get().byConversation[conversationId] ?? {};
    const next = later(current[key], readAt);
    if (next === current[key]) return;
    set((s) => ({ byConversation: { ...s.byConversation, [conversationId]: { ...current, [key]: next } } }));
  },

  load: async (kind, conversationId, me) => {
    if (!me || !isValidUUID(conversationId)) return;
    try {
      const rows = await workspaceApi.listReads(kind, conversationId, me);
      for (const r of rows ?? []) get().apply(conversationId, r.email, r.read_at);
    } catch {
      // Receipts are a nicety: without them messages just show the "sent" tick.
    }
  },
}));

/** Who else (not `me`) has read up to `createdAt`. */
export function seenBy(receipts: ReadReceipts | undefined, me: string, createdAt: string): string[] {
  if (!receipts) return [];
  const sent = Date.parse(createdAt);
  const self = me.toLowerCase();
  return Object.entries(receipts)
    .filter(([email, at]) => email !== self && Date.parse(at) >= sent)
    .map(([email]) => email);
}

// ── Announcing my own reads ──

const lastAnnounced = new Map<string, string>();

/** Tell the server (and so everyone in the conversation) that I have read up to `readAt`. Sent once per position. */
export function announceRead(ws: WebSocket | null, kind: ConversationKind, conversationId: string, readAt: string) {
  if (!ws || ws.readyState !== WebSocket.OPEN || !isValidUUID(conversationId)) return;
  if (lastAnnounced.get(conversationId) === readAt) return;
  lastAnnounced.set(conversationId, readAt);
  const payload = { kind, conversation_id: conversationId, read_at: readAt };
  ws.send(JSON.stringify({ type: "conversation.read", payload }));
}
