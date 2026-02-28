package repository

import (
	"context"

	"github.com/AirSend/workspace-server/internal/models"
	"github.com/jackc/pgx/v5/pgxpool"
)

// ═══════════════════════════════════════════════════════════════════════════
// MemberRepo — struct-based implementation of domain.MemberRepository
// ═══════════════════════════════════════════════════════════════════════════

type MemberRepo struct {
	db *pgxpool.Pool
}

func NewMemberRepo(db *pgxpool.Pool) *MemberRepo {
	return &MemberRepo{db: db}
}

func (r *MemberRepo) List(ctx context.Context, teamID string) ([]models.TeamMember, error) {
	rows, err := r.db.Query(ctx, `
		SELECT tm.id, tm.team_id, tm.email, tm.role, tm.display_name,
		       tm.status, tm.custom_status, tm.joined_at,
		       ma.name AS account_name
		FROM workspace.team_members tm
		LEFT JOIN public.mail_accounts ma ON ma.email = tm.email
		WHERE tm.team_id = $1
		ORDER BY
			CASE tm.role
				WHEN 'owner' THEN 0
				WHEN 'admin' THEN 1
				WHEN 'moderator' THEN 2
				ELSE 3
			END, tm.display_name
	`, teamID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var members []models.TeamMember
	for rows.Next() {
		var m models.TeamMember
		if err := rows.Scan(&m.ID, &m.TeamID, &m.Email, &m.Role,
			&m.DisplayName, &m.Status, &m.CustomStatus, &m.JoinedAt,
			&m.AccountName); err != nil {
			return nil, err
		}
		members = append(members, m)
	}
	return members, nil
}

func (r *MemberRepo) Add(ctx context.Context, teamID string, input models.AddMemberInput) (*models.TeamMember, error) {
	var m models.TeamMember
	err := r.db.QueryRow(ctx, `
		INSERT INTO workspace.team_members (team_id, email, role, display_name)
		VALUES ($1, $2, $3, COALESCE($4, (SELECT name FROM public.mail_accounts WHERE email = $2)))
		RETURNING id, team_id, email, role, display_name, status, custom_status, joined_at
	`, teamID, input.Email, input.Role, input.DisplayName,
	).Scan(&m.ID, &m.TeamID, &m.Email, &m.Role,
		&m.DisplayName, &m.Status, &m.CustomStatus, &m.JoinedAt)
	if err != nil {
		return nil, err
	}
	return &m, nil
}

func (r *MemberRepo) ChangeRole(ctx context.Context, teamID, email, newRole string) error {
	_, err := r.db.Exec(ctx, `
		UPDATE workspace.team_members SET role = $3
		WHERE team_id = $1 AND email = $2
	`, teamID, email, newRole)
	return err
}

func (r *MemberRepo) Remove(ctx context.Context, teamID, email string) error {
	_, err := r.db.Exec(ctx, `
		DELETE FROM workspace.team_members
		WHERE team_id = $1 AND email = $2 AND role != 'owner'
	`, teamID, email)
	return err
}

func (r *MemberRepo) UpdateStatus(ctx context.Context, teamID, email, status, customStatus string) error {
	_, err := r.db.Exec(ctx, `
		UPDATE workspace.team_members
		SET status = $3, custom_status = $4
		WHERE team_id = $1 AND email = $2
	`, teamID, email, status, customStatus)
	return err
}

func (r *MemberRepo) IsMember(ctx context.Context, teamID, email string) (bool, error) {
	var count int
	err := r.db.QueryRow(ctx, `
		SELECT COUNT(*) FROM workspace.team_members
		WHERE team_id = $1 AND email = $2
	`, teamID, email).Scan(&count)
	return count > 0, err
}

func (r *MemberRepo) GetRole(ctx context.Context, teamID, email string) (string, error) {
	var role string
	err := r.db.QueryRow(ctx, `
		SELECT role FROM workspace.team_members
		WHERE team_id = $1 AND email = $2
	`, teamID, email).Scan(&role)
	return role, err
}
