/**
 * Event Bridge - Event Handlers
 * Maps each BridgeEvent type to a Dexie write operation.
 * Pure async functions — no React, no side effects beyond DB writes.
 */

import { airsendDB } from '@/db';
import { BridgeEvent } from './constants';
import type {
  SyncEvent,
  MessageReceivedPayload,
  MessageFlagPayload,
  MessageMovedPayload,
  MessageDeletedPayload,
  MessageStarredPayload,
  FolderCreatedPayload,
  FolderRenamedPayload,
  FolderEmptiedPayload,
  LabelPayload,
  DraftPayload,
  EventHandler,
} from './types';

// ─── Message Handlers ───

const handleMessageReceived: EventHandler<MessageReceivedPayload> = async (event) => {
  const { payload } = event;
  await airsendDB.putItem('mails', {
    message_id: payload.messageId,
    from_email: payload.from.address,
    subject: payload.subject,
    folder: payload.folder,
    uid: String(payload.uid),
    is_read: payload.isRead,
    is_starred: false,
    is_important: false,
    has_attachments: payload.hasAttachments,
    flags: payload.flags,
    created_at: payload.date,
    receipient: payload.to[0]?.address ?? '',
    receipients: payload.to.map((t) => t.address),
    plain_text: payload.snippet,
  });
};

const handleMessageDeleted: EventHandler<MessageDeletedPayload> = async (event) => {
  const { payload } = event;
  await airsendDB.deleteItem('mails', payload.messageId);
};

const handleMessageTrashed: EventHandler<MessageMovedPayload> = async (event) => {
  const { payload } = event;
  await airsendDB.updateItem('mails', payload.messageId, { folder: 'Trash' });
};

const handleMessageMoved: EventHandler<MessageMovedPayload> = async (event) => {
  const { payload } = event;
  await airsendDB.updateItem('mails', payload.messageId, { folder: payload.toFolder });
};

const handleMessageSpam: EventHandler<MessageMovedPayload> = async (event) => {
  const { payload } = event;
  await airsendDB.updateItem('mails', payload.messageId, { folder: 'Spam' });
};

const handleMessageNotSpam: EventHandler<MessageMovedPayload> = async (event) => {
  const { payload } = event;
  await airsendDB.updateItem('mails', payload.messageId, { folder: payload.toFolder });
};

// ─── Flag Handlers ───

const handleFlagsRead: EventHandler<MessageFlagPayload> = async (event) => {
  await airsendDB.updateItem('mails', event.payload.messageId, { is_read: true });
};

const handleFlagsUnread: EventHandler<MessageFlagPayload> = async (event) => {
  await airsendDB.updateItem('mails', event.payload.messageId, { is_read: false });
};

const handleFlagsStarred: EventHandler<MessageStarredPayload> = async (event) => {
  await airsendDB.updateItem('mails', event.payload.messageId, { is_starred: true });
};

const handleFlagsUnstarred: EventHandler<MessageStarredPayload> = async (event) => {
  await airsendDB.updateItem('mails', event.payload.messageId, { is_starred: false });
};

const handleFlagsAnswered: EventHandler<MessageFlagPayload> = async (event) => {
  await airsendDB.updateItem('mails', event.payload.messageId, { is_replied: true });
};

const handleFlagsForwarded: EventHandler<MessageFlagPayload> = async (event) => {
  await airsendDB.updateItem('mails', event.payload.messageId, { is_forwarded: true });
};

const handleFlagsImportant: EventHandler<MessageFlagPayload> = async (event) => {
  await airsendDB.updateItem('mails', event.payload.messageId, { is_important: true });
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
  // Delete all mails in that folder
  const mails = await airsendDB.query('mails', {
    where: { field: 'folder_path' as any, operator: 'equals', value: payload.folderName },
  });
  if (Array.isArray(mails) && mails.length > 0) {
    const ids = mails.map((m: any) => m.message_id);
    await airsendDB.bulkDeleteItems('mails', ids);
  }
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
  [BridgeEvent.MESSAGE_RECEIVED]: handleMessageReceived,
  [BridgeEvent.MESSAGE_SENT]: handleMessageReceived, // same shape as received
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
