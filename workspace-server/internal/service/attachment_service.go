package service

import (
	"context"

	"github.com/AirSend/workspace-server/internal/models"
)

// ═══════════════════════════════════════════════════════════════════════════
// AttachmentService — file upload/download logic
// ═══════════════════════════════════════════════════════════════════════════

type AttachmentService struct {
	d *Deps
}

func NewAttachmentService(d *Deps) *AttachmentService {
	return &AttachmentService{d: d}
}

// Upload stores a file (raw bytes or base64) and links it to a message.
func (s *AttachmentService) Upload(ctx context.Context, messageID, fileName, fileType string, data []byte, email string) (*models.MessageAttachment, error) {
	// Verify the message exists and sender matches
	msg, err := s.d.Messages.GetByID(ctx, messageID)
	if err != nil {
		return nil, ErrNotFound
	}

	// Verify user is member of the team
	ch, err := s.d.Channels.GetByID(ctx, msg.ChannelID)
	if err != nil {
		return nil, ErrNotFound
	}
	ok, _ := s.d.Members.IsMember(ctx, ch.TeamID, email)
	if !ok {
		return nil, ErrForbidden
	}

	att, err := s.d.Attachments.Create(ctx, messageID, fileName, fileType, data)
	if err != nil {
		return nil, err
	}

	// Broadcast attachment added
	s.d.Hub.BroadcastToChannel(msg.ChannelID, "message.attachment", map[string]interface{}{
		"message_id": messageID,
		"attachment": att,
	})

	return att, nil
}

// UploadBase64 stores a base64-encoded file.
func (s *AttachmentService) UploadBase64(ctx context.Context, messageID, fileName, fileType, b64Data, email string) (*models.MessageAttachment, error) {
	msg, err := s.d.Messages.GetByID(ctx, messageID)
	if err != nil {
		return nil, ErrNotFound
	}

	ch, err := s.d.Channels.GetByID(ctx, msg.ChannelID)
	if err != nil {
		return nil, ErrNotFound
	}
	ok, _ := s.d.Members.IsMember(ctx, ch.TeamID, email)
	if !ok {
		return nil, ErrForbidden
	}

	att, err := s.d.Attachments.CreateFromBase64(ctx, messageID, fileName, fileType, b64Data)
	if err != nil {
		return nil, err
	}

	s.d.Hub.BroadcastToChannel(msg.ChannelID, "message.attachment", map[string]interface{}{
		"message_id": messageID,
		"attachment": att,
	})

	return att, nil
}

// Download retrieves the raw bytea content.
func (s *AttachmentService) Download(ctx context.Context, attachmentID string) (*models.MessageAttachment, []byte, error) {
	return s.d.Attachments.GetContent(ctx, attachmentID)
}
