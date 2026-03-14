package flush

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"time"

	"github.com/hibiken/asynq"
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/AirSend/workspace-server/internal/msgbuffer"
)

// ═══════════════════════════════════════════════════════════════════════════
// Flush Worker — drains PebbleDB buffer and batch-INSERTs into PostgreSQL.
//
// Runs as an Asynq periodic task (every 2 seconds) or can be enqueued
// on demand after a burst of writes.
// ═══════════════════════════════════════════════════════════════════════════

const (
	TypeFlushMessages = "messages:flush"
	BatchLimit        = 500 // max messages per flush cycle
)

// NewFlushTask creates an Asynq task (no payload needed).
func NewFlushTask() *asynq.Task {
	return asynq.NewTask(TypeFlushMessages, nil)
}

// FlushHandler processes the flush task.
type FlushHandler struct {
	buf *msgbuffer.Buffer
	db  *pgxpool.Pool
}

func NewFlushHandler(buf *msgbuffer.Buffer, db *pgxpool.Pool) *FlushHandler {
	return &FlushHandler{buf: buf, db: db}
}

func (h *FlushHandler) ProcessTask(ctx context.Context, _ *asynq.Task) error {
	msgs, err := h.buf.DrainAll(BatchLimit)
	if err != nil {
		return fmt.Errorf("drain pebble: %w", err)
	}
	if len(msgs) == 0 {
		return nil
	}

	if err := h.batchInsert(ctx, msgs); err != nil {
		// Re-buffer on failure so messages aren't lost
		for i := range msgs {
			_ = h.buf.Put(&msgs[i])
		}
		return fmt.Errorf("batch insert: %w", err)
	}

	log.Printf("[flush] persisted %d messages to postgres", len(msgs))
	return nil
}

// batchInsert uses a single multi-row INSERT for efficiency.
func (h *FlushHandler) batchInsert(ctx context.Context, msgs []msgbuffer.BufferedMessage) error {
	tx, err := h.db.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)

	// Build a multi-row INSERT
	// INSERT INTO workspace.messages (id, channel_id, sender_email, content, type, priority, parent_id, mentions, created_at)
	// VALUES ($1,$2,$3,...), ($9,$10,...) ...
	const cols = 9
	args := make([]interface{}, 0, len(msgs)*cols)
	query := `INSERT INTO workspace.messages (id, channel_id, sender_email, content, type, priority, parent_id, mentions, created_at) VALUES `

	for i, m := range msgs {
		if i > 0 {
			query += ","
		}
		base := i * cols
		query += fmt.Sprintf("($%d,$%d,$%d,$%d,$%d,$%d,$%d,$%d,$%d)",
			base+1, base+2, base+3, base+4, base+5, base+6, base+7, base+8, base+9)

		createdAt := time.Unix(0, m.CreatedAt).UTC()
		args = append(args, m.ID, m.ChannelID, m.SenderEmail, m.Content, m.Type, m.Priority, m.ParentID, m.Mentions, createdAt)
	}

	query += ` ON CONFLICT (id) DO NOTHING`

	if _, err := tx.Exec(ctx, query, args...); err != nil {
		return err
	}
	return tx.Commit(ctx)
}

// ── Asynq Scheduler setup helper ──

// SchedulerEntry returns a periodic task entry for the Asynq scheduler.
func SchedulerEntry() *asynq.PeriodicTaskConfig {
	return &asynq.PeriodicTaskConfig{
		Cronspec: "@every 2s",
		Task:     NewFlushTask(),
		Opts: []asynq.Option{
			asynq.MaxRetry(3),
			asynq.Timeout(30 * time.Second),
			asynq.Queue("critical"),
			asynq.Unique(2 * time.Second), // deduplicate overlapping flushes
		},
	}
}

// ── Standalone periodic flusher (no Redis required) ──

// StartPeriodicFlusher runs the flush loop in a goroutine, draining
// PebbleDB → PostgreSQL every `interval`. Use this when Redis/Asynq
// is not available.
func StartPeriodicFlusher(ctx context.Context, buf *msgbuffer.Buffer, db *pgxpool.Pool, interval time.Duration) {
	handler := NewFlushHandler(buf, db)
	go func() {
		ticker := time.NewTicker(interval)
		defer ticker.Stop()
		for {
			select {
			case <-ctx.Done():
				// Final drain on shutdown
				finalCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
				_ = handler.ProcessTask(finalCtx, nil)
				cancel()
				return
			case <-ticker.C:
				if err := handler.ProcessTask(ctx, nil); err != nil {
					log.Printf("[flush] error: %v", err)
				}
			}
		}
	}()
	log.Printf("[flush] periodic flusher started (interval: %s)", interval)
}

// ── Helper: marshal payload for Asynq task ──

func MarshalPayload(data interface{}) []byte {
	b, _ := json.Marshal(data)
	return b
}
