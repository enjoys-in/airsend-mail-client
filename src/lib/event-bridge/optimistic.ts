/**
 * Event Bridge - Optimistic Update Queue
 * Tracks local optimistic writes so they can be rolled back if the server rejects.
 */

import { airsendDB } from '@/db';
import type { OptimisticEntry } from './types';

class OptimisticQueue {
  private pending = new Map<string, OptimisticEntry>();

  /**
   * Record an optimistic write before making the API call.
   * Stores the previous value for rollback.
   */
  async track(params: {
    id: string;
    table: 'mails' | 'mailboxes' | 'settings';
    key: string;
    action: OptimisticEntry['action'];
  }): Promise<void> {
    const { id, table, key, action } = params;

    // Snapshot current value before the optimistic write
    const previousValue = await airsendDB.getItemByKey(table, key);

    this.pending.set(id, {
      id,
      table,
      key,
      action,
      previousValue: previousValue ?? null,
      timestamp: Date.now(),
    });
  }

  /**
   * Confirm that the server accepted the change.
   * Removes the entry from the rollback queue.
   */
  confirm(id: string): void {
    this.pending.delete(id);
  }

  /**
   * Roll back an optimistic write — restores previous value.
   */
  async rollback(id: string): Promise<boolean> {
    const entry = this.pending.get(id);
    if (!entry) return false;

    const { table, key, action, previousValue } = entry;

    try {
      if (action === 'delete' && previousValue) {
        // Was deleted optimistically — restore it
        await airsendDB.putItem(table as any, previousValue as any);
      } else if (action === 'put' && !previousValue) {
        // Was added optimistically — remove it
        await airsendDB.deleteItem(table as any, key);
      } else if (action === 'update' && previousValue) {
        // Was updated optimistically — restore previous
        await airsendDB.putItem(table as any, previousValue as any);
      }
    } finally {
      this.pending.delete(id);
    }

    return true;
  }

  /**
   * Check if an event is already handled optimistically.
   * If the incoming event matches a pending optimistic write,
   * we confirm it (skip re-processing).
   */
  hasOptimistic(messageId: string): boolean {
    return this.pending.has(messageId);
  }

  /**
   * Roll back all pending optimistic writes (e.g., on disconnect).
   */
  async rollbackAll(): Promise<void> {
    const entries = Array.from(this.pending.keys());
    for (const id of entries) {
      await this.rollback(id);
    }
  }

  /**
   * Clean up stale entries (older than 30 seconds).
   */
  prune(maxAgeMs: number = 30_000): void {
    const now = Date.now();
    for (const [id, entry] of this.pending) {
      if (now - entry.timestamp > maxAgeMs) {
        this.pending.delete(id);
      }
    }
  }

  get size(): number {
    return this.pending.size;
  }
}

export const optimisticQueue = new OptimisticQueue();
