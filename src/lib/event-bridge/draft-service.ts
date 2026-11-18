/**
 * Event Bridge - Draft Service
 * Handles client → server draft persistence with auto-save, 
 * optimistic writes to Dexie, and recovery on page close.
 * 
 * Singleton — framework-agnostic, no React dependencies.
 */

import { airsendDB, db } from '@/db';
import { API } from '@/lib/api/handler';
import { optimisticQueue } from './optimistic';
import { BridgeEvent } from './constants';
import { Security } from '@/lib/security';

const security = new Security();

export interface DraftData {
  from?: string;
  to?: string[];
  cc?: string[];
  bcc?: string[];
  subject?: string;
  html?: string;
}

/** Check if draft has no meaningful user content */
export function isDraftEmpty(data?: DraftData | null): boolean {
  if (!data) return true;
  const hasTo = Array.isArray(data.to) && data.to.some((addr) => !!addr && addr.trim().length > 0);
  const hasCc = Array.isArray(data.cc) && data.cc.some((addr) => !!addr && addr.trim().length > 0);
  const hasBcc = Array.isArray(data.bcc) && data.bcc.some((addr) => !!addr && addr.trim().length > 0);
  if (hasTo || hasCc || hasBcc) return false;

  if (data.subject && data.subject.trim().length > 0) return false;

  if (data.html) {
    const text = data.html
      .replace(/<[^>]*>/g, "")
      .replace(/&nbsp;/gi, " ")
      .replace(/&#160;/gi, " ")
      .trim();
    if (text === "Write your content here...") return true;
    const hasMedia = /<img|<iframe|<svg|<video|<audio/i.test(data.html);
    if (text.length > 0 || hasMedia) return false;
  }

  return true;
}

/** Structural comparison of before vs after draft state */
export function isDraftEqual(a?: DraftData | null, b?: DraftData | null): boolean {
  if (!a && !b) return true;
  if (!a || !b) return false;

  const normalizeList = (list?: string[]) =>
    (list || [])
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean)
      .sort();

  const toA = normalizeList(a.to);
  const toB = normalizeList(b.to);
  if (toA.length !== toB.length || toA.some((val, idx) => val !== toB[idx])) return false;

  const ccA = normalizeList(a.cc);
  const ccB = normalizeList(b.cc);
  if (ccA.length !== ccB.length || ccA.some((val, idx) => val !== ccB[idx])) return false;

  const bccA = normalizeList(a.bcc);
  const bccB = normalizeList(b.bcc);
  if (bccA.length !== bccB.length || bccA.some((val, idx) => val !== bccB[idx])) return false;

  const subjA = (a.subject || "").trim();
  const subjB = (b.subject || "").trim();
  if (subjA !== subjB) return false;

  const normalizeHtml = (html?: string) =>
    (html || "")
      .replace(/\s+/g, " ")
      .trim();

  if (normalizeHtml(a.html) !== normalizeHtml(b.html)) return false;

  return true;
}

function cloneDraft(data?: DraftData | null): DraftData {
  if (!data) return {};
  return {
    from: data.from,
    to: data.to ? [...data.to] : [],
    cc: data.cc ? [...data.cc] : [],
    bcc: data.bcc ? [...data.bcc] : [],
    subject: data.subject ?? "",
    html: data.html ?? "",
  };
}

interface ActiveDraft {
  /** Server-assigned message_id (null until first save completes) */
  messageId: string | null;
  /** Local temporary ID for optimistic tracking */
  localId: string;
  /** Current draft content */
  data: DraftData;
  /** Baseline content when opened (for before vs after comparison) */
  initialData: DraftData;
  /** Whether there are unsaved changes */
  dirty: boolean;
  /** Last saved timestamp */
  lastSavedAt: number | null;
  /** Debounce timer */
  timer: ReturnType<typeof setTimeout> | null;
  /** Whether a save is in-flight */
  saving: boolean;
  /** Whether an optimistic entry has been written to Dexie */
  hasWrittenOptimistic?: boolean;
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

