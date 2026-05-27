/**
 * Event Bridge Types
 * Fully typed interfaces for sync events, payloads, and service contracts.
 */

import type { BridgeEvent, SyncStatus } from './constants';

// ─── Core Event Shape ───

export interface SyncEvent<T = unknown> {
  eventId: string;
  type: BridgeEvent | string;
  payload: T;
  timestamp: number;
  source: EventSource;
}

export type EventSource = 'web' | 'imap' | 'smtp' | 'system' | 'api';

// ─── Sync Protocol Payloads ───

export interface SyncCursorPayload {
  lastId: string;
}

export interface SyncReplayPayload {
  events: SyncEvent[];
  count: number;
}

export interface SyncResumePayload {
  lastSeenId: string;
}

export interface SyncAckPayload {
  lastId: string;
}

// ─── Event-Specific Payloads ───

export interface MessageAddress {
  name: string;
  address: string;
}

export interface MessageReceivedPayload {
  messageId: string;
  uid: number;
  folder: string;
  from: MessageAddress;
  to: MessageAddress[];
  subject: string;
  snippet: string;
  date: string;
  hasAttachments: boolean;
  isRead: boolean;
  flags: string[];
}

export interface MessageFlagPayload {
  messageId: string;
  uid: number;
  folder: string;
}

export interface MessageMovedPayload {
  messageId: string;
  uid: number;
  fromFolder: string;
  toFolder: string;
}

export interface MessageDeletedPayload {
  messageId: string;
  uid: number;
  folder: string;
}

export interface MessageStarredPayload {
  messageId: string;
  uid: number;
  folder: string;
  starred: boolean;
}

export interface FolderCreatedPayload {
  folderName: string;
  parentFolder?: string;
}

export interface FolderRenamedPayload {
  oldName: string;
  newName: string;
}

export interface FolderEmptiedPayload {
  folderName: string;
}

export interface LabelPayload {
  messageId: string;
  label: string;
  color?: string;
}

export interface QuotaPayload {
  used: number;
  limit: number;
  percentage: number;
}

export interface DraftPayload {
  messageId: string;
  uid?: number;
  folder?: string;
  subject?: string;
  to?: MessageAddress[];
  content?: string;
}

// ─── Sync State ───

export interface BridgeSyncState {
  status: SyncStatus;
  /** Whether destructive actions should be blocked */
  isSyncGateActive: boolean;
  /** Progress 0-100 during batch sync, null when idle */
  progress: number | null;
  /** Last successful sync timestamp */
  lastSyncAt: number | null;
  /** Error message if status is ERROR */
  error: string | null;
}

// ─── Optimistic Update ───

export interface OptimisticEntry {
  id: string;
  table: string;
  key: string;
  action: 'put' | 'delete' | 'update';
  previousValue: unknown;
  timestamp: number;
}

// ─── Sync Meta (stored in Dexie) ───

export interface SyncMeta {
  key: string;
  value: string;
}

// ─── Event Handler Map ───

export type EventHandler<T = unknown> = (event: SyncEvent<T>) => Promise<void> | void;

export type EventHandlerMap = Partial<Record<BridgeEvent, EventHandler<any>>>;

// ─── Service Interface ───

export interface IEventBridgeService {
  init(email: string): void;
  destroy(): void;
  getState(): BridgeSyncState;
  subscribe(listener: (state: BridgeSyncState) => void): () => void;
  isActionAllowed(action: 'read' | 'send' | 'mutate'): boolean;
}
