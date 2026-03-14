package msgbuffer

import (
	"encoding/json"
	"fmt"
	"log"
	"time"

	badger "github.com/dgraph-io/badger/v4"
)

// ═══════════════════════════════════════════════════════════════════════════
// Buffer — fast temporary message store backed by BadgerDB (LSM).
//
// Key format:  msg:<channelID>:<sortable-timestamp-nanos-hex>:<messageID>
// Value:       JSON-encoded BufferedMessage
//
// Messages are written here instantly on send, broadcast via WS, and later
// flushed to PostgreSQL in batches by the flush worker.
// ═══════════════════════════════════════════════════════════════════════════

// BufferedMessage is what gets stored in BadgerDB before flush.
type BufferedMessage struct {
	ID          string   `json:"id"`
	ChannelID   string   `json:"channel_id"`
	SenderEmail string   `json:"sender_email"`
	Content     string   `json:"content"`
	Type        string   `json:"type"`
	Priority    string   `json:"priority"`
	ParentID    *string  `json:"parent_id,omitempty"`
	Mentions    []string `json:"mentions,omitempty"`
	CreatedAt   int64    `json:"created_at"` // unix nanos
}

type Buffer struct {
	db *badger.DB
}

// Open creates or opens a BadgerDB at the given directory.
func Open(dir string) (*Buffer, error) {
	opts := badger.DefaultOptions(dir).
		WithLoggingLevel(badger.WARNING)
	db, err := badger.Open(opts)
	if err != nil {
		return nil, fmt.Errorf("badger open: %w", err)
	}
	// Run GC periodically in background
	go func() {
		ticker := time.NewTicker(5 * time.Minute)
		defer ticker.Stop()
		for range ticker.C {
			_ = db.RunValueLogGC(0.5)
		}
	}()
	return &Buffer{db: db}, nil
}

// Close shuts down BadgerDB.
func (b *Buffer) Close() error {
	return b.db.Close()
}

// ── Key helpers ──

func msgKey(channelID string, createdAt int64, msgID string) []byte {
	return []byte(fmt.Sprintf("msg:%s:%016x:%s", channelID, createdAt, msgID))
}

func channelPrefix(channelID string) []byte {
	return []byte(fmt.Sprintf("msg:%s:", channelID))
}

func allMsgPrefix() []byte {
	return []byte("msg:")
}

// ── Write ──

// Put stores a message in BadgerDB.
func (b *Buffer) Put(msg *BufferedMessage) error {
	if msg.CreatedAt == 0 {
		msg.CreatedAt = time.Now().UnixNano()
	}
	val, err := json.Marshal(msg)
	if err != nil {
		return err
	}
	key := msgKey(msg.ChannelID, msg.CreatedAt, msg.ID)
	return b.db.Update(func(txn *badger.Txn) error {
		return txn.Set(key, val)
	})
}

// Delete removes a single buffered message.
func (b *Buffer) Delete(channelID string, createdAt int64, msgID string) error {
	key := msgKey(channelID, createdAt, msgID)
	return b.db.Update(func(txn *badger.Txn) error {
		return txn.Delete(key)
	})
}

// ── Read (for hybrid fetch) ──

// LatestForChannel returns the most recent `limit` buffered messages for a
// channel, ordered oldest-first (ascending by timestamp).
func (b *Buffer) LatestForChannel(channelID string, limit int) ([]BufferedMessage, error) {
	prefix := channelPrefix(channelID)
	var all []BufferedMessage

	err := b.db.View(func(txn *badger.Txn) error {
		opts := badger.DefaultIteratorOptions
		opts.Prefix = prefix
		it := txn.NewIterator(opts)
		defer it.Close()

		for it.Seek(prefix); it.ValidForPrefix(prefix); it.Next() {
			item := it.Item()
			if err := item.Value(func(val []byte) error {
				var m BufferedMessage
				if err := json.Unmarshal(val, &m); err != nil {
					return nil // skip corrupt entries
				}
				all = append(all, m)
				return nil
			}); err != nil {
				continue
			}
		}
		return nil
	})
	if err != nil {
		return nil, err
	}

	if len(all) > limit {
		all = all[len(all)-limit:]
	}
	return all, nil
}

// ── Drain (for batch flush) ──

// DrainAll returns ALL buffered messages (across all channels) and deletes
// them from BadgerDB atomically. Used by the flush worker.
func (b *Buffer) DrainAll(batchLimit int) ([]BufferedMessage, error) {
	prefix := allMsgPrefix()
	var msgs []BufferedMessage
	var keysToDelete [][]byte

	// Read phase
	err := b.db.View(func(txn *badger.Txn) error {
		opts := badger.DefaultIteratorOptions
		opts.Prefix = prefix
		it := txn.NewIterator(opts)
		defer it.Close()

		for it.Seek(prefix); it.ValidForPrefix(prefix); it.Next() {
			if len(msgs) >= batchLimit {
				break
			}
			item := it.Item()
			keyCopy := item.KeyCopy(nil)
			if err := item.Value(func(val []byte) error {
				var m BufferedMessage
				if err := json.Unmarshal(val, &m); err != nil {
					return nil
				}
				msgs = append(msgs, m)
				keysToDelete = append(keysToDelete, keyCopy)
				return nil
			}); err != nil {
				continue
			}
		}
		return nil
	})
	if err != nil {
		return nil, err
	}

	if len(msgs) == 0 {
		return nil, nil
	}

	// Delete phase
	wb := b.db.NewWriteBatch()
	for _, k := range keysToDelete {
		if err := wb.Delete(k); err != nil {
			wb.Cancel()
			return nil, fmt.Errorf("batch delete: %w", err)
		}
	}
	if err := wb.Flush(); err != nil {
		return nil, fmt.Errorf("batch flush: %w", err)
	}

	log.Printf("[msgbuffer] drained %d messages", len(msgs))
	return msgs, nil
}

// CountForChannel returns the number of buffered messages for a channel.
func (b *Buffer) CountForChannel(channelID string) (int, error) {
	prefix := channelPrefix(channelID)
	count := 0
	err := b.db.View(func(txn *badger.Txn) error {
		opts := badger.DefaultIteratorOptions
		opts.PrefetchValues = false
		opts.Prefix = prefix
		it := txn.NewIterator(opts)
		defer it.Close()
		for it.Seek(prefix); it.ValidForPrefix(prefix); it.Next() {
			count++
		}
		return nil
	})
	return count, err
}
