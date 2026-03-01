package service

import (
	"context"

	"github.com/AirSend/workspace-server/internal/models"
)

// ═══════════════════════════════════════════════════════════════════════════
// MessageService — business logic for channel messages
// ═══════════════════════════════════════════════════════════════════════════

type MessageService struct {
	d *Deps
}

func NewMessageService(d *Deps) *MessageService {
	return &MessageService{d: d}
}

func (s *MessageService) List(ctx context.Context, channelID, email string, page, limit int) (*models.PaginatedResponse, error) {
	ch, err := s.d.Channels.GetByID(ctx, channelID)
	if err != nil {
		return nil, err
	}
	ok, _ := s.d.Members.IsMember(ctx, ch.TeamID, email)
	if !ok {
		return nil, ErrForbidden
	}

	msgs, total, err := s.d.Messages.List(ctx, channelID, page, limit)
	if err != nil {
		return nil, err
	}

	return &models.PaginatedResponse{
		Items:      msgs,
		Total:      total,
		Page:       page,
		Limit:      limit,
		TotalPages: (total + limit - 1) / limit,
	}, nil
}

func (s *MessageService) Send(ctx context.Context, channelID string, input models.SendMessageInput, email, ip, ua string) (*models.Message, error) {
	ch, err := s.d.Channels.GetByID(ctx, channelID)
	if err != nil {
		return nil, err
	}
	ok, _ := s.d.Members.IsMember(ctx, ch.TeamID, email)
	if !ok {
		return nil, ErrForbidden
	}

	// Channel lock enforcement — only owner/admin/moderator can post to locked channels
	if ch.IsLocked {
		role, _ := s.d.Members.GetRole(ctx, ch.TeamID, email)
		if role != "owner" && role != "admin" && role != "moderator" {
			return nil, ErrForbidden
		}
	}

	msg, err := s.d.Messages.Send(ctx, channelID, input, email)
	if err != nil {
		return nil, err
	}

	// Real-time broadcast
	s.d.Hub.BroadcastToChannel(channelID, "message.created", map[string]interface{}{
		"message":    msg,
		"channel_id": channelID,
		"team_id":    ch.TeamID,
	})

	// Redis Stream for persistence/replay
	if s.d.Stream != nil {
		s.d.Stream.PublishMessage(ctx, channelID, "message.created", map[string]interface{}{
			"message_id": msg.ID,
			"channel_id": channelID,
			"sender":     email,
			"content":    msg.Content,
		})
	}

	// Audit (sample — only log if it's a thread start or has mentions)
	if input.ParentID == nil && len(input.Mentions) > 0 {
		s.d.Events.Log(ctx, models.Event{
			ActorEmail:   email,
			Action:       "message.sent_with_mentions",
			ResourceType: "message",
			ResourceID:   strPtr(msg.ID),
			TeamID:       &ch.TeamID,
			Metadata:     map[string]interface{}{"mentions": input.Mentions},
			IPAddress:    &ip,
			UserAgent:    &ua,
		})
	}

	// Notify mentioned users
	if len(input.Mentions) > 0 {
		for _, mentioned := range input.Mentions {
			s.d.Hub.SendToUser(mentioned, "notification.mention", map[string]interface{}{
				"message_id": msg.ID,
				"channel_id": channelID,
				"sender":     email,
				"content":    msg.Content,
			})
		}
	}

	// Cache invalidation
	s.d.Cache.Invalidate(ctx, "messages:"+channelID)

	// Webhook trigger
	s.triggerWebhooks(ctx, ch.TeamID, "message.created", map[string]interface{}{
		"message":    msg,
		"channel_id": channelID,
	})

	return msg, nil
}

func (s *MessageService) Edit(ctx context.Context, messageID, content, email string) (*models.Message, error) {
	msg, err := s.d.Messages.Edit(ctx, messageID, content, email)
	if err != nil {
		return nil, err
	}

	s.d.Hub.BroadcastToChannel(msg.ChannelID, "message.updated", map[string]interface{}{
		"message": msg,
	})

	s.d.Cache.Invalidate(ctx, "messages:"+msg.ChannelID)
	return msg, nil
}

