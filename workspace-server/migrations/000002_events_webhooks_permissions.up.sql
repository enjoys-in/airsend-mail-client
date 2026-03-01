-- ============================================================================
-- Migration 000002: Events, Webhooks, Permissions, Invitations
-- ============================================================================

-- ── Events / Audit Log ──
CREATE TABLE IF NOT EXISTS workspace.events (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_email   VARCHAR(255) NOT NULL,
    action        VARCHAR(50)  NOT NULL,        -- e.g. 'message.sent', 'channel.created', 'member.joined'
    resource_type VARCHAR(30)  NOT NULL,         -- 'message', 'channel', 'team', 'member', 'dm'
    resource_id   VARCHAR(255),
    team_id       UUID REFERENCES workspace.teams(id) ON DELETE SET NULL,
    metadata      JSONB DEFAULT '{}',
    ip_address    INET,
    user_agent    TEXT,
    created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_events_actor      ON workspace.events (actor_email, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_team       ON workspace.events (team_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_action     ON workspace.events (action, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_resource   ON workspace.events (resource_type, resource_id);

-- ── Webhooks ──
CREATE TABLE IF NOT EXISTS workspace.webhooks (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id          UUID         NOT NULL REFERENCES workspace.teams(id) ON DELETE CASCADE,
    name             VARCHAR(100) NOT NULL,
    url              TEXT         NOT NULL,
    secret           VARCHAR(255),
    events           TEXT[]       NOT NULL DEFAULT '{}',    -- subscribed event types
    is_active        BOOLEAN DEFAULT true,
    created_by       VARCHAR(255) NOT NULL,
    last_triggered_at TIMESTAMPTZ,
    failure_count    INT DEFAULT 0,
    created_at       TIMESTAMPTZ DEFAULT NOW(),
    updated_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_webhooks_team     ON workspace.webhooks (team_id, is_active);

-- ── Webhook Deliveries (delivery log / retry queue) ──
CREATE TABLE IF NOT EXISTS workspace.webhook_deliveries (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    webhook_id      UUID         NOT NULL REFERENCES workspace.webhooks(id) ON DELETE CASCADE,
    event_id        UUID         REFERENCES workspace.events(id) ON DELETE SET NULL,
    payload         JSONB        NOT NULL,
    response_status INT,
    response_body   TEXT,
    status          VARCHAR(20)  DEFAULT 'pending',  -- pending, success, failed, retrying
    attempts        INT DEFAULT 0,
    next_retry_at   TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    completed_at    TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_webhook_del_status ON workspace.webhook_deliveries (status, next_retry_at)
    WHERE status IN ('pending', 'retrying');

-- ── Permissions (OpenFGA-inspired relationship tuples) ──
CREATE TABLE IF NOT EXISTS workspace.permissions (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    object_type VARCHAR(30)  NOT NULL,  -- 'team', 'channel', 'message'
    object_id   VARCHAR(255) NOT NULL,
    relation    VARCHAR(30)  NOT NULL,  -- 'owner', 'admin', 'member', 'viewer', 'can_post', 'can_invite'
    user_email  VARCHAR(255) NOT NULL,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(object_type, object_id, relation, user_email)
);

CREATE INDEX IF NOT EXISTS idx_perm_user   ON workspace.permissions (user_email, object_type);
CREATE INDEX IF NOT EXISTS idx_perm_object ON workspace.permissions (object_type, object_id);

-- ── Invitations ──
CREATE TABLE IF NOT EXISTS workspace.invitations (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id        UUID         NOT NULL REFERENCES workspace.teams(id) ON DELETE CASCADE,
    inviter_email  VARCHAR(255) NOT NULL,
    invitee_email  VARCHAR(255) NOT NULL,
    role           VARCHAR(20)  DEFAULT 'member',
    status         VARCHAR(20)  DEFAULT 'pending',   -- pending, accepted, declined, expired
    token          VARCHAR(255) NOT NULL UNIQUE,
    expires_at     TIMESTAMPTZ  NOT NULL,
    created_at     TIMESTAMPTZ DEFAULT NOW(),
    responded_at   TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_invitations_invitee ON workspace.invitations (invitee_email, status);
CREATE INDEX IF NOT EXISTS idx_invitations_team    ON workspace.invitations (team_id, status);
CREATE INDEX IF NOT EXISTS idx_invitations_token   ON workspace.invitations (token) WHERE status = 'pending';

-- ── User Presence (for WebSocket tracking) ──
CREATE TABLE IF NOT EXISTS workspace.user_presence (
    email       VARCHAR(255) PRIMARY KEY,
    status      VARCHAR(20)  DEFAULT 'offline',  -- online, idle, dnd, offline
    last_seen   TIMESTAMPTZ  DEFAULT NOW(),
    client_info JSONB DEFAULT '{}'
);
