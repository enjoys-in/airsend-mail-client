// ============================================================================
// Workspace cache — IndexedDB (Dexie) mirror of the chat store.
//
// Stale-while-revalidate: on start the store is filled from IndexedDB so
// teams, channels, DMs and the open conversation render instantly, then the
// normal fetches refresh them silently. A store subscription writes every
// change back (API refetches and WebSocket events alike), so the cache always
// holds the latest known state and nothing here needs to be called by hand.
// Everything is best-effort: any IndexedDB failure leaves the app working
// exactly as it did without the cache.
// ============================================================================

import Dexie, { type Table } from "dexie";
import type {
  CallRecord,
  Channel,
  ChatMessage,
  ChatNotification,
  DirectMessage,
  Meeting,
  Team,
  TeamMember,
  WorkspaceFile,
} from "./chat-types";

interface Row<T> {
  id: string;
  scope: string;
  v: T;
}

interface MetaRow {
  key: string;
  value: unknown;
}

export interface OutboxEntry {
  id: string;
  kind: "channel" | "dm";
  target: string;
  content: string;
  mentions: string[];
  priority: string;
  createdAt: number;
  /** Inline quote-reply target. */
  replyToId?: string;
  // Retry state (see send-retry.ts)
  attempts?: number;
  nextAt?: number;
  failed?: boolean;
  error?: string;
  // File messages: the bytes stay here until the files service has them, so a reload or going offline resumes
  file?: Blob;
  fileName?: string;
  fileType?: string;
  fileSize?: number;
  fileExtension?: string;
  /** Reuse a file already in the files service (forward / "use the existing upload") instead of uploading. */
  reuseFileId?: string;
  /** Set once the message exists on the workspace server (step 1 done). */
  messageId?: string;
  /** Set once the files service stored the file under messageId (step 2 done). */
  uploaded?: boolean;
  /** Set when step 2 was first tried: a later try asks the files service before sending the bytes again. */
  uploadTried?: boolean;
}

/** A composer draft: unsent text and files of one conversation. */
/** A message you deleted: its text and files, kept for undo until the window ends (then its files are purged). */
export interface TrashEntry {
  id: string;
  kind: "channel" | "dm";
  conversationId: string;
  content: string;
  fileIds: string[];
  deletedAt: number;
}

export interface DraftEntry {
  id: string;
  text: string;
  files: DraftFile[];
  updatedAt: number;
}

/** A staged file: new bytes, or a file already uploaded in this conversation that will be reused. */
export interface DraftFile {
  id: string;
  name: string;
  size: number;
  type: string;
  blob?: Blob;
  existingFileId?: string;
  extension?: string;
}

interface CacheState {
  teams: Team[];
  channels: Channel[];
  members: TeamMember[];
  directMessages: DirectMessage[];
  messages: ChatMessage[];
  dmMessages: Record<string, ChatMessage[]>;
  meetings: Meeting[];
  files: WorkspaceFile[];
  notifications: ChatNotification[];
  callRecords: CallRecord[];
  messageCursors: Record<string, string>;
  messageHasMore: Record<string, boolean>;
  readPositions: Record<string, string>;
  activeTeamId: string | null;
  activeChannelId: string | null;
}

interface StoreLike {
  getState(): CacheState;
  setState(patch: Partial<CacheState>): void;
  subscribe(listener: (state: CacheState) => void): () => void;
}

export interface CachedSearchHit {
  message: ChatMessage;
  kind: "channel" | "dm";
  conversationId: string;
}

export interface CacheStats {
  channelMessages: number;
  dmMessages: number;
  conversations: number;
  outbox: number;
  bytes: number | null;
}

const DATA_VERSION = 2;
const KEEP_ON_WIPE = new Set(["outbox", "drafts", "trash"]);
const DB_PREFIX = "airsend-workspace:";
const MESSAGES_PER_SCOPE = 200;
const FLUSH_DELAY_MS = 400;
const DEFAULT_TTL_MS = 60_000;

