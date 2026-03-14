package repository

import (
	"context"
	"encoding/base64"

	"github.com/AirSend/workspace-server/internal/models"
	"github.com/jackc/pgx/v5/pgxpool"
)

// ═══════════════════════════════════════════════════════════════════════════
// AttachmentRepo — file attachments stored as bytea in PostgreSQL
// ═══════════════════════════════════════════════════════════════════════════

type AttachmentRepo struct {
	db *pgxpool.Pool
}

func NewAttachmentRepo(db *pgxpool.Pool) *AttachmentRepo {
	return &AttachmentRepo{db: db}
}

// Create stores a file attachment with bytea content.
func (r *AttachmentRepo) Create(ctx context.Context, messageID string, fileName string, fileType string, data []byte) (*models.MessageAttachment, error) {
	// file_url is a self-referencing download link built from the attachment ID
	var att models.MessageAttachment
	err := r.db.QueryRow(ctx, `
		INSERT INTO workspace.message_attachments (message_id, file_name, file_url, file_type, file_size, file_content)
		VALUES ($1, $2, '', $3, $4, $5)
		RETURNING id, message_id, file_name, file_url, file_type, file_size, created_at
	`, messageID, fileName, fileType, len(data), data).Scan(
		&att.ID, &att.MessageID, &att.FileName, &att.FileURL,
		&att.FileType, &att.FileSize, &att.CreatedAt,
	)
	if err != nil {
		return nil, err
	}

	// Update file_url to point to the download endpoint
	att.FileURL = "/api/v1/attachments/" + att.ID
	_, _ = r.db.Exec(ctx, `UPDATE workspace.message_attachments SET file_url = $1 WHERE id = $2`, att.FileURL, att.ID)

	return &att, nil
}

// CreateFromBase64 decodes a base64 string and stores as bytea.
func (r *AttachmentRepo) CreateFromBase64(ctx context.Context, messageID, fileName, fileType, b64Data string) (*models.MessageAttachment, error) {
	data, err := base64.StdEncoding.DecodeString(b64Data)
	if err != nil {
		return nil, err
	}
	return r.Create(ctx, messageID, fileName, fileType, data)
}

// GetContent retrieves file content (bytea) for download.
func (r *AttachmentRepo) GetContent(ctx context.Context, attachmentID string) (*models.MessageAttachment, []byte, error) {
	var att models.MessageAttachment
	var content []byte
	err := r.db.QueryRow(ctx, `
		SELECT id, message_id, file_name, file_url, file_type, file_size, file_content, created_at
		FROM workspace.message_attachments
		WHERE id = $1
	`, attachmentID).Scan(
		&att.ID, &att.MessageID, &att.FileName, &att.FileURL,
		&att.FileType, &att.FileSize, &content, &att.CreatedAt,
	)
	if err != nil {
		return nil, nil, err
	}
	return &att, content, nil
}

// ListByMessage returns all attachments for a message (without bytea content).
func (r *AttachmentRepo) ListByMessage(ctx context.Context, messageID string) ([]models.MessageAttachment, error) {
	rows, err := r.db.Query(ctx, `
		SELECT id, message_id, file_name, file_url, file_type, file_size, created_at
		FROM workspace.message_attachments
		WHERE message_id = $1
		ORDER BY created_at
	`, messageID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var attachments []models.MessageAttachment
	for rows.Next() {
		var a models.MessageAttachment
		if err := rows.Scan(&a.ID, &a.MessageID, &a.FileName, &a.FileURL,
			&a.FileType, &a.FileSize, &a.CreatedAt); err != nil {
			return nil, err
		}
		attachments = append(attachments, a)
	}
	return attachments, nil
}
