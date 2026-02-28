package service

import (
	"context"
	"encoding/json"

	"github.com/AirSend/workspace-server/internal/models"
	"github.com/AirSend/workspace-server/internal/streaming"
)

// ═══════════════════════════════════════════════════════════════════════════
// TeamService — business logic for teams
// ═══════════════════════════════════════════════════════════════════════════

type TeamService struct {
	d *Deps
}

func NewTeamService(d *Deps) *TeamService {
	return &TeamService{d: d}
}

func (s *TeamService) List(ctx context.Context, email string) ([]models.Team, error) {
	cacheKey := "teams:" + email
	if cached, err := s.d.Cache.Get(ctx, cacheKey); err == nil && cached != nil {
		var teams []models.Team
		if json.Unmarshal(cached, &teams) == nil {
			return teams, nil
		}
	}

	teams, err := s.d.Teams.ListByEmail(ctx, email)
	if err != nil {
		return nil, err
	}

	s.d.Cache.Set(ctx, cacheKey, teams, 300)
	return teams, nil
}

func (s *TeamService) Get(ctx context.Context, teamID, email string) (*models.Team, error) {
	ok, err := s.d.Members.IsMember(ctx, teamID, email)
	if err != nil || !ok {
		return nil, ErrForbidden
	}
	return s.d.Teams.GetByID(ctx, teamID)
}

func (s *TeamService) Create(ctx context.Context, input models.CreateTeamInput, email, ip, ua string) (*models.Team, error) {
	team, err := s.d.Teams.Create(ctx, input, email)
	if err != nil {
		return nil, err
	}

	// Assign owner permissions
	s.d.Permissions.WriteTuple(ctx, "team", team.ID, "owner", email)

	// Audit log
	s.d.Events.Log(ctx, models.Event{
		ActorEmail:   email,
		Action:       "team.created",
		ResourceType: "team",
		ResourceID:   strPtr(team.ID),
		TeamID:       &team.ID,
		Metadata:     map[string]interface{}{"name": team.Name},
		IPAddress:    &ip,
		UserAgent:    &ua,
	})

	// Stream event
	if s.d.Stream != nil {
		s.d.Stream.Publish(ctx, streaming.StreamEvents, map[string]interface{}{
			"event":   "team.created",
			"team_id": team.ID,
			"actor":   email,
		})
	}

	// Invalidate cache
	s.d.Cache.Invalidate(ctx, "teams:"+email)

	return team, nil
}

func (s *TeamService) Update(ctx context.Context, teamID string, fields map[string]interface{}, email, ip, ua string) (*models.Team, error) {
	// Permission check
	allowed, _ := s.d.Permissions.Check(ctx, "team", teamID, "admin", email)
	if !allowed {
		role, _ := s.d.Members.GetRole(ctx, teamID, email)
		if role != "owner" && role != "admin" {
			return nil, ErrForbidden
		}
	}

	team, err := s.d.Teams.Update(ctx, teamID, fields)
	if err != nil {
		return nil, err
	}

	s.d.Events.Log(ctx, models.Event{
		ActorEmail:   email,
		Action:       "team.updated",
		ResourceType: "team",
		ResourceID:   &teamID,
		TeamID:       &teamID,
		Metadata:     fields,
		IPAddress:    &ip,
		UserAgent:    &ua,
	})

	s.d.Cache.InvalidatePrefix(ctx, "teams:")

	// Notify team members
	s.d.Hub.BroadcastToTeam(teamID, "team.updated", map[string]interface{}{
		"team": team,
	})

	return team, nil
}

func (s *TeamService) Delete(ctx context.Context, teamID, email, ip, ua string) error {
	team, err := s.d.Teams.GetByID(ctx, teamID)
	if err != nil {
		return err
	}
	if team.OwnerEmail != email {
		return ErrForbidden
	}

	if err := s.d.Teams.Delete(ctx, teamID); err != nil {
		return err
	}

	s.d.Permissions.DeleteAllForObject(ctx, "team", teamID)

	s.d.Events.Log(ctx, models.Event{
		ActorEmail:   email,
		Action:       "team.deleted",
		ResourceType: "team",
		ResourceID:   &teamID,
		TeamID:       &teamID,
		Metadata:     map[string]interface{}{"name": team.Name},
		IPAddress:    &ip,
		UserAgent:    &ua,
	})

	s.d.Cache.InvalidatePrefix(ctx, "teams:")

	s.d.Hub.BroadcastToTeam(teamID, "team.deleted", map[string]interface{}{"team_id": teamID})

	return nil
}
