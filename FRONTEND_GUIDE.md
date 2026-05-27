# Frontend Event-Sync Integration Guide

## Quick Start

```ts
import { io } from 'socket.io-client';

const socket = io('https://your-api.com/mail', {
  transports: ['websocket'],
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
});
```

---

## Connection Flow

```
┌──────────────────────────────────────────────────────────────────┐
│ 1. Connect to /mail namespace                                     │
│ 2. Emit REGISTER_CLIENT with user email                          │
│ 3. Server responds with:                                          │
│    ├── @@SYNC_CURSOR { lastId }  — latest stream position        │
│    └── @@SYNC_REPLAY { events[], count } — initial/missed events │
│ 4. Process events → update UI state                              │
│ 5. ACK with @@SYNC_ACK { lastId } — save your cursor            │
│ 6. Listen for real-time events (message.received, etc.)          │
└──────────────────────────────────────────────────────────────────┘
```

---

## Socket Events Reference

### Client → Server (Emit)

| Event | Payload | When |
|-------|---------|------|
| `REGISTER_CLIENT` | `email: string` | Immediately after connect |
| `@@SYNC_RESUME` | `{ lastSeenId: string }` | On reconnect, send last known cursor |
| `@@SYNC_ACK` | `{ lastId: string }` | After processing replayed events |

### Server → Client (Listen)

| Event | Payload | When |
|-------|---------|------|
| `@@SYNC_CURSOR` | `{ lastId: string }` | After registration — latest stream ID |
| `@@SYNC_REPLAY` | `{ events: SyncEvent[], count: number }` | Initial state or missed events |
| `message.received` | `SyncEvent` | New mail arrived |
| `message.sent` | `SyncEvent` | Mail sent successfully |
| `message.deleted` | `SyncEvent` | Mail permanently deleted |
| `message.trashed` | `SyncEvent` | Mail moved to trash |
| `message.moved` | `SyncEvent` | Mail moved between folders |
| `message.copied` | `SyncEvent` | Mail copied to another folder |
| `message.spam` | `SyncEvent` | Mail marked as spam |
| `message.not_spam` | `SyncEvent` | Mail unmarked from spam |
| `message.draft.created` | `SyncEvent` | Draft saved |
| `message.draft.updated` | `SyncEvent` | Draft updated |
| `message.draft.deleted` | `SyncEvent` | Draft deleted |
| `message.bounced` | `SyncEvent` | Mail bounced |
| `message.flags.read` | `SyncEvent` | Marked as read |
| `message.flags.unread` | `SyncEvent` | Marked as unread |
| `message.flags.starred` | `SyncEvent` | Starred |
| `message.flags.unstarred` | `SyncEvent` | Unstarred |
| `message.flags.answered` | `SyncEvent` | Marked answered |
| `message.flags.forwarded` | `SyncEvent` | Marked forwarded |
| `message.flags.important` | `SyncEvent` | Marked important |
| `message.label.added` | `SyncEvent` | Label added to message |
| `message.label.removed` | `SyncEvent` | Label removed from message |
| `folder.created` | `SyncEvent` | New folder created |
| `folder.deleted` | `SyncEvent` | Folder deleted |
| `folder.renamed` | `SyncEvent` | Folder renamed |
| `folder.moved` | `SyncEvent` | Folder moved |
| `folder.emptied` | `SyncEvent` | Folder emptied (purged) |
| `mailbox.quota.warning` | `SyncEvent` | Quota near limit |
| `mailbox.quota.exceeded` | `SyncEvent` | Quota exceeded |
| `mailbox.settings.updated` | `SyncEvent` | Settings changed |
| `filter.created` | `SyncEvent` | Filter created |
| `filter.updated` | `SyncEvent` | Filter updated |
| `filter.deleted` | `SyncEvent` | Filter deleted |
| `filter.triggered` | `SyncEvent` | Filter auto-applied |
| `session.imap.connected` | `SyncEvent` | IMAP client connected |
| `session.imap.disconnected` | `SyncEvent` | IMAP client disconnected |

---

## SyncEvent Shape

Each event (both in `@@SYNC_REPLAY` array and individual real-time events) has this structure:

```ts
interface SyncEvent {
  eventId: string;       // Unique event ID (Redis stream ID)
  type: string;          // Event type, e.g. "message.received"
  payload: any;          // Event-specific data (see payload examples below)
  timestamp: number;     // Unix ms when event was created
  source: 'web' | 'imap' | 'smtp' | 'system' | 'api';
}
```

---

## Full Implementation Example

