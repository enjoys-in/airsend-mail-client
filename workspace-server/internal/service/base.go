package service

import (
	"github.com/AirSend/workspace-server/internal/cache"
	"github.com/AirSend/workspace-server/internal/permissions"
	"github.com/AirSend/workspace-server/internal/repository"
	"github.com/AirSend/workspace-server/internal/streaming"
	"github.com/AirSend/workspace-server/internal/ws"
)

// ═══════════════════════════════════════════════════════════════════════════
// Deps — shared dependencies injected into every service
// ═══════════════════════════════════════════════════════════════════════════

type Deps struct {
	// ── repos ──
	Teams       *repository.TeamRepo
	Channels    *repository.ChannelRepo
	Messages    *repository.MessageRepo
	Members     *repository.MemberRepo
	DMs         *repository.DMRepo
	Events      *repository.EventRepo
	Webhooks    *repository.WebhookRepo
	Invitations *repository.InvitationRepo
	Polls       *repository.PollRepo

	// ── cross-cutting ──
	Cache       *cache.CacheService
	Stream      *streaming.RedisStream
	Hub         *ws.Hub
	Permissions *permissions.FGA
}
