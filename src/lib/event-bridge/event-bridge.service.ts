/**
 * EventBridgeService
 * Singleton that orchestrates socket ↔ Dexie sync.
 * Framework-agnostic — no React, no hooks, no re-renders.
 *
 * Responsibilities:
 * - Listen to socket sync protocol (CURSOR, REPLAY, real-time events)
 * - Deduplicate events
 * - Dispatch to event handlers (Dexie writes)
 * - Manage cursor persistence in Dexie
 * - Control sync state (gate, progress)
 * - Coordinate with optimistic queue
 */

import type { Socket } from 'socket.io-client';
import { decode } from '@msgpack/msgpack';
import { db } from '@/db';
import { BridgeEvent, SyncProtocol, SyncStatus, ALL_BRIDGE_EVENTS, SYNC_CURSOR_KEY, SYNC_TIMESTAMP_KEY } from './constants';
import { syncStore } from './sync-state';
import { eventHandlerMap } from './event-handlers';
import { optimisticQueue } from './optimistic';
import { EventDeduplicator } from './deduplicator';
import { eventBus } from '@/lib/event-bus';
import { CustomEventKey } from '@/hooks/use-custom-event';
import type {
  SyncEvent,
  SyncCursorPayload,
  SyncReplayPayload,
  BridgeSyncState,
  IEventBridgeService,
} from './types';

class EventBridgeService implements IEventBridgeService {
  private socket: Socket | null = null;
  private email: string | null = null;
  private dedup = new EventDeduplicator();
  private lastSeenId: string | null = null;
  private initialized = false;
  private listenersBound = false;

  // ─── Public API ───

  init(email: string): void {
    if (this.initialized && this.email === email) return;

    this.email = email;
    this.initialized = true;

    // Load cursor from Dexie (async, non-blocking)
    this.loadCursor().then((cursor) => {
      this.lastSeenId = cursor;
    });
  }

  /**
   * Attach to a socket instance. Call after socket connects.
   */
  attach(socket: Socket): void {
    if (this.socket === socket && this.listenersBound) return;

    // Detach previous if different
    if (this.socket && this.socket !== socket) {
      this.detachListeners();
    }

    this.socket = socket;
    this.attachListeners();
  }

  /**
   * Clean up — detach all listeners, reset state.
   */
  destroy(): void {
    this.detachListeners();
    this.socket = null;
    this.email = null;
    this.initialized = false;
    this.lastSeenId = null;
    this.dedup.clear();
    syncStore.getState().reset();
  }

  getState(): BridgeSyncState {
    const { setSyncing, setIdle, setError, setProgress, reset, ...state } = syncStore.getState();
    return state;
  }

  subscribe(listener: (state: BridgeSyncState) => void): () => void {
    return syncStore.subscribe((full) => {
      const { setSyncing, setIdle, setError, setProgress, reset, ...state } = full;
      listener(state);
    });
  }

  isActionAllowed(action: 'read' | 'send' | 'mutate'): boolean {
    if (action === 'read' || action === 'send') return true;
    return !syncStore.getState().isSyncGateActive;
  }

  /**
   * Called on reconnect — resume sync from last cursor.
   */
  resume(): void {
    if (!this.socket || !this.lastSeenId) return;
    syncStore.getState().setSyncing();
    this.socket.emit(SyncProtocol.SYNC_RESUME, { lastSeenId: this.lastSeenId });
  }

  // ─── Internal: Listeners ───

  private attachListeners(): void {
    if (!this.socket || this.listenersBound) return;

    this.socket.on(SyncProtocol.SYNC_CURSOR, this.handleSyncCursor);
    this.socket.on(SyncProtocol.SYNC_REPLAY, this.handleSyncReplay);

    // Bind all real-time event listeners
    for (const eventType of ALL_BRIDGE_EVENTS) {
      this.socket.on(eventType, (raw: Uint8Array | SyncEvent) => {
        const event = this.decodeEvent(raw);
        if (event) this.processEvent(event);
      });
    }

    // Socket lifecycle
    this.socket.on('reconnect', this.handleReconnect);

    this.listenersBound = true;
  }

