"use client";

// ============================================================================
// Outbox: every outgoing chat message (text, file, forward) goes through here.
//
// 1. The row is written to IndexedDB first (files keep their bytes there), so
//    nothing is lost when the tab reloads or the network drops.
// 2. Text: sent over the WebSocket (ack replaces the optimistic copy) or HTTP.
//    File: create the message -> upload under the message id (or share an
//    existing file) -> reference it on the message. Each step is saved on the
//    row, so a retry resumes where it stopped.
// 3. Failures retry with backoff (send-retry.ts); permanent ones are marked
//    failed and wait for the user to Retry or Discard.
// Uploads run at most MAX_PARALLEL_UPLOADS at a time (limit.ts) and continue
// while the user moves to other conversations.
// ============================================================================

import type { StoreApi } from "zustand";
import { toast } from "sonner";
import type { ChatStore } from "./chat-store";
import type { ChatMessage, MessageAttachment, PendingUpload } from "./chat-types";
import {
  workspaceApi,
  toMessage,
  toDMMessage,
  toAttachment,
  apiErrorMessage,
  isValidUUID,
  WorkspaceApiError,
  type AttachmentRef,
} from "./api";
import {
  uploadWorkspaceFile,
  shareWorkspaceFile,
  deleteWorkspaceFile,
  getWorkspaceFileMeta,
  filesErrorMessage,
  FilesApiError,
} from "./files-api";
import { enqueueOutbox, removeOutbox, loadOutbox, getOutboxRow, type OutboxEntry } from "./workspace-cache";
import { uploadLimit } from "./limit";
import { retryDelay, isTransient, isOffline, isAlreadyAttached, MAX_SEND_ATTEMPTS } from "./send-retry";
import { extensionOf } from "./file-utils";

type SetState = StoreApi<ChatStore>["setState"];
type GetState = StoreApi<ChatStore>["getState"];

export type ConversationKind = "channel" | "dm";

/** A file to send: new bytes, or a file already in the files service (reused, nothing uploaded). */
export interface OutgoingFile {
  file?: File;
  reuse?: { fileId: string; name: string; size: number; type: string; extension?: string };
}

export interface ForwardTarget {
  kind: ConversationKind;
  id: string;
}

/** How long a WebSocket send may wait for its ack before the outbox sends it again over HTTP. */
const WS_ACK_GRACE_MS = 15_000;
const QUOTE_MAX = 80;

let lastStamp = 0;
/** Strictly increasing creation time, so rows queued in the same millisecond keep their order. */
const stamp = () => (lastStamp = Math.max(Date.now(), lastStamp + 1));
const newId = (prefix: string) => `${prefix}-${stamp()}-${Math.random().toString(36).slice(2, 8)}`;

const isFileRow = (r: OutboxEntry) => !!r.file || !!r.reuseFileId;

/** The quote shown above a reply. */
export function quoteOf(m?: ChatMessage | null): ChatMessage["replyTo"] {
  if (!m) return undefined;
  const text = m.content.length > QUOTE_MAX ? `${m.content.slice(0, QUOTE_MAX)}…` : m.content;
  return { messageId: m.id, authorId: m.authorId, authorName: m.authorName, content: text };
}

/** Keep the local quote when the server copy only carries the reply id (no preview yet). */
export function keepQuote(real: ChatMessage, local?: ChatMessage): ChatMessage {
  if (!local?.replyTo || !real.replyTo || real.replyTo.authorName) return real;
  return { ...real, replyTo: local.replyTo };
}

/** A quote known only by id (rebuilt after a reload); ReplyQuote shows "Original message". */
const idOnlyQuote = (id?: string): ChatMessage["replyTo"] =>
  id ? { messageId: id, authorId: "", authorName: "", content: "" } : undefined;

/** Only real (server) message ids can be replied to. */
const replyIdOf = (m?: ChatMessage | null) => (m && isValidUUID(m.id) ? m.id : undefined);

