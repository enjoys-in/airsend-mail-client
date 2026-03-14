-- ============================================================================
-- Migration 000005: Add bytea content to attachments, voice channel sessions
-- ============================================================================

-- Add file_content (bytea) for inline file storage
ALTER TABLE workspace.message_attachments
    ADD COLUMN IF NOT EXISTS file_content BYTEA;

-- Voice channel sessions — tracks active voice participants
CREATE TABLE IF NOT EXISTS workspace.voice_sessions (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    channel_id    UUID NOT NULL REFERENCES workspace.channels(id) ON DELETE CASCADE,
    user_email    VARCHAR(255) NOT NULL,
    joined_at     TIMESTAMPTZ DEFAULT NOW(),
    left_at       TIMESTAMPTZ,
    is_muted      BOOLEAN DEFAULT false,
    is_deafened   BOOLEAN DEFAULT false,
    UNIQUE (channel_id, user_email)
);

CREATE INDEX IF NOT EXISTS idx_voice_sessions_channel ON workspace.voice_sessions (channel_id) WHERE left_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_voice_sessions_user ON workspace.voice_sessions (user_email) WHERE left_at IS NULL;

-- Voice signaling offers/answers (ephemeral, cleaned by background worker)
CREATE TABLE IF NOT EXISTS workspace.voice_signals (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    channel_id    UUID NOT NULL REFERENCES workspace.channels(id) ON DELETE CASCADE,
    from_email    VARCHAR(255) NOT NULL,
    to_email      VARCHAR(255) NOT NULL,
    signal_type   VARCHAR(20) NOT NULL,      -- offer, answer, ice-candidate
    payload       JSONB NOT NULL,
    created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_voice_signals_to ON workspace.voice_signals (to_email, channel_id, created_at);
