/**
 * Event Bridge Constants
 * All socket event names and sync protocol constants.
 */

// ─── Sync Protocol (Client ↔ Server) ───

export const enum SyncProtocol {
  /** Client → Server: Register this client for events */
  REGISTER_CLIENT = '@@REGISTER_CLIENT',
  /** Server → Client: Latest stream cursor position */
  SYNC_CURSOR = '@@SYNC_CURSOR',
  /** Server → Client: Batch of missed/initial events */
  SYNC_REPLAY = '@@SYNC_REPLAY',
  /** Client → Server: Acknowledge processed events */
  SYNC_ACK = '@@SYNC_ACK',
  /** Client → Server: Resume from last known cursor */
  SYNC_RESUME = '@@SYNC_RESUME',
}

// ─── Real-time Event Types ───

export const enum BridgeEvent {
  // Messages
  MESSAGE_RECEIVED = 'message.received',
  MESSAGE_SENT = 'message.sent',
  MESSAGE_DELETED = 'message.deleted',
  MESSAGE_TRASHED = 'message.trashed',
  MESSAGE_MOVED = 'message.moved',
  MESSAGE_COPIED = 'message.copied',
  MESSAGE_SPAM = 'message.spam',
  MESSAGE_NOT_SPAM = 'message.not_spam',
  MESSAGE_BOUNCED = 'message.bounced',

  // Drafts
  DRAFT_CREATED = 'message.draft.created',
  DRAFT_UPDATED = 'message.draft.updated',
  DRAFT_DELETED = 'message.draft.deleted',

  // Flags
  FLAGS_READ = 'message.flags.read',
  FLAGS_UNREAD = 'message.flags.unread',
  FLAGS_STARRED = 'message.flags.starred',
  FLAGS_UNSTARRED = 'message.flags.unstarred',
  FLAGS_ANSWERED = 'message.flags.answered',
  FLAGS_FORWARDED = 'message.flags.forwarded',
  FLAGS_IMPORTANT = 'message.flags.important',

  // Labels
  LABEL_ADDED = 'message.label.added',
  LABEL_REMOVED = 'message.label.removed',

  // Folders
  FOLDER_CREATED = 'folder.created',
  FOLDER_DELETED = 'folder.deleted',
  FOLDER_RENAMED = 'folder.renamed',
  FOLDER_MOVED = 'folder.moved',
  FOLDER_EMPTIED = 'folder.emptied',

  // Mailbox
  QUOTA_WARNING = 'mailbox.quota.warning',
  QUOTA_EXCEEDED = 'mailbox.quota.exceeded',
  SETTINGS_UPDATED = 'mailbox.settings.updated',

  // Filters
  FILTER_CREATED = 'filter.created',
  FILTER_UPDATED = 'filter.updated',
  FILTER_DELETED = 'filter.deleted',
  FILTER_TRIGGERED = 'filter.triggered',

  // Session
  IMAP_CONNECTED = 'session.imap.connected',
  IMAP_DISCONNECTED = 'session.imap.disconnected',
}

// ─── Sync State ───

export const enum SyncStatus {
  /** Initial state before first sync */
  INITIALIZING = 'initializing',
  /** Currently receiving and processing events */
  SYNCING = 'syncing',
  /** Fully synced and idle */
  IDLE = 'idle',
  /** Sync error occurred */
  ERROR = 'error',
}

// ─── Dexie Table Keys ───

export const SYNC_META_TABLE = 'sync_meta' as const;
export const SYNC_CURSOR_KEY = 'last_sync_cursor' as const;
export const SYNC_TIMESTAMP_KEY = 'last_sync_timestamp' as const;

// ─── All subscribable real-time events ───

export const ALL_BRIDGE_EVENTS: string[] = [
  BridgeEvent.MESSAGE_RECEIVED,
  BridgeEvent.MESSAGE_SENT,
  BridgeEvent.MESSAGE_DELETED,
  BridgeEvent.MESSAGE_TRASHED,
  BridgeEvent.MESSAGE_MOVED,
  BridgeEvent.MESSAGE_COPIED,
  BridgeEvent.MESSAGE_SPAM,
  BridgeEvent.MESSAGE_NOT_SPAM,
  BridgeEvent.MESSAGE_BOUNCED,
  BridgeEvent.DRAFT_CREATED,
  BridgeEvent.DRAFT_UPDATED,
  BridgeEvent.DRAFT_DELETED,
  BridgeEvent.FLAGS_READ,
  BridgeEvent.FLAGS_UNREAD,
  BridgeEvent.FLAGS_STARRED,
  BridgeEvent.FLAGS_UNSTARRED,
  BridgeEvent.FLAGS_ANSWERED,
  BridgeEvent.FLAGS_FORWARDED,
  BridgeEvent.FLAGS_IMPORTANT,
  BridgeEvent.LABEL_ADDED,
  BridgeEvent.LABEL_REMOVED,
  BridgeEvent.FOLDER_CREATED,
  BridgeEvent.FOLDER_DELETED,
  BridgeEvent.FOLDER_RENAMED,
  BridgeEvent.FOLDER_MOVED,
  BridgeEvent.FOLDER_EMPTIED,
  BridgeEvent.QUOTA_WARNING,
  BridgeEvent.QUOTA_EXCEEDED,
  BridgeEvent.SETTINGS_UPDATED,
  BridgeEvent.FILTER_CREATED,
  BridgeEvent.FILTER_UPDATED,
  BridgeEvent.FILTER_DELETED,
  BridgeEvent.FILTER_TRIGGERED,
  BridgeEvent.IMAP_CONNECTED,
  BridgeEvent.IMAP_DISCONNECTED,
];
