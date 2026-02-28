-- ============================================================================
-- Migration 000004: Create polls, poll options, poll votes
-- ============================================================================

-- Polls table
CREATE TABLE IF NOT EXISTS workspace.polls (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    channel_id      UUID NOT NULL REFERENCES workspace.channels(id) ON DELETE CASCADE,
    created_by      VARCHAR(255) NOT NULL,
    question        TEXT NOT NULL,
    is_multi_select BOOLEAN DEFAULT false,
    is_anonymous    BOOLEAN DEFAULT false,
    is_closed       BOOLEAN DEFAULT false,
    expires_at      TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_polls_channel ON workspace.polls (channel_id);
CREATE INDEX IF NOT EXISTS idx_polls_created_by ON workspace.polls (created_by);

-- Poll options table
CREATE TABLE IF NOT EXISTS workspace.poll_options (
    id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    poll_id   UUID NOT NULL REFERENCES workspace.polls(id) ON DELETE CASCADE,
    text      TEXT NOT NULL,
    position  INT NOT NULL DEFAULT 0,
    UNIQUE (poll_id, position)
);

CREATE INDEX IF NOT EXISTS idx_poll_options_poll ON workspace.poll_options (poll_id);

-- Poll votes table
CREATE TABLE IF NOT EXISTS workspace.poll_votes (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    poll_id    UUID NOT NULL REFERENCES workspace.polls(id) ON DELETE CASCADE,
    option_id  UUID NOT NULL REFERENCES workspace.poll_options(id) ON DELETE CASCADE,
    voter_email VARCHAR(255) NOT NULL,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (poll_id, option_id, voter_email)
);

CREATE INDEX IF NOT EXISTS idx_poll_votes_poll ON workspace.poll_votes (poll_id);
CREATE INDEX IF NOT EXISTS idx_poll_votes_option ON workspace.poll_votes (option_id);
CREATE INDEX IF NOT EXISTS idx_poll_votes_voter ON workspace.poll_votes (voter_email);
