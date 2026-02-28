package service

import (
	"context"

	"github.com/AirSend/workspace-server/internal/models"
)

// ═══════════════════════════════════════════════════════════════════════════
// EventService — audit log queries
// ═══════════════════════════════════════════════════════════════════════════

type EventService struct {
	d *Deps
}

func NewEventService(d *Deps) *EventService {
	return &EventService{d: d}
}

func (s *EventService) List(ctx context.Context, params models.EventQueryParams, email string) (*models.PaginatedResponse, error) {
	// Permission: must be admin of the team
	if params.TeamID != nil {
		role, _ := s.d.Members.GetRole(ctx, *params.TeamID, email)
		if role != "owner" && role != "admin" {
			return nil, ErrForbidden
		}
	}

	events, total, err := s.d.Events.List(ctx, params)
	if err != nil {
		return nil, err
	}

	return &models.PaginatedResponse{
		Items:      events,
		Total:      total,
		Page:       params.Page,
		Limit:      params.Limit,
		TotalPages: (total + params.Limit - 1) / params.Limit,
	}, nil
}

func (s *EventService) GetByID(ctx context.Context, id, email string) (*models.Event, error) {
	event, err := s.d.Events.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}

	// Permission: must be admin of the event's team
	if event.TeamID != nil {
		role, _ := s.d.Members.GetRole(ctx, *event.TeamID, email)
		if role != "owner" && role != "admin" {
			return nil, ErrForbidden
		}
	}

	return event, nil
}
