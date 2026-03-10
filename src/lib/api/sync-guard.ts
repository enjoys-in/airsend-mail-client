/**
 * Sync Guard — prevents dexie-observable from re-pushing backend data.
 *
 * When syncing settings FROM the backend TO IDB, we set this flag to true.
 * IdbSyncHookApi checks this flag and skips the API push if it's set.
 *
 * This prevents the loop: backend → IDB → dexie-observable → backend
 */

let _isSyncingFromBackend = false;

export function isSyncingFromBackend(): boolean {
    return _isSyncingFromBackend;
}

export function setSyncingFromBackend(value: boolean): void {
    _isSyncingFromBackend = value;
}

/**
 * Execute a function while suppressing dexie-observable → API sync.
 * Use this when writing backend data to IDB.
 */
export async function withSyncGuard<T>(fn: () => Promise<T>): Promise<T> {
    _isSyncingFromBackend = true;
    try {
        return await fn();
    } finally {
        // Small delay to ensure dexie-observable processes the change before we re-enable
        setTimeout(() => {
            _isSyncingFromBackend = false;
        }, 100);
    }
}
