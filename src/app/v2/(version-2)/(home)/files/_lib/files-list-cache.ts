import Dexie, { type Table } from "dexie";
import type { File } from "@/app/v2/(version-2)/(home)/files/_packages/shared";

// Last known contents of each folder, in IndexedDB, so a folder opens instantly (stale) while the fresh list loads.
// Best effort: any IndexedDB failure (private mode, blocked storage) just means no cache.

/** How often an open folder is fetched again on its own (re-opening one within 30 s reuses it: staleTime). */
export const FILES_REFRESH_MS = 60_000;

const MAX_LISTS = 100;

interface CachedList {
	key: string;
	files: File[];
	at: number;
}

class FilesListDB extends Dexie {
	lists!: Table<CachedList, string>;
	constructor() {
		super("airsend-files-lists");
		this.version(1).stores({ lists: "key, at" });
	}
}

let db: FilesListDB | null = null;
const open = () => (db ??= new FilesListDB());

export async function readCachedList(key: string): Promise<CachedList | null> {
	try {
		return (await open().lists.get(key)) ?? null;
	} catch {
		return null;
	}
}

export async function writeCachedList(key: string, files: File[]): Promise<void> {
	try {
		const lists = open().lists;
		await lists.put({ key, files, at: Date.now() });
		const extra = (await lists.count()) - MAX_LISTS;
		if (extra > 0) await lists.orderBy("at").limit(extra).delete();
	} catch {
		return;
	}
}

/** Forget every cached folder (e.g. on sign-out). */
export async function clearCachedLists(): Promise<void> {
	try {
		await open().lists.clear();
	} catch {
		return;
	}
}
