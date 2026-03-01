package repository

import (
	"context"

	"github.com/AirSend/workspace-server/internal/models"
	"github.com/jackc/pgx/v5/pgxpool"
)

// ═══════════════════════════════════════════════════════════════════════════
// MessageRepo — struct-based implementation of domain.MessageRepository
// ═══════════════════════════════════════════════════════════════════════════

type MessageRepo struct {
	db *pgxpool.Pool
}

func NewMessageRepo(db *pgxpool.Pool) *MessageRepo {
	return &MessageRepo{db: db}
}

func (r *MessageRepo) List(ctx context.Context, channelID string, page, limit int) ([]models.Message, int, error) {
	offset := (page - 1) * limit

	var total int
	err := r.db.QueryRow(ctx, `
		SELECT COUNT(*) FROM workspace.messages
		WHERE channel_id = $1 AND parent_id IS NULL
	`, channelID).Scan(&total)
	if err != nil {
		return nil, 0, err
	}

	rows, err := r.db.Query(ctx, `
		SELECT m.id, m.channel_id, m.sender_email, m.content, m.type, m.priority,
		       m.parent_id, m.is_pinned, m.is_edited, m.is_deleted,
		       m.mentions, m.created_at, m.updated_at,
		       ma.name AS sender_name,
		       (SELECT COUNT(*) FROM workspace.messages r WHERE r.parent_id = m.id) AS reply_count
		FROM workspace.messages m
		LEFT JOIN public.mail_accounts ma ON ma.email = m.sender_email
		WHERE m.channel_id = $1 AND m.parent_id IS NULL
		ORDER BY m.created_at ASC
		LIMIT $2 OFFSET $3
	`, channelID, limit, offset)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var messages []models.Message
	for rows.Next() {
		var msg models.Message
		if err := rows.Scan(
			&msg.ID, &msg.ChannelID, &msg.SenderEmail, &msg.Content, &msg.Type, &msg.Priority,
			&msg.ParentID, &msg.IsPinned, &msg.IsEdited, &msg.IsDeleted,
			&msg.Mentions, &msg.CreatedAt, &msg.UpdatedAt,
			&msg.SenderName, &msg.ReplyCount,
		); err != nil {
			return nil, 0, err
		}
		messages = append(messages, msg)
	}

	if len(messages) > 0 {
		ids := make([]string, len(messages))
		for i, m := range messages {
			ids[i] = m.ID
		}
		r.batchLoadReactions(ctx, messages, ids)
		r.batchLoadAttachments(ctx, messages, ids)
	}

	return messages, total, nil
}

func (r *MessageRepo) GetByID(ctx context.Context, messageID string) (*models.Message, error) {
	var msg models.Message
	err := r.db.QueryRow(ctx, `
		SELECT m.id, m.channel_id, m.sender_email, m.content, m.type, m.priority,
		       m.parent_id, m.is_pinned, m.is_edited, m.is_deleted,
		       m.mentions, m.created_at, m.updated_at,
		       ma.name AS sender_name,
		       (SELECT COUNT(*) FROM workspace.messages r WHERE r.parent_id = m.id) AS reply_count
		FROM workspace.messages m
		LEFT JOIN public.mail_accounts ma ON ma.email = m.sender_email
		WHERE m.id = $1
	`, messageID).Scan(
		&msg.ID, &msg.ChannelID, &msg.SenderEmail, &msg.Content, &msg.Type, &msg.Priority,
		&msg.ParentID, &msg.IsPinned, &msg.IsEdited, &msg.IsDeleted,
		&msg.Mentions, &msg.CreatedAt, &msg.UpdatedAt,
		&msg.SenderName, &msg.ReplyCount,
	)
	if err != nil {
		return nil, err
	}
	return &msg, nil
}

