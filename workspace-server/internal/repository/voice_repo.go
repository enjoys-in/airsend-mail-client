package repository

import (
	"context"

	"github.com/AirSend/workspace-server/internal/models"
	"github.com/jackc/pgx/v5/pgxpool"
)

// ═══════════════════════════════════════════════════════════════════════════
// VoiceRepo — voice channel session management
// ═══════════════════════════════════════════════════════════════════════════

type VoiceRepo struct {
	db *pgxpool.Pool
}

func NewVoiceRepo(db *pgxpool.Pool) *VoiceRepo {
	return &VoiceRepo{db: db}
}

// Join marks a user as joined in a voice channel.
func (r *VoiceRepo) Join(ctx context.Context, channelID, email string) (*models.VoiceSession, error) {
	var session models.VoiceSession
	err := r.db.QueryRow(ctx, `
		INSERT INTO workspace.voice_sessions (channel_id, user_email)
		VALUES ($1, $2)
		ON CONFLICT (channel_id, user_email) DO UPDATE SET left_at = NULL, joined_at = NOW(), is_muted = false, is_deafened = false
		RETURNING id, channel_id, user_email, joined_at, left_at, is_muted, is_deafened
	`, channelID, email).Scan(
		&session.ID, &session.ChannelID, &session.UserEmail,
		&session.JoinedAt, &session.LeftAt, &session.IsMuted, &session.IsDeafened,
	)
	if err != nil {
		return nil, err
	}
	return &session, nil
}

// Leave marks a user as left from a voice channel.
func (r *VoiceRepo) Leave(ctx context.Context, channelID, email string) error {
	_, err := r.db.Exec(ctx, `
		UPDATE workspace.voice_sessions SET left_at = NOW()
		WHERE channel_id = $1 AND user_email = $2 AND left_at IS NULL
	`, channelID, email)
	return err
}

// ListParticipants returns active participants in a voice channel.
func (r *VoiceRepo) ListParticipants(ctx context.Context, channelID string) ([]models.VoiceSession, error) {
	rows, err := r.db.Query(ctx, `
		SELECT vs.id, vs.channel_id, vs.user_email, vs.joined_at, vs.left_at, vs.is_muted, vs.is_deafened,
		       COALESCE(tm.display_name, ma.name) AS display_name
		FROM workspace.voice_sessions vs
		LEFT JOIN workspace.team_members tm ON tm.email = vs.user_email
		LEFT JOIN public.mail_accounts ma ON ma.email = vs.user_email
		WHERE vs.channel_id = $1 AND vs.left_at IS NULL
		ORDER BY vs.joined_at
	`, channelID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var participants []models.VoiceSession
	for rows.Next() {
		var p models.VoiceSession
		if err := rows.Scan(&p.ID, &p.ChannelID, &p.UserEmail, &p.JoinedAt,
			&p.LeftAt, &p.IsMuted, &p.IsDeafened, &p.DisplayName); err != nil {
			return nil, err
		}
		participants = append(participants, p)
	}
	return participants, nil
}

// UpdateMute toggles mute/deafen state.
func (r *VoiceRepo) UpdateMute(ctx context.Context, channelID, email string, muted, deafened bool) error {
	_, err := r.db.Exec(ctx, `
		UPDATE workspace.voice_sessions SET is_muted = $3, is_deafened = $4
		WHERE channel_id = $1 AND user_email = $2 AND left_at IS NULL
	`, channelID, email, muted, deafened)
	return err
}

// CleanupStale marks users who have been in voice for too long as left (cleanup on server restart).
func (r *VoiceRepo) CleanupStale(ctx context.Context) error {
	_, err := r.db.Exec(ctx, `
		UPDATE workspace.voice_sessions SET left_at = NOW()
		WHERE left_at IS NULL AND joined_at < NOW() - INTERVAL '24 hours'
	`)
	return err
}
