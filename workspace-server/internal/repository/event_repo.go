package repository

import (
	"context"
	"encoding/json"

	"github.com/AirSend/workspace-server/internal/models"
	"github.com/jackc/pgx/v5/pgxpool"
)

// ═══════════════════════════════════════════════════════════════════════════
// EventRepo — audit log persistence
// ═══════════════════════════════════════════════════════════════════════════

type EventRepo struct {
	db *pgxpool.Pool
}

func NewEventRepo(db *pgxpool.Pool) *EventRepo {
	return &EventRepo{db: db}
}

func (r *EventRepo) Log(ctx context.Context, event models.Event) error {
	meta, _ := json.Marshal(event.Metadata)
	_, err := r.db.Exec(ctx, `
		INSERT INTO workspace.events (actor_email, action, resource_type, resource_id, team_id, metadata, ip_address, user_agent)
		VALUES ($1, $2, $3, $4, $5, $6, $7::inet, $8)
	`, event.ActorEmail, event.Action, event.ResourceType, event.ResourceID,
		event.TeamID, meta, event.IPAddress, event.UserAgent)
	return err
}

func (r *EventRepo) List(ctx context.Context, params models.EventQueryParams) ([]models.Event, int, error) {
	if params.Page < 1 {
		params.Page = 1
	}
	if params.Limit < 1 || params.Limit > 100 {
		params.Limit = 50
	}
	offset := (params.Page - 1) * params.Limit

	// Build dynamic WHERE clause
	where := "WHERE 1=1"
	args := []interface{}{}
	argN := 0

	nextArg := func() string {
		argN++
		return "$" + itoa(argN)
	}

	if params.TeamID != nil {
		where += " AND team_id = " + nextArg()
		args = append(args, *params.TeamID)
	}
	if params.ActorEmail != nil {
		where += " AND actor_email = " + nextArg()
		args = append(args, *params.ActorEmail)
	}
	if params.Action != nil {
		where += " AND action = " + nextArg()
		args = append(args, *params.Action)
	}
	if params.ResourceType != nil {
		where += " AND resource_type = " + nextArg()
		args = append(args, *params.ResourceType)
	}

	// Count
	var total int
	countArgs := make([]interface{}, len(args))
	copy(countArgs, args)
	err := r.db.QueryRow(ctx, "SELECT COUNT(*) FROM workspace.events "+where, countArgs...).Scan(&total)
	if err != nil {
		return nil, 0, err
	}

	// Query
	limitArg := nextArg()
	args = append(args, params.Limit)
	offsetArg := nextArg()
	args = append(args, offset)

	rows, err := r.db.Query(ctx, `
		SELECT id, actor_email, action, resource_type, resource_id, team_id,
		       metadata, ip_address, user_agent, created_at
		FROM workspace.events `+where+`
		ORDER BY created_at DESC
		LIMIT `+limitArg+` OFFSET `+offsetArg, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var events []models.Event
	for rows.Next() {
		var e models.Event
		var metaRaw []byte
		var ipStr *string
		if err := rows.Scan(&e.ID, &e.ActorEmail, &e.Action, &e.ResourceType,
			&e.ResourceID, &e.TeamID, &metaRaw, &ipStr, &e.UserAgent, &e.CreatedAt); err != nil {
			return nil, 0, err
		}
		if metaRaw != nil {
			json.Unmarshal(metaRaw, &e.Metadata)
		}
		e.IPAddress = ipStr
		events = append(events, e)
	}
	return events, total, nil
}

func (r *EventRepo) GetByID(ctx context.Context, id string) (*models.Event, error) {
	var e models.Event
	var metaRaw []byte
	var ipStr *string
	err := r.db.QueryRow(ctx, `
		SELECT id, actor_email, action, resource_type, resource_id, team_id,
		       metadata, ip_address, user_agent, created_at
		FROM workspace.events WHERE id = $1
	`, id).Scan(&e.ID, &e.ActorEmail, &e.Action, &e.ResourceType,
		&e.ResourceID, &e.TeamID, &metaRaw, &ipStr, &e.UserAgent, &e.CreatedAt)
	if err != nil {
		return nil, err
	}
	if metaRaw != nil {
		json.Unmarshal(metaRaw, &e.Metadata)
	}
	e.IPAddress = ipStr
	return &e, nil
}

func itoa(n int) string {
	if n < 10 {
		return string(rune('0' + n))
	}
	return itoa(n/10) + string(rune('0'+n%10))
}
