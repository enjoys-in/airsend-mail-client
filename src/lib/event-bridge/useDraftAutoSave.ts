/**
 * useDraftAutoSave Hook
 * React hook that wraps DraftService for compose components.
 * Handles lifecycle, beforeunload, and exposes status reactively.
 */

"use client";

import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { draftService, type DraftData, type DraftStatus } from './draft-service';

interface UseDraftAutoSaveOptions {
  /** Server message_id if editing an existing draft */
  existingMessageId?: string;
  /** Pre-fill data for reply/forward */
  initialData?: DraftData;
  /** Auto-save debounce in ms (default: 3000) */
  debounceMs?: number;
}

interface UseDraftAutoSaveReturn {
  /** Call whenever compose fields change */
  update: (data: Partial<DraftData>) => void;
  /** Force save immediately */
  flush: () => Promise<void>;
  /** Discard the draft entirely */
  discard: () => Promise<void>;
  /** Current save status */
  status: DraftStatus;
  /** The local draft session ID */
  localId: string;
  /** Server message_id (available after first save) */
  messageId: string | null;
}

export function useDraftAutoSave(options: UseDraftAutoSaveOptions = {}): UseDraftAutoSaveReturn {
  const { existingMessageId, initialData } = options;
  const localIdRef = useRef<string>(crypto.randomUUID());
  const localId = localIdRef.current;

  const [status, setStatus] = useState<DraftStatus>({
    saving: false,
    lastSavedAt: null,
    dirty: false,
    error: null,
  });

  // Open draft session on mount
  useEffect(() => {
    draftService.open(localId, existingMessageId, initialData);

    // Subscribe to status changes
    const unsub = draftService.onStatus(localId, setStatus);

    // beforeunload — flush on page close
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (draftService.hasUnsaved()) {
        // Use sendBeacon or sync flush
        draftService.flushAll();
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      unsub();
      // Close session (flushes pending saves)
      draftService.close(localId);
    };
  }, [localId, existingMessageId]);

  const update = useCallback((data: Partial<DraftData>) => {
    draftService.update(localId, data);
  }, [localId]);

  const flush = useCallback(async () => {
    await draftService.flush(localId);
  }, [localId]);

  const discard = useCallback(async () => {
    await draftService.discard(localId);
  }, [localId]);

  const messageId = draftService.getMessageId(localId);

  return {
    update,
    flush,
    discard,
    status,
    localId,
    messageId,
  };
}
