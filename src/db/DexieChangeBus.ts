// hooks/DexieHookBus.ts
import Dexie, { Table, Transaction, TableHooks } from "dexie";
import { EntityTable } from "dexie";
import { Subject,  Subscription } from "rxjs";


type HookCallbacks<T, TKey, E extends DexieEvent> =
    E extends 'creating' ? (payload: { this: any; obj: T; transaction: Transaction }) => void :
    E extends 'updating' ? (payload: { this: any; modifications: Partial<T>; obj: T; transaction: Transaction }) => void :
    E extends 'deleting' ? (payload: { this: any; obj: T; transaction: Transaction }) => void :
    E extends 'reading' ? (payload: { obj: T }) => void :
    never;
export interface CreatingHookContext<T, TKey> {
    onerror: (error: any) => void;
    onsuccess: (primKey: TKey) => void;
}

export interface UpdatingHookContext<T, TKey> {
    onerror: (error: any) => void;
    onsuccess: (modifications: Partial<T>) => void;
}

export interface DeletingHookContext<T, TKey> {
    onerror: (error: any) => void;
    onsuccess: () => void;
}

// Event types Dexie supports
export type DexieEvent = "creating" | "updating" | "deleting" | "reading";
type ExtractModel<T> = T extends EntityTable<infer Model, any> ? Model : never;
type ExtractKey<T> = T extends EntityTable<any, infer Key> ? Key : never;


type HookPayloads<T, TKey> = {
    creating: {
        this: CreatingHookContext<T, TKey>;
        obj: T;
        transaction: Transaction;
    };
    updating: {
        this: UpdatingHookContext<T, TKey>;
        modifications: Partial<T>;
        obj: T;
        transaction: Transaction;
    };
    deleting: {
        this: DeletingHookContext<T, TKey>;
        obj: T;
        transaction: Transaction;
    };
    reading: {
        obj: T;
    };
};
;

type HookCallback<T, TKey, E extends DexieEvent> = (payload: HookPayloads<T, TKey>[E]) => void;




export class DexieHookBus<Tables extends Record<string, EntityTable<any, any>>> {
    private subjects = new Map<string, Subject<any>>();
    private subscriptions = new Map<string, Set<Subscription>>();

    constructor(private db: Dexie, private tableNames: (keyof Tables)[]) {
        this.setupHooks();
    }

    private setupHooks() {
        for (const tableName of this.tableNames) {
            const table = (this.db as Dexie & Tables).table(tableName as string);
            
            ([ "updating", "deleting", "reading"] as DexieEvent[]).forEach(event => {
                const key = this.getKey(tableName as string, event);
                if (!this.subjects.has(key)) {
                    this.subjects.set(key, new Subject<any>());
                }

                table.hook(event as any, ((...args: any[]) => {
                    const payload = this.buildPayload(event, ...args);
                    this.subjects.get(key)?.next(payload);
                }));
            });
        }
    }

    private getKey(table: string, event: DexieEvent) {
        return `${table}:${event}`;
    }

    private buildPayload(event: DexieEvent, ...args: any[]) {
        switch (event) {
            case "creating":
                return { this: args[0], obj: args[2], transaction: args[3] };
            case "updating":
                return { this: args[0], modifications: args[1], obj: args[3], transaction: args[4] };
            case "deleting":
                return { this: args[0], obj: args[2], transaction: args[3] };
            case "reading":
                return { obj: args[0] };
        }
    }

    public subscribe<
        K extends keyof Tables,
        E extends DexieEvent
    >(
        tableName: K,
        event: E,
        cb: HookCallback<ExtractModel<Tables[K]>, ExtractKey<Tables[K]>, E>
    ): Subscription {
        const key = this.getKey(tableName as string, event);
        const subj = this.subjects.get(key);
        if (!subj) throw new Error(`No hook for ${key}`);
        const subscription = subj.asObservable().subscribe(cb as any);

        if (!this.subscriptions.has(key)) {
            this.subscriptions.set(key, new Set());
        }
        this.subscriptions.get(key)!.add(subscription);

        return subscription;
    }

    public unsubscribe<
        K extends keyof Tables,
        E extends DexieEvent
    >(
        tableName: K,
        event: E,
        subscription: Subscription
    ): void {
        const key = this.getKey(tableName as string, event);
        if (this.subscriptions.has(key)) {
            this.subscriptions.get(key)!.delete(subscription);
        }
        subscription.unsubscribe();
    }

    public unsubscribeAll() {
        for (const set of this.subscriptions.values()) {
            for (const sub of set) {
                sub.unsubscribe();
            }
        }
        this.subscriptions.clear();
    }
}