```ts
// ─── types.ts ───
interface SyncEvent {
  eventId: string;
  type: string;
  payload: any;
  timestamp: number;
  source: string;
}

// ─── mail-socket.ts ───
import { io, Socket } from 'socket.io-client';
import { decode } from '@msgpack/msgpack';

class MailSocket {
  private socket: Socket;
  private lastSeenId: string | null = null;
  private handlers: Map<string, ((event: SyncEvent) => void)[]> = new Map();

  constructor(private apiUrl: string) {
    this.socket = io(`${apiUrl}/mail`, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      autoConnect: false,
    });

    this.setupListeners();
  }

  // ─── Public API ───

  connect(email: string) {
    this.socket.connect();
    this.socket.on('connect', () => {
      this.socket.emit('REGISTER_CLIENT', email);
    });
  }

  disconnect() {
    this.socket.disconnect();
  }

  /**
   * Register a handler for a specific event type.
   * Works for both replay and real-time events.
   */
  on(eventType: string, handler: (event: SyncEvent) => void) {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);

      // Register socket listener for this event type (real-time)
      this.socket.on(eventType, (data: Uint8Array | SyncEvent) => {
        const event = data instanceof Uint8Array ? decode(data) as SyncEvent : data;
        this.processEvent(event);
      });
    }
    this.handlers.get(eventType)!.push(handler);
  }

  off(eventType: string, handler?: (event: SyncEvent) => void) {
    if (!handler) {
      this.handlers.delete(eventType);
      this.socket.off(eventType);
    } else {
      const arr = this.handlers.get(eventType);
      if (arr) {
        const idx = arr.indexOf(handler);
        if (idx >= 0) arr.splice(idx, 1);
      }
    }
  }

  // ─── Internal ───

  private setupListeners() {
    // Cursor — save the latest stream position
    this.socket.on('@@SYNC_CURSOR', (data: { lastId: string }) => {
      this.lastSeenId = data.lastId;
      this.persistCursor(data.lastId);
    });

    // Replay — process batch of events (initial state or missed)
    this.socket.on('@@SYNC_REPLAY', (data: { events: SyncEvent[]; count: number }) => {
      for (const event of data.events) {
        this.processEvent(event);
      }

      // ACK the last event so server saves our cursor
      const lastEvent = data.events[data.events.length - 1];
      if (lastEvent) {
        this.lastSeenId = lastEvent.eventId;
        this.persistCursor(lastEvent.eventId);
        this.socket.emit('@@SYNC_ACK', { lastId: lastEvent.eventId });
      }
    });

    // On reconnect — resume from last known position
    this.socket.on('reconnect', () => {
      const savedCursor = this.loadCursor();
      if (savedCursor) {
        this.socket.emit('@@SYNC_RESUME', { lastSeenId: savedCursor });
      }
    });
  }

  private processEvent(event: SyncEvent) {
    // Update cursor
    if (event.eventId && event.eventId > (this.lastSeenId || '0')) {
      this.lastSeenId = event.eventId;
    }

    // Dispatch to registered handlers
    const handlers = this.handlers.get(event.type);
    if (handlers) {
      for (const handler of handlers) {
        handler(event);
      }
    }

    // Also dispatch to wildcard '*' handlers
    const wildcardHandlers = this.handlers.get('*');
    if (wildcardHandlers) {
      for (const handler of wildcardHandlers) {
        handler(event);
      }
    }
  }

  private persistCursor(cursor: string) {
    try {
      localStorage.setItem('sync:cursor', cursor);
    } catch {}
  }

  private loadCursor(): string | null {
    try {
      return localStorage.getItem('sync:cursor');
    } catch {
      return null;
    }
  }
}

export default MailSocket;
```

---

## Usage in React

