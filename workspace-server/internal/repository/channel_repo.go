package repository

import (
	"context"

	"github.com/AirSend/workspace-server/internal/models"
	"github.com/jackc/pgx/v5/pgxpool"
)

// ═══════════════════════════════════════════════════════════════════════════
// ChannelRepo — struct-based implementation of domain.ChannelRepository
// ═══════════════════════════════════════════════════════════════════════════

type ChannelRepo struct {
	db *pgxpool.Pool
}

func NewChannelRepo(db *pgxpool.Pool) *ChannelRepo {
	return &ChannelRepo{db: db}
}

func (r *ChannelRepo) ListByTeam(ctx context.Context, teamID string) ([]models.Channel, error) {
	rows, err := r.db.Query(ctx, `
		SELECT id, team_id, name, description, type, visibility,
		       is_default, is_locked, created_by, created_at, updated_at
		FROM workspace.channels
		WHERE team_id = $1
		ORDER BY is_default DESC, type, name
	`, teamID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var channels []models.Channel
	for rows.Next() {
		var c models.Channel
		if err := rows.Scan(&c.ID, &c.TeamID, &c.Name, &c.Description,
			&c.Type, &c.Visibility, &c.IsDefault, &c.IsLocked, &c.CreatedBy,
			&c.CreatedAt, &c.UpdatedAt); err != nil {
			return nil, err
		}
		channels = append(channels, c)
	}
	return channels, nil
}

func (r *ChannelRepo) GetByID(ctx context.Context, channelID string) (*models.Channel, error) {
	var c models.Channel
	err := r.db.QueryRow(ctx, `
		SELECT id, team_id, name, description, type, visibility,
		       is_default, is_locked, created_by, created_at, updated_at
		FROM workspace.channels WHERE id = $1
	`, channelID).Scan(&c.ID, &c.TeamID, &c.Name, &c.Description,
		&c.Type, &c.Visibility, &c.IsDefault, &c.IsLocked, &c.CreatedBy,
		&c.CreatedAt, &c.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return &c, nil
}

func (r *ChannelRepo) Create(ctx context.Context, teamID string, input models.CreateChannelInput, createdBy string) (*models.Channel, error) {
	var c models.Channel
	err := r.db.QueryRow(ctx, `
		INSERT INTO workspace.channels (team_id, name, description, type, visibility, created_by)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING id, team_id, name, description, type, visibility, is_default, is_locked, created_by, created_at, updated_at
	`, teamID, input.Name, input.Description, input.Type, input.Visibility, createdBy,
	).Scan(&c.ID, &c.TeamID, &c.Name, &c.Description,
		&c.Type, &c.Visibility, &c.IsDefault, &c.IsLocked, &c.CreatedBy,
		&c.CreatedAt, &c.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return &c, nil
}

func (r *ChannelRepo) Update(ctx context.Context, id string, fields map[string]interface{}) (*models.Channel, error) {
	// Whitelist allowed column names to prevent SQL injection
	allowed := map[string]bool{
		"name": true, "description": true, "type": true, "visibility": true, "is_locked": true,
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
	setClauses += ", updated_at = NOW()"

	var c models.Channel
	err := r.db.QueryRow(ctx, `
		UPDATE workspace.channels SET `+setClauses+`
		WHERE id = $1
		RETURNING id, team_id, name, description, type, visibility, is_default, is_locked, created_by, created_at, updated_at
	`, args...).Scan(&c.ID, &c.TeamID, &c.Name, &c.Description,
		&c.Type, &c.Visibility, &c.IsDefault, &c.IsLocked, &c.CreatedBy,
		&c.CreatedAt, &c.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return &c, nil
}

func (r *ChannelRepo) Delete(ctx context.Context, id string) error {
	_, err := r.db.Exec(ctx, `DELETE FROM workspace.channels WHERE id = $1 AND is_default = false`, id)
	return err
}

func (r *ChannelRepo) GetDefault(ctx context.Context, teamID string) (*models.Channel, error) {
	var c models.Channel
	err := r.db.QueryRow(ctx, `
		SELECT id, team_id, name, description, type, visibility,
		       is_default, is_locked, created_by, created_at, updated_at
		FROM workspace.channels
		WHERE team_id = $1 AND is_default = true
		ORDER BY name LIMIT 1
	`, teamID).Scan(&c.ID, &c.TeamID, &c.Name, &c.Description,
		&c.Type, &c.Visibility, &c.IsDefault, &c.IsLocked, &c.CreatedBy,
		&c.CreatedAt, &c.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return &c, nil
}
