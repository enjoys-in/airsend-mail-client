/**
 * Event Bridge - Draft Service
 * Handles client → server draft persistence with auto-save, 
 * optimistic writes to Dexie, and recovery on page close.
 * 
 * Singleton — framework-agnostic, no React dependencies.
 */

import { airsendDB } from '@/db';
import { API } from '@/lib/api/handler';
import { optimisticQueue } from './optimistic';
import { BridgeEvent } from './constants';

export interface DraftData {
  to?: string[];
  cc?: string[];
  bcc?: string[];
  subject?: string;
  html?: string;
}

interface ActiveDraft {
  /** Server-assigned message_id (null until first save completes) */
  messageId: string | null;
  /** Local temporary ID for optimistic tracking */
  localId: string;
  /** Current draft content */
  data: DraftData;
  /** Whether there are unsaved changes */
  dirty: boolean;
  /** Last saved timestamp */
  lastSavedAt: number | null;
  /** Debounce timer */
  timer: ReturnType<typeof setTimeout> | null;
  /** Whether a save is in-flight */
  saving: boolean;
}

type DraftStatusListener = (status: DraftStatus) => void;

export interface DraftStatus {
  saving: boolean;
  lastSavedAt: number | null;
  dirty: boolean;
  error: string | null;
}

class DraftService {
  private drafts = new Map<string, ActiveDraft>();
  private listeners = new Map<string, Set<DraftStatusListener>>();
  private debounceMs = 3000; // 3 second auto-save interval

  // ─── Public API ───

  /**
   * Open/create a draft session. Call when compose mounts.
   * @param localId - Unique tab/compose instance ID (use crypto.randomUUID())
   * @param existingMessageId - If editing an existing draft from server
   * @param initialData - Pre-fill data (for reply/forward/existing draft)
   */
  open(localId: string, existingMessageId?: string, initialData?: DraftData): void {
    if (this.drafts.has(localId)) return;

    this.drafts.set(localId, {
      messageId: existingMessageId ?? null,
      localId,
      data: initialData ?? {},
      dirty: false,
      lastSavedAt: null,
      timer: null,
      saving: false,
    });

    // Write optimistic entry to Dexie immediately if new draft
    if (!existingMessageId) {
      this.writeOptimisticToDexie(localId);
    }
  }

  /**
   * Update draft content. Triggers debounced auto-save.
   */
  update(localId: string, data: Partial<DraftData>): void {
    const draft = this.drafts.get(localId);
    if (!draft) return;

    draft.data = { ...draft.data, ...data };
    draft.dirty = true;

    this.notify(localId);
    this.scheduleSave(localId);
  }

  /**
   * Force immediate save (e.g., on blur, before close).
   */
  async flush(localId: string): Promise<void> {
    const draft = this.drafts.get(localId);
    if (!draft || !draft.dirty) return;

    this.cancelTimer(localId);
    await this.save(localId);
  }

  /**
   * Close a draft session. Flushes pending changes, cleans up.
   * Call when compose unmounts.
   */
  async close(localId: string): Promise<void> {
    await this.flush(localId);
    this.cancelTimer(localId);
    this.drafts.delete(localId);
    this.listeners.delete(localId);
  }

  /**
   * Discard a draft entirely — deletes from server and Dexie.
   */
  async discard(localId: string): Promise<void> {
    const draft = this.drafts.get(localId);
    if (!draft) return;

    this.cancelTimer(localId);

    // Delete from server if it was saved
    if (draft.messageId) {
      try {
        await API.deleteDraft(draft.messageId);
      } catch {}
      await airsendDB.deleteItem('mails', draft.messageId);
    }

    // Remove optimistic local entry
    await airsendDB.deleteItem('mails', draft.localId).catch(() => {});

    this.drafts.delete(localId);
    this.listeners.delete(localId);
  }

