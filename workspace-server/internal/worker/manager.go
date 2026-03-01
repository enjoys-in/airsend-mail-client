package worker

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strings"
	"sync"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

// ═══════════════════════════════════════════════════════════════════════════
// Background Worker Manager — cron jobs and async task processing
// ═══════════════════════════════════════════════════════════════════════════

// Job is a recurring background task.
type Job struct {
	Name     string
	Interval time.Duration
	Fn       func(ctx context.Context) error
}

// Manager runs background jobs and processes async queues.
type Manager struct {
	db      *pgxpool.Pool
	jobs    []Job
	ctx     context.Context
	cancel  context.CancelFunc
	wg      sync.WaitGroup
	httpCli *http.Client
}

// NewManager creates a worker manager.
func NewManager(db *pgxpool.Pool) *Manager {
	ctx, cancel := context.WithCancel(context.Background())
	return &Manager{
		db:     db,
		ctx:    ctx,
		cancel: cancel,
		httpCli: &http.Client{
			Timeout: 10 * time.Second,
		},
	}
}

// Register adds a recurring job.
func (m *Manager) Register(name string, interval time.Duration, fn func(ctx context.Context) error) {
	m.jobs = append(m.jobs, Job{Name: name, Interval: interval, Fn: fn})
}

// Start launches all registered jobs and built-in workers.
func (m *Manager) Start() {
	// Register built-in jobs
	m.Register("cache_cleanup", 5*time.Minute, m.cleanupExpiredCache)
	m.Register("webhook_delivery", 30*time.Second, m.processWebhookDeliveries)
	m.Register("expire_invitations", 1*time.Hour, m.expireInvitations)
	m.Register("presence_cleanup", 2*time.Minute, m.cleanupStalePresence)

	for _, job := range m.jobs {
		m.wg.Add(1)
		go m.runJob(job)
	}

	log.Printf("[worker] started %d background jobs", len(m.jobs))
}

// Stop gracefully shuts down all workers.
func (m *Manager) Stop() {
	m.cancel()
	m.wg.Wait()
	log.Println("[worker] all background jobs stopped")
}

func (m *Manager) runJob(job Job) {
	defer m.wg.Done()
	ticker := time.NewTicker(job.Interval)
	defer ticker.Stop()

	log.Printf("[worker] job '%s' started (interval: %s)", job.Name, job.Interval)

	for {
		select {
		case <-m.ctx.Done():
			return
		case <-ticker.C:
			if err := job.Fn(m.ctx); err != nil {
				log.Printf("[worker] job '%s' error: %v", job.Name, err)
			}
		}
	}
}

// ── Built-in Jobs ──

// cleanupExpiredCache removes expired entries from public.api_cache.
func (m *Manager) cleanupExpiredCache(ctx context.Context) error {
	result, err := m.db.Exec(ctx, `DELETE FROM public.api_cache WHERE expires_at < NOW()`)
	if err != nil {
		return err
	}
	if result.RowsAffected() > 0 {
		log.Printf("[worker] cleaned %d expired cache entries", result.RowsAffected())
	}
	return nil
}

// processWebhookDeliveries processes pending webhook deliveries.
func (m *Manager) processWebhookDeliveries(ctx context.Context) error {
	rows, err := m.db.Query(ctx, `
		SELECT wd.id, wd.webhook_id, wd.payload, wd.attempts,
		       w.url, w.secret
		FROM workspace.webhook_deliveries wd
		INNER JOIN workspace.webhooks w ON w.id = wd.webhook_id
		WHERE wd.status IN ('pending', 'retrying')
			AND (wd.next_retry_at IS NULL OR wd.next_retry_at <= NOW())
			AND w.is_active = true
		ORDER BY wd.created_at ASC
		LIMIT 50
	`)
	if err != nil {
		return err
	}
	defer rows.Close()

	type delivery struct {
		ID        string
		WebhookID string
		Payload   string
		Attempts  int
		URL       string
		Secret    *string
	}

	var deliveries []delivery
	for rows.Next() {
		var d delivery
		if err := rows.Scan(&d.ID, &d.WebhookID, &d.Payload, &d.Attempts, &d.URL, &d.Secret); err != nil {
			return err
		}
		deliveries = append(deliveries, d)
	}

	for _, d := range deliveries {
		m.executeWebhookDelivery(ctx, d.ID, d.WebhookID, d.URL, d.Payload, d.Secret, d.Attempts)
	}

	return nil
}

