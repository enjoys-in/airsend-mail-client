/**
 * Event Bridge - Barrel Export
 */

export { eventBridge } from './event-bridge.service';
export { syncStore, getSyncState, isSyncGateActive, subscribeSyncState } from './sync-state';
export { optimisticQueue } from './optimistic';
export { installSyncGate, SyncGateError, isSyncGateError } from './sync-gate';
export { draftService } from './draft-service';
export { useDraftAutoSave } from './useDraftAutoSave';
export { BridgeEvent, SyncProtocol, SyncStatus, ALL_BRIDGE_EVENTS } from './constants';
export type {
  SyncEvent,
  BridgeSyncState,
  EventSource,
  IEventBridgeService,
  OptimisticEntry,
  MessageReceivedPayload,
  MessageFlagPayload,
  MessageMovedPayload,
  MessageDeletedPayload,
  MessageStarredPayload,
  FolderCreatedPayload,
  FolderRenamedPayload,
  LabelPayload,
  QuotaPayload,
  DraftPayload,
} from './types';
export type { DraftData, DraftStatus } from './draft-service';