class WorkspaceCacheDB extends Dexie {
  teams!: Table<Row<Team>, string>;
  channels!: Table<Row<Channel>, string>;
  members!: Table<Row<TeamMember>, string>;
  dms!: Table<Row<DirectMessage>, string>;
  messages!: Table<Row<ChatMessage>, string>;
  dmMessages!: Table<Row<ChatMessage>, string>;
  meetings!: Table<Row<Meeting>, string>;
  files!: Table<Row<WorkspaceFile>, string>;
  notifications!: Table<Row<ChatNotification>, string>;
  calls!: Table<Row<CallRecord>, string>;
  outbox!: Table<OutboxEntry, string>;
  drafts!: Table<DraftEntry, string>;
  trash!: Table<TrashEntry, string>;
  meta!: Table<MetaRow, string>;

  constructor(name: string) {
    super(name);
    this.version(1).stores({
      teams: "id",
      channels: "id, scope",
      members: "id, scope",
      dms: "id",
      messages: "id, scope",
      dmMessages: "id, scope",
      meta: "key",
    });
    this.version(2).stores({
      meetings: "id",
      files: "id",
      notifications: "id",
      calls: "id",
      outbox: "id, createdAt",
    });
    this.version(3).stores({ drafts: "id" });
    this.version(4).stores({ trash: "id" });
  }
}

interface Entry<T> {
  item: T;
  scope: string;
}

interface Syncer<T> {
  known: Map<string, T>;
  flush(entries: Entry<T>[]): Promise<string[]>;
}

function createSyncer<T>(
  table: Table<Row<T>, string>,
  idOf: (item: T, scope: string) => string | null,
  prune: boolean,
): Syncer<T> {
  const known = new Map<string, T>();
  return {
    known,
    async flush(entries) {
      const puts: Row<T>[] = [];
      const seen = new Set<string>();
      const touchedScopes = new Set<string>();
      for (const { item, scope } of entries) {
        const id = idOf(item, scope);
        if (!id) continue;
        seen.add(id);
        if (known.get(id) !== item) {
          known.set(id, item);
          puts.push({ id, scope, v: item });
          touchedScopes.add(scope);
        }
      }
      const removed: string[] = [];
      if (prune) {
        for (const id of known.keys()) {
          if (!seen.has(id)) removed.push(id);
        }
        for (const id of removed) known.delete(id);
      }
      if (puts.length) await table.bulkPut(puts);
      if (removed.length) await table.bulkDelete(removed);
      return [...touchedScopes];
    },
  };
}

interface Context {
  email: string;
  db: WorkspaceCacheDB;
  store: StoreLike;
  ready: Promise<void>;
  teams: Syncer<Team>;
  channels: Syncer<Channel>;
  members: Syncer<TeamMember>;
  dms: Syncer<DirectMessage>;
  messages: Syncer<ChatMessage>;
  dmMessages: Syncer<ChatMessage>;
  meetings: Syncer<Meeting>;
  files: Syncer<WorkspaceFile>;
  notifications: Syncer<ChatNotification>;
  calls: Syncer<CallRecord>;
  stop: () => void;
}

let ctx: Context | null = null;

const isTemp = (id: string) => id.startsWith("temp-");
const byCreatedAt = (a: ChatMessage, b: ChatMessage) => String(a.createdAt).localeCompare(String(b.createdAt));
const plain = <T extends { id: string }>(item: T) => item.id;

async function pruneScope(table: Table<Row<ChatMessage>, string>, scope: string) {
  const count = await table.where("scope").equals(scope).count();
  if (count <= MESSAGES_PER_SCOPE) return;
  const rows = await table.where("scope").equals(scope).toArray();
  rows.sort((a, b) => byCreatedAt(a.v, b.v));
  await table.bulkDelete(rows.slice(0, count - MESSAGES_PER_SCOPE).map((r) => r.id));
}

function grouped<T extends { teamId: string }>(items: T[]): Entry<T>[] {
  return items.map((item) => ({ item, scope: item.teamId }));
}

function unscoped<T>(items: T[]): Entry<T>[] {
  return items.map((item) => ({ item, scope: "" }));
}

function flattenDMMessages(byDm: Record<string, ChatMessage[]>): Entry<ChatMessage>[] {
  const out: Entry<ChatMessage>[] = [];
  for (const [dmId, list] of Object.entries(byDm)) {
    for (const item of list) out.push({ item, scope: dmId });
  }
  return out;
}

