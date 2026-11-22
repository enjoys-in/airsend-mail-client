"use client";

// ============================================================================
// Message selection (select mode) and the forward dialog.
//
// "Select" on a message enters select mode in its conversation; checkboxes
// appear and a bar offers Forward / Copy. "Forward" on a single message opens
// the dialog directly with that message.
// ============================================================================

import { create } from "zustand";

interface SelectionState {
  /** Conversation in select mode (channel or DM id); null when not selecting. */
  conversationId: string | null;
  selectedIds: string[];
  /** Messages the forward dialog is open for; empty when closed. */
  forwardIds: string[];
  forwardFrom: string | null;

  start: (conversationId: string, messageId?: string) => void;
  toggle: (messageId: string) => void;
  clear: () => void;
  openForward: (conversationId: string, messageIds: string[]) => void;
  closeForward: () => void;
}

export const useSelection = create<SelectionState>()((set, get) => ({
  conversationId: null,
  selectedIds: [],
  forwardIds: [],
  forwardFrom: null,

  start: (conversationId, messageId) =>
    set({ conversationId, selectedIds: messageId ? [messageId] : [] }),

  toggle: (messageId) => {
    const ids = get().selectedIds;
    set({ selectedIds: ids.includes(messageId) ? ids.filter((id) => id !== messageId) : [...ids, messageId] });
  },

  clear: () => set({ conversationId: null, selectedIds: [] }),

  openForward: (conversationId, messageIds) => set({ forwardFrom: conversationId, forwardIds: messageIds }),

  closeForward: () => set({ forwardIds: [], forwardFrom: null }),
}));

/** Is `conversationId` in select mode? */
export const useSelecting = (conversationId: string | null | undefined) =>
  useSelection((s) => !!conversationId && s.conversationId === conversationId);
