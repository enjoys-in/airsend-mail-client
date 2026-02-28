-- ============================================================================
-- workspace schema — all tables for the teams/channels/chat system
-- References public.mail_accounts(email) for user identity
-- ============================================================================

CREATE SCHEMA IF NOT EXISTS workspace;

-- ── Teams ──
CREATE TABLE workspace.teams (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name          VARCHAR(100) NOT NULL,
    description   TEXT,
    logo_url      TEXT,
    owner_email   VARCHAR(255) NOT NULL,
    is_private    BOOLEAN DEFAULT false,
    created_at    TIMESTAMPTZ DEFAULT NOW(),
    updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_teams_owner ON workspace.teams (owner_email);

-- ── Team Members ──
CREATE TABLE workspace.team_members (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id       UUID NOT NULL REFERENCES workspace.teams(id) ON DELETE CASCADE,
    email         VARCHAR(255) NOT NULL,
    role          VARCHAR(20) NOT NULL DEFAULT 'member',   -- owner, admin, moderator, member
    display_name  VARCHAR(100),
    status        VARCHAR(20) DEFAULT 'offline',           -- online, idle, dnd, offline
    custom_status TEXT,
    joined_at     TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (team_id, email)
);

CREATE INDEX idx_team_members_email ON workspace.team_members (email);
CREATE INDEX idx_team_members_team  ON workspace.team_members (team_id);

-- ── Channels ──
CREATE TABLE workspace.channels (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id       UUID NOT NULL REFERENCES workspace.teams(id) ON DELETE CASCADE,
    name          VARCHAR(100) NOT NULL,
    description   TEXT,
    type          VARCHAR(20) NOT NULL DEFAULT 'text',     -- text, voice, announcement
    visibility    VARCHAR(20) NOT NULL DEFAULT 'public',   -- public, private
    is_default    BOOLEAN DEFAULT false,
    created_by    VARCHAR(255),
    created_at    TIMESTAMPTZ DEFAULT NOW(),
    updated_at    TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (team_id, name)
);

CREATE INDEX idx_channels_team ON workspace.channels (team_id);

-- ── Messages ──
CREATE TABLE workspace.messages (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    channel_id    UUID NOT NULL REFERENCES workspace.channels(id) ON DELETE CASCADE,
    sender_email  VARCHAR(255) NOT NULL,
    content       TEXT NOT NULL,
    type          VARCHAR(20) DEFAULT 'text',              -- text, system, announcement
    parent_id     UUID REFERENCES workspace.messages(id) ON DELETE SET NULL,  -- thread parent
    is_pinned     BOOLEAN DEFAULT false,
    is_edited     BOOLEAN DEFAULT false,
    is_deleted    BOOLEAN DEFAULT false,
    mentions      TEXT[],
    created_at    TIMESTAMPTZ DEFAULT NOW(),
    updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_messages_channel    ON workspace.messages (channel_id, created_at);
CREATE INDEX idx_messages_parent     ON workspace.messages (parent_id) WHERE parent_id IS NOT NULL;
CREATE INDEX idx_messages_sender     ON workspace.messages (sender_email);
CREATE INDEX idx_messages_pinned     ON workspace.messages (channel_id) WHERE is_pinned = true;

-- ── Message Attachments ──
CREATE TABLE workspace.message_attachments (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id    UUID NOT NULL REFERENCES workspace.messages(id) ON DELETE CASCADE,
    file_name     VARCHAR(255) NOT NULL,
    file_url      TEXT NOT NULL,
    file_type     VARCHAR(100),
    file_size     BIGINT DEFAULT 0,
    created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_attachments_message ON workspace.message_attachments (message_id);

-- ── Message Reactions ──
CREATE TABLE workspace.message_reactions (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id    UUID NOT NULL REFERENCES workspace.messages(id) ON DELETE CASCADE,
    user_email    VARCHAR(255) NOT NULL,
    emoji         VARCHAR(50) NOT NULL,
    created_at    TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (message_id, user_email, emoji)
);

CREATE INDEX idx_reactions_message ON workspace.message_reactions (message_id);

-- ── DM Conversations ──
CREATE TABLE workspace.dm_conversations (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at    TIMESTAMPTZ DEFAULT NOW(),
    updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── DM Participants ──
CREATE TABLE workspace.dm_participants (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES workspace.dm_conversations(id) ON DELETE CASCADE,
    email           VARCHAR(255) NOT NULL,
    display_name    VARCHAR(100),
    last_read_at    TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (conversation_id, email)
);

CREATE INDEX idx_dm_participants_email ON workspace.dm_participants (email);
CREATE INDEX idx_dm_participants_conv  ON workspace.dm_participants (conversation_id);

-- ── DM Messages ──
CREATE TABLE workspace.dm_messages (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES workspace.dm_conversations(id) ON DELETE CASCADE,
    sender_email    VARCHAR(255) NOT NULL,
    content         TEXT NOT NULL,
    is_edited       BOOLEAN DEFAULT false,
    is_deleted      BOOLEAN DEFAULT false,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_dm_messages_conv ON workspace.dm_messages (conversation_id, created_at);

-- ── Notifications ──
CREATE TABLE workspace.notifications (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_email  VARCHAR(255) NOT NULL,
    type             VARCHAR(30) NOT NULL,   -- mention, reply, reaction, dm, team_invite
    title            TEXT NOT NULL,
    body             TEXT,
    source_id        UUID,
    source_type      VARCHAR(20),            -- message, dm, team
    is_read          BOOLEAN DEFAULT false,
    created_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_recipient ON workspace.notifications (recipient_email, is_read, created_at DESC);

-- ── Tasks ──
CREATE TABLE workspace.tasks (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id         UUID NOT NULL REFERENCES workspace.teams(id) ON DELETE CASCADE,
    title           VARCHAR(255) NOT NULL,
    description     TEXT,
    assignee_email  VARCHAR(255),
    status          VARCHAR(20) DEFAULT 'todo',     -- todo, in_progress, done
    priority        VARCHAR(20) DEFAULT 'medium',   -- urgent, high, medium, low
    due_date        DATE,
    created_by      VARCHAR(255) NOT NULL,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tasks_team     ON workspace.tasks (team_id);
CREATE INDEX idx_tasks_assignee ON workspace.tasks (assignee_email);

-- ── API Cache (in public schema) ──
CREATE TABLE IF NOT EXISTS public.api_cache (
    key         VARCHAR(512) PRIMARY KEY,
    value       JSONB NOT NULL,
    expires_at  TIMESTAMPTZ,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_api_cache_expires ON public.api_cache (expires_at);