func (s *MessageService) Delete(ctx context.Context, messageID, email string) error {
	msg, err := s.d.Messages.GetByID(ctx, messageID)
	if err != nil {
		return err
	}

	if err := s.d.Messages.Delete(ctx, messageID, email); err != nil {
		return err
	}

	s.d.Hub.BroadcastToChannel(msg.ChannelID, "message.deleted", map[string]interface{}{
		"message_id": messageID,
		"channel_id": msg.ChannelID,
	})

	s.d.Cache.Invalidate(ctx, "messages:"+msg.ChannelID)
	return nil
}

func (s *MessageService) Pin(ctx context.Context, messageID string, pin bool, email, ip, ua string) error {
	msg, err := s.d.Messages.GetByID(ctx, messageID)
	if err != nil {
		return err
	}
	ch, err := s.d.Channels.GetByID(ctx, msg.ChannelID)
	if err != nil {
		return err
	}
	role, _ := s.d.Members.GetRole(ctx, ch.TeamID, email)
	if role != "owner" && role != "admin" && role != "moderator" {
		return ErrForbidden
	}

	if err := s.d.Messages.Pin(ctx, messageID, pin); err != nil {
		return err
	}

	action := "message.pinned"
	if !pin {
		action = "message.unpinned"
	}

	s.d.Events.Log(ctx, models.Event{
		ActorEmail:   email,
		Action:       action,
		ResourceType: "message",
		ResourceID:   &messageID,
		TeamID:       &ch.TeamID,
		IPAddress:    &ip,
		UserAgent:    &ua,
	})

	s.d.Hub.BroadcastToChannel(msg.ChannelID, action, map[string]interface{}{
		"message_id": messageID,
		"pinned":     pin,
	})

	return nil
}

func (s *MessageService) AddReaction(ctx context.Context, messageID, emoji, email string) error {
	msg, err := s.d.Messages.GetByID(ctx, messageID)
	if err != nil {
		return err
	}

	if err := s.d.Messages.AddReaction(ctx, messageID, email, emoji); err != nil {
		return err
	}

	s.d.Hub.BroadcastToChannel(msg.ChannelID, "message.reaction_added", map[string]interface{}{
		"message_id": messageID,
		"emoji":      emoji,
		"user":       email,
	})
	return nil
}

func (s *MessageService) RemoveReaction(ctx context.Context, messageID, emoji, email string) error {
	msg, err := s.d.Messages.GetByID(ctx, messageID)
	if err != nil {
		return err
	}

	if err := s.d.Messages.RemoveReaction(ctx, messageID, email, emoji); err != nil {
		return err
	}

	s.d.Hub.BroadcastToChannel(msg.ChannelID, "message.reaction_removed", map[string]interface{}{
		"message_id": messageID,
		"emoji":      emoji,
		"user":       email,
	})
	return nil
}

func (s *MessageService) GetThread(ctx context.Context, parentID, email string) ([]models.Message, error) {
	msg, err := s.d.Messages.GetByID(ctx, parentID)
	if err != nil {
		return nil, err
	}
	ch, err := s.d.Channels.GetByID(ctx, msg.ChannelID)
	if err != nil {
		return nil, err
	}
	ok, _ := s.d.Members.IsMember(ctx, ch.TeamID, email)
	if !ok {
		return nil, ErrForbidden
	}
	return s.d.Messages.GetThreadReplies(ctx, parentID)
}

func (s *MessageService) GetPinned(ctx context.Context, channelID, email string) ([]models.Message, error) {
	ch, err := s.d.Channels.GetByID(ctx, channelID)
	if err != nil {
		return nil, err
	}
	ok, _ := s.d.Members.IsMember(ctx, ch.TeamID, email)
	if !ok {
		return nil, ErrForbidden
	}
	return s.d.Messages.GetPinned(ctx, channelID)
}

func (s *MessageService) GetByID(ctx context.Context, messageID string) (*models.Message, error) {
	return s.d.Messages.GetByID(ctx, messageID)
}

func (s *MessageService) triggerWebhooks(ctx context.Context, teamID, event string, payload map[string]interface{}) {
	if s.d.Stream == nil {
		return
	}
	hooks, err := s.d.Webhooks.ListByEvent(ctx, teamID, event)
	if err != nil || len(hooks) == 0 {
		return
	}
	for _, h := range hooks {
		s.d.Stream.Publish(ctx, "workspace:webhooks", map[string]interface{}{
			"webhook_id": h.ID,
			"event":      event,
			"payload":    payload,
		})
	}
}
