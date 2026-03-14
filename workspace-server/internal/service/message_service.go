package service

import (
	"context"
	"time"

	"github.com/AirSend/workspace-server/internal/models"
	"github.com/AirSend/workspace-server/internal/msgbuffer"
	"github.com/google/uuid"
)

// ═══════════════════════════════════════════════════════════════════════════
// MessageService — business logic for channel messages
//
// Send path: PebbleDB (instant) → WS broadcast → Asynq flush → PostgreSQL
// Read path: PostgreSQL (cursor) + PebbleDB (latest) → merged response
// ═══════════════════════════════════════════════════════════════════════════

type MessageService struct {
	d *Deps
}

func NewMessageService(d *Deps) *MessageService {
	return &MessageService{d: d}
}

// List returns messages using cursor-based pagination.
// It fetches from PostgreSQL first, then overlays any buffered (un-flushed)
// messages from PebbleDB for the latest view.
func (s *MessageService) List(ctx context.Context, channelID, email string, limit int, cursor string) (*models.CursorPaginatedResponse, error) {
	ch, err := s.d.Channels.GetByID(ctx, channelID)
	if err != nil {
		return nil, err
	}
	ok, _ := s.d.Members.IsMember(ctx, ch.TeamID, email)
	if !ok {
		return nil, ErrForbidden
	}

	// Fetch from Postgres (cursor-based, newest first)
	dbMsgs, nextCursor, err := s.d.Messages.ListCursor(ctx, channelID, limit, cursor)
	if err != nil {
		return nil, err
	}

	// If no cursor (first load), overlay buffered messages from PebbleDB
	if cursor == "" && s.d.MsgBuffer != nil {
		buffered, _ := s.d.MsgBuffer.LatestForChannel(channelID, limit)
		if len(buffered) > 0 {
			// Merge: deduplicate by ID (buffered messages may have been flushed already)
			idSet := make(map[string]struct{}, len(dbMsgs))
			for _, m := range dbMsgs {
				idSet[m.ID] = struct{}{}
			}
			for _, bm := range buffered {
				if _, exists := idSet[bm.ID]; !exists {
					dbMsgs = append(dbMsgs, bufToMessage(bm))
				}
			}
			// Re-sort ascending by created_at
			sortMessagesAsc(dbMsgs)
		}
	}

	return &models.CursorPaginatedResponse{
		Items:      dbMsgs,
		NextCursor: nextCursor,
		HasMore:    nextCursor != "",
		Limit:      limit,
	}, nil
}

// Send writes the message to PebbleDB for instant response and broadcasts
// via WebSocket immediately. The flush worker will batch-INSERT to PostgreSQL.
func (s *MessageService) Send(ctx context.Context, channelID string, input models.SendMessageInput, email, ip, ua string) (*models.Message, error) {
	ch, err := s.d.Channels.GetByID(ctx, channelID)
	if err != nil {
		return nil, err
	}
	ok, _ := s.d.Members.IsMember(ctx, ch.TeamID, email)
	if !ok {
		return nil, ErrForbidden
	}

	// Channel lock enforcement
	if ch.IsLocked {
		role, _ := s.d.Members.GetRole(ctx, ch.TeamID, email)
		if role != "owner" && role != "admin" && role != "moderator" {
			return nil, ErrForbidden
		}
	}

	// Generate message ID and timestamp upfront
	msgID := uuid.New().String()
	now := time.Now()
	msgType := input.Type
	if msgType == "" {
		msgType = "text"
	}
	priority := input.Priority
	if priority == "" {
		priority = "normal"
	}

	// Build the message model (returned to caller + broadcast)
	msg := &models.Message{
		ID:          msgID,
		ChannelID:   channelID,
		SenderEmail: email,
		Content:     input.Content,
		Type:        msgType,
		Priority:    priority,
		ParentID:    input.ParentID,
		Mentions:    input.Mentions,
		CreatedAt:   now,
		UpdatedAt:   now,
	}

	// Write to PebbleDB buffer (fast path)
	if s.d.MsgBuffer != nil {
		bm := &msgbuffer.BufferedMessage{
			ID:          msgID,
			ChannelID:   channelID,
			SenderEmail: email,
			Content:     input.Content,
			Type:        msgType,
			Priority:    priority,
			ParentID:    input.ParentID,
			Mentions:    input.Mentions,
			CreatedAt:   now.UnixNano(),
		}
		if err := s.d.MsgBuffer.Put(bm); err != nil {
			// Fallback: write directly to Postgres if PebbleDB fails
			dbMsg, dbErr := s.d.Messages.Send(ctx, channelID, input, email)
			if dbErr != nil {
				return nil, dbErr
			}
			msg = dbMsg
		}
	} else {
		// No PebbleDB configured — direct write (original behavior)
		dbMsg, err := s.d.Messages.Send(ctx, channelID, input, email)
		if err != nil {
			return nil, err
		}
		msg = dbMsg
	}

	// Real-time broadcast (instant — before Postgres flush)
	s.d.Hub.BroadcastToChannel(channelID, "message.created", map[string]interface{}{
		"message":    msg,
		"channel_id": channelID,
		"team_id":    ch.TeamID,
	})

	// Redis Stream for event log
	if s.d.Stream != nil {
		s.d.Stream.PublishMessage(ctx, channelID, "message.created", map[string]interface{}{
			"message_id": msg.ID,
			"channel_id": channelID,
			"sender":     email,
			"content":    msg.Content,
		})
	}

	// Audit for mentions
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

	// Webhooks
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

// ── Helpers for Pebble ↔ Model conversion ──

func bufToMessage(bm msgbuffer.BufferedMessage) models.Message {
	t := time.Unix(0, bm.CreatedAt)
	return models.Message{
		ID:          bm.ID,
		ChannelID:   bm.ChannelID,
		SenderEmail: bm.SenderEmail,
		Content:     bm.Content,
		Type:        bm.Type,
		Priority:    bm.Priority,
		ParentID:    bm.ParentID,
		Mentions:    bm.Mentions,
		CreatedAt:   t,
		UpdatedAt:   t,
	}
}

func sortMessagesAsc(msgs []models.Message) {
	n := len(msgs)
	for i := 1; i < n; i++ {
		for j := i; j > 0 && msgs[j].CreatedAt.Before(msgs[j-1].CreatedAt); j-- {
			msgs[j], msgs[j-1] = msgs[j-1], msgs[j]
		}
	}
}
