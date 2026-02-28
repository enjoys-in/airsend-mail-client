package repository

import (
	"context"

	"github.com/AirSend/workspace-server/internal/models"
	"github.com/jackc/pgx/v5/pgxpool"
)

// ═══════════════════════════════════════════════════════════════════════════
// TeamRepo — struct-based implementation of domain.TeamRepository
// ═══════════════════════════════════════════════════════════════════════════

type TeamRepo struct {
	db *pgxpool.Pool
}

func NewTeamRepo(db *pgxpool.Pool) *TeamRepo {
	return &TeamRepo{db: db}
}

func (r *TeamRepo) ListByEmail(ctx context.Context, email string) ([]models.Team, error) {
	rows, err := r.db.Query(ctx, `
		SELECT t.id, t.name, t.description, t.logo_url, t.owner_email,
		       t.is_private, t.created_at, t.updated_at
		FROM workspace.teams t
		INNER JOIN workspace.team_members tm ON tm.team_id = t.id
		WHERE tm.email = $1
		ORDER BY t.name
	`, email)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var teams []models.Team
	for rows.Next() {
		var t models.Team
		if err := rows.Scan(&t.ID, &t.Name, &t.Description, &t.LogoURL,
			&t.OwnerEmail, &t.IsPrivate, &t.CreatedAt, &t.UpdatedAt); err != nil {
			return nil, err
		}
		teams = append(teams, t)
	}
	return teams, nil
}

func (r *TeamRepo) GetByID(ctx context.Context, teamID string) (*models.Team, error) {
	var t models.Team
	err := r.db.QueryRow(ctx, `
		SELECT id, name, description, logo_url, owner_email,
		       is_private, created_at, updated_at
		FROM workspace.teams WHERE id = $1
	`, teamID).Scan(&t.ID, &t.Name, &t.Description, &t.LogoURL,
		&t.OwnerEmail, &t.IsPrivate, &t.CreatedAt, &t.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return &t, nil
}

func (r *TeamRepo) Create(ctx context.Context, input models.CreateTeamInput, ownerEmail string) (*models.Team, error) {
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return nil, err
	}
	defer tx.Rollback(ctx)

	var t models.Team
	err = tx.QueryRow(ctx, `
		INSERT INTO workspace.teams (name, description, logo_url, owner_email, is_private)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id, name, description, logo_url, owner_email, is_private, created_at, updated_at
	`, input.Name, input.Description, input.LogoURL, ownerEmail, input.IsPrivate,
	).Scan(&t.ID, &t.Name, &t.Description, &t.LogoURL,
		&t.OwnerEmail, &t.IsPrivate, &t.CreatedAt, &t.UpdatedAt)
	if err != nil {
		return nil, err
	}

	// Add owner as member
	_, err = tx.Exec(ctx, `
		INSERT INTO workspace.team_members (team_id, email, role, display_name)
		SELECT $1, $2, 'owner', ma.name
		FROM public.mail_accounts ma WHERE ma.email = $2
	`, t.ID, ownerEmail)
	if err != nil {
		return nil, err
	}

	// Create default channels
	for _, ch := range []struct{ name, typ string }{
		{"general", "text"},
		{"announcements", "announcement"},
	} {
		_, err = tx.Exec(ctx, `
			INSERT INTO workspace.channels (team_id, name, type, visibility, is_default, created_by)
			VALUES ($1, $2, $3, 'public', true, $4)
		`, t.ID, ch.name, ch.typ, ownerEmail)
		if err != nil {
			return nil, err
		}
	}

	return &t, tx.Commit(ctx)
}

func (r *TeamRepo) Update(ctx context.Context, id string, fields map[string]interface{}) (*models.Team, error) {
	// Whitelist allowed column names to prevent SQL injection
	allowed := map[string]bool{
		"name": true, "description": true, "logo_url": true, "is_private": true,
	}

	setClauses := ""
	args := []interface{}{id}
	argN := 1

	for key, val := range fields {
		if !allowed[key] {
			continue
		}
		argN++
		if setClauses != "" {
			setClauses += ", "
		}
		setClauses += key + " = $" + itoa(argN)
		args = append(args, val)
	}
	if setClauses == "" {
		return r.GetByID(ctx, id)
	}

	argN++
	setClauses += ", updated_at = NOW()"

	var t models.Team
	err := r.db.QueryRow(ctx, `
		UPDATE workspace.teams SET `+setClauses+`
		WHERE id = $1
		RETURNING id, name, description, logo_url, owner_email, is_private, created_at, updated_at
	`, args...).Scan(&t.ID, &t.Name, &t.Description, &t.LogoURL,
		&t.OwnerEmail, &t.IsPrivate, &t.CreatedAt, &t.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return &t, nil
}

func (r *TeamRepo) Delete(ctx context.Context, id string) error {
	_, err := r.db.Exec(ctx, `DELETE FROM workspace.teams WHERE id = $1`, id)
	return err
}