async function wipeIfStale(db: WorkspaceCacheDB) {
  const stored = await db.meta.get("dataVersion");
  if (stored && stored.value === DATA_VERSION) return;
  if (stored) {
    await Promise.all(
      // Unsent work (outbox, drafts) and undo copies (trash) survive a cache format change.
      db.tables.filter((t) => !KEEP_ON_WIPE.has(t.name)).map((t) => t.clear()),
    );
  }
  await db.meta.put({ key: "dataVersion", value: DATA_VERSION });
}

async function hydrate(c: Context): Promise<void> {
  await wipeIfStale(c.db);

  const [teams, channels, members, dms, meetings, files, notifications, calls, ui, cursors, reads] = await Promise.all([
    c.db.teams.toArray(),
    c.db.channels.toArray(),
    c.db.members.toArray(),
    c.db.dms.toArray(),
    c.db.meetings.toArray(),
    c.db.files.toArray(),
    c.db.notifications.toArray(),
    c.db.calls.toArray(),
    c.db.meta.get("ui"),
    c.db.meta.get("cursors"),
    c.db.meta.get("reads"),
  ]);

  const s = c.store.getState();
  const patch: Partial<CacheState> = {};
  if (!s.teams.length && teams.length) patch.teams = teams.map((r) => r.v);
  if (!s.channels.length && channels.length) patch.channels = channels.map((r) => r.v);
  if (!s.members.length && members.length) patch.members = members.map((r) => r.v);
  if (!s.directMessages.length && dms.length) patch.directMessages = dms.map((r) => r.v);
  if (!s.meetings.length && meetings.length) patch.meetings = meetings.map((r) => r.v);
  if (!s.files.length && files.length) patch.files = files.map((r) => r.v);
  if (!s.notifications.length && notifications.length) {
    patch.notifications = notifications.map((r) => r.v).sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
  }
  if (!s.callRecords.length && calls.length) patch.callRecords = calls.map((r) => r.v);

  const cachedUi = ui?.value as { activeTeamId?: string | null; activeChannelId?: string | null } | undefined;
  const nextTeams = patch.teams ?? s.teams;
  const nextChannels = patch.channels ?? s.channels;
  if (!s.activeTeamId && cachedUi?.activeTeamId && nextTeams.some((t) => t.id === cachedUi.activeTeamId)) {
    patch.activeTeamId = cachedUi.activeTeamId;
  }
  if (!s.activeChannelId && cachedUi?.activeChannelId && nextChannels.some((ch) => ch.id === cachedUi.activeChannelId)) {
    patch.activeChannelId = cachedUi.activeChannelId;
  }

  const cachedCursors = cursors?.value as { cursors?: Record<string, string>; hasMore?: Record<string, boolean> } | undefined;
  if (cachedCursors) {
    patch.messageCursors = { ...(cachedCursors.cursors ?? {}), ...s.messageCursors };
    patch.messageHasMore = { ...(cachedCursors.hasMore ?? {}), ...s.messageHasMore };
  }

  const cachedReads = reads?.value as Record<string, string> | undefined;
  if (cachedReads) patch.readPositions = { ...cachedReads, ...s.readPositions };

  if (Object.keys(patch).length) c.store.setState(patch);
}

