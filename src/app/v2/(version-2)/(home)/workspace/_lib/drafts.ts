"use client";

// ============================================================================
// Composer drafts, per conversation (channel id or DM conversation id).
//
// Typing in a conversation and switching away keeps the text and the staged
// files; coming back restores them. Held in memory for instant switching and
// written to IndexedDB (debounced) so drafts also survive a reload.
// ============================================================================

import { create } from "zustand";
import { loadDrafts, saveDraft, type DraftEntry, type DraftFile } from "./workspace-cache";

export type { DraftFile };

interface DraftsState {
  drafts: Record<string, DraftEntry>;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  setText: (conversationId: string, text: string) => void;
  addFiles: (conversationId: string, files: DraftFile[]) => void;
  removeFile: (conversationId: string, fileId: string) => void;
  clear: (conversationId: string) => void;
}

const SAVE_DELAY_MS = 500;
const timers = new Map<string, ReturnType<typeof setTimeout>>();

function persistLater(entry: DraftEntry) {
  clearTimeout(timers.get(entry.id));
  timers.set(
    entry.id,
    setTimeout(() => {
      timers.delete(entry.id);
      void saveDraft(entry);
    }, SAVE_DELAY_MS),
  );
}

const emptyDraft = (id: string): DraftEntry => ({ id, text: "", files: [], updatedAt: Date.now() });

export const useDrafts = create<DraftsState>()((set, get) => {
  /** Applies `change` to a conversation's draft and schedules the save. */
  const update = (id: string, change: (d: DraftEntry) => DraftEntry) => {
    if (!id) return;
    const next = { ...change(get().drafts[id] ?? emptyDraft(id)), updatedAt: Date.now() };
    set((s) => ({ drafts: { ...s.drafts, [id]: next } }));
    persistLater(next);
  };

  return {
    drafts: {},
    hydrated: false,

    hydrate: async () => {
      const rows = await loadDrafts();
      // Anything typed before hydration finished wins over the stored copy.
      set((s) => ({
        hydrated: true,
        drafts: { ...Object.fromEntries(rows.map((r) => [r.id, r])), ...s.drafts },
      }));
    },

    setText: (id, text) => {
      if ((get().drafts[id]?.text ?? "") === text) return;
      update(id, (d) => ({ ...d, text }));
    },

    addFiles: (id, files) => update(id, (d) => ({ ...d, files: [...d.files, ...files] })),

    removeFile: (id, fileId) => update(id, (d) => ({ ...d, files: d.files.filter((f) => f.id !== fileId) })),

    clear: (id) => update(id, (d) => ({ ...d, text: "", files: [] })),
  };
});

/** A staged file from a picked / dropped File (its bytes are kept with the draft). */
export function draftFileFrom(file: File): DraftFile {
  return {
    id: `df-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: file.name,
    size: file.size,
    type: file.type || "application/octet-stream",
    blob: file,
  };
}

/** Does this conversation have unsent text or files? (Sidebar "draft" hint.) */
export const hasDraft = (d?: DraftEntry) => !!d && (!!d.text.trim() || d.files.length > 0);