  private detachListeners(): void {
    if (!this.socket) return;

    this.socket.off(SyncProtocol.SYNC_CURSOR, this.handleSyncCursor);
    this.socket.off(SyncProtocol.SYNC_REPLAY, this.handleSyncReplay);

    for (const eventType of ALL_BRIDGE_EVENTS) {
      this.socket.removeAllListeners(eventType);
    }

    this.socket.off('reconnect', this.handleReconnect);
    this.listenersBound = false;
  }

  // ─── Internal: Protocol Handlers ───

  private handleSyncCursor = (data: SyncCursorPayload): void => {
    this.lastSeenId = data.lastId;
    this.persistCursor(data.lastId);
  };

  private handleSyncReplay = async (data: SyncReplayPayload): Promise<void> => {
    const { events, count } = data;

    if (count === 0) {
      syncStore.getState().setIdle();
      return;
    }

    syncStore.getState().setSyncing(0);

    // Process events in batch
    for (let i = 0; i < events.length; i++) {
      const event = events[i];
      await this.processEvent(event);

      // Update progress
      const progress = Math.round(((i + 1) / count) * 100);
      syncStore.getState().setProgress(progress);
    }

    // ACK the last event
    const lastEvent = events[events.length - 1];
    if (lastEvent) {
      this.lastSeenId = lastEvent.eventId;
      this.persistCursor(lastEvent.eventId);
      this.socket?.emit(SyncProtocol.SYNC_ACK, { lastId: lastEvent.eventId });
    }

    syncStore.getState().setIdle();

    // Notify UI that sync is complete
    eventBus.emit(CustomEventKey.SyncMail);
  };

  private handleReconnect = (): void => {
    this.resume();
  };

  // ─── Internal: Event Processing ───

  private async processEvent(event: SyncEvent): Promise<void> {
    // Deduplicate
    if (this.dedup.isDuplicate(event.eventId)) return;

    // Skip if handled optimistically (user's own action)
    if (optimisticQueue.hasOptimistic(event.eventId)) {
      optimisticQueue.confirm(event.eventId);
      return;
    }

    // Update cursor
    if (event.eventId && event.eventId > (this.lastSeenId ?? '0')) {
      this.lastSeenId = event.eventId;
    }

    // Find and execute handler
    const handler = eventHandlerMap[event.type as BridgeEvent];
    if (handler) {
      try {
        await handler(event);
      } catch (err) {
        console.error(`[EventBridge] Handler failed for ${event.type}:`, err);
      }
    }

    // Emit on eventBus for any non-Dexie side effects (toasts, sounds, etc.)
    eventBus.emit(CustomEventKey.MailEvents, event);
  }

  // ─── Internal: Msgpack Decode ───

  private decodeEvent(raw: Uint8Array | SyncEvent | unknown): SyncEvent | null {
    try {
      if (raw instanceof Uint8Array) {
        return decode(raw) as SyncEvent;
      }
      if (raw && typeof raw === 'object' && 'eventId' in (raw as object)) {
        return raw as SyncEvent;
      }
      return null;
    } catch {
      console.error('[EventBridge] Failed to decode event');
      return null;
    }
  }

  // ─── Internal: Cursor Persistence (Dexie) ───

  private async persistCursor(cursor: string): Promise<void> {
    try {
      await db.table('sync_meta').put({ key: SYNC_CURSOR_KEY, value: cursor });
      await db.table('sync_meta').put({ key: SYNC_TIMESTAMP_KEY, value: String(Date.now()) });
    } catch (err) {
      // Fallback to localStorage if Dexie write fails
      try {
        localStorage.setItem('eb:cursor', cursor);
        localStorage.setItem('eb:timestamp', String(Date.now()));
      } catch {}
    }
  }

  private async loadCursor(): Promise<string | null> {
    try {
      const record = await db.table('sync_meta').get(SYNC_CURSOR_KEY);
      if (record?.value) return record.value;
    } catch {}

    // Fallback to localStorage
    try {
      return localStorage.getItem('eb:cursor');
    } catch {
      return null;
    }
  }
}

// ─── Singleton Export ───

export const eventBridge = new EventBridgeService();