func (r *MessageRepo) Send(ctx context.Context, channelID string, input models.SendMessageInput, senderEmail string) (*models.Message, error) {
	msgType := input.Type
	if msgType == "" {
		msgType = "text"
	}
	priority := input.Priority
	if priority == "" {
		priority = "normal"
	}
	var msg models.Message
	err := r.db.QueryRow(ctx, `
		INSERT INTO workspace.messages (channel_id, sender_email, content, type, priority, parent_id, mentions)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		RETURNING id, channel_id, sender_email, content, type, priority, parent_id,
		          is_pinned, is_edited, is_deleted, mentions, created_at, updated_at
	`, channelID, senderEmail, input.Content, msgType, priority, input.ParentID, input.Mentions,
	).Scan(
		&msg.ID, &msg.ChannelID, &msg.SenderEmail, &msg.Content, &msg.Type, &msg.Priority,
		&msg.ParentID, &msg.IsPinned, &msg.IsEdited, &msg.IsDeleted,
		&msg.Mentions, &msg.CreatedAt, &msg.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	return &msg, nil
}

func (r *MessageRepo) Edit(ctx context.Context, messageID, content, senderEmail string) (*models.Message, error) {
	var msg models.Message
	err := r.db.QueryRow(ctx, `
		UPDATE workspace.messages
		SET content = $2, is_edited = true, updated_at = NOW()
		WHERE id = $1 AND sender_email = $3
		RETURNING id, channel_id, sender_email, content, type, priority, parent_id,
		          is_pinned, is_edited, is_deleted, mentions, created_at, updated_at
	`, messageID, content, senderEmail).Scan(
		&msg.ID, &msg.ChannelID, &msg.SenderEmail, &msg.Content, &msg.Type, &msg.Priority,
		&msg.ParentID, &msg.IsPinned, &msg.IsEdited, &msg.IsDeleted,
		&msg.Mentions, &msg.CreatedAt, &msg.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	return &msg, nil
}

func (r *MessageRepo) Delete(ctx context.Context, messageID, senderEmail string) error {
	_, err := r.db.Exec(ctx, `
		UPDATE workspace.messages SET is_deleted = true, content = '', updated_at = NOW()
		WHERE id = $1 AND sender_email = $2
	`, messageID, senderEmail)
	return err
}

func (r *MessageRepo) Pin(ctx context.Context, messageID string, pin bool) error {
	_, err := r.db.Exec(ctx, `
		UPDATE workspace.messages SET is_pinned = $2, updated_at = NOW() WHERE id = $1
	`, messageID, pin)
	return err
}

func (r *MessageRepo) AddReaction(ctx context.Context, messageID, userEmail, emoji string) error {
	_, err := r.db.Exec(ctx, `
		INSERT INTO workspace.message_reactions (message_id, user_email, emoji)
		VALUES ($1, $2, $3)
		ON CONFLICT (message_id, user_email, emoji) DO NOTHING
	`, messageID, userEmail, emoji)
	return err
}

func (r *MessageRepo) RemoveReaction(ctx context.Context, messageID, userEmail, emoji string) error {
	_, err := r.db.Exec(ctx, `
		DELETE FROM workspace.message_reactions
		WHERE message_id = $1 AND user_email = $2 AND emoji = $3
	`, messageID, userEmail, emoji)
	return err
}

func (r *MessageRepo) GetThreadReplies(ctx context.Context, parentID string) ([]models.Message, error) {
	rows, err := r.db.Query(ctx, `
		SELECT m.id, m.channel_id, m.sender_email, m.content, m.type, m.priority,
		       m.parent_id, m.is_pinned, m.is_edited, m.is_deleted,
		       m.mentions, m.created_at, m.updated_at,
		       ma.name AS sender_name, 0 AS reply_count
		FROM workspace.messages m
		LEFT JOIN public.mail_accounts ma ON ma.email = m.sender_email
		WHERE m.parent_id = $1
		ORDER BY m.created_at ASC
	`, parentID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var msgs []models.Message
	for rows.Next() {
		var msg models.Message
		if err := rows.Scan(
			&msg.ID, &msg.ChannelID, &msg.SenderEmail, &msg.Content, &msg.Type, &msg.Priority,
			&msg.ParentID, &msg.IsPinned, &msg.IsEdited, &msg.IsDeleted,
			&msg.Mentions, &msg.CreatedAt, &msg.UpdatedAt,
			&msg.SenderName, &msg.ReplyCount,
		); err != nil {
			return nil, err
		}
		msgs = append(msgs, msg)
	}
	return msgs, nil
}

func (r *MessageRepo) GetPinned(ctx context.Context, channelID string) ([]models.Message, error) {
	rows, err := r.db.Query(ctx, `
		SELECT m.id, m.channel_id, m.sender_email, m.content, m.type, m.priority,
		       m.parent_id, m.is_pinned, m.is_edited, m.is_deleted,
		       m.mentions, m.created_at, m.updated_at,
		       ma.name AS sender_name, 0 AS reply_count
		FROM workspace.messages m
		LEFT JOIN public.mail_accounts ma ON ma.email = m.sender_email
		WHERE m.channel_id = $1 AND m.is_pinned = true
		ORDER BY m.updated_at DESC
	`, channelID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var msgs []models.Message
	for rows.Next() {
		var msg models.Message
		if err := rows.Scan(
			&msg.ID, &msg.ChannelID, &msg.SenderEmail, &msg.Content, &msg.Type, &msg.Priority,
			&msg.ParentID, &msg.IsPinned, &msg.IsEdited, &msg.IsDeleted,
			&msg.Mentions, &msg.CreatedAt, &msg.UpdatedAt,
			&msg.SenderName, &msg.ReplyCount,
		); err != nil {
			return nil, err
		}
		msgs = append(msgs, msg)
	}
	return msgs, nil
}

// ── helpers ──

func (r *MessageRepo) batchLoadReactions(ctx context.Context, messages []models.Message, ids []string) {
	rows, err := r.db.Query(ctx, `
		SELECT message_id, emoji, COUNT(*), array_agg(user_email)
		FROM workspace.message_reactions
		WHERE message_id = ANY($1)
		GROUP BY message_id, emoji
	`, ids)
	if err != nil {
		return
	}
	defer rows.Close()

	reactionMap := make(map[string][]models.Reaction)
	for rows.Next() {
		var msgID, emoji string
		var count int
		var users []string
		if err := rows.Scan(&msgID, &emoji, &count, &users); err != nil {
			continue
		}
		reactionMap[msgID] = append(reactionMap[msgID], models.Reaction{
			Emoji: emoji, Count: count, UserEmail: users,
		})
	}

	for i := range messages {
		if r2, ok := reactionMap[messages[i].ID]; ok {
			messages[i].Reactions = r2
		}
	}
}

func (r *MessageRepo) batchLoadAttachments(ctx context.Context, messages []models.Message, ids []string) {
	rows, err := r.db.Query(ctx, `
		SELECT id, message_id, file_name, file_url, file_type, file_size, created_at
		FROM workspace.message_attachments
		WHERE message_id = ANY($1)
		ORDER BY created_at
	`, ids)
	if err != nil {
		return
	}
	defer rows.Close()

	attachMap := make(map[string][]models.MessageAttachment)
	for rows.Next() {
		var a models.MessageAttachment
		if err := rows.Scan(&a.ID, &a.MessageID, &a.FileName, &a.FileURL,
			&a.FileType, &a.FileSize, &a.CreatedAt); err != nil {
			continue
		}
		attachMap[a.MessageID] = append(attachMap[a.MessageID], a)
	}

	for i := range messages {
		if att, ok := attachMap[messages[i].ID]; ok {
			messages[i].Attachments = att
		}
	}
}