function attach(c: Context): () => void {
  const { store } = c;
  const baseline = store.getState();
  const prev = { ...baseline } as CacheState;

  for (const t of baseline.teams) c.teams.known.set(t.id, t);
  for (const ch of baseline.channels) c.channels.known.set(ch.id, ch);
  for (const m of baseline.members) c.members.known.set(`${m.teamId}:${m.id}`, m);
  for (const d of baseline.directMessages) c.dms.known.set(d.id, d);
  for (const m of baseline.meetings) c.meetings.known.set(m.id, m);
  for (const f of baseline.files) c.files.known.set(f.id, f);
  for (const n of baseline.notifications) c.notifications.known.set(n.id, n);
  for (const r of baseline.callRecords) c.calls.known.set(r.id, r);
  for (const m of baseline.messages) if (!isTemp(m.id)) c.messages.known.set(m.id, m);
  for (const list of Object.values(baseline.dmMessages)) {
    for (const m of list) if (!isTemp(m.id)) c.dmMessages.known.set(m.id, m);
  }

  let timer: ReturnType<typeof setTimeout> | undefined;
  let chain: Promise<void> = Promise.resolve();
  let stopped = false;

  const run = async () => {
    if (stopped) return;
    const s = store.getState();
    const jobs: Promise<unknown>[] = [];

    if (s.teams !== prev.teams) {
      prev.teams = s.teams;
      jobs.push(c.teams.flush(unscoped(s.teams)));
    }
    if (s.channels !== prev.channels) {
      prev.channels = s.channels;
      jobs.push(c.channels.flush(grouped(s.channels)));
    }
    if (s.members !== prev.members) {
      prev.members = s.members;
      jobs.push(c.members.flush(grouped(s.members)));
    }
    if (s.directMessages !== prev.directMessages) {
      prev.directMessages = s.directMessages;
      jobs.push(c.dms.flush(unscoped(s.directMessages)));
    }
    if (s.meetings !== prev.meetings) {
      prev.meetings = s.meetings;
      jobs.push(c.meetings.flush(unscoped(s.meetings)));
    }
    if (s.files !== prev.files) {
      prev.files = s.files;
      jobs.push(c.files.flush(unscoped(s.files)));
    }
    if (s.notifications !== prev.notifications) {
      prev.notifications = s.notifications;
      jobs.push(c.notifications.flush(unscoped(s.notifications)));
    }
    if (s.callRecords !== prev.callRecords) {
      prev.callRecords = s.callRecords;
      jobs.push(c.calls.flush(unscoped(s.callRecords)));
    }
    if (s.messages !== prev.messages) {
      prev.messages = s.messages;
      jobs.push(
        c.messages
          .flush(s.messages.map((item) => ({ item, scope: item.channelId })))
          .then((scopes) => Promise.all(scopes.map((scope) => pruneScope(c.db.messages, scope)))),
      );
    }
    if (s.dmMessages !== prev.dmMessages) {
      prev.dmMessages = s.dmMessages;
      jobs.push(
        c.dmMessages
          .flush(flattenDMMessages(s.dmMessages))
          .then((scopes) => Promise.all(scopes.map((scope) => pruneScope(c.db.dmMessages, scope)))),
      );
    }
    if (s.messageCursors !== prev.messageCursors || s.messageHasMore !== prev.messageHasMore) {
      prev.messageCursors = s.messageCursors;
      prev.messageHasMore = s.messageHasMore;
      jobs.push(c.db.meta.put({ key: "cursors", value: { cursors: s.messageCursors, hasMore: s.messageHasMore } }));
    }
    if (s.readPositions !== prev.readPositions) {
      prev.readPositions = s.readPositions;
      jobs.push(c.db.meta.put({ key: "reads", value: s.readPositions }));
    }
    if (s.activeTeamId !== prev.activeTeamId || s.activeChannelId !== prev.activeChannelId) {
      prev.activeTeamId = s.activeTeamId;
      prev.activeChannelId = s.activeChannelId;
      jobs.push(c.db.meta.put({ key: "ui", value: { activeTeamId: s.activeTeamId, activeChannelId: s.activeChannelId } }));
    }

    await Promise.allSettled(jobs);
  };

  const unsubscribe = store.subscribe(() => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      chain = chain.then(run).catch(() => undefined);
    }, FLUSH_DELAY_MS);
  });

  return () => {
    stopped = true;
    clearTimeout(timer);
    unsubscribe();
  };
}

function nameFor(email: string) {
  return `${DB_PREFIX}${email.trim().toLowerCase()}`;
}

function injectMessages(syncer: Syncer<ChatMessage>, messages: ChatMessage[]) {
  for (const m of messages) syncer.known.set(m.id, m);
}

