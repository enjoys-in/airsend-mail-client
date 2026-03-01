package repository

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"time"

	"github.com/AirSend/workspace-server/internal/models"
	"github.com/jackc/pgx/v5/pgxpool"
)

// ═══════════════════════════════════════════════════════════════════════════
// InvitationRepo — team invitation management
// ═══════════════════════════════════════════════════════════════════════════

type InvitationRepo struct {
	db *pgxpool.Pool
}

func NewInvitationRepo(db *pgxpool.Pool) *InvitationRepo {
	return &InvitationRepo{db: db}
}

func (r *InvitationRepo) Create(ctx context.Context, input models.CreateInvitationInput) (*models.Invitation, error) {
	token, err := generateToken()
	if err != nil {
		return nil, err
	}

	expiresAt := time.Now().Add(7 * 24 * time.Hour) // 7 day expiry

	var inv models.Invitation
	err = r.db.QueryRow(ctx, `
		INSERT INTO workspace.invitations (team_id, inviter_email, invitee_email, role, token, expires_at)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING id, team_id, inviter_email, invitee_email, role, status, token, expires_at, created_at
	`, input.TeamID, input.InviterEmail, input.InviteeEmail, input.Role, token, expiresAt,
	).Scan(&inv.ID, &inv.TeamID, &inv.InviterEmail, &inv.InviteeEmail,
		&inv.Role, &inv.Status, &inv.Token, &inv.ExpiresAt, &inv.CreatedAt)
	if err != nil {
		return nil, err
	}
	return &inv, nil
}

func (r *InvitationRepo) GetByToken(ctx context.Context, token string) (*models.Invitation, error) {
	var inv models.Invitation
	err := r.db.QueryRow(ctx, `
		SELECT id, team_id, inviter_email, invitee_email, role, status, token, expires_at, created_at, responded_at
		FROM workspace.invitations WHERE token = $1
	`, token).Scan(&inv.ID, &inv.TeamID, &inv.InviterEmail, &inv.InviteeEmail,
		&inv.Role, &inv.Status, &inv.Token, &inv.ExpiresAt, &inv.CreatedAt, &inv.RespondedAt)
	if err != nil {
		return nil, err
	}
	return &inv, nil
}

func (r *InvitationRepo) ListByTeam(ctx context.Context, teamID string) ([]models.Invitation, error) {
	rows, err := r.db.Query(ctx, `
		SELECT id, team_id, inviter_email, invitee_email, role, status, token, expires_at, created_at, responded_at
		FROM workspace.invitations WHERE team_id = $1
		ORDER BY created_at DESC
	`, teamID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var invitations []models.Invitation
	for rows.Next() {
		var inv models.Invitation
		if err := rows.Scan(&inv.ID, &inv.TeamID, &inv.InviterEmail, &inv.InviteeEmail,
			&inv.Role, &inv.Status, &inv.Token, &inv.ExpiresAt, &inv.CreatedAt, &inv.RespondedAt); err != nil {
			return nil, err
		}
		invitations = append(invitations, inv)
	}
	return invitations, nil
}

func (r *InvitationRepo) ListPendingByEmail(ctx context.Context, email string) ([]models.Invitation, error) {
	rows, err := r.db.Query(ctx, `
		SELECT id, team_id, inviter_email, invitee_email, role, status, token, expires_at, created_at, responded_at
		FROM workspace.invitations
		WHERE invitee_email = $1 AND status = 'pending' AND expires_at > NOW()
		ORDER BY created_at DESC
	`, email)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var invitations []models.Invitation
	for rows.Next() {
		var inv models.Invitation
		if err := rows.Scan(&inv.ID, &inv.TeamID, &inv.InviterEmail, &inv.InviteeEmail,
			&inv.Role, &inv.Status, &inv.Token, &inv.ExpiresAt, &inv.CreatedAt, &inv.RespondedAt); err != nil {
			return nil, err
		}
		invitations = append(invitations, inv)
	}
	return invitations, nil
}

func (r *InvitationRepo) UpdateStatus(ctx context.Context, id, status string) error {
	_, err := r.db.Exec(ctx, `
		UPDATE workspace.invitations SET status = $2, responded_at = NOW() WHERE id = $1
	`, id, status)
	return err
}

func generateToken() (string, error) {
	b := make([]byte, 32)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	return hex.EncodeToString(b), nil
}