func (m *Manager) executeWebhookDelivery(ctx context.Context, deliveryID, webhookID, url, payload string, secret *string, attempts int) {
	req, err := http.NewRequestWithContext(ctx, "POST", url, strings.NewReader(payload))
	if err != nil {
		m.failDelivery(ctx, deliveryID, attempts, err.Error())
		return
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("User-Agent", "AirSend-Webhook/1.0")
	if secret != nil && *secret != "" {
		req.Header.Set("X-Webhook-Secret", *secret)
	}

	resp, err := m.httpCli.Do(req)
	if err != nil {
		m.failDelivery(ctx, deliveryID, attempts, err.Error())
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 200 && resp.StatusCode < 300 {
		// Success
		m.db.Exec(ctx, `
			UPDATE workspace.webhook_deliveries
			SET status = 'success', response_status = $2, attempts = $3,
			    completed_at = NOW()
			WHERE id = $1
		`, deliveryID, resp.StatusCode, attempts+1)

		m.db.Exec(ctx, `
			UPDATE workspace.webhooks SET last_triggered_at = NOW(), failure_count = 0
			WHERE id = $1
		`, webhookID)
	} else {
		m.failDelivery(ctx, deliveryID, attempts, fmt.Sprintf("HTTP %d", resp.StatusCode))
	}
}

func (m *Manager) failDelivery(ctx context.Context, deliveryID string, attempts int, errMsg string) {
	maxRetries := 5
	newAttempts := attempts + 1

	if newAttempts >= maxRetries {
		m.db.Exec(ctx, `
			UPDATE workspace.webhook_deliveries
			SET status = 'failed', attempts = $2, response_body = $3, completed_at = NOW()
			WHERE id = $1
		`, deliveryID, newAttempts, errMsg)
		return
	}

	// Exponential backoff: 30s, 2m, 8m, 32m
	backoff := time.Duration(1<<uint(newAttempts)) * 30 * time.Second
	nextRetry := time.Now().Add(backoff)

	m.db.Exec(ctx, `
		UPDATE workspace.webhook_deliveries
		SET status = 'retrying', attempts = $2, response_body = $3, next_retry_at = $4
		WHERE id = $1
	`, deliveryID, newAttempts, errMsg, nextRetry)
}

// expireInvitations marks expired invitations.
func (m *Manager) expireInvitations(ctx context.Context) error {
	result, err := m.db.Exec(ctx, `
		UPDATE workspace.invitations SET status = 'expired'
		WHERE status = 'pending' AND expires_at < NOW()
	`)
	if err != nil {
		return err
	}
	if result.RowsAffected() > 0 {
		log.Printf("[worker] expired %d invitations", result.RowsAffected())
	}
	return nil
}

// cleanupStalePresence marks users offline who haven't been seen recently.
func (m *Manager) cleanupStalePresence(ctx context.Context) error {
	_, err := m.db.Exec(ctx, `
		UPDATE workspace.user_presence SET status = 'offline'
		WHERE status != 'offline' AND last_seen < NOW() - INTERVAL '5 minutes'
	`)
	return err
}

// ── QueueWebhookDelivery is called by services when events occur ──

func QueueWebhookDelivery(ctx context.Context, db *pgxpool.Pool, webhookID, eventID string, payload interface{}) error {
	data, err := json.Marshal(payload)
	if err != nil {
		return err
	}

	_, err = db.Exec(ctx, `
		INSERT INTO workspace.webhook_deliveries (webhook_id, event_id, payload, status)
		VALUES ($1, $2, $3, 'pending')
	`, webhookID, eventID, string(data))
	return err
}
