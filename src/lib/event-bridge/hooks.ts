/**
 * Event Bridge - React Hooks
 * Selective subscriptions to sync state — only re-renders when selected value changes.
 */

"use client";

import { useSyncExternalStore, useCallback } from 'react';
import { syncStore, type SyncStore } from './sync-state';
import { SyncStatus } from './constants';
import type { BridgeSyncState } from './types';

/**
 * Subscribe to the full sync state.
 * Use `useSyncStatus()` or `useIsSyncGateActive()` for selective subscriptions.
 */
export function useSyncState(): BridgeSyncState {
  return useSyncExternalStore(
    syncStore.subscribe,
    () => {
      const { setSyncing, setIdle, setError, setProgress, reset, ...state } = syncStore.getState();
      return state;
    },
    () => ({
      status: SyncStatus.INITIALIZING,
      isSyncGateActive: true,
      progress: null,
      lastSyncAt: null,
      error: null,
    })
  );
}

/**
 * Only re-renders when sync status changes.
 */
export function useSyncStatus(): SyncStatus {
  return useSyncExternalStore(
    syncStore.subscribe,
    () => syncStore.getState().status,
    () => SyncStatus.INITIALIZING
  );
}

/**
 * Only re-renders when gate active/inactive toggles.
 */
export function useIsSyncGateActive(): boolean {
  return useSyncExternalStore(
    syncStore.subscribe,
    () => syncStore.getState().isSyncGateActive,
    () => true
  );
}

/**
 * Returns whether a mutating action is currently allowed.
 */
export function useCanMutate(): boolean {
  const gateActive = useIsSyncGateActive();
  return !gateActive;
}
