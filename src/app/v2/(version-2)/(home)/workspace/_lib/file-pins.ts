// ============================================================================
// Pinned team files — the signed-in user's pins, kept in the files service by
// files-service file id. Loaded once; toggles are optimistic and revert on error.
// ============================================================================

import { create } from "zustand";
import { toast } from "sonner";
import { filesErrorMessage, listPinnedFileIds, setFilePinned } from "./files-api";

interface FilePinsState {
  /** files-service file id -> pinned */
  pinned: Record<string, true>;
  loaded: boolean;
  load: (force?: boolean) => Promise<void>;
  toggle: (fileId: string) => Promise<void>;
}

let loading: Promise<void> | null = null;

function without(map: Record<string, true>, id: string): Record<string, true> {
  const next = { ...map };
  delete next[id];
  return next;
}

export const useFilePins = create<FilePinsState>()((set, get) => ({
  pinned: {},
  loaded: false,

  load: (force) => {
    if (get().loaded && !force) return Promise.resolve();
    loading ??= listPinnedFileIds()
      .then((ids) => set({ pinned: Object.fromEntries(ids.map((id) => [id, true as const])), loaded: true }))
      .catch((err) => console.warn("[Files] Could not load pins:", err))
      .finally(() => {
        loading = null;
      });
    return loading;
  },

  toggle: async (fileId) => {
    const wasPinned = !!get().pinned[fileId];
    const apply = (pin: boolean) =>
      set((s) => ({ pinned: pin ? { ...s.pinned, [fileId]: true } : without(s.pinned, fileId) }));
    apply(!wasPinned);
    try {
      await setFilePinned(fileId, !wasPinned);
    } catch (err) {
      apply(wasPinned);
      toast.error(filesErrorMessage(err, wasPinned ? "Could not unpin the file" : "Could not pin the file"));
    }
  },
}));
