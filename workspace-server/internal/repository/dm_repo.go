package repository

import (
	"context"

	"github.com/AirSend/workspace-server/internal/models"
	"github.com/jackc/pgx/v5/pgxpool"
)

// ═══════════════════════════════════════════════════════════════════════════
// DMRepo — struct-based implementation of domain.DMRepository
// ═══════════════════════════════════════════════════════════════════════════

type DMRepo struct {
	db *pgxpool.Pool
}

func NewDMRepo(db *pgxpool.Pool) *DMRepo {
	return &DMRepo{db: db}
}

func (r *DMRepo) ListConversations(ctx context.Context, email string) ([]models.DMConversation, error) {
	rows, err := r.db.Query(ctx, `
		SELECT DISTINCT dc.id, dc.created_at, dc.updated_at
		FROM workspace.dm_conversations dc
		INNER JOIN workspace.dm_participants dp ON dp.conversation_id = dc.id
		WHERE dp.email = $1
		ORDER BY dc.updated_at DESC
	`, email)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var convos []models.DMConversation
	for rows.Next() {
		var c models.DMConversation
		if err := rows.Scan(&c.ID, &c.CreatedAt, &c.UpdatedAt); err != nil {
			return nil, err
		}

		parts, _ := r.getParticipants(ctx, c.ID)
		c.Participants = parts

		last, _ := r.getLastMessage(ctx, c.ID)
		if last != nil {
			c.LastMessage = last
		}

		convos = append(convos, c)
	}
	return convos, nil
}

func (r *DMRepo) GetConversation(ctx context.Context, dmID string) (*models.DMConversation, error) {
	var c models.DMConversation
	err := r.db.QueryRow(ctx, `
		SELECT id, created_at, updated_at
		FROM workspace.dm_conversations WHERE id = $1
	`, dmID).Scan(&c.ID, &c.CreatedAt, &c.UpdatedAt)
	if err != nil {
		return nil, err
	}

	parts, _ := r.getParticipants(ctx, c.ID)
	c.Participants = parts
	return &c, nil
}

func (r *DMRepo) CreateConversation(ctx context.Context, senderEmail, recipientEmail string) (*models.DMConversation, error) {
	// Check existing
	var existingID string
	err := r.db.QueryRow(ctx, `
		SELECT dp1.conversation_id
		FROM workspace.dm_participants dp1
		INNER JOIN workspace.dm_participants dp2 ON dp1.conversation_id = dp2.conversation_id
		WHERE dp1.email = $1 AND dp2.email = $2
		LIMIT 1
	`, senderEmail, recipientEmail).Scan(&existingID)
	if err == nil {
		return r.GetConversation(ctx, existingID)
	}

	tx, err := r.db.Begin(ctx)
	if err != nil {
		return nil, err
	}
	defer tx.Rollback(ctx)

	var c models.DMConversation
	err = tx.QueryRow(ctx, `
		INSERT INTO workspace.dm_conversations DEFAULT VALUES
		RETURNING id, created_at, updated_at
	`).Scan(&c.ID, &c.CreatedAt, &c.UpdatedAt)
	if err != nil {
		return nil, err
	}

	for _, email := range []string{senderEmail, recipientEmail} {
		_, err = tx.Exec(ctx, `
			INSERT INTO workspace.dm_participants (conversation_id, email, display_name)
			SELECT $1, $2, ma.name
			FROM public.mail_accounts ma WHERE ma.email = $2
		`, c.ID, email)
		if err != nil {
			return nil, err
		}
	}

	if err := tx.Commit(ctx); err != nil {
		return nil, err
	}

	parts, _ := r.getParticipants(ctx, c.ID)
	c.Participants = parts
	return &c, nil
}