  /**
   * Get current status for a draft session.
   */
  getStatus(localId: string): DraftStatus {
    const draft = this.drafts.get(localId);
    if (!draft) return { saving: false, lastSavedAt: null, dirty: false, error: null };
    return {
      saving: draft.saving,
      lastSavedAt: draft.lastSavedAt,
      dirty: draft.dirty,
      error: null,
    };
  }

  /**
   * Subscribe to status changes for a specific draft.
   */
  onStatus(localId: string, listener: DraftStatusListener): () => void {
    if (!this.listeners.has(localId)) this.listeners.set(localId, new Set());
    this.listeners.get(localId)!.add(listener);
    return () => this.listeners.get(localId)?.delete(listener);
  }

  /**
   * Get the server message_id for a draft (after first save).
   */
  getMessageId(localId: string): string | null {
    return this.drafts.get(localId)?.messageId ?? null;
  }

  /**
   * Save all dirty drafts immediately (call on beforeunload).
   */
  async flushAll(): Promise<void> {
    const promises: Promise<void>[] = [];
    for (const [localId, draft] of this.drafts) {
      if (draft.dirty) {
        promises.push(this.flush(localId));
      }
    }
    await Promise.allSettled(promises);
  }

  /**
   * Check if there are any unsaved drafts.
   */
  hasUnsaved(): boolean {
    for (const draft of this.drafts.values()) {
      if (draft.dirty) return true;
    }
    return false;
  }

  // ─── Internal ───

  private scheduleSave(localId: string): void {
    const draft = this.drafts.get(localId);
    if (!draft) return;

    this.cancelTimer(localId);

    draft.timer = setTimeout(() => {
      this.save(localId);
    }, this.debounceMs);
  }

  private cancelTimer(localId: string): void {
    const draft = this.drafts.get(localId);
    if (draft?.timer) {
      clearTimeout(draft.timer);
      draft.timer = null;
    }
  }

  private async save(localId: string): Promise<void> {
    const draft = this.drafts.get(localId);
    if (!draft || draft.saving) return;

    // Don't save empty drafts
    const hasContent = draft.data.subject || draft.data.html || (draft.data.to && draft.data.to.length > 0);
    if (!hasContent) return;

    draft.saving = true;
    this.notify(localId);

    try {
      if (draft.messageId) {
        // Update existing draft
        await API.updateDraft(draft.messageId, draft.data);
      } else {
        // Create new draft
        const response = await API.saveDraft(draft.data);
        const result = response.data?.result;
        if (result?.message_id) {
          draft.messageId = result.message_id;

          // Replace local optimistic entry with real one
          await airsendDB.deleteItem('mails', draft.localId).catch(() => {});
          await airsendDB.putItem('mails', {
            message_id: result.message_id,
            uid: result.uid,
            folder: 'Drafts',
            subject: draft.data.subject ?? '',
            receipients: draft.data.to ?? [],
            plain_text: draft.data.html ?? '',
            created_at: new Date().toISOString(),
          });
        }
      }

      draft.dirty = false;
      draft.lastSavedAt = Date.now();
    } catch (err: any) {
      console.error('[DraftService] Save failed:', err?.message);
      // Re-schedule on failure
      this.scheduleSave(localId);
    } finally {
      draft.saving = false;
      this.notify(localId);
    }
  }

  private async writeOptimisticToDexie(localId: string): Promise<void> {
    const draft = this.drafts.get(localId);
    if (!draft) return;

    await airsendDB.putItem('mails', {
      message_id: localId, // temporary local ID
      folder: 'Drafts',
      subject: draft.data.subject ?? '',
      receipients: draft.data.to ?? [],
      plain_text: draft.data.html ?? '',
      created_at: new Date().toISOString(),
    }).catch(() => {});
  }

  private notify(localId: string): void {
    const listeners = this.listeners.get(localId);
    if (!listeners) return;
    const status = this.getStatus(localId);
    for (const fn of listeners) {
      fn(status);
    }
  }
}

export const draftService = new DraftService();
