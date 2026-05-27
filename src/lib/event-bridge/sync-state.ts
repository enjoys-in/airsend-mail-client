/**
 * Event Bridge Sync State
 * Vanilla zustand store — works outside React, subscribable from anywhere.
 * React components can use `useSyncState` hook for selective subscriptions.
 */

import { createStore } from 'zustand/vanilla';
import { SyncStatus } from './constants';
import type { BridgeSyncState } from './types';

const initialState: BridgeSyncState = {
  status: SyncStatus.INITIALIZING,
  isSyncGateActive: true, // gate active until first sync completes
  progress: null,
  lastSyncAt: null,
  error: null,
};

type SyncStateActions = {
  setSyncing: (progress?: number) => void;
  setIdle: () => void;
  setError: (error: string) => void;
  setProgress: (progress: number) => void;
  reset: () => void;
};

export type SyncStore = BridgeSyncState & SyncStateActions;

export const syncStore = createStore<SyncStore>((set) => ({
  ...initialState,

  setSyncing: (progress?: number) =>
    set({
      status: SyncStatus.SYNCING,
      isSyncGateActive: true,
      progress: progress ?? null,
      error: null,
    }),

  setIdle: () =>
    set({
      status: SyncStatus.IDLE,
      isSyncGateActive: false,
      progress: null,
      lastSyncAt: Date.now(),
      error: null,
    }),

  setError: (error: string) =>
    set({
      status: SyncStatus.ERROR,
      isSyncGateActive: false,
      progress: null,
      error,
    }),

  setProgress: (progress: number) =>
    set({ progress }),

  reset: () => set(initialState),
}));

// ─── Convenience Accessors ───

export function getSyncState(): BridgeSyncState {
  const { setSyncing, setIdle, setError, setProgress, reset, ...state } = syncStore.getState();
  return state;
}

export function isSyncGateActive(): boolean {
  return syncStore.getState().isSyncGateActive;
}

export function subscribeSyncState(listener: (state: BridgeSyncState) => void): () => void {
  return syncStore.subscribe((full) => {
    const { setSyncing, setIdle, setError, setProgress, reset, ...state } = full;
    listener(state);
  });
}