function describe(err: unknown, fallback: string) {
  return err instanceof FilesApiError ? filesErrorMessage(err, fallback) : apiErrorMessage(err, fallback);
}

/** The /ref call can 404 for a moment while the server flushes the just-sent message; retry once after ~1s. */
async function withRefRetry<T>(call: () => Promise<T>): Promise<T> {
  try {
    return await call();
  } catch (err) {
    if (!(err instanceof WorkspaceApiError) || err.status !== 404) throw err;
    await new Promise((r) => setTimeout(r, 1000));
    return call();
  }
}

/** Does the files service already hold the file of this message? (Unknown counts as no: the upload then decides.) */
async function isStored(messageId: string): Promise<boolean> {
  try {
    await getWorkspaceFileMeta(messageId);
    return true;
  } catch {
    return false;
  }
}

/** IndexedDB hands Files back as Blobs in some browsers. */
function asFile(row: OutboxEntry): File {
  const blob = row.file as Blob;
  if (blob instanceof File) return blob;
  return new File([blob], row.fileName ?? "file", { type: row.fileType });
}

export function createOutbox(set: SetState, get: GetState) {
  /** Rows of this session; IndexedDB is the durable copy (and the only one after a reload). */
  const memory = new Map<string, OutboxEntry>();
  const inFlight = new Set<string>();
  const finished = new Set<string>();
  const discarded = new Set<string>();
  const controllers = new Map<string, AbortController>();
  let timer: ReturnType<typeof setTimeout> | undefined;
  let timerAt = Infinity;

  // ── persistence ──

  const save = async (row: OutboxEntry) => {
    memory.set(row.id, row);
    await enqueueOutbox(row);
  };
  const forget = async (id: string) => {
    memory.delete(id);
    await removeOutbox(id);
  };
  const rowOf = async (id: string) => memory.get(id) ?? (await getOutboxRow(id));
  const allRows = async () => {
    const byId = new Map((await loadOutbox()).map((r) => [r.id, r]));
    for (const r of memory.values()) byId.set(r.id, r);
    return [...byId.values()].sort((a, b) => a.createdAt - b.createdAt);
  };

  // ── store helpers ──

  const listOf = (kind: ConversationKind, target: string) =>
    kind === "channel" ? get().messages : (get().dmMessages[target] ?? []);

  const withList = (kind: ConversationKind, target: string, fn: (list: ChatMessage[]) => ChatMessage[]) =>
    set((s) =>
      kind === "channel"
        ? { messages: fn(s.messages) }
        : { dmMessages: { ...s.dmMessages, [target]: fn(s.dmMessages[target] ?? []) } },
    );

  /** Open, or already loaded: only then may a message be added locally (else the first fetch would skip history). */
  const isLoaded = (kind: ConversationKind, target: string) => {
    const s = get();
    if (kind === "channel") return s.activeChannelId === target || s.messages.some((m) => m.channelId === target);
    return s.activeDmId === target || target in s.dmMessages;
  };

  const putMessage = (kind: ConversationKind, target: string, msg: ChatMessage) => {
    if (!isLoaded(kind, target)) return;
    withList(kind, target, (list) => (list.some((m) => m.id === msg.id) ? list : [...list, msg]));
  };

  /** Swap the optimistic copy (id = row id) for the server's message. */
  const settle = (row: OutboxEntry, real: ChatMessage) =>
    withList(row.kind, row.target, (list) => {
      if (list.some((m) => m.id === real.id)) return list.filter((m) => m.id !== row.id);
      if (!list.some((m) => m.id === row.id)) return [...list, real];
      return list.map((m) => (m.id === row.id ? keepQuote(real, m) : m));
    });

  const patchMessage = (row: OutboxEntry, patch: Partial<ChatMessage>) =>
    withList(row.kind, row.target, (list) => list.map((m) => (m.id === row.id ? { ...m, ...patch } : m)));

  const dropMessage = (kind: ConversationKind, target: string, id: string) =>
    withList(kind, target, (list) => list.filter((m) => m.id !== id));

  const patchUpload = (id: string, p: Partial<PendingUpload>) =>
    set((s) => ({ pendingUploads: s.pendingUploads.map((u) => (u.id === id ? { ...u, ...p } : u)) }));

  const dropUpload = (id: string) => set((s) => ({ pendingUploads: s.pendingUploads.filter((u) => u.id !== id) }));

  const ensureUpload = (row: OutboxEntry) => {
    if (get().pendingUploads.some((u) => u.id === row.id)) return;
    const upload: PendingUpload = {
      id: row.id,
      contextType: row.kind,
      contextId: row.target,
      name: row.fileName ?? "file",
      size: row.fileSize ?? 0,
      progress: 0,
      status: "queued",
    };
    set((s) => ({ pendingUploads: [...s.pendingUploads, upload] }));
  };

  /** The optimistic copy of a text row (rebuilt after a reload too, so unsent messages stay visible). */
  const optimistic = (row: OutboxEntry, replyTo?: ChatMessage["replyTo"]): ChatMessage => ({
    id: row.id,
    channelId: row.target,
    authorId: get().currentUserId,
    authorName: "You",
    content: row.content,
    type: "text",
    priority: (row.priority || "normal") as ChatMessage["priority"],
    createdAt: new Date(row.createdAt).toISOString(),
    isEdited: false,
    isPinned: false,
    isPinnedPublic: false,
    mentions: row.mentions,
    reactions: [],
    attachments: [],
    threadReplyCount: 0,
    isDeleted: false,
    sendStatus: row.failed ? "failed" : "sending",
    replyTo: replyTo ?? idOnlyQuote(row.replyToId),
  });

  /** Reflect a row's state in the UI: the composer's upload list for files, the message's status for text. */
  const show = (row: OutboxEntry) => {
    if (isFileRow(row)) {
      ensureUpload(row);
      const waiting = isOffline() ? "Waiting for connection…" : row.error ? `${row.error} · retrying…` : undefined;
      patchUpload(row.id, row.failed ? { status: "error", error: row.error } : { status: "queued", error: waiting });
      return;
    }
    if (listOf(row.kind, row.target).some((m) => m.id === row.id)) {
      patchMessage(row, { sendStatus: row.failed ? "failed" : "sending" });
    } else {
      putMessage(row.kind, row.target, optimistic(row));
    }
  };

  const schedule = (at: number) => {
    if (!Number.isFinite(at) || at >= timerAt) return;
    clearTimeout(timer);
    timerAt = at;
    timer = setTimeout(() => {
      timerAt = Infinity;
      void flush();
    }, Math.max(0, at - Date.now()));
  };

  const done = async (row: OutboxEntry) => {
    finished.add(row.id);
    controllers.delete(row.id);
    await forget(row.id);
    if (isFileRow(row)) dropUpload(row.id);
  };

  const fail = async (stale: OutboxEntry, err: unknown) => {
    if (discarded.has(stale.id)) return;
    // Build on the latest saved copy: steps done since `stale` was taken (messageId, uploaded) must survive,
    // or the retry would redo them (e.g. upload the same file again).
    const row = memory.get(stale.id) ?? stale;
    // Offline: no attempt is counted; the "online" event flushes again.
    if (isOffline()) return show(row);
    const attempts = (row.attempts ?? 0) + 1;
    const retry = isTransient(err) && attempts < MAX_SEND_ATTEMPTS;
    const next: OutboxEntry = {
      ...row,
      attempts,
      error: describe(err, "Could not send"),
      failed: !retry,
      nextAt: retry ? Date.now() + retryDelay(attempts) : undefined,
    };
    await save(next);
    show(next);
    if (retry) schedule(next.nextAt as number);
    else toast.error(isFileRow(next) ? `${next.fileName}: ${next.error}` : (next.error as string));
  };

  // ── text ──

  const sendText = async (row: OutboxEntry) => {
    const email = get().currentUserId;
    const body = {
      content: row.content,
      type: "text",
      priority: row.priority,
      mentions: row.mentions,
      reply_to_id: row.replyToId,
    };
    const real =
      row.kind === "channel"
        ? toMessage(await workspaceApi.sendMessage(row.target, body, email))
        : toDMMessage(await workspaceApi.sendDMMessage(row.target, row.content, email, row.replyToId));
    settle(row, real);
  };

  // ── files ──

  const placeholder = (row: OutboxEntry, uploadProgress?: number): MessageAttachment => ({
    id: `local-${row.messageId}`,
    name: row.fileName ?? "file",
    url: "",
    mimeType: row.fileType || "application/octet-stream",
    size: row.fileSize ?? 0,
    fileId: row.messageId,
    extension: row.fileExtension || extensionOf(row.fileName ?? "") || undefined,
    uploadProgress,
  });

  /** Undo a file message whose file never got attached. DM messages cannot be deleted: keep the text, drop the card. */
  const undo = async (row: OutboxEntry) => {
    const id = row.messageId;
    if (!id) return;
    if (row.kind === "channel") {
      dropMessage("channel", row.target, id);
      workspaceApi.deleteMessage(id, get().currentUserId).catch(() => {});
    } else {
      const strip = (m: ChatMessage) => ({ ...m, attachments: m.attachments.filter((a) => a.fileId !== id) });
      withList("dm", row.target, (list) => list.map((m) => (m.id === id ? strip(m) : m)));
    }
    if (row.uploaded) deleteWorkspaceFile(id).catch(() => {});
  };

  /** Step 1: the message the file belongs to (its id becomes the file id). null when discarded meanwhile. */
  const createFileMessage = async (row: OutboxEntry): Promise<OutboxEntry | null> => {
    if (row.messageId) {
      get().addMessageAttachment(row.messageId, placeholder(row, row.uploaded ? undefined : 0));
      return row;
    }
    const email = get().currentUserId;
    const body = { content: row.content, type: "file", reply_to_id: row.replyToId };
    const msg =
      row.kind === "channel"
        ? toMessage(await workspaceApi.sendMessage(row.target, body, email))
        : toDMMessage(await workspaceApi.sendDMMessage(row.target, row.content, email, row.replyToId));
    const next = { ...row, messageId: msg.id };
    if (discarded.has(row.id)) {
      await undo(next);
      return null;
    }
    await save(next);
    putMessage(row.kind, row.target, { ...msg, type: "file", attachments: [placeholder(next, 0)] });
    return next;
  };

  const progress = (row: OutboxEntry, percent: number) => {
    patchUpload(row.id, { progress: percent });
    if (row.messageId) get().addMessageAttachment(row.messageId, placeholder(row, percent));
  };

  /** Steps 2 + 3: the bytes (or a shared existing file) under the message id, then the reference on the message. */
  const finishFile = async (row: OutboxEntry): Promise<OutboxEntry> => {
    const messageId = row.messageId as string;
    let current = row;
    // A retry whose earlier upload may have landed (response lost, tab closed): never upload the same file twice.
    if (!row.uploaded && row.attempts && (await isStored(messageId))) {
      current = { ...row, uploaded: true };
      await save(current);
    }
    if (!current.uploaded) {
      const controller = new AbortController();
      controllers.set(row.id, controller);
      try {
        await uploadLimit(async () => {
          if (discarded.has(row.id)) throw new FilesApiError("Upload cancelled", 0);
          patchUpload(row.id, { status: "uploading", error: undefined });
          if (row.reuseFileId) return shareWorkspaceFile(row.reuseFileId, row.kind, row.target, messageId);
          return uploadWorkspaceFile(asFile(row), row.kind, row.target, {
            messageId,
            signal: controller.signal,
            onProgress: (p) => progress(row, p),
          });
        });
      } catch (err) {
        if (!isAlreadyAttached(err)) throw err; // 409: an earlier try already stored it
      }
      current = { ...row, uploaded: true };
      await save(current);
    }
    patchUpload(row.id, { progress: 100, status: "sending" });
    get().addMessageAttachment(messageId, placeholder(current));
    const ref: AttachmentRef = {
      file_id: messageId,
      file_name: row.fileName ?? "file",
      file_type: row.fileType,
      file_size: row.fileSize ?? 0,
      file_extension: row.fileExtension,
    };
    const email = get().currentUserId;
    const att = await withRefRetry(() =>
      row.kind === "channel"
        ? workspaceApi.addAttachmentRef(messageId, ref, email)
        : workspaceApi.addDMAttachmentRef(row.target, messageId, ref, email),
    );
    get().addMessageAttachment(messageId, toAttachment(att));
    return current;
  };

  // ── the loop ──

  /** Is this row ready to run now? Schedules a later flush when it is waiting. */
  const due = (row: OutboxEntry, now: number) => {
    if (row.failed) {
      show(row);
      return false;
    }
    if (inFlight.has(row.id) || finished.has(row.id) || discarded.has(row.id)) return false;
    if (row.nextAt && row.nextAt > now) {
      show(row);
      schedule(row.nextAt);
      return false;
    }
    // A fresh WebSocket send is waiting for its ack.
    const awaitingAck = !isFileRow(row) && !row.attempts && listOf(row.kind, row.target).some((m) => m.id === row.id);
    if (awaitingAck && now - row.createdAt < WS_ACK_GRACE_MS) {
      schedule(row.createdAt + WS_ACK_GRACE_MS);
      return false;
    }
    return true;
  };

  async function flush(): Promise<void> {
    if (!get().currentUserId || isOffline()) return;
    const uploads: Promise<unknown>[] = [];
    const now = Date.now();
    // Text and message creation run in order (keeps the conversation order); uploads then run in parallel.
    for (const listed of await allRows()) {
      if (!due(listed, now)) continue;
      inFlight.add(listed.id);
      const row = await rowOf(listed.id); // fresh copy: another flush may have moved it on
      if (!row || row.failed) {
        inFlight.delete(listed.id);
        continue;
      }
      try {
        show(row);
        if (!isFileRow(row)) {
          await sendText(row);
          await done(row);
          inFlight.delete(row.id);
          continue;
        }
        const created = await createFileMessage(row);
        if (!created) {
          inFlight.delete(row.id);
          continue;
        }
        uploads.push(
          finishFile(created)
            .then(done, (err) => fail(created, err))
            .finally(() => inFlight.delete(row.id)),
        );
      } catch (err) {
        await fail(row, err);
        inFlight.delete(row.id);
      }
    }
    await Promise.all(uploads);
  }

  // ── queueing ──

  const stageText = async (
    kind: ConversationKind,
    target: string,
    content: string,
    opts: { mentions?: string[]; priority?: string; replyTo?: ChatMessage | null } = {},
  ) => {
    const row: OutboxEntry = {
      id: newId("temp"),
      kind,
      target,
      content,
      mentions: opts.mentions ?? [],
      priority: opts.priority ?? "normal",
      createdAt: stamp(),
      replyToId: replyIdOf(opts.replyTo),
    };
    putMessage(kind, target, optimistic(row, quoteOf(opts.replyTo)));
    await save(row);
    return row;
  };

  const stageFiles = async (
    kind: ConversationKind,
    target: string,
    items: OutgoingFile[],
    caption?: string,
    replyTo?: ChatMessage | null,
  ) => {
    for (const [i, item] of items.entries()) {
      const name = item.file?.name ?? item.reuse?.name ?? "file";
      const row: OutboxEntry = {
        id: newId("up"),
        kind,
        target,
        // The first file carries the caption (and the reply); the others are just their name.
        content: (i === 0 && caption?.trim()) || name,
        mentions: [],
        priority: "normal",
        createdAt: stamp(),
        replyToId: i === 0 ? replyIdOf(replyTo) : undefined,
        file: item.file,
        fileName: name,
        fileType: item.file?.type || item.reuse?.type || "application/octet-stream",
        fileSize: item.file?.size ?? item.reuse?.size ?? 0,
        fileExtension: item.reuse?.extension || extensionOf(name) || undefined,
        reuseFileId: item.reuse?.fileId,
      };
      await save(row);
      show(row);
    }
  };

  /** The socket frame for a text row: `message.send` (channel) or `dm.send` (DM / group). Acked with the temp id. */
  const socketFrame = (row: OutboxEntry) => {
    const common = { content: row.content, reply_to_id: row.replyToId ?? null, temp_id: row.id };
    if (row.kind === "dm") return { type: "dm.send", payload: { ...common, conversation_id: row.target } };
    const extra = { channel_id: row.target, type: "text", priority: row.priority, mentions: row.mentions };
    return { type: "message.send", payload: { ...common, ...extra } };
  };

  /**
   * Send a text message: optimistic copy now, then the WebSocket when connected (channels and DMs alike); the ack
   * swaps in the server copy. Without a socket, or with no ack in time, the outbox sends it over HTTP.
   */
  const queueText = async (...args: Parameters<typeof stageText>) => {
    const row = await stageText(...args);
    const ws = get()._ws;
    if (ws?.readyState !== WebSocket.OPEN) return void flush();
    ws.send(JSON.stringify(socketFrame(row)));
    schedule(row.createdAt + WS_ACK_GRACE_MS);
  };

  const queueFiles = async (...args: Parameters<typeof stageFiles>) => {
    await stageFiles(...args);
    await flush();
  };

  /** Forward messages to other conversations. Files are shared by reference (no new upload). */
  const forward = async (messages: ChatMessage[], targets: ForwardTarget[]) => {
    for (const t of targets) {
      for (const m of messages) {
        const label = `Forwarded from ${m.authorName || m.authorId}`;
        const files = m.attachments.filter((a) => a.fileId);
        const ownText = m.content.trim() && !m.attachments.some((a) => a.name === m.content) ? m.content : "";
        const text = ownText ? `${label}\n${ownText}` : label;
        if (!files.length) {
          if (ownText) await stageText(t.kind, t.id, text);
          continue;
        }
        const reuse = files.map((a) => ({
          reuse: { fileId: a.fileId as string, name: a.name, size: a.size, type: a.mimeType, extension: a.extension },
        }));
        await stageFiles(t.kind, t.id, reuse, text);
      }
    }
    await flush();
  };

  // ── user actions ──

  const retry = async (id: string) => {
    const row = await rowOf(id);
    if (!row) return;
    discarded.delete(id);
    const next: OutboxEntry = { ...row, failed: false, attempts: 0, nextAt: undefined, error: undefined };
    await save(next);
    show(next);
    void flush();
  };

  const discard = async (id: string) => {
    discarded.add(id);
    controllers.get(id)?.abort();
    const row = await rowOf(id);
    await forget(id);
    dropUpload(id);
    if (!row) return;
    if (isFileRow(row)) await undo(row);
    else dropMessage(row.kind, row.target, row.id);
  };

  /** The WebSocket rejected a send: retry it over HTTP (which reports a precise status). */
  const wsFailed = async (tempId: string, error: string) => {
    const row = await rowOf(tempId);
    if (row) await fail(row, new Error(error || "Failed to send message"));
  };

  /** The WebSocket acked a send. */
  const acked = (tempId: string) => {
    finished.add(tempId);
    void forget(tempId);
  };

  return { flush, queueText, queueFiles, forward, retry, discard, wsFailed, acked };
}

export type Outbox = ReturnType<typeof createOutbox>;
