/**
 * Event Bridge - Event Handlers
 * Maps each BridgeEvent type to a Dexie write operation.
 * Pure async functions — no React, no side effects beyond DB writes.
 */

import { airsendDB, db } from '@/db';
import { markCurrentListStale } from '@/db/mailbox-sync';
import { BridgeEvent } from './constants';
import type {
  MessageMovedPayload,
  FolderCreatedPayload,
  FolderRenamedPayload,
  FolderEmptiedPayload,
  LabelPayload,
  DraftPayload,
  EventHandler,
} from './types';

// ─── Mailbox Count Helpers ───

async function incrementMailboxCount(folderPath: string, field: 'unread_count' | 'total_count', delta: number = 1): Promise<void> {
  if (!folderPath) return;
  try {
    await db.mailboxes
      .where('path')
      .equalsIgnoreCase(folderPath)
      .modify((mailbox: any) => {
        mailbox[field] = Math.max(0, (mailbox[field] ?? 0) + delta);
        if (field === 'unread_count') {
          mailbox.read_count = Math.max(0, (mailbox.total_count ?? 0) - mailbox[field]);
        }
      });
  } catch {}
}

async function decrementMailboxCount(folderPath: string, field: 'unread_count' | 'total_count', delta: number = 1): Promise<void> {
  await incrementMailboxCount(folderPath, field, -delta);
}

// ─── Payload helpers ───
// Web actions arrive from the API as { messageIds: [...], folder, targetFolder, action };
// IMAP / restore events as { messageId, fromFolder, toFolder }. Both are accepted.

/** Folder the web client lists trashed mail under (`/u/mail/deleted`). */
const TRASH_FOLDER = 'deleted';

type AnyMessagePayload = Partial<MessageMovedPayload> & {
  messageIds?: string[];
  folder?: string;
  targetFolder?: string;
  action?: string;
};

function messageIdsOf(p: AnyMessagePayload): string[] {
  const ids = Array.isArray(p?.messageIds) ? p.messageIds : p?.messageId ? [p.messageId] : [];
  return ids.filter(Boolean);
}

const sourceFolderOf = (p: AnyMessagePayload) => p?.fromFolder ?? p?.folder ?? '';

/** Destination of a move; undefined when the server decides it (e.g. unarchive). */
function targetFolderOf(p: AnyMessagePayload): string | undefined {
  if (p?.toFolder || p?.targetFolder) return p.toFolder ?? p.targetFolder;
  if (p?.action === 'archive') return 'archive';
  return undefined;
}

/**
 * Moves the mails to `toFolder` in Dexie and shifts the mailbox counts. Without a known
 * destination the mail is dropped locally; the next list fetch of its folder brings it back.
 * Mails not cached here, or already where the event puts them (the tab that made the change
 * gets its own event back), are skipped so the counters are not shifted twice.
 * A mail not cached here can't be placed in the destination's cached list, so that list is marked
 * stale and fetched once the next time it is opened.
 */
async function moveMails(p: AnyMessagePayload, toFolder: string | undefined): Promise<void> {
  let uncached = false;
  for (const id of messageIdsOf(p)) {
    const existing = await airsendDB.getItemByKey('mails', id);
    if (!existing) {
      uncached = true;
      continue;
    }
    const fromFolder = existing.folder ?? sourceFolderOf(p);
    if (toFolder && fromFolder.toLowerCase() === toFolder.toLowerCase()) continue;

    if (toFolder) await airsendDB.updateItem('mails', id, { folder: toFolder });
    else await airsendDB.deleteItem('mails', id);

    await decrementMailboxCount(fromFolder, 'total_count');
    if (toFolder) await incrementMailboxCount(toFolder, 'total_count');
    if (!existing.is_read) {
      await decrementMailboxCount(fromFolder, 'unread_count');
      if (toFolder) await incrementMailboxCount(toFolder, 'unread_count');
    }
  }
  if (uncached && toFolder) await markCurrentListStale([toFolder]);
}

/** Sets one field on every mail of the event. */
async function setOnMails(p: AnyMessagePayload, changes: Record<string, unknown>): Promise<void> {
  for (const id of messageIdsOf(p)) await airsendDB.updateItem('mails', id, changes as any);
}

// ─── Message Handlers ───

