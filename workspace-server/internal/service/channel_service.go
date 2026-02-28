package service

import (
	"context"

	"github.com/AirSend/workspace-server/internal/models"
)

// ═══════════════════════════════════════════════════════════════════════════
// ChannelService — business logic for channels
// ═══════════════════════════════════════════════════════════════════════════

type ChannelService struct {
	d *Deps
}

func NewChannelService(d *Deps) *ChannelService {
	return &ChannelService{d: d}
}

func (s *ChannelService) List(ctx context.Context, teamID, email string) ([]models.Channel, error) {
	ok, _ := s.d.Members.IsMember(ctx, teamID, email)
	if !ok {
		return nil, ErrForbidden
	}
	return s.d.Channels.ListByTeam(ctx, teamID)
}

func (s *ChannelService) Get(ctx context.Context, channelID, email string) (*models.Channel, error) {
	ch, err := s.d.Channels.GetByID(ctx, channelID)
	if err != nil {
		return nil, err
	}
	ok, _ := s.d.Members.IsMember(ctx, ch.TeamID, email)
	if !ok {
		return nil, ErrForbidden
	}
	return ch, nil
}

func (s *ChannelService) Create(ctx context.Context, teamID string, input models.CreateChannelInput, email, ip, ua string) (*models.Channel, error) {
	role, _ := s.d.Members.GetRole(ctx, teamID, email)
	if role != "owner" && role != "admin" && role != "moderator" {
		return nil, ErrForbidden
	}

	ch, err := s.d.Channels.Create(ctx, teamID, input, email)
	if err != nil {
		return nil, err
	}

	s.d.Events.Log(ctx, models.Event{
		ActorEmail:   email,
		Action:       "channel.created",
		ResourceType: "channel",
		ResourceID:   strPtr(ch.ID),
		TeamID:       &teamID,
		Metadata:     map[string]interface{}{"name": ch.Name, "type": ch.Type},
		IPAddress:    &ip,
		UserAgent:    &ua,
	})

	s.d.Cache.Invalidate(ctx, "channels:"+teamID)

	s.d.Hub.BroadcastToTeam(teamID, "channel.created", map[string]interface{}{
		"channel": ch,
	})

	// Trigger webhooks
	s.triggerWebhooks(ctx, teamID, "channel.created", map[string]interface{}{
		"channel": ch,
		"actor":   email,
	})

	return ch, nil
}

func (s *ChannelService) Update(ctx context.Context, channelID string, fields map[string]interface{}, email, ip, ua string) (*models.Channel, error) {
	ch, err := s.d.Channels.GetByID(ctx, channelID)
	if err != nil {
		return nil, err
	}

	role, _ := s.d.Members.GetRole(ctx, ch.TeamID, email)
	if role != "owner" && role != "admin" && role != "moderator" {
		return nil, ErrForbidden
	}

	updated, err := s.d.Channels.Update(ctx, channelID, fields)
	if err != nil {
		return nil, err
	}

	s.d.Events.Log(ctx, models.Event{
		ActorEmail:   email,
		Action:       "channel.updated",
		ResourceType: "channel",
		ResourceID:   &channelID,
		TeamID:       &ch.TeamID,
		Metadata:     fields,
		IPAddress:    &ip,
		UserAgent:    &ua,
	})

	s.d.Cache.Invalidate(ctx, "channels:"+ch.TeamID)

	s.d.Hub.BroadcastToTeam(ch.TeamID, "channel.updated", map[string]interface{}{
		"channel": updated,
	})

	return updated, nil
}

func (s *ChannelService) Delete(ctx context.Context, channelID, email, ip, ua string) error {
	ch, err := s.d.Channels.GetByID(ctx, channelID)
	if err != nil {
		return err
	}

	role, _ := s.d.Members.GetRole(ctx, ch.TeamID, email)
	if role != "owner" && role != "admin" {
		return ErrForbidden
	}

	if err := s.d.Channels.Delete(ctx, channelID); err != nil {
		return err
	}

	s.d.Events.Log(ctx, models.Event{
		ActorEmail:   email,
		Action:       "channel.deleted",
		ResourceType: "channel",
		ResourceID:   &channelID,
		TeamID:       &ch.TeamID,
		Metadata:     map[string]interface{}{"name": ch.Name},
		IPAddress:    &ip,
		UserAgent:    &ua,
	})

	s.d.Cache.Invalidate(ctx, "channels:"+ch.TeamID)

	s.d.Hub.BroadcastToTeam(ch.TeamID, "channel.deleted", map[string]interface{}{
		"channel_id": channelID,
	})

	return nil
}

func (s *ChannelService) triggerWebhooks(ctx context.Context, teamID, event string, payload map[string]interface{}) {
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
