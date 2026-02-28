package service

import (
	"context"

	"github.com/AirSend/workspace-server/internal/models"
)

// ═══════════════════════════════════════════════════════════════════════════
// WebhookService — webhook management
// ═══════════════════════════════════════════════════════════════════════════

type WebhookService struct {
	d *Deps
}

func NewWebhookService(d *Deps) *WebhookService {
	return &WebhookService{d: d}
}

func (s *WebhookService) List(ctx context.Context, teamID, email string) ([]models.Webhook, error) {
	role, _ := s.d.Members.GetRole(ctx, teamID, email)
	if role != "owner" && role != "admin" {
		return nil, ErrForbidden
	}
	return s.d.Webhooks.List(ctx, teamID)
}

func (s *WebhookService) Create(ctx context.Context, input models.CreateWebhookInput, email, ip, ua string) (*models.Webhook, error) {
	role, _ := s.d.Members.GetRole(ctx, input.TeamID, email)
	if role != "owner" && role != "admin" {
		return nil, ErrForbidden
	}

	hook, err := s.d.Webhooks.Create(ctx, input, email)
	if err != nil {
		return nil, err
	}

	s.d.Events.Log(ctx, models.Event{
		ActorEmail:   email,
		Action:       "webhook.created",
		ResourceType: "webhook",
		ResourceID:   strPtr(hook.ID),
		TeamID:       &input.TeamID,
		Metadata:     map[string]interface{}{"name": hook.Name, "url": hook.URL},
		IPAddress:    &ip,
		UserAgent:    &ua,
	})

	return hook, nil
}

func (s *WebhookService) Delete(ctx context.Context, webhookID, teamID, email, ip, ua string) error {
	role, _ := s.d.Members.GetRole(ctx, teamID, email)
	if role != "owner" && role != "admin" {
		return ErrForbidden
	}

	if err := s.d.Webhooks.Delete(ctx, webhookID); err != nil {
		return err
	}

	s.d.Events.Log(ctx, models.Event{
		ActorEmail:   email,
		Action:       "webhook.deleted",
		ResourceType: "webhook",
		ResourceID:   &webhookID,
		TeamID:       &teamID,
		IPAddress:    &ip,
		UserAgent:    &ua,
	})

	return nil
}
