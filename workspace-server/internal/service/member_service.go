package service

import (
	"context"

	"github.com/AirSend/workspace-server/internal/models"
)

// ═══════════════════════════════════════════════════════════════════════════
// MemberService — business logic for team membership
// ═══════════════════════════════════════════════════════════════════════════

type MemberService struct {
	d *Deps
}

func NewMemberService(d *Deps) *MemberService {
	return &MemberService{d: d}
}

func (s *MemberService) List(ctx context.Context, teamID, email string) ([]models.TeamMember, error) {
	ok, _ := s.d.Members.IsMember(ctx, teamID, email)
	if !ok {
		return nil, ErrForbidden
	}
	return s.d.Members.List(ctx, teamID)
}

func (s *MemberService) Add(ctx context.Context, teamID string, input models.AddMemberInput, actorEmail, ip, ua string) (*models.TeamMember, error) {
	role, _ := s.d.Members.GetRole(ctx, teamID, actorEmail)
	if role != "owner" && role != "admin" {
		return nil, ErrForbidden
	}

	member, err := s.d.Members.Add(ctx, teamID, input)
	if err != nil {
		return nil, err
	}

	memberRole := input.Role
	if memberRole == "" {
		memberRole = "member"
	}
	s.d.Permissions.WriteTuple(ctx, "team", teamID, memberRole, input.Email)

	s.d.Events.Log(ctx, models.Event{
		ActorEmail:   actorEmail,
		Action:       "member.added",
		ResourceType: "team_member",
		ResourceID:   strPtr(member.ID),
		TeamID:       &teamID,
		Metadata: map[string]interface{}{
			"email": input.Email,
			"role":  memberRole,
		},
		IPAddress: &ip,
		UserAgent: &ua,
	})

	s.d.Cache.InvalidatePrefix(ctx, "teams:")
	s.d.Cache.Invalidate(ctx, "members:"+teamID)

	// Notify the added user
	s.d.Hub.SendToUser(input.Email, "team.member_added", map[string]interface{}{
		"team_id": teamID,
		"role":    memberRole,
	})

	s.d.Hub.BroadcastToTeam(teamID, "member.joined", map[string]interface{}{
		"member": member,
	})

	return member, nil
}

func (s *MemberService) ChangeRole(ctx context.Context, teamID, targetEmail, newRole, actorEmail, ip, ua string) error {
	actorRole, _ := s.d.Members.GetRole(ctx, teamID, actorEmail)
	if actorRole != "owner" && actorRole != "admin" {
		return ErrForbidden
	}
	if newRole == "owner" && actorRole != "owner" {
		return ErrForbidden
	}

	if err := s.d.Members.ChangeRole(ctx, teamID, targetEmail, newRole); err != nil {
		return err
	}

	// Update permissions tuple
	s.d.Permissions.SyncTeamMemberPermissions(ctx, teamID, targetEmail, newRole)

	s.d.Events.Log(ctx, models.Event{
		ActorEmail:   actorEmail,
		Action:       "member.role_changed",
		ResourceType: "team_member",
		ResourceID:   &targetEmail,
		TeamID:       &teamID,
		Metadata: map[string]interface{}{
			"email":    targetEmail,
			"new_role": newRole,
		},
		IPAddress: &ip,
		UserAgent: &ua,
	})

	s.d.Cache.Invalidate(ctx, "members:"+teamID)

	s.d.Hub.BroadcastToTeam(teamID, "member.role_changed", map[string]interface{}{
		"email":    targetEmail,
		"new_role": newRole,
	})

	return nil
}

func (s *MemberService) Remove(ctx context.Context, teamID, targetEmail, actorEmail, ip, ua string) error {
	actorRole, _ := s.d.Members.GetRole(ctx, teamID, actorEmail)
	if actorRole != "owner" && actorRole != "admin" {
		return ErrForbidden
	}

	if err := s.d.Members.Remove(ctx, teamID, targetEmail); err != nil {
		return err
	}

	s.d.Permissions.DeleteTuple(ctx, "team", teamID, "member", targetEmail)
	s.d.Permissions.DeleteTuple(ctx, "team", teamID, "admin", targetEmail)
	s.d.Permissions.DeleteTuple(ctx, "team", teamID, "moderator", targetEmail)

	s.d.Events.Log(ctx, models.Event{
		ActorEmail:   actorEmail,
		Action:       "member.removed",
		ResourceType: "team_member",
		ResourceID:   &targetEmail,
		TeamID:       &teamID,
		Metadata:     map[string]interface{}{"email": targetEmail},
		IPAddress:    &ip,
		UserAgent:    &ua,
	})

	s.d.Cache.InvalidatePrefix(ctx, "teams:")
	s.d.Cache.Invalidate(ctx, "members:"+teamID)

	s.d.Hub.SendToUser(targetEmail, "team.member_removed", map[string]interface{}{"team_id": teamID})

	return nil
}

func (s *MemberService) UpdateStatus(ctx context.Context, teamID, email, status, customStatus string) error {
	if err := s.d.Members.UpdateStatus(ctx, teamID, email, status, customStatus); err != nil {
		return err
	}

	s.d.Hub.BroadcastToTeam(teamID, "member.status_changed", map[string]interface{}{
		"email":         email,
		"status":        status,
		"custom_status": customStatus,
	})

	return nil
}
