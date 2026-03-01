package router

import (
	"github.com/AirSend/workspace-server/internal/handlers"
	"github.com/AirSend/workspace-server/internal/middleware"
	"github.com/AirSend/workspace-server/internal/ws"
	"github.com/gofiber/fiber/v2"
)

// Setup registers all API routes on the Fiber app.
func Setup(app *fiber.App, h *handlers.Handler, hub *ws.Hub) {
	api := app.Group("/api/v1", middleware.Auth())

	// ── Teams ──
	teams := api.Group("/teams")
	teams.Get("/", h.ListTeams)
	teams.Post("/", h.CreateTeam)
	teams.Get("/:teamId", h.GetTeam)
	teams.Put("/:teamId", h.UpdateTeam)
	teams.Delete("/:teamId", h.DeleteTeam)

	// ── Team Channels ──
	teams.Get("/:teamId/channels", h.ListChannels)
	teams.Post("/:teamId/channels", h.CreateChannel)

	// ── Team Members ──
	teams.Get("/:teamId/members", h.ListMembers)
	teams.Post("/:teamId/members", h.AddMember)
	teams.Put("/:teamId/members/me/status", h.UpdateMyStatus)
	teams.Put("/:teamId/members/:email/role", h.ChangeMemberRole)
	teams.Delete("/:teamId/members/:email", h.RemoveMember)

	// ── Team Invitations ──
	teams.Get("/:teamId/invitations", h.ListTeamInvitations)
	teams.Post("/:teamId/invitations", h.CreateInvitation)
	teams.Delete("/:teamId/invitations/:invitationId", h.RevokeInvitation)

	// ── Team Webhooks ──
	teams.Get("/:teamId/webhooks", h.ListWebhooks)
	teams.Post("/:teamId/webhooks", h.CreateWebhook)
	teams.Delete("/:teamId/webhooks/:webhookId", h.DeleteWebhook)

	// ── Channels (direct) ──
	channels := api.Group("/channels")
	channels.Get("/:channelId", h.GetChannel)
	channels.Put("/:channelId", h.UpdateChannel)
	channels.Delete("/:channelId", h.DeleteChannel)
	channels.Put("/:channelId/lock", h.LockChannel)
	channels.Get("/:channelId/messages", h.ListMessages)
	channels.Post("/:channelId/messages", h.SendMessage)
	channels.Get("/:channelId/pinned", h.GetPinnedMessages)

	// ── Channel Polls ──
	channels.Post("/:channelId/polls", h.CreatePoll)
	channels.Get("/:channelId/polls", h.ListChannelPolls)

	// ── Polls (direct) ──
	polls := api.Group("/polls")
	polls.Get("/:pollId", h.GetPoll)
	polls.Post("/:pollId/vote", h.VotePoll)
	polls.Put("/:pollId/close", h.ClosePoll)
	polls.Delete("/:pollId", h.DeletePoll)

	// ── Messages ──
	messages := api.Group("/messages")
	messages.Get("/:messageId", h.GetMessage)
	messages.Put("/:messageId", h.EditMessage)
	messages.Delete("/:messageId", h.DeleteMessage)
	messages.Put("/:messageId/pin", h.PinMessage)
	messages.Post("/:messageId/reactions", h.AddReaction)
	messages.Delete("/:messageId/reactions/:emoji", h.RemoveReaction)
	messages.Get("/:messageId/thread", h.GetThread)
	messages.Post("/:messageId/thread", h.ReplyToThread)

	// ── Direct Messages ──
	dms := api.Group("/dms")
	dms.Get("/", h.ListDMs)
	dms.Post("/", h.CreateDM)
	dms.Get("/:dmId", h.GetDM)
	dms.Get("/:dmId/messages", h.ListDMMessages)
	dms.Post("/:dmId/messages", h.SendDM)

	// ── Events / Audit Log ──
	events := api.Group("/events")
	events.Get("/", h.ListEvents)
	events.Get("/:eventId", h.GetEvent)

	// ── Invitations (user-facing) ──
	invitations := api.Group("/invitations")
	invitations.Get("/", h.ListMyInvitations)
	invitations.Post("/accept", h.AcceptInvitation)
	invitations.Post("/decline", h.DeclineInvitation)

	// ── WebSocket ──
	app.Use("/ws", ws.UpgradeMiddleware())
	app.Get("/ws", ws.Handler(hub, nil))
}