```tsx
// ─── hooks/useMailSocket.ts ───
import { useEffect, useRef } from 'react';
import MailSocket from '../lib/mail-socket';
import { useMailStore } from '../store/mail';

export function useMailSocket(email: string | null) {
  const socketRef = useRef<MailSocket | null>(null);
  const store = useMailStore();

  useEffect(() => {
    if (!email) return;

    const ms = new MailSocket(import.meta.env.VITE_API_URL);
    socketRef.current = ms;

    // ── Message Events ──
    ms.on('message.received', (e) => {
      store.addMail(e.payload);
      store.incrementUnread(e.payload.folder || 'INBOX');
    });

    ms.on('message.sent', (e) => {
      store.addToSent(e.payload);
    });

    ms.on('message.deleted', (e) => {
      store.removeMail(e.payload.messageId);
    });

    ms.on('message.trashed', (e) => {
      store.moveMail(e.payload.messageId, 'Trash');
    });

    ms.on('message.moved', (e) => {
      store.moveMail(e.payload.messageId, e.payload.toFolder);
    });

    ms.on('message.spam', (e) => {
      store.moveMail(e.payload.messageId, 'Spam');
    });

    // ── Flag Events ──
    ms.on('message.flags.read', (e) => {
      store.markRead(e.payload.messageId);
      store.decrementUnread(e.payload.folder);
    });

    ms.on('message.flags.unread', (e) => {
      store.markUnread(e.payload.messageId);
      store.incrementUnread(e.payload.folder);
    });

    ms.on('message.flags.starred', (e) => {
      store.setStar(e.payload.messageId, true);
    });

    ms.on('message.flags.unstarred', (e) => {
      store.setStar(e.payload.messageId, false);
    });

    // ── Folder Events ──
    ms.on('folder.created', (e) => {
      store.addFolder(e.payload.folderName);
    });

    ms.on('folder.deleted', (e) => {
      store.removeFolder(e.payload.folderName);
    });

    ms.on('folder.renamed', (e) => {
      store.renameFolder(e.payload.oldName, e.payload.newName);
    });

    ms.on('folder.emptied', (e) => {
      store.emptyFolder(e.payload.folderName);
    });

    // ── Mailbox Events ──
    ms.on('mailbox.quota.warning', (e) => {
      store.setQuotaWarning(e.payload);
    });

    ms.on('mailbox.settings.updated', (e) => {
      store.updateSettings(e.payload);
    });

    // ── Draft Events ──
    ms.on('message.draft.created', (e) => {
      store.addDraft(e.payload);
    });

    ms.on('message.draft.updated', (e) => {
      store.updateDraft(e.payload);
    });

    ms.on('message.draft.deleted', (e) => {
      store.removeDraft(e.payload.messageId);
    });

    // ── Label Events ──
    ms.on('message.label.added', (e) => {
      store.addLabel(e.payload.messageId, e.payload.label);
    });

    ms.on('message.label.removed', (e) => {
      store.removeLabel(e.payload.messageId, e.payload.label);
    });

    // Connect
    ms.connect(email);

    return () => {
      ms.disconnect();
      socketRef.current = null;
    };
  }, [email]);

  return socketRef;
}
```

```tsx
// ─── App.tsx (or layout) ───
import { useMailSocket } from './hooks/useMailSocket';
import { useAuthStore } from './store/auth';

function App() {
  const { user } = useAuthStore();
  useMailSocket(user?.email ?? null);

  return <MailLayout />;
}
```

---

## Usage in Vue 3

```ts
// ─── composables/useMailSocket.ts ───
import { onMounted, onUnmounted, watch } from 'vue';
import MailSocket from '../lib/mail-socket';
import { useMailStore } from '../store/mail';
import { useAuthStore } from '../store/auth';

export function useMailSocket() {
  const mailStore = useMailStore();
  const authStore = useAuthStore();
  let ms: MailSocket | null = null;

  function setup(email: string) {
    ms = new MailSocket(import.meta.env.VITE_API_URL);

    ms.on('message.received', (e) => mailStore.addMail(e.payload));
    ms.on('message.deleted', (e) => mailStore.removeMail(e.payload.messageId));
    ms.on('message.flags.read', (e) => mailStore.markRead(e.payload.messageId));
    ms.on('message.flags.starred', (e) => mailStore.setStar(e.payload.messageId, true));
    ms.on('message.moved', (e) => mailStore.moveMail(e.payload.messageId, e.payload.toFolder));
    ms.on('folder.created', (e) => mailStore.addFolder(e.payload.folderName));
    ms.on('folder.deleted', (e) => mailStore.removeFolder(e.payload.folderName));
    // ... add more handlers as needed

    ms.connect(email);
  }

  watch(() => authStore.user?.email, (email) => {
    if (ms) { ms.disconnect(); ms = null; }
    if (email) setup(email);
  }, { immediate: true });

  onUnmounted(() => {
    if (ms) ms.disconnect();
  });
}
```

---

## Reconnection & Offline Handling

```ts
// The MailSocket class handles reconnection automatically:
//
// 1. Socket.IO reconnects with exponential backoff
// 2. On reconnect → emits @@SYNC_RESUME with last cursor
// 3. Server replays all missed events
// 4. Client processes them → UI is up to date
//
// For offline-first apps, you can queue optimistic updates:

class OfflineQueue {
  private queue: Array<{ action: string; payload: any; timestamp: number }> = [];

  add(action: string, payload: any) {
    this.queue.push({ action, payload, timestamp: Date.now() });
    this.persist();
  }

  flush(apiClient: any) {
    while (this.queue.length > 0) {
      const item = this.queue.shift()!;
      apiClient.post(`/mail/${item.action}`, item.payload).catch(() => {
        // Re-queue on failure
        this.queue.unshift(item);
        this.persist();
      });
    }
    this.persist();
  }

  private persist() {
    localStorage.setItem('offline:queue', JSON.stringify(this.queue));
  }

  load() {
    try {
      this.queue = JSON.parse(localStorage.getItem('offline:queue') || '[]');
    } catch {
      this.queue = [];
    }
  }
}
```

