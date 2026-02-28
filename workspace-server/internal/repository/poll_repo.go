package repository

import (
	"context"

	"github.com/AirSend/workspace-server/internal/models"
	"github.com/jackc/pgx/v5/pgxpool"
)

// ═══════════════════════════════════════════════════════════════════════════
// PollRepo — PostgreSQL implementation for polls
// ═══════════════════════════════════════════════════════════════════════════

type PollRepo struct {
	db *pgxpool.Pool
}

func NewPollRepo(db *pgxpool.Pool) *PollRepo {
	return &PollRepo{db: db}
}

// Create inserts a poll and its options in a transaction.
func (r *PollRepo) Create(ctx context.Context, channelID string, input models.CreatePollInput, createdBy string) (*models.Poll, error) {
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return nil, err
	}
	defer tx.Rollback(ctx)

	var p models.Poll
	var expiresAt interface{}
	if input.ExpiresAt != nil {
		expiresAt = *input.ExpiresAt
	}
	err = tx.QueryRow(ctx, `
		INSERT INTO workspace.polls (channel_id, created_by, question, is_multi_select, is_anonymous, expires_at)
		VALUES ($1, $2, $3, $4, $5, $6::timestamptz)
		RETURNING id, channel_id, created_by, question, is_multi_select, is_anonymous, is_closed, expires_at, created_at, updated_at
	`, channelID, createdBy, input.Question, input.IsMultiSelect, input.IsAnonymous, expiresAt,
	).Scan(&p.ID, &p.ChannelID, &p.CreatedBy, &p.Question,
		&p.IsMultiSelect, &p.IsAnonymous, &p.IsClosed, &p.ExpiresAt,
		&p.CreatedAt, &p.UpdatedAt)
	if err != nil {
		return nil, err
	}

	// Insert options
	p.Options = make([]models.PollOption, 0, len(input.Options))
	for i, text := range input.Options {
		var opt models.PollOption
		err = tx.QueryRow(ctx, `
			INSERT INTO workspace.poll_options (poll_id, text, position)
			VALUES ($1, $2, $3)
			RETURNING id, poll_id, text, position
		`, p.ID, text, i).Scan(&opt.ID, &opt.PollID, &opt.Text, &opt.Position)
		if err != nil {
			return nil, err
		}
		opt.VoteCount = 0
		opt.VoterEmail = []string{}
		p.Options = append(p.Options, opt)
	}

	if err = tx.Commit(ctx); err != nil {
		return nil, err
	}

	p.TotalVotes = 0
	return &p, nil
}

