package repository

import (
	"context"

	"github.com/AirSend/workspace-server/internal/models"
	"github.com/jackc/pgx/v5/pgxpool"
)

// ═══════════════════════════════════════════════════════════════════════════
// WebhookRepo — CRUD for webhooks and delivery tracking
// ═══════════════════════════════════════════════════════════════════════════

type WebhookRepo struct {
	db *pgxpool.Pool
}

func NewWebhookRepo(db *pgxpool.Pool) *WebhookRepo {
	return &WebhookRepo{db: db}
}

func (r *WebhookRepo) List(ctx context.Context, teamID string) ([]models.Webhook, error) {
	rows, err := r.db.Query(ctx, `
		SELECT id, team_id, name, url, secret, events, is_active,
		       created_by, last_triggered_at, failure_count, created_at, updated_at
		FROM workspace.webhooks WHERE team_id = $1
		ORDER BY created_at DESC
	`, teamID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var webhooks []models.Webhook
	for rows.Next() {
		var w models.Webhook
		if err := rows.Scan(&w.ID, &w.TeamID, &w.Name, &w.URL, &w.Secret,
			&w.Events, &w.IsActive, &w.CreatedBy, &w.LastTriggeredAt,
			&w.FailureCount, &w.CreatedAt, &w.UpdatedAt); err != nil {
			return nil, err
		}
		webhooks = append(webhooks, w)
	}
	return webhooks, nil
}

func (r *WebhookRepo) GetByID(ctx context.Context, id string) (*models.Webhook, error) {
	var w models.Webhook
	err := r.db.QueryRow(ctx, `
		SELECT id, team_id, name, url, secret, events, is_active,
		       created_by, last_triggered_at, failure_count, created_at, updated_at
		FROM workspace.webhooks WHERE id = $1
	`, id).Scan(&w.ID, &w.TeamID, &w.Name, &w.URL, &w.Secret,
		&w.Events, &w.IsActive, &w.CreatedBy, &w.LastTriggeredAt,
		&w.FailureCount, &w.CreatedAt, &w.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return &w, nil
}

func (r *WebhookRepo) Create(ctx context.Context, input models.CreateWebhookInput, createdBy string) (*models.Webhook, error) {
	var w models.Webhook
	err := r.db.QueryRow(ctx, `
		INSERT INTO workspace.webhooks (team_id, name, url, secret, events, created_by)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING id, team_id, name, url, secret, events, is_active,
		          created_by, last_triggered_at, failure_count, created_at, updated_at
	`, input.TeamID, input.Name, input.URL, input.Secret, input.Events, createdBy,
	).Scan(&w.ID, &w.TeamID, &w.Name, &w.URL, &w.Secret,
		&w.Events, &w.IsActive, &w.CreatedBy, &w.LastTriggeredAt,
		&w.FailureCount, &w.CreatedAt, &w.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return &w, nil
}

func (r *WebhookRepo) Delete(ctx context.Context, id string) error {
	_, err := r.db.Exec(ctx, `DELETE FROM workspace.webhooks WHERE id = $1`, id)
	return err
}

func (r *WebhookRepo) ListByEvent(ctx context.Context, teamID, eventType string) ([]models.Webhook, error) {
	rows, err := r.db.Query(ctx, `
		SELECT id, team_id, name, url, secret, events, is_active,
		       created_by, last_triggered_at, failure_count, created_at, updated_at
		FROM workspace.webhooks
		WHERE team_id = $1 AND is_active = true AND $2 = ANY(events)
	`, teamID, eventType)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var webhooks []models.Webhook
	for rows.Next() {
		var w models.Webhook
		if err := rows.Scan(&w.ID, &w.TeamID, &w.Name, &w.URL, &w.Secret,
			&w.Events, &w.IsActive, &w.CreatedBy, &w.LastTriggeredAt,
			&w.FailureCount, &w.CreatedAt, &w.UpdatedAt); err != nil {
			return nil, err
		}
		webhooks = append(webhooks, w)
	}
	return webhooks, nil
}

func (r *WebhookRepo) CreateDelivery(ctx context.Context, delivery models.WebhookDelivery) error {
	_, err := r.db.Exec(ctx, `
		INSERT INTO workspace.webhook_deliveries (webhook_id, event_id, payload, status)
		VALUES ($1, $2, $3, $4)
	`, delivery.WebhookID, delivery.EventID, delivery.Payload, delivery.Status)
	return err
}

func (r *WebhookRepo) GetPendingDeliveries(ctx context.Context, limit int) ([]models.WebhookDelivery, error) {
	rows, err := r.db.Query(ctx, `
		SELECT id, webhook_id, event_id, payload, response_status, response_body,
		       status, attempts, next_retry_at, created_at, completed_at
		FROM workspace.webhook_deliveries
		WHERE status IN ('pending', 'retrying')
		ORDER BY created_at ASC LIMIT $1
	`, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var deliveries []models.WebhookDelivery
	for rows.Next() {
		var d models.WebhookDelivery
		if err := rows.Scan(&d.ID, &d.WebhookID, &d.EventID, &d.Payload,
			&d.ResponseStatus, &d.ResponseBody, &d.Status, &d.Attempts,
			&d.NextRetryAt, &d.CreatedAt, &d.CompletedAt); err != nil {
			return nil, err
		}
		deliveries = append(deliveries, d)
	}
	return deliveries, nil
}