export function initWorkspaceCache(email: string, store: StoreLike): Promise<void> {
  if (typeof window === "undefined" || typeof indexedDB === "undefined" || !email) return Promise.resolve();
  if (ctx && ctx.email === email.trim().toLowerCase()) return ctx.ready;

  ctx?.stop();
  ctx = null;

  try {
    const db = new WorkspaceCacheDB(nameFor(email));
    const c: Context = {
      email: email.trim().toLowerCase(),
      db,
      store,
      ready: Promise.resolve(),
      teams: createSyncer<Team>(db.teams, plain, true),
      channels: createSyncer<Channel>(db.channels, plain, true),
      members: createSyncer<TeamMember>(db.members, (m) => `${m.teamId}:${m.id}`, true),
      dms: createSyncer<DirectMessage>(db.dms, plain, true),
      messages: createSyncer<ChatMessage>(db.messages, (m) => (isTemp(m.id) ? null : m.id), false),
      dmMessages: createSyncer<ChatMessage>(db.dmMessages, (m) => (isTemp(m.id) ? null : m.id), false),
      meetings: createSyncer<Meeting>(db.meetings, plain, true),
      files: createSyncer<WorkspaceFile>(db.files, plain, true),
      notifications: createSyncer<ChatNotification>(db.notifications, plain, true),
      calls: createSyncer<CallRecord>(db.calls, plain, true),
      stop: () => undefined,
    };
    ctx = c;
    c.ready = hydrate(c)
      .catch(() => undefined)
      .then(() => {
        if (ctx !== c) return;
        c.stop = attach(c);
      });
    return c.ready;
  } catch {
    ctx = null;
    return Promise.resolve();
  }
}

export async function loadCachedChannelMessages(channelId: string): Promise<ChatMessage[]> {
  const c = ctx;
  if (!c) return [];
  try {
    await c.ready;
    const rows = await c.db.messages.where("scope").equals(channelId).toArray();
    const list = rows.map((r) => r.v).sort(byCreatedAt);
    injectMessages(c.messages, list);
    return list;
  } catch {
    return [];
  }
}

export async function loadCachedDMMessages(dmId: string): Promise<ChatMessage[]> {
  const c = ctx;
  if (!c) return [];
  try {
    await c.ready;
    const rows = await c.db.dmMessages.where("scope").equals(dmId).toArray();
    const list = rows.map((r) => r.v).sort(byCreatedAt);
    injectMessages(c.dmMessages, list);
    return list;
  } catch {
    return [];
  }
}

export function newestChange(messages: ChatMessage[]): string | null {
  let max = 0;
  for (const m of messages) {
    if (isTemp(m.id)) continue;
    const t = Date.parse(m.updatedAt ?? m.createdAt);
    if (Number.isFinite(t) && t > max) max = t;
  }
  return max ? new Date(max - 1).toISOString() : null;
}

export function upsertById(existing: ChatMessage[], incoming: ChatMessage[]): ChatMessage[] {
  if (!incoming.length) return existing;
  const byId = new Map(incoming.map((m) => [m.id, m]));
  const merged = existing.map((m) => {
    const next = byId.get(m.id);
    if (!next) return m;
    byId.delete(m.id);
    return next;
  });
  for (const m of byId.values()) merged.push(m);
  return merged.sort(byCreatedAt);
}

export async function searchCachedMessages(query: string, limit = 50): Promise<CachedSearchHit[]> {
  const c = ctx;
  const q = query.trim().toLowerCase();
  if (!c || !q) return [];
  try {
    await c.ready;
    const [channelRows, dmRows] = await Promise.all([
      c.db.messages.filter((r) => !r.v.isDeleted && r.v.content.toLowerCase().includes(q)).toArray(),
      c.db.dmMessages.filter((r) => !r.v.isDeleted && r.v.content.toLowerCase().includes(q)).toArray(),
    ]);
    const hits: CachedSearchHit[] = [
      ...channelRows.map((r) => ({ message: r.v, kind: "channel" as const, conversationId: r.scope })),
      ...dmRows.map((r) => ({ message: r.v, kind: "dm" as const, conversationId: r.scope })),
    ];
    hits.sort((a, b) => byCreatedAt(b.message, a.message));
    return hits.slice(0, limit);
  } catch {
    return [];
  }
}

export async function enqueueOutbox(entry: OutboxEntry): Promise<void> {
  const c = ctx;
  if (!c) return;
  try {
    await c.db.outbox.put(entry);
  } catch {
    return;
  }
}

