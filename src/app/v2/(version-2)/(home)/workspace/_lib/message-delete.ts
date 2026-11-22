"use client";

// Deleting a message (channel or DM). Everyone else sees "deleted by <name>" at
// once: the server blanks the text and hides the files. Your own message keeps
// an undo copy (trash.ts) that Undo sends back; a moderator's delete is final.

import type { StoreApi } from "zustand";
import type { ChatStore } from "./chat-store";
import type { ChatMessage } from "./chat-types";
import { workspaceApi, toMessage, toDMMessage, WorkspaceApiError } from "./api";
import { keepForUndo, takeUndo, forgetUndo, purgeNow } from "./trash";
import type { TrashEntry } from "./workspace-cache";

type SetState = StoreApi<ChatStore>["setState"];
type GetState = StoreApi<ChatStore>["getState"];
type Deleter = NonNullable<ChatMessage["deletedBy"]>;

/** The placeholder a deleted message becomes: no text, no files. */
export const asDeleted = (m: ChatMessage, by?: Deleter): ChatMessage => ({
  ...m,
  isDeleted: true,
  content: "",
  attachments: [],
  deletedBy: by ?? m.deletedBy,
});

export function createDeletes(set: SetState, get: GetState) {
  /** Where a loaded message lives: the channel list, the open thread, or one DM conversation. */
  const locate = (id: string) => {
    const s = get();
    const msg = s.messages.find((m) => m.id === id) ?? s.threadReplies.find((m) => m.id === id);
    if (msg) return { kind: "channel" as const, target: msg.channelId, msg };
    for (const [target, list] of Object.entries(s.dmMessages)) {
      const dm = list.find((m) => m.id === id);
      if (dm) return { kind: "dm" as const, target, msg: dm };
    }
    return null;
  };

  const patch = (id: string, fn: (m: ChatMessage) => ChatMessage) => {
    const at = locate(id);
    if (!at) return;
    const swap = (list: ChatMessage[]) => list.map((m) => (m.id === id ? fn(m) : m));
    set((s) =>
      at.kind === "channel"
        ? { messages: swap(s.messages), threadReplies: swap(s.threadReplies) }
        : { dmMessages: { ...s.dmMessages, [at.target]: swap(s.dmMessages[at.target] ?? []) } },
    );
  };

  const applyDeleted = (id: string, by?: Deleter) => patch(id, (m) => asDeleted(m, by));

  const applyRestored = (msg: ChatMessage) => {
    forgetUndo(msg.id);
    patch(msg.id, () => msg);
  };

  async function remove(id: string): Promise<boolean> {
    const at = locate(id);
    if (!at) return false;
    const { kind, target, msg } = at;
    const email = get().currentUserId;
    applyDeleted(id, { email, name: email });
    try {
      if (kind === "channel") await workspaceApi.deleteMessage(id, email);
      else await workspaceApi.deleteDMMessage(target, id, email);
    } catch {
      patch(id, () => msg); // e.g. 403
      return false;
    }
    const fileIds = msg.attachments.flatMap((a) => (a.fileId ? [a.fileId] : []));
    const entry: TrashEntry = { id, kind, conversationId: target, content: msg.content, fileIds, deletedAt: Date.now() };
    if (msg.authorId.toLowerCase() === email.toLowerCase()) keepForUndo(entry);
    else void purgeNow(entry, false);
    return true;
  }

  async function undo(id: string): Promise<boolean> {
    const entry = takeUndo(id);
    if (!entry) return false;
    const email = get().currentUserId;
    try {
      const restored =
        entry.kind === "channel"
          ? toMessage(await workspaceApi.restoreMessage(id, entry.content, email))
          : toDMMessage(await workspaceApi.restoreDMMessage(entry.conversationId, id, entry.content, email));
      applyRestored(restored);
      return true;
    } catch (err) {
      // 410: the window closed on the server, so the files go; anything else can be tried again.
      if (err instanceof WorkspaceApiError && err.status === 410) void purgeNow(entry);
      else keepForUndo(entry);
      return false;
    }
  }

  return { remove, undo, applyDeleted, applyRestored };
}
