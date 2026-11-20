import Dexie, { type Table } from "dexie";
import { dehydrate, hydrate, type DehydratedState, type Query, type QueryClient } from "@tanstack/react-query";
import { forgetRestored, markRestored } from "./query-restore-state";

interface Snapshot {
  key: string;
  savedAt: number;
  state: DehydratedState;
}

class TasksCacheDB extends Dexie {
  snapshots!: Table<Snapshot, string>;

  constructor() {
    super("airsend-workspace:tasks-cache");
    this.version(1).stores({ snapshots: "key" });
  }
}

const PERSISTED_ROOTS = new Set([
  "tasks",
  "task",
  "task-relations",
  "projects",
  "project",
  "labels",
  "columns",
  "workspaces",
  "workspace",
  "workspace-users",
  "active-workspace-users",
  "workspace-user",
  "assigned-tasks",
  "activities",
  "notifications",
]);

const MAX_AGE_MS = 24 * 60 * 60 * 1000;
const SAVE_DELAY_MS = 1500;
const MAX_ROWS_PER_QUERY = 5000;

let db: TasksCacheDB | null = null;

function getDb(): TasksCacheDB | null {
  if (typeof indexedDB === "undefined") return null;
  db ??= new TasksCacheDB();
  return db;
}

function shouldPersist(query: Query): boolean {
  if (query.state.status !== "success") return false;
  if (!PERSISTED_ROOTS.has(String(query.queryKey[0]))) return false;
  const data = query.state.data;
  return !(Array.isArray(data) && data.length > MAX_ROWS_PER_QUERY);
}

export async function restoreQueryCache(client: QueryClient, userKey: string): Promise<void> {
  try {
    const store = getDb();
    if (!store) return;
    const snapshot = await store.snapshots.get(userKey);
    if (!snapshot || Date.now() - snapshot.savedAt > MAX_AGE_MS) return;
    const cache = client.getQueryCache();
    for (const q of snapshot.state.queries) {
      if (cache.get(q.queryHash)?.state.data === undefined) markRestored(q.queryHash);
    }
    hydrate(client, snapshot.state);
  } catch {
    return;
  }
}

export function startQueryPersistence(client: QueryClient, userKey: string): () => void {
  const store = getDb();
  if (!store) return () => undefined;
  let timer: ReturnType<typeof setTimeout> | undefined;

  const save = () => {
    try {
      const state = dehydrate(client, { shouldDehydrateQuery: shouldPersist });
      void store.snapshots.put({ key: userKey, savedAt: Date.now(), state }).catch(() => undefined);
    } catch {
      return;
    }
  };

  const unsubscribe = client.getQueryCache().subscribe((event) => {
    if (event.type === "updated" && event.action.type === "success") {
      forgetRestored(event.query.queryHash);
    }
    if (event.type === "updated" || event.type === "removed") {
      clearTimeout(timer);
      timer = setTimeout(save, SAVE_DELAY_MS);
    }
  });

  return () => {
    clearTimeout(timer);
    unsubscribe();
  };
}
