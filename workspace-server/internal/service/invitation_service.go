package service

import (
	"context"
	"errors"

	"github.com/AirSend/workspace-server/internal/models"
)

// ═══════════════════════════════════════════════════════════════════════════
// InvitationService — team invitation management
// ═══════════════════════════════════════════════════════════════════════════

type InvitationService struct {
	d *Deps
}

func NewInvitationService(d *Deps) *InvitationService {
	return &InvitationService{d: d}
}

func (s *InvitationService) Create(ctx context.Context, teamID, inviteeEmail, role, actorEmail, ip, ua string) (*models.Invitation, error) {
	actorRole, _ := s.d.Members.GetRole(ctx, teamID, actorEmail)
	if actorRole != "owner" && actorRole != "admin" {
		return nil, ErrForbidden
	}

	// Check not already a member
	isMember, _ := s.d.Members.IsMember(ctx, teamID, inviteeEmail)
	if isMember {
		return nil, errors.New("user is already a team member")
	}

	if role == "" {
		role = "member"
	}

	inv, err := s.d.Invitations.Create(ctx, models.CreateInvitationInput{
		TeamID:       teamID,
		InviterEmail: actorEmail,
		InviteeEmail: inviteeEmail,
		Role:         role,
	})
	if err != nil {
		return nil, err
	}

	s.d.Events.Log(ctx, models.Event{
		ActorEmail:   actorEmail,
		Action:       "invitation.created",
		ResourceType: "invitation",
		ResourceID:   strPtr(inv.ID),
		TeamID:       &teamID,
		Metadata: map[string]interface{}{
			"invitee": inviteeEmail,
			"role":    role,
		},
		IPAddress: &ip,
		UserAgent: &ua,
	})

	// Notify invitee
	s.d.Hub.SendToUser(inviteeEmail, "invitation.received", map[string]interface{}{
		"invitation": inv,
	})

	return inv, nil
}

func (s *InvitationService) ListByTeam(ctx context.Context, teamID, email string) ([]models.Invitation, error) {
	role, _ := s.d.Members.GetRole(ctx, teamID, email)
	if role != "owner" && role != "admin" {
		return nil, ErrForbidden
	}
	return s.d.Invitations.ListByTeam(ctx, teamID)
}

func (s *InvitationService) ListMyPending(ctx context.Context, email string) ([]models.Invitation, error) {
	return s.d.Invitations.ListPendingByEmail(ctx, email)
}

func (s *InvitationService) Accept(ctx context.Context, token, email, ip, ua string) error {
	inv, err := s.d.Invitations.GetByToken(ctx, token)
	if err != nil {
		return ErrNotFound
	}
	if inv.InviteeEmail != email {
		return ErrForbidden
	}
	if inv.Status != "pending" {
		return errors.New("invitation already " + inv.Status)
	}

	// Update invitation status
	if err := s.d.Invitations.UpdateStatus(ctx, inv.ID, "accepted"); err != nil {
		return err
	}

	// Add as team member
	_, err = s.d.Members.Add(ctx, inv.TeamID, models.AddMemberInput{
		Email: email,
		Role:  inv.Role,
	})
	if err != nil {
		return err
	}

	// Write permission tuple
	s.d.Permissions.WriteTuple(ctx, "team", inv.TeamID, inv.Role, email)

	s.d.Events.Log(ctx, models.Event{
		ActorEmail:   email,
		Action:       "invitation.accepted",
		ResourceType: "invitation",
		ResourceID:   strPtr(inv.ID),
		TeamID:       &inv.TeamID,
		IPAddress:    &ip,
		UserAgent:    &ua,
	})

	s.d.Cache.InvalidatePrefix(ctx, "teams:")
	s.d.Cache.Invalidate(ctx, "members:"+inv.TeamID)

	s.d.Hub.BroadcastToTeam(inv.TeamID, "member.joined", map[string]interface{}{
		"email": email,
		"role":  inv.Role,
	})

	return nil
}

func (s *InvitationService) Decline(ctx context.Context, token, email string) error {
	inv, err := s.d.Invitations.GetByToken(ctx, token)
	if err != nil {
		return ErrNotFound
	}
	if inv.InviteeEmail != email {
		return ErrForbidden
	}
	if inv.Status != "pending" {
		return errors.New("invitation already " + inv.Status)
	}
	return s.d.Invitations.UpdateStatus(ctx, inv.ID, "declined")
}

func (s *InvitationService) Revoke(ctx context.Context, invitationID, teamID, email string) error {
	role, _ := s.d.Members.GetRole(ctx, teamID, email)
	if role != "owner" && role != "admin" {
		return ErrForbidden
	}
	return s.d.Invitations.UpdateStatus(ctx, invitationID, "revoked")
}