const handleMessageDeleted: EventHandler<AnyMessagePayload> = async (event) => {
  // Soft or hard delete: either way it leaves the list it was in; the trash list is fetched on next open.
  await moveMails(event.payload, undefined);
  await markCurrentListStale([TRASH_FOLDER]);
};

const handleMessageTrashed: EventHandler<AnyMessagePayload> = async (event) => {
  await moveMails(event.payload, TRASH_FOLDER);
};

const handleMessageMoved: EventHandler<AnyMessagePayload> = async (event) => {
  const target = targetFolderOf(event.payload);
  await moveMails(event.payload, target);
  // The server picked the destination (e.g. unarchive): any list may now hold these mails
  if (!target) await markCurrentListStale();
};

/** Mail sent from another tab, device or IMAP client: the Sent list is fetched on its next open. */
const handleMessageSent: EventHandler<AnyMessagePayload> = async () => {
  await markCurrentListStale(['sent']);
};

const handleMessageSpam: EventHandler<AnyMessagePayload> = async (event) => {
  // "block" also maps to message.spam but leaves the mail where it is.
  if (event.payload?.action === 'block') return;
  await moveMails(event.payload, 'spam');
};

const handleMessageNotSpam: EventHandler<AnyMessagePayload> = async (event) => {
  if (event.payload?.action === 'unblock') return;
  await moveMails(event.payload, targetFolderOf(event.payload) ?? 'inbox');
};

// ─── Flag Handlers ───

/** Read/unread: only mails whose state really changes move the unread counter. */
const readState = (isRead: boolean): EventHandler<AnyMessagePayload> => async (event) => {
  for (const id of messageIdsOf(event.payload)) {
    const existing = await airsendDB.getItemByKey('mails', id);
    await airsendDB.updateItem('mails', id, { is_read: isRead });
    if (existing && !!existing.is_read !== isRead) {
      await incrementMailboxCount(existing.folder ?? sourceFolderOf(event.payload), 'unread_count', isRead ? -1 : 1);
    }
  }
};

const handleFlagsRead = readState(true);
const handleFlagsUnread = readState(false);

const handleFlagsStarred: EventHandler<AnyMessagePayload> = (event) => setOnMails(event.payload, { is_starred: true });
const handleFlagsUnstarred: EventHandler<AnyMessagePayload> = (event) => setOnMails(event.payload, { is_starred: false });
const handleFlagsAnswered: EventHandler<AnyMessagePayload> = (event) => setOnMails(event.payload, { is_replied: true });
const handleFlagsForwarded: EventHandler<AnyMessagePayload> = (event) => setOnMails(event.payload, { is_forwarded: true });

/** pin/unpin/importance/unimportance all arrive as message.flags.important; the action tells them apart. */
const handleFlagsImportant: EventHandler<AnyMessagePayload> = (event) => {
  const changes: Record<string, Record<string, boolean>> = {
    pin: { is_pinned: true },
    unpin: { is_pinned: false },
    unimportance: { is_important: false },
  };
  return setOnMails(event.payload, changes[event.payload?.action ?? ''] ?? { is_important: true });
};

// ─── Draft Handlers ───

const handleDraftCreated: EventHandler<DraftPayload> = async (event) => {
  const { payload } = event;
  await airsendDB.putItem('mails', {
    message_id: payload.messageId,
    folder: 'Drafts',
    uid: payload.uid ? String(payload.uid) : undefined,
    subject: payload.subject ?? '',
    plain_text: payload.content ?? '',
    receipients: payload.to?.map((t) => t.address) ?? [],
  });
};

const handleDraftUpdated: EventHandler<DraftPayload> = async (event) => {
  const { payload } = event;
  const updates: Record<string, unknown> = {};
  if (payload.subject !== undefined) updates.subject = payload.subject;
  if (payload.content !== undefined) updates.plain_text = payload.content;
  if (payload.to !== undefined) updates.receipients = payload.to.map((t) => t.address);
  await airsendDB.updateItem('mails', payload.messageId, updates);
};

const handleDraftDeleted: EventHandler<DraftPayload> = async (event) => {
  await airsendDB.deleteItem('mails', event.payload.messageId);
};

// ─── Folder Handlers ───

const handleFolderCreated: EventHandler<FolderCreatedPayload> = async (event) => {
  const { payload } = event;
  await airsendDB.putItem('mailboxes', {
    path: payload.folderName,
    type: 'custom',
  } as any);
};