---

## Event Payload Examples

### message.received
```json
{
  "messageId": "<abc123@airsend.in>",
  "uid": 1542,
  "folder": "INBOX",
  "from": { "name": "John Doe", "address": "john@example.com" },
  "to": [{ "name": "Me", "address": "user@airsend.in" }],
  "subject": "Meeting Tomorrow",
  "snippet": "Hey, just wanted to confirm our meeting...",
  "date": "2026-05-27T10:30:00.000Z",
  "hasAttachments": true,
  "isRead": false,
  "flags": []
}
```

### message.flags.read
```json
{
  "messageId": "<abc123@airsend.in>",
  "uid": 1542,
  "folder": "INBOX"
}
```

### message.moved
```json
{
  "messageId": "<abc123@airsend.in>",
  "uid": 1542,
  "fromFolder": "INBOX",
  "toFolder": "Archive"
}
```

### message.deleted
```json
{
  "messageId": "<abc123@airsend.in>",
  "uid": 1542,
  "folder": "Trash"
}
```

### message.flags.starred
```json
{
  "messageId": "<abc123@airsend.in>",
  "uid": 1542,
  "folder": "INBOX",
  "starred": true
}
```

### folder.created
```json
{
  "folderName": "Projects/Active",
  "parentFolder": "Projects"
}
```

### folder.renamed
```json
{
  "oldName": "Projects/Active",
  "newName": "Projects/Current"
}
```

### mailbox.quota.warning
```json
{
  "used": 4831838208,
  "limit": 5368709120,
  "percentage": 90
}
```

### message.label.added
```json
{
  "messageId": "<abc123@airsend.in>",
  "label": "important",
  "color": "#ff0000"
}
```

---

## Deduplication (Client-Side)

Events have unique `eventId` values. To prevent duplicate processing (e.g., during replay + real-time overlap):

```ts
class EventDeduplicator {
  private seen = new Set<string>();
  private maxSize = 1000;

  isDuplicate(eventId: string): boolean {
    if (this.seen.has(eventId)) return true;
    this.seen.add(eventId);
    if (this.seen.size > this.maxSize) {
      // Evict oldest entries
      const arr = Array.from(this.seen);
      this.seen = new Set(arr.slice(arr.length - 500));
    }
    return false;
  }
}

// In MailSocket.processEvent():
private dedup = new EventDeduplicator();

private processEvent(event: SyncEvent) {
  if (this.dedup.isDuplicate(event.eventId)) return;
  // ... rest of processing
}
```

---

## Msgpack Decoding

Real-time events are encoded with msgpack for efficiency. The `@@SYNC_REPLAY` payload is JSON. Individual real-time events may arrive as `Uint8Array`:

```ts
import { decode } from '@msgpack/msgpack';

socket.on('message.received', (raw: Uint8Array | object) => {
  const event = raw instanceof Uint8Array ? decode(raw) as SyncEvent : raw;
  // process event
});
```

The `MailSocket` class above handles this automatically.

---

## Testing Locally

```bash
# 1. Start the API server
cd apiv1 && npm run start:dev

# 2. Quick socket test (Node.js script)
node -e "
const { io } = require('socket.io-client');
const socket = io('http://localhost:3000/mail', { transports: ['websocket'] });

socket.on('connect', () => {
  console.log('Connected:', socket.id);
  socket.emit('REGISTER_CLIENT', 'test@airsend.in');
});

socket.on('@@SYNC_CURSOR', (data) => console.log('Cursor:', data));
socket.on('@@SYNC_REPLAY', (data) => console.log('Replay:', data.count, 'events'));
socket.on('message.received', (data) => console.log('New mail:', data));
"
```

---

## Constants Summary

```ts
// Use these exact strings in your socket event listeners:

// Client emits:
const REGISTER_CLIENT = 'REGISTER_CLIENT';
const SYNC_RESUME     = '@@SYNC_RESUME';
const SYNC_ACK        = '@@SYNC_ACK';

// Server emits:
const SYNC_CURSOR     = '@@SYNC_CURSOR';
const SYNC_REPLAY     = '@@SYNC_REPLAY';

// Real-time events — server emits event.type directly as the event name:
// 'message.received', 'message.sent', 'message.deleted', etc.
```