func (r *DMRepo) ListMessages(ctx context.Context, dmID string, page, limit int) ([]models.DMMessage, int, error) {
	offset := (page - 1) * limit

	var total int
	err := r.db.QueryRow(ctx, `
		SELECT COUNT(*) FROM workspace.dm_messages WHERE conversation_id = $1
	`, dmID).Scan(&total)
	if err != nil {
		return nil, 0, err
	}

	rows, err := r.db.Query(ctx, `
		SELECT dm.id, dm.conversation_id, dm.sender_email, dm.content,
		       dm.is_edited, dm.is_deleted, dm.created_at, dm.updated_at,
		       ma.name AS sender_name
		FROM workspace.dm_messages dm
		LEFT JOIN public.mail_accounts ma ON ma.email = dm.sender_email
		WHERE dm.conversation_id = $1
		ORDER BY dm.created_at ASC
		LIMIT $2 OFFSET $3
	`, dmID, limit, offset)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var msgs []models.DMMessage
	for rows.Next() {
		var m models.DMMessage
		if err := rows.Scan(&m.ID, &m.ConversationID, &m.SenderEmail,
			&m.Content, &m.IsEdited, &m.IsDeleted,
			&m.CreatedAt, &m.UpdatedAt, &m.SenderName); err != nil {
			return nil, 0, err
		}
		msgs = append(msgs, m)
	}
	return msgs, total, nil
}

func (r *DMRepo) SendMessage(ctx context.Context, dmID string, input models.SendDMInput, senderEmail string) (*models.DMMessage, error) {
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return nil, err
	}
	defer tx.Rollback(ctx)

	var m models.DMMessage
	err = tx.QueryRow(ctx, `
		INSERT INTO workspace.dm_messages (conversation_id, sender_email, content)
		VALUES ($1, $2, $3)
		RETURNING id, conversation_id, sender_email, content, is_edited, is_deleted, created_at, updated_at
	`, dmID, senderEmail, input.Content,
	).Scan(&m.ID, &m.ConversationID, &m.SenderEmail,
		&m.Content, &m.IsEdited, &m.IsDeleted, &m.CreatedAt, &m.UpdatedAt)
	if err != nil {
		return nil, err
	}

	tx.Exec(ctx, `UPDATE workspace.dm_conversations SET updated_at = NOW() WHERE id = $1`, dmID)
	return &m, tx.Commit(ctx)
}

// ── helpers ──

func (r *DMRepo) getParticipants(ctx context.Context, dmID string) ([]models.DMParticipant, error) {
	rows, err := r.db.Query(ctx, `
		SELECT dp.email, dp.display_name, COALESCE(tm.status, 'offline') AS status,
		       dp.last_read_at, ma.name AS account_name
		FROM workspace.dm_participants dp
		LEFT JOIN public.mail_accounts ma ON ma.email = dp.email
		LEFT JOIN LATERAL (
			SELECT status FROM workspace.team_members
			WHERE email = dp.email
			ORDER BY joined_at DESC LIMIT 1
		) tm ON true
		WHERE dp.conversation_id = $1
	`, dmID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var parts []models.DMParticipant
	for rows.Next() {
		var p models.DMParticipant
		if err := rows.Scan(&p.Email, &p.DisplayName, &p.Status,
			&p.LastReadAt, &p.AccountName); err != nil {
			return nil, err
		}
		parts = append(parts, p)
	}
	return parts, nil
}

func (r *DMRepo) getLastMessage(ctx context.Context, dmID string) (*models.DMMessage, error) {
	var m models.DMMessage
	err := r.db.QueryRow(ctx, `
		SELECT dm.id, dm.conversation_id, dm.sender_email, dm.content,
		       dm.is_edited, dm.is_deleted, dm.created_at, dm.updated_at,
		       ma.name AS sender_name
		FROM workspace.dm_messages dm
		LEFT JOIN public.mail_accounts ma ON ma.email = dm.sender_email
		WHERE dm.conversation_id = $1
		ORDER BY dm.created_at DESC LIMIT 1
	`, dmID).Scan(&m.ID, &m.ConversationID, &m.SenderEmail,
		&m.Content, &m.IsEdited, &m.IsDeleted,
		&m.CreatedAt, &m.UpdatedAt, &m.SenderName)
	if err != nil {
		return nil, nil
	}
	return &m, nil
}