  constructor() {
    if (typeof window !== "undefined") {
      setTimeout(() => {
        this.purgeEmptyDrafts().catch(() => {});
      }, 1000);
    }
  }

  // ─── Public API ───

  /**
   * Open/create a draft session. Call when compose mounts.
   * @param localId - Unique tab/compose instance ID (use crypto.randomUUID())
   * @param existingMessageId - If editing an existing draft from server
   * @param initialData - Pre-fill data (for reply/forward/existing draft)
   */
  open(localId: string, existingMessageId?: string, initialData?: DraftData): void {
    if (this.drafts.has(localId)) return;

    const baseline = cloneDraft(initialData);

    this.drafts.set(localId, {
      messageId: existingMessageId ?? null,
      localId,
      data: cloneDraft(initialData),
      initialData: baseline,
      dirty: false,
      lastSavedAt: null,
      timer: null,
      saving: false,
      hasWrittenOptimistic: false,
    });

    // DO NOT write optimistic entry to Dexie immediately on open!
    // Storing happens ONLY when state actually changes before vs after and is not empty.
  }

  /**
   * Update draft content. Triggers debounced auto-save only if changed vs baseline.
   */
  update(localId: string, data: Partial<DraftData>): void {
    const draft = this.drafts.get(localId);
    if (!draft) return;

    draft.data = { ...draft.data, ...data };

    const empty = isDraftEmpty(draft.data);
    const unchanged = isDraftEqual(draft.initialData, draft.data);

    // If after clear or showing same before: NO DRAFT
    if (empty || unchanged) {
      this.cancelTimer(localId);
      draft.dirty = false;
      this.notify(localId);

      // If we previously wrote an optimistic draft or have a server draft, clean it up!
      if (draft.hasWrittenOptimistic || draft.messageId) {
        this.removeDraftStorage(localId).catch(() => {});
      }
      return;
    }

    // State is changed before vs after AND has content: mark dirty and save
    draft.dirty = true;
    this.notify(localId);

    // Optimistically record to Dexie with IV + secret key encryption
    this.writeOptimisticToDexie(localId).catch(() => {});
    this.scheduleSave(localId);
  }

  /**
   * Force immediate save (e.g., on blur, before close).
   */
  async flush(localId: string): Promise<void> {
    const draft = this.drafts.get(localId);
    if (!draft || !draft.dirty) return;

    if (isDraftEmpty(draft.data) || isDraftEqual(draft.initialData, draft.data)) {
      this.cancelTimer(localId);
      draft.dirty = false;
      await this.removeDraftStorage(localId);
      return;
    }

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
      await airsendDB.deleteItem('mails', draft.messageId).catch(() => {});
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
      if (draft.dirty && !isDraftEmpty(draft.data) && !isDraftEqual(draft.initialData, draft.data)) {
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
      if (draft.dirty && !isDraftEmpty(draft.data) && !isDraftEqual(draft.initialData, draft.data)) {
        return true;
      }
    }
    return false;
  }

