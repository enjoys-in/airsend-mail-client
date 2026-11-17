/**
 * When a mailbox's list must come from the API, and how API results are written into IndexedDB.
 *
 * A folder list is fetched from the API only when its cached copy cannot be trusted:
 *   - it was never fetched (no record),
 *   - something marked it stale (an event the cache can't apply, e.g. mail arriving while offline),
 *   - or it is older than LIST_MAX_AGE_MS (a safety net for events missed while no tab was open).
 * New mail, read/unread, moves and deletes are applied to IndexedDB directly and don't trigger a fetch.
 * Folder counts come with the list response and with each action's response, so the sidebar never
 * asks for them separately.
 */
import { airsendDB, db } from "@/db";

const LIST_MAX_AGE_MS = 30 * 60 * 1000;

type ListSync = { synced_at: number; stale: boolean };
type FolderCounts = { total_count: number; unread_count: number; read_count?: number };

/** Result of PATCH /update-mail-event: every message touched (whole threads for moves/deletes) and folder counts. */
export interface MailEventResult {
    message_ids: string[];
    counts: Record<string, FolderCounts>;
}

const prefixOf = (email: string) => `list_sync::${email.toLowerCase()}::`;
const keyOf = (email: string, folder: string) => `${prefixOf(email)}${folder.toLowerCase()}`;

function parse(value: string | undefined): ListSync | null {
    if (!value) return null;
    try {
        return JSON.parse(value) as ListSync;
    } catch {
        return null;
    }
}

/** True when the folder's list has to be fetched from the API. */
export async function needsListFetch(email: string, folder: string): Promise<boolean> {
    try {
        const state = parse((await db.sync_meta.get(keyOf(email, folder)))?.value);
        if (!state) return true;
        return state.stale || Date.now() - state.synced_at > LIST_MAX_AGE_MS;
    } catch {
        return true;
    }
}

/** Records that the folder's list was just fetched. */
export async function markListSynced(email: string, folder: string): Promise<void> {
    const state: ListSync = { synced_at: Date.now(), stale: false };
    await db.sync_meta.put({ key: keyOf(email, folder), value: JSON.stringify(state) }).catch(() => { });
}

/**
 * Marks folder lists stale so the next open fetches them once. Without folders: every folder of the account.
 * A folder with no record needs no mark: it is fetched on open anyway.
 */
export async function markListStale(email: string | undefined | null, folders?: string[]): Promise<void> {
    if (!email) return;
    const markStale = (row: { value: string }) => {
        const state = parse(row.value);
        if (state) row.value = JSON.stringify({ ...state, stale: true });
    };
    try {
        if (!folders) {
            await db.sync_meta.where("key").startsWith(prefixOf(email)).modify(markStale);
            return;
        }
        const keys = [...new Set(folders.filter(Boolean).map((f) => keyOf(email, f)))];
        if (keys.length > 0) await db.sync_meta.where("key").anyOf(keys).modify(markStale);
    } catch { }
}

/** Same, for the account on screen (used where only the event is known, not the account). */
export const markCurrentListStale = (folders?: string[]) => markListStale(airsendDB.getMailAccount(), folders);

/** Writes server folder counts into the cached mailboxes; the sidebar reads them live. */
export async function applyFolderCounts(counts: Record<string, FolderCounts> | undefined | null): Promise<void> {
    if (!counts) return;
    for (const [path, c] of Object.entries(counts)) {
        const total = Number(c?.total_count) || 0;
        const unread = Number(c?.unread_count) || 0;
        await db.mailboxes
            .where("path")
            .equalsIgnoreCase(path)
            .modify({ total_count: total, unread_count: unread, read_count: Math.max(0, total - unread) } as any)
            .catch(() => { });
    }
}

/**
 * Applies a mail action's API result to IndexedDB and returns the message ids it touched.
 * `removesMail`: the action took the mails out of the folder on screen (delete, move, archive, spam), so
 * every message of the thread leaves the cache, and the folders they went to are marked stale (their
 * cached lists don't have them yet).
 */
export async function applyMailActionResult(opts: {
    result: MailEventResult | null | undefined;
    fallbackIds: string[];
    currentFolder: string;
    removesMail: boolean;
}): Promise<string[]> {
    const { result, fallbackIds, currentFolder, removesMail } = opts;
    const ids = result?.message_ids?.length ? result.message_ids : fallbackIds;
    if (removesMail && ids.length > 0) {
        await airsendDB.bulkDeleteItems("mails", ids);
        const current = currentFolder.toLowerCase();
        const destinations = Object.keys(result?.counts ?? {}).filter((f) => f.toLowerCase() !== current);
        await markCurrentListStale(destinations);
    }
    await applyFolderCounts(result?.counts);
    return ids;
}
