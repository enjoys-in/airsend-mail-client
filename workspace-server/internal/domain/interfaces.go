package domain

import (
	"context"

	"github.com/AirSend/workspace-server/internal/models"
)

// ═══════════════════════════════════════════════════════════════════════════
// Base Repository Interfaces — contract for all concrete implementations
// ═══════════════════════════════════════════════════════════════════════════

// ── TeamRepository ──

type TeamRepository interface {
	ListByEmail(ctx context.Context, email string) ([]models.Team, error)
	GetByID(ctx context.Context, id string) (*models.Team, error)
	Create(ctx context.Context, input models.CreateTeamInput, ownerEmail string) (*models.Team, error)
	Update(ctx context.Context, id string, fields map[string]interface{}) (*models.Team, error)
	Delete(ctx context.Context, id string) error
}

// ── ChannelRepository ──

type ChannelRepository interface {
	ListByTeam(ctx context.Context, teamID string) ([]models.Channel, error)
	GetByID(ctx context.Context, id string) (*models.Channel, error)
	Create(ctx context.Context, teamID string, input models.CreateChannelInput, createdBy string) (*models.Channel, error)
	Update(ctx context.Context, id string, fields map[string]interface{}) (*models.Channel, error)
	Delete(ctx context.Context, id string) error
	GetDefault(ctx context.Context, teamID string) (*models.Channel, error)
}

// ── MessageRepository ──

type MessageRepository interface {
	List(ctx context.Context, channelID string, page, limit int) ([]models.Message, int, error)
	GetByID(ctx context.Context, id string) (*models.Message, error)
	Send(ctx context.Context, channelID string, input models.SendMessageInput, senderEmail string) (*models.Message, error)
	Edit(ctx context.Context, id, content, senderEmail string) (*models.Message, error)
	Delete(ctx context.Context, id, senderEmail string) error
	Pin(ctx context.Context, id string, pinned bool) error
	AddReaction(ctx context.Context, messageID, userEmail, emoji string) error
	RemoveReaction(ctx context.Context, messageID, userEmail, emoji string) error
	GetThreadReplies(ctx context.Context, parentID string) ([]models.Message, error)
	GetPinned(ctx context.Context, channelID string) ([]models.Message, error)
}

// ── MemberRepository ──

type MemberRepository interface {
	List(ctx context.Context, teamID string) ([]models.TeamMember, error)
	Add(ctx context.Context, teamID string, input models.AddMemberInput) (*models.TeamMember, error)
	ChangeRole(ctx context.Context, teamID, email, role string) error
	Remove(ctx context.Context, teamID, email string) error
	UpdateStatus(ctx context.Context, teamID, email, status, customStatus string) error
	IsMember(ctx context.Context, teamID, email string) (bool, error)
	GetRole(ctx context.Context, teamID, email string) (string, error)
}

// ── DMRepository ──

type DMRepository interface {
	ListConversations(ctx context.Context, email string) ([]models.DMConversation, error)
	GetConversation(ctx context.Context, id string) (*models.DMConversation, error)
	CreateConversation(ctx context.Context, senderEmail, recipientEmail string) (*models.DMConversation, error)
	ListMessages(ctx context.Context, dmID string, page, limit int) ([]models.DMMessage, int, error)
	SendMessage(ctx context.Context, dmID string, input models.SendDMInput, senderEmail string) (*models.DMMessage, error)
}

// ── EventRepository — audit log ──

type EventRepository interface {
	Log(ctx context.Context, event models.Event) error
	List(ctx context.Context, params models.EventQueryParams) ([]models.Event, int, error)
	GetByID(ctx context.Context, id string) (*models.Event, error)
}

// ── WebhookRepository ──

type WebhookRepository interface {
	List(ctx context.Context, teamID string) ([]models.Webhook, error)
	GetByID(ctx context.Context, id string) (*models.Webhook, error)
	Create(ctx context.Context, input models.CreateWebhookInput) (*models.Webhook, error)
	Update(ctx context.Context, id string, fields map[string]interface{}) (*models.Webhook, error)
	Delete(ctx context.Context, id string) error
	ListByEvent(ctx context.Context, teamID, eventType string) ([]models.Webhook, error)
	CreateDelivery(ctx context.Context, delivery models.WebhookDelivery) error
	UpdateDelivery(ctx context.Context, id string, fields map[string]interface{}) error
	GetPendingDeliveries(ctx context.Context, limit int) ([]models.WebhookDelivery, error)
}

// ── PermissionRepository — OpenFGA-inspired relationship tuples ──

type PermissionRepository interface {
	Check(ctx context.Context, objectType, objectID, relation, userEmail string) (bool, error)
	Write(ctx context.Context, objectType, objectID, relation, userEmail string) error
	Delete(ctx context.Context, objectType, objectID, relation, userEmail string) error
	ListObjects(ctx context.Context, objectType, relation, userEmail string) ([]string, error)
	ListRelations(ctx context.Context, objectType, objectID, userEmail string) ([]string, error)
	DeleteAllForObject(ctx context.Context, objectType, objectID string) error
}

// ── InvitationRepository ──

type InvitationRepository interface {
	Create(ctx context.Context, input models.CreateInvitationInput) (*models.Invitation, error)
	GetByToken(ctx context.Context, token string) (*models.Invitation, error)
	ListByTeam(ctx context.Context, teamID string) ([]models.Invitation, error)
	ListPendingByEmail(ctx context.Context, email string) ([]models.Invitation, error)
	UpdateStatus(ctx context.Context, id, status string) error
}

// ══════════════════════════════════════════════════════════════════════════
// Cache Interface
// ══════════════════════════════════════════════════════════════════════════

type CacheService interface {
	Get(ctx context.Context, key string) ([]byte, error)
	Set(ctx context.Context, key string, data interface{}, ttlSeconds ...int) error
	Invalidate(ctx context.Context, key string) error
	InvalidatePrefix(ctx context.Context, prefix string) error
	Cleanup(ctx context.Context) error
}

// ══════════════════════════════════════════════════════════════════════════
// Stream Interface — for Redis Streams / message bus
// ══════════════════════════════════════════════════════════════════════════

type StreamPublisher interface {
	Publish(ctx context.Context, stream string, payload interface{}) error
}

type StreamSubscriber interface {
	Subscribe(ctx context.Context, stream, group, consumer string, handler func(id string, values map[string]interface{})) error
}

// ══════════════════════════════════════════════════════════════════════════
// WebSocket Hub Interface
// ══════════════════════════════════════════════════════════════════════════

type WSHub interface {
	SendToUser(email string, event string, payload interface{})
	BroadcastToChannel(channelID string, event string, payload interface{})
	BroadcastToTeam(teamID string, event string, payload interface{})
}
