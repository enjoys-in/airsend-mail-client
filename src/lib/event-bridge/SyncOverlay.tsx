/**
 * Event Bridge - Sync Overlay
 * Shows a non-intrusive "Syncing…" indicator when sync gate is active.
 * Uses useTransition to avoid blocking user interactions.
 */

"use client";

import { useEffect, useState, useTransition } from 'react';
import { syncStore } from '@/lib/event-bridge/sync-state';
import { SyncStatus } from '@/lib/event-bridge/constants';
import type { BridgeSyncState } from '@/lib/event-bridge/types';
import { Progress } from '@/components/ui/progress';

export function SyncOverlay() {
  const [state, setState] = useState<BridgeSyncState>(() => {
    const { setSyncing, setIdle, setError, setProgress, reset, ...s } = syncStore.getState();
    return s;
  });
  const [, startTransition] = useTransition();

  useEffect(() => {
    const unsub = syncStore.subscribe((full) => {
      startTransition(() => {
        const { setSyncing, setIdle, setError, setProgress, reset, ...s } = full;
        setState(s);
      });
    });
    return unsub;
  }, []);

  // Don't render when idle
  if (state.status === SyncStatus.IDLE) return null;

  const isInitializing = state.status === SyncStatus.INITIALIZING;
  const isSyncing = state.status === SyncStatus.SYNCING;
  const isError = state.status === SyncStatus.ERROR;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[9999] pointer-events-none"
      role="status"
      aria-live="polite"
    >
      {/* Progress bar at top of viewport */}
      {(isSyncing || isInitializing) && (
        <div className="w-full">
          <Progress
            value={state.progress ?? undefined}
            className="h-1 rounded-none"
          />
        </div>
      )}

      {/* Status message */}
      <div className="flex justify-center mt-2">
        <div className="bg-background/95 backdrop-blur border rounded-lg px-4 py-2 shadow-lg pointer-events-auto flex items-center gap-2 text-sm">
          {(isSyncing || isInitializing) && (
            <>
              <SyncSpinner />
              <span className="text-muted-foreground">
                {isInitializing
                  ? 'Initializing…'
                  : state.progress != null
                    ? `Syncing your changes… ${state.progress}%`
                    : 'Syncing your changes…'}
              </span>
            </>
          )}
          {isError && (
            <>
              <span className="text-destructive text-xs">●</span>
              <span className="text-destructive">
                Sync error: {state.error ?? 'Unknown error'}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function SyncSpinner() {
  return (
    <svg
      className="animate-spin h-4 w-4 text-primary"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}