  /**
   * One-time cleanup of any legacy blank / empty drafts previously left in Dexie.
   */
  async purgeEmptyDrafts(): Promise<void> {
    try {
      const allDrafts = await db.mails.filter((m: any) => {
        if ((m?.folder ?? '').toLowerCase() !== 'drafts') return false;
        const subj = security.decryptAES(m?.subject || '') || m?.subject || '';
        const body = security.decryptAES(m?.plain_text || '') || m?.plain_text || '';
        const recs = Array.isArray(m?.receipients) ? m.receipients : [];
        const hasRecs = recs.some((r: any) => {
          const dec = security.decryptAES(r || '') || r || '';
          return !!dec && dec.trim().length > 0;
        });
        const hasSubj = subj.trim().length > 0;
        const text = body.replace(/<[^>]*>/g, '').replace(/&nbsp;/gi, ' ').trim();
        const hasBody = text.length > 0 && text !== 'Write your content here...';
        return !hasSubj && !hasBody && !hasRecs;
      }).toArray();
      if (allDrafts && allDrafts.length > 0) {
        for (const d of allDrafts) {
          if (d?.message_id) {
            await airsendDB.deleteItem('mails', d.message_id).catch(() => {});
          }
        }
      }
    } catch {
      // non-blocking
    }
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

  private async removeDraftStorage(localId: string): Promise<void> {
    const draft = this.drafts.get(localId);
    if (!draft) return;

    this.cancelTimer(localId);
    draft.hasWrittenOptimistic = false;

    // Delete local optimistic Dexie entry
    await airsendDB.deleteItem('mails', draft.localId).catch(() => {});

    // If server draft was created, delete from server and Dexie
    if (draft.messageId) {
      const mid = draft.messageId;
      draft.messageId = null;
      try {
        await API.deleteDraft(mid);
      } catch {}
      await airsendDB.deleteItem('mails', mid).catch(() => {});
    }
  }

  private async save(localId: string): Promise<void> {
    const draft = this.drafts.get(localId);
    if (!draft || draft.saving) return;

    // Guard: don't save empty drafts or drafts showing same before
    if (isDraftEmpty(draft.data) || isDraftEqual(draft.initialData, draft.data)) {
      draft.dirty = false;
      await this.removeDraftStorage(localId);
      return;
    }

    draft.saving = true;
    this.notify(localId);

    try {
      if (draft.messageId) {
        // Update existing draft on server
        await API.updateDraft(draft.messageId, draft.data);
      } else {
        // Create new draft on server
        const response = await API.saveDraft(draft.data);
        const result = response.data?.result;
        if (result?.message_id) {
          draft.messageId = result.message_id;

          // Replace local optimistic entry with real one in Dexie
          await airsendDB.deleteItem('mails', draft.localId).catch(() => {});

          const accountEmail = draft.data.from || airsendDB.getMailAccount() || "";
          await airsendDB.putItem('mails', {
            message_id: result.message_id,
            uid: result.uid ? String(result.uid) : result.message_id,
            folder: 'Drafts',
            from_email: security.encryptAES(accountEmail),
            receipient: accountEmail,
            receipients: (draft.data.to ?? []).map((addr) => security.encryptAES(addr)),
            subject: security.encryptAES(draft.data.subject ?? ''),
            plain_text: security.encryptAES(draft.data.html ?? ''),
            flags: ["\\Draft"],
            is_read: true,
            has_attachments: false,
            created_at: new Date().toISOString(),
            timestamp: new Date().toISOString(),
          });
        }
      }

      draft.dirty = false;
      draft.lastSavedAt = Date.now();
    } catch (err: any) {
      console.error('[DraftService] Save failed:', err?.message);
      // Re-schedule on failure only if still dirty and not cleared
      if (!isDraftEmpty(draft.data) && !isDraftEqual(draft.initialData, draft.data)) {
        this.scheduleSave(localId);
      }
    } finally {
      draft.saving = false;
      this.notify(localId);
    }
  }

  private async writeOptimisticToDexie(localId: string): Promise<void> {
    const draft = this.drafts.get(localId);
    if (!draft) return;

    // Guard: never write empty or unchanged draft
    if (isDraftEmpty(draft.data) || isDraftEqual(draft.initialData, draft.data)) {
      return;
    }

    draft.hasWrittenOptimistic = true;
    const accountEmail = draft.data.from || airsendDB.getMailAccount() || "";

    await airsendDB.putItem('mails', {
      message_id: localId, // temporary local ID
      uid: localId,
      folder: 'Drafts',
      from_email: security.encryptAES(accountEmail),
      receipient: accountEmail,
      receipients: (draft.data.to ?? []).map((addr) => security.encryptAES(addr)),
      subject: security.encryptAES(draft.data.subject ?? ''),
      plain_text: security.encryptAES(draft.data.html ?? ''),
      flags: ["\\Draft"],
      is_read: true,
      has_attachments: false,
      created_at: new Date().toISOString(),
      timestamp: new Date().toISOString(),
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
