package service

import (
	"context"

	"github.com/AirSend/workspace-server/internal/models"
)

// ═══════════════════════════════════════════════════════════════════════════
// DMService — business logic for direct messages
// ═══════════════════════════════════════════════════════════════════════════

type DMService struct {
	d *Deps
}

func NewDMService(d *Deps) *DMService {
	return &DMService{d: d}
}

func (s *DMService) ListConversations(ctx context.Context, email string) ([]models.DMConversation, error) {
	cacheKey := "dms:" + email
	if cached, err := s.d.Cache.Get(ctx, cacheKey); err == nil && cached != nil {
		// fast path — return cached
		var convos []models.DMConversation
		if err := decodeCache(cached, &convos); err == nil {
			return convos, nil
		}
	}

	convos, err := s.d.DMs.ListConversations(ctx, email)
	if err != nil {
		return nil, err
	}

	s.d.Cache.Set(ctx, cacheKey, convos, 60)
	return convos, nil
}

func (s *DMService) GetConversation(ctx context.Context, dmID, email string) (*models.DMConversation, error) {
	convo, err := s.d.DMs.GetConversation(ctx, dmID)
	if err != nil {
		return nil, err
	}
	// Permission check: verify user is a participant
	isParticipant := false
	for _, p := range convo.Participants {
		if p.Email == email {
			isParticipant = true
			break
		}
	}
	if !isParticipant {
		return nil, ErrForbidden
	}
	return convo, nil
}

func (s *DMService) CreateConversation(ctx context.Context, senderEmail, recipientEmail string) (*models.DMConversation, error) {
	convo, err := s.d.DMs.CreateConversation(ctx, senderEmail, recipientEmail)
	if err != nil {
		return nil, err
	}

	s.d.Cache.Invalidate(ctx, "dms:"+senderEmail)
	s.d.Cache.Invalidate(ctx, "dms:"+recipientEmail)

	// Notify recipient
	s.d.Hub.SendToUser(recipientEmail, "dm.created", map[string]interface{}{
		"conversation": convo,
	})

	s.d.Events.Log(ctx, models.Event{
		ActorEmail:   senderEmail,
		Action:       "dm.created",
		ResourceType: "dm_conversation",
		ResourceID:   strPtr(convo.ID),
	})

	return convo, nil
}

func (s *DMService) ListMessages(ctx context.Context, dmID, email string, page, limit int) (*models.PaginatedResponse, error) {
	msgs, total, err := s.d.DMs.ListMessages(ctx, dmID, page, limit)
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

func (s *DMService) SendMessage(ctx context.Context, dmID string, input models.SendDMInput, senderEmail string) (*models.DMMessage, error) {
	msg, err := s.d.DMs.SendMessage(ctx, dmID, input, senderEmail)
	if err != nil {
		return nil, err
	}

	// Notify all participants
	convo, _ := s.d.DMs.GetConversation(ctx, dmID)
	if convo != nil {
		for _, p := range convo.Participants {
			if p.Email != senderEmail {
				s.d.Hub.SendToUser(p.Email, "dm.message.created", map[string]interface{}{
					"message":         msg,
					"conversation_id": dmID,
				})
			}
		}
	}

	s.d.Cache.Invalidate(ctx, "dms:"+senderEmail)

	// Stream for replay
	if s.d.Stream != nil {
		s.d.Stream.Publish(ctx, "workspace:messages", map[string]interface{}{
			"type":            "dm",
			"conversation_id": dmID,
			"message_id":      msg.ID,
			"sender":          senderEmail,
		})
	}

	return msg, nil
}