export async function removeOutbox(id: string): Promise<void> {
  const c = ctx;
  if (!c) return;
  try {
    await c.db.outbox.delete(id);
  } catch {
    return;
  }
}

export async function loadOutbox(): Promise<OutboxEntry[]> {
  const c = ctx;
  if (!c) return [];
  try {
    await c.ready;
    return await c.db.outbox.orderBy("createdAt").toArray();
  } catch {
    return [];
  }
}

/** One outbox row, or null when it is gone (sent or discarded meanwhile). */
export async function getOutboxRow(id: string): Promise<OutboxEntry | null> {
  const c = ctx;
  if (!c) return null;
  try {
    await c.ready;
    return (await c.db.outbox.get(id)) ?? null;
  } catch {
    return null;
  }
}

export async function loadDrafts(): Promise<DraftEntry[]> {
  const c = ctx;
  if (!c) return [];
  try {
    await c.ready;
    return await c.db.drafts.toArray();
  } catch {
    return [];
  }
}

/** Saves a draft, or removes it when it has no text and no files. */
export async function saveDraft(entry: DraftEntry): Promise<void> {
  const c = ctx;
  if (!c) return;
  try {
    if (!entry.text.trim() && !entry.files.length) await c.db.drafts.delete(entry.id);
    else await c.db.drafts.put(entry);
  } catch {
    return;
  }
}

export async function loadTrash(): Promise<TrashEntry[]> {
  const c = ctx;
  if (!c) return [];
  try {
    await c.ready;
    return await c.db.trash.toArray();
  } catch {
    return [];
  }
}

/** Keeps an undo copy, or drops it when `entry` is just an id. */
export async function saveTrash(entry: TrashEntry | string): Promise<void> {
  const c = ctx;
  if (!c) return;
  try {
    if (typeof entry === "string") await c.db.trash.delete(entry);
    else await c.db.trash.put(entry);
  } catch {
    return;
  }
}

export async function getCacheStats(): Promise<CacheStats | null> {
  const c = ctx;
  if (!c) return null;
  try {
    await c.ready;
    const [channelMessages, dmMessages, channels, dms, outbox] = await Promise.all([
      c.db.messages.count(),
      c.db.dmMessages.count(),
      c.db.channels.count(),
      c.db.dms.count(),
      c.db.outbox.count(),
    ]);
    let bytes: number | null = null;
    try {
      bytes = (await navigator.storage?.estimate?.())?.usage ?? null;
    } catch {
      bytes = null;
    }
    return { channelMessages, dmMessages, conversations: channels + dms, outbox, bytes };
  } catch {
    return null;
  }
}

export async function clearWorkspaceCache(): Promise<void> {
  const c = ctx;
  ctx = null;
  c?.stop();
  try {
    c?.db.close();
    const names = await Dexie.getDatabaseNames();
    await Promise.all(names.filter((n) => n.startsWith(DB_PREFIX)).map((n) => Dexie.delete(n)));
  } catch {
    return;
  }
}

const freshAt = new Map<string, number>();
const inflight = new Map<string, Promise<void>>();

/** Coming back to a screen within this long reuses what is on screen instead of calling the API again. */
export const ROUTE_TTL_MS = 30_000;
/** How often an open screen refreshes on its own (live changes arrive over the WebSocket meanwhile). */
export const AUTO_REFRESH_MS = 60_000;

/**
 * Runs `run` unless `key` was refreshed less than `ttlMs` ago (or is already running). `force` (a Refresh button)
 * always runs it.
 */
export function revalidate(
  key: string,
  run: () => Promise<unknown>,
  ttlMs = DEFAULT_TTL_MS,
  force = false,
): Promise<void> {
  const last = freshAt.get(key);
  if (!force && last !== undefined && Date.now() - last < ttlMs) return Promise.resolve();
  const running = inflight.get(key);
  if (running) return running;
  const p = Promise.resolve()
    .then(run)
    .then(() => {
      freshAt.set(key, Date.now());
    })
    .catch(() => undefined)
    .finally(() => {
      inflight.delete(key);
    });
  inflight.set(key, p);
  return p;
}

export function resetRevalidation(): void {
  freshAt.clear();
  inflight.clear();
}