// GetByID returns a poll with options and vote counts.
func (r *PollRepo) GetByID(ctx context.Context, pollID string) (*models.Poll, error) {
	var p models.Poll
	err := r.db.QueryRow(ctx, `
		SELECT p.id, p.channel_id, p.created_by, p.question,
		       p.is_multi_select, p.is_anonymous, p.is_closed, p.expires_at,
		       p.created_at, p.updated_at,
		       ma.name
		FROM workspace.polls p
		LEFT JOIN public.mail_accounts ma ON ma.email = p.created_by
		WHERE p.id = $1
	`, pollID).Scan(&p.ID, &p.ChannelID, &p.CreatedBy, &p.Question,
		&p.IsMultiSelect, &p.IsAnonymous, &p.IsClosed, &p.ExpiresAt,
		&p.CreatedAt, &p.UpdatedAt, &p.CreatorName)
	if err != nil {
		return nil, err
	}

	// Fetch options with vote counts
	rows, err := r.db.Query(ctx, `
		SELECT o.id, o.poll_id, o.text, o.position,
		       COUNT(v.id) AS vote_count
		FROM workspace.poll_options o
		LEFT JOIN workspace.poll_votes v ON v.option_id = o.id
		WHERE o.poll_id = $1
		GROUP BY o.id, o.poll_id, o.text, o.position
		ORDER BY o.position
	`, pollID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	totalVotes := 0
	for rows.Next() {
		var opt models.PollOption
		if err := rows.Scan(&opt.ID, &opt.PollID, &opt.Text, &opt.Position, &opt.VoteCount); err != nil {
			return nil, err
		}

		// Fetch voters for this option (unless anonymous)
		if !p.IsAnonymous {
			voterRows, err := r.db.Query(ctx, `
				SELECT voter_email FROM workspace.poll_votes WHERE option_id = $1
			`, opt.ID)
			if err == nil {
				var voters []string
				for voterRows.Next() {
					var email string
					if err := voterRows.Scan(&email); err == nil {
						voters = append(voters, email)
					}
				}
				voterRows.Close()
				opt.VoterEmail = voters
			}
		} else {
			opt.VoterEmail = nil
		}

		totalVotes += opt.VoteCount
		p.Options = append(p.Options, opt)
	}
	p.TotalVotes = totalVotes

	return &p, nil
}

// ListByChannel returns all polls for a channel.
func (r *PollRepo) ListByChannel(ctx context.Context, channelID string) ([]models.Poll, error) {
	rows, err := r.db.Query(ctx, `
		SELECT p.id, p.channel_id, p.created_by, p.question,
		       p.is_multi_select, p.is_anonymous, p.is_closed, p.expires_at,
		       p.created_at, p.updated_at,
		       ma.name
		FROM workspace.polls p
		LEFT JOIN public.mail_accounts ma ON ma.email = p.created_by
		WHERE p.channel_id = $1
		ORDER BY p.created_at DESC
	`, channelID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var polls []models.Poll
	for rows.Next() {
		var p models.Poll
		if err := rows.Scan(&p.ID, &p.ChannelID, &p.CreatedBy, &p.Question,
			&p.IsMultiSelect, &p.IsAnonymous, &p.IsClosed, &p.ExpiresAt,
			&p.CreatedAt, &p.UpdatedAt, &p.CreatorName); err != nil {
			return nil, err
		}
		polls = append(polls, p)
	}

	// Fetch options + counts for each poll
	for i := range polls {
		optRows, err := r.db.Query(ctx, `
			SELECT o.id, o.poll_id, o.text, o.position,
			       COUNT(v.id) AS vote_count
			FROM workspace.poll_options o
			LEFT JOIN workspace.poll_votes v ON v.option_id = o.id
			WHERE o.poll_id = $1
			GROUP BY o.id, o.poll_id, o.text, o.position
			ORDER BY o.position
		`, polls[i].ID)
		if err != nil {
			continue
		}
		total := 0
		for optRows.Next() {
			var opt models.PollOption
			if err := optRows.Scan(&opt.ID, &opt.PollID, &opt.Text, &opt.Position, &opt.VoteCount); err != nil {
				continue
			}
			opt.VoterEmail = nil
			total += opt.VoteCount
			polls[i].Options = append(polls[i].Options, opt)
		}
		optRows.Close()
		polls[i].TotalVotes = total
	}

	return polls, nil
}

// Vote records votes for a user. Removes previous votes first, then inserts new ones.
func (r *PollRepo) Vote(ctx context.Context, pollID string, optionIDs []string, voterEmail string) error {
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)

	// Remove existing votes for this user on this poll
	_, err = tx.Exec(ctx, `
		DELETE FROM workspace.poll_votes WHERE poll_id = $1 AND voter_email = $2
	`, pollID, voterEmail)
	if err != nil {
		return err
	}

	// Insert new votes
	for _, optID := range optionIDs {
		_, err = tx.Exec(ctx, `
			INSERT INTO workspace.poll_votes (poll_id, option_id, voter_email)
			VALUES ($1, $2, $3)
			ON CONFLICT DO NOTHING
		`, pollID, optID, voterEmail)
		if err != nil {
			return err
		}
	}

	return tx.Commit(ctx)
}

// Close marks a poll as closed.
func (r *PollRepo) Close(ctx context.Context, pollID string) error {
	_, err := r.db.Exec(ctx, `
		UPDATE workspace.polls SET is_closed = true, updated_at = NOW()
		WHERE id = $1
	`, pollID)
	return err
}

// Delete removes a poll.
func (r *PollRepo) Delete(ctx context.Context, pollID string) error {
	_, err := r.db.Exec(ctx, `DELETE FROM workspace.polls WHERE id = $1`, pollID)
	return err
}

// GetVoterChoices returns the option IDs a given user has voted for.
func (r *PollRepo) GetVoterChoices(ctx context.Context, pollID, voterEmail string) ([]string, error) {
	rows, err := r.db.Query(ctx, `
		SELECT option_id FROM workspace.poll_votes
		WHERE poll_id = $1 AND voter_email = $2
	`, pollID, voterEmail)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var ids []string
	for rows.Next() {
		var id string
		if err := rows.Scan(&id); err != nil {
			return nil, err
		}
		ids = append(ids, id)
	}
	return ids, nil
}
