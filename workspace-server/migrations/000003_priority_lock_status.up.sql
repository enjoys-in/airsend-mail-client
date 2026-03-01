-- ============================================================================
-- Migration 000003: Add message priority, channel locking, user status
-- ============================================================================

-- Message priority: normal, everyone, urgent, priority
ALTER TABLE workspace.messages ADD COLUMN IF NOT EXISTS priority VARCHAR(20) DEFAULT 'normal';

-- Channel locking: locked channels restrict posting to admins/moderators only
ALTER TABLE workspace.channels ADD COLUMN IF NOT EXISTS is_locked BOOLEAN DEFAULT false;

-- Channel members table: for managing private channel membership
CREATE TABLE IF NOT EXISTS workspace.channel_members (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    channel_id    UUID NOT NULL REFERENCES workspace.channels(id) ON DELETE CASCADE,
    email         VARCHAR(255) NOT NULL,
    added_by      VARCHAR(255),
    created_at    TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (channel_id, email)
);

CREATE INDEX IF NOT EXISTS idx_channel_members_channel ON workspace.channel_members (channel_id);
CREATE INDEX IF NOT EXISTS idx_channel_members_email ON workspace.channel_members (email);

-- DM message priority
ALTER TABLE workspace.dm_messages ADD COLUMN IF NOT EXISTS priority VARCHAR(20) DEFAULT 'normal';
