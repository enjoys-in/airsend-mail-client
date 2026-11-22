"use client";

// Undo copies of messages you deleted. The text and file ids stay in IndexedDB
// for UNDO_WINDOW_MS; when the window ends the files are purged from the files
// service (it already refuses to serve them once the message is deleted).

import { create } from "zustand";
import { loadTrash, saveTrash, type TrashEntry } from "./workspace-cache";
import { deleteWorkspaceFile, FilesApiError } from "./files-api";

/** Same as models.UndoDeleteWindow on the workspace server. */
export const UNDO_WINDOW_MS = 10 * 60_000;

export const useTrash = create<{ entries: Record<string, TrashEntry> }>(() => ({ entries: {} }));

const timers = new Map<string, ReturnType<typeof setTimeout>>();

const isUndoable = (e?: TrashEntry) => !!e && Date.now() - e.deletedAt < UNDO_WINDOW_MS;

/** The undo copy of a message while it can still be restored. */
export const useUndoable = (messageId: string) => useTrash((s) => isUndoable(s.entries[messageId]));

function stopTimer(id: string) {
  clearTimeout(timers.get(id));
  timers.delete(id);
}

function setEntry(id: string, entry?: TrashEntry) {
  useTrash.setState((s) => {
    const entries = { ...s.entries };
    if (entry) entries[id] = entry;
    else delete entries[id];
    return { entries };
  });
}

/** Drop the undo copy (restored, or its files are purged). */
export function forgetUndo(id: string) {
  stopTimer(id);
  setEntry(id);
  void saveTrash(id);
}

/**
 * Delete the files of a deleted message now. A failure keeps the stored copy so the next start tries again.
 * `kept`: the copy is in IndexedDB, so purge only while it still is (another tab may have restored the message).
 */
export async function purgeNow(entry: TrashEntry, kept = true) {
  stopTimer(entry.id);
  if (kept && !(await loadTrash()).some((e) => e.id === entry.id)) return setEntry(entry.id);
  const gone = (err: unknown) => err instanceof FilesApiError && err.status === 404;
  const results = await Promise.allSettled(entry.fileIds.map((f) => deleteWorkspaceFile(f)));
  if (results.some((r) => r.status === "rejected" && !gone(r.reason))) return setEntry(entry.id);
  forgetUndo(entry.id);
}

/** Keep an undo copy and purge its files when the window ends. */
export function keepForUndo(entry: TrashEntry) {
  stopTimer(entry.id);
  setEntry(entry.id, entry);
  void saveTrash(entry);
  const left = entry.deletedAt + UNDO_WINDOW_MS - Date.now();
  timers.set(entry.id, setTimeout(() => void purgeNow(entry), Math.max(0, left)));
}

/** The undo copy to restore, with its purge paused; undefined when the window has passed. */
export function takeUndo(id: string): TrashEntry | undefined {
  const entry = useTrash.getState().entries[id];
  if (!isUndoable(entry)) return undefined;
  stopTimer(id);
  return entry;
}

/** On start: reschedule the copies kept by earlier sessions (expired ones purge now). */
export async function hydrateTrash() {
  for (const entry of await loadTrash()) keepForUndo(entry);
}
