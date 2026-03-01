package permissions

import (
	"context"
	"log"

	"github.com/jackc/pgx/v5/pgxpool"
)

// ═══════════════════════════════════════════════════════════════════════════
// OpenFGA-inspired Permission System (Zanzibar relationship tuples)
// ═══════════════════════════════════════════════════════════════════════════
//
// Concepts:
//   - ObjectType + ObjectID = the resource (e.g. "team", "team-uuid-123")
//   - Relation = the role/capability (e.g. "owner", "admin", "member", "viewer")
//   - UserEmail = the subject
//
// Implicit relation hierarchy for teams/channels:
//   owner  → admin → member → viewer
//   (owner implies admin, admin implies member, etc.)
//

// RelationHierarchy defines implicit permission inheritance.
// If a user has "owner", they implicitly have "admin", "member", "viewer" too.
var RelationHierarchy = map[string][]string{
	"owner":     {"admin", "member", "viewer", "can_post", "can_invite"},
	"admin":     {"member", "viewer", "can_post", "can_invite"},
	"moderator": {"member", "viewer", "can_post"},
	"member":    {"viewer", "can_post"},
}

type FGA struct {
	db *pgxpool.Pool
}

func NewFGA(db *pgxpool.Pool) *FGA {
	return &FGA{db: db}
}

// ── Write — create a relationship tuple ──

func (f *FGA) WriteTuple(ctx context.Context, objectType, objectID, relation, userEmail string) error {
	_, err := f.db.Exec(ctx, `
		INSERT INTO workspace.permissions (object_type, object_id, relation, user_email)
		VALUES ($1, $2, $3, $4)
		ON CONFLICT (object_type, object_id, relation, user_email) DO NOTHING
	`, objectType, objectID, relation, userEmail)
	return err
}

// ── Delete — remove a relationship tuple ──

func (f *FGA) DeleteTuple(ctx context.Context, objectType, objectID, relation, userEmail string) error {
	_, err := f.db.Exec(ctx, `
		DELETE FROM workspace.permissions
		WHERE object_type = $1 AND object_id = $2 AND relation = $3 AND user_email = $4
	`, objectType, objectID, relation, userEmail)
	return err
}

// ── Check — does user have this relation (explicit or implicit)? ──

func (f *FGA) Check(ctx context.Context, objectType, objectID, relation, userEmail string) (bool, error) {
	// Build list of relations that imply the requested relation
	relationsToCheck := []string{relation}
	for parent, implied := range RelationHierarchy {
		for _, r := range implied {
			if r == relation {
				relationsToCheck = append(relationsToCheck, parent)
			}
		}
	}

	var count int
	err := f.db.QueryRow(ctx, `
		SELECT COUNT(*) FROM workspace.permissions
		WHERE object_type = $1 AND object_id = $2
			AND relation = ANY($3) AND user_email = $4
	`, objectType, objectID, relationsToCheck, userEmail).Scan(&count)
	if err != nil {
		return false, err
	}
	return count > 0, nil
}

// ── ListObjects — what objects does user have relation on? ──

func (f *FGA) ListObjects(ctx context.Context, objectType, relation, userEmail string) ([]string, error) {
	relationsToCheck := []string{relation}
	for parent, implied := range RelationHierarchy {
		for _, r := range implied {
			if r == relation {
				relationsToCheck = append(relationsToCheck, parent)
			}
		}
	}

	rows, err := f.db.Query(ctx, `
		SELECT DISTINCT object_id FROM workspace.permissions
		WHERE object_type = $1 AND relation = ANY($2) AND user_email = $3
	`, objectType, relationsToCheck, userEmail)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var objects []string
	for rows.Next() {
		var id string
		if err := rows.Scan(&id); err != nil {
			return nil, err
		}
		objects = append(objects, id)
	}
	return objects, nil
}

// ── ListRelations — what relations does user have on this object? ──

func (f *FGA) ListRelations(ctx context.Context, objectType, objectID, userEmail string) ([]string, error) {
	rows, err := f.db.Query(ctx, `
		SELECT relation FROM workspace.permissions
		WHERE object_type = $1 AND object_id = $2 AND user_email = $3
	`, objectType, objectID, userEmail)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var rels []string
	for rows.Next() {
		var r string
		if err := rows.Scan(&r); err != nil {
			return nil, err
		}
		rels = append(rels, r)
	}

	// Expand implicit relations
	expanded := make(map[string]bool)
	for _, r := range rels {
		expanded[r] = true
		if implied, ok := RelationHierarchy[r]; ok {
			for _, ir := range implied {
				expanded[ir] = true
			}
		}
	}

	result := make([]string, 0, len(expanded))
	for r := range expanded {
		result = append(result, r)
	}
	return result, nil
}

// ── DeleteAllForObject — cleanup when object is deleted ──

func (f *FGA) DeleteAllForObject(ctx context.Context, objectType, objectID string) error {
	_, err := f.db.Exec(ctx, `
		DELETE FROM workspace.permissions
		WHERE object_type = $1 AND object_id = $2
	`, objectType, objectID)
	return err
}

// ── SyncTeamMemberPermissions — syncs team_members roles to permission tuples ──
// Call after team member role changes.

func (f *FGA) SyncTeamMemberPermissions(ctx context.Context, teamID, userEmail, role string) error {
	// Delete existing team permission for this user
	_, err := f.db.Exec(ctx, `
		DELETE FROM workspace.permissions
		WHERE object_type = 'team' AND object_id = $1 AND user_email = $2
	`, teamID, userEmail)
	if err != nil {
		return err
	}

	// Write new relation
	if err := f.WriteTuple(ctx, "team", teamID, role, userEmail); err != nil {
		return err
	}

	log.Printf("[fga] synced team=%s user=%s role=%s", teamID, userEmail, role)
	return nil
}