const handleFolderDeleted: EventHandler<FolderCreatedPayload> = async (event) => {
  await airsendDB.deleteItem('mailboxes', event.payload.folderName);
};

const handleFolderRenamed: EventHandler<FolderRenamedPayload> = async (event) => {
  const { payload } = event;
  // Delete old, put new
  const existing = await airsendDB.getItemByKey('mailboxes', payload.oldName);
  if (existing) {
    await airsendDB.deleteItem('mailboxes', payload.oldName);
    await airsendDB.putItem('mailboxes', { ...existing, path: payload.newName } as any);
  }
};

const handleFolderEmptied: EventHandler<FolderEmptiedPayload> = async (event) => {
  const { payload } = event;
  // Delete all mails in that folder (mail records carry `folder`; case differs between sources)
  const folder = (payload.folderName ?? '').toLowerCase();
  await db.mails.filter((m) => (m.folder ?? '').toLowerCase() === folder && airsendDB.ownsMail(m)).delete();
  await db.mailboxes.where('path').equalsIgnoreCase(payload.folderName ?? '')
    .modify((mailbox: any) => { mailbox.total_count = 0; mailbox.unread_count = 0; mailbox.read_count = 0; })
    .catch(() => { });
};

// ─── Label Handlers ───

const handleLabelAdded: EventHandler<LabelPayload> = async (event) => {
  const { payload } = event;
  const mail = await airsendDB.getItemByKey('mails', payload.messageId);
  if (mail) {
    const tags = [...(mail.tags ?? [])];
    if (!tags.includes(payload.label)) {
      tags.push(payload.label);
      await airsendDB.updateItem('mails', payload.messageId, { tags });
    }
  }
};

const handleLabelRemoved: EventHandler<LabelPayload> = async (event) => {
  const { payload } = event;
  const mail = await airsendDB.getItemByKey('mails', payload.messageId);
  if (mail) {
    const tags = (mail.tags ?? []).filter((t) => t !== payload.label);
    await airsendDB.updateItem('mails', payload.messageId, { tags });
  }
};

// ─── Handler Registry ───

export const eventHandlerMap: Partial<Record<BridgeEvent, EventHandler<any>>> = {
  // MESSAGE_RECEIVED: handled by the custom @@NEW_MAIL_RECEIVED socket.
  // MESSAGE_SENT: marks Sent stale; a tab showing Sent refetches it at once (ClientMailCard).
  [BridgeEvent.MESSAGE_SENT]: handleMessageSent,
  [BridgeEvent.MESSAGE_DELETED]: handleMessageDeleted,
  [BridgeEvent.MESSAGE_TRASHED]: handleMessageTrashed,
  [BridgeEvent.MESSAGE_MOVED]: handleMessageMoved,
  [BridgeEvent.MESSAGE_SPAM]: handleMessageSpam,
  [BridgeEvent.MESSAGE_NOT_SPAM]: handleMessageNotSpam,
  [BridgeEvent.MESSAGE_BOUNCED]: handleMessageDeleted, // remove bounced

  [BridgeEvent.FLAGS_READ]: handleFlagsRead,
  [BridgeEvent.FLAGS_UNREAD]: handleFlagsUnread,
  [BridgeEvent.FLAGS_STARRED]: handleFlagsStarred,
  [BridgeEvent.FLAGS_UNSTARRED]: handleFlagsUnstarred,
  [BridgeEvent.FLAGS_ANSWERED]: handleFlagsAnswered,
  [BridgeEvent.FLAGS_FORWARDED]: handleFlagsForwarded,
  [BridgeEvent.FLAGS_IMPORTANT]: handleFlagsImportant,

  [BridgeEvent.DRAFT_CREATED]: handleDraftCreated,
  [BridgeEvent.DRAFT_UPDATED]: handleDraftUpdated,
  [BridgeEvent.DRAFT_DELETED]: handleDraftDeleted,

  [BridgeEvent.FOLDER_CREATED]: handleFolderCreated,
  [BridgeEvent.FOLDER_DELETED]: handleFolderDeleted,
  [BridgeEvent.FOLDER_RENAMED]: handleFolderRenamed,
  [BridgeEvent.FOLDER_EMPTIED]: handleFolderEmptied,

  [BridgeEvent.LABEL_ADDED]: handleLabelAdded,
  [BridgeEvent.LABEL_REMOVED]: handleLabelRemoved,
};
