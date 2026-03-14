package models

import "time"

// ── Teams ──

type Team struct {
	ID          string    `json:"id"`
	Name        string    `json:"name"`
	Description *string   `json:"description"`
	LogoURL     *string   `json:"logo_url"`
	OwnerEmail  string    `json:"owner_email"`
	IsPrivate   bool      `json:"is_private"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type CreateTeamInput struct {
	Name        string  `json:"name"`
	Description *string `json:"description"`
	LogoURL     *string `json:"logo_url"`
	IsPrivate   bool    `json:"is_private"`
}

// ── Team Members ──

type TeamMember struct {
	ID           string    `json:"id"`
	TeamID       string    `json:"team_id"`
	Email        string    `json:"email"`
	Role         string    `json:"role"`
	DisplayName  *string   `json:"display_name"`
	Status       string    `json:"status"`
	CustomStatus *string   `json:"custom_status"`
	JoinedAt     time.Time `json:"joined_at"`
	// Joined from public.mail_accounts
	AccountName *string `json:"account_name,omitempty"`
}

type AddMemberInput struct {
	Email       string  `json:"email"`
	Role        string  `json:"role"`
	DisplayName *string `json:"display_name"`
}

// ── Channels ──

type Channel struct {
	ID          string    `json:"id"`
	TeamID      string    `json:"team_id"`
	Name        string    `json:"name"`
	Description *string   `json:"description"`
	Type        string    `json:"type"`
	Visibility  string    `json:"visibility"`
	IsDefault   bool      `json:"is_default"`
	IsLocked    bool      `json:"is_locked"`
	CreatedBy   *string   `json:"created_by"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
	// Computed
	UnreadCount int `json:"unread_count"`
}

type CreateChannelInput struct {
	Name        string  `json:"name"`
	Description *string `json:"description"`
	Type        string  `json:"type"`
	Visibility  string  `json:"visibility"`
}

// ── Messages ──

type Message struct {
	ID          string    `json:"id"`
	ChannelID   string    `json:"channel_id"`
	SenderEmail string    `json:"sender_email"`
	Content     string    `json:"content"`
	Type        string    `json:"type"`
	Priority    string    `json:"priority"` // normal, everyone, urgent, priority
	ParentID    *string   `json:"parent_id"`
	IsPinned    bool      `json:"is_pinned"`
	IsEdited    bool      `json:"is_edited"`
	IsDeleted   bool      `json:"is_deleted"`
	Mentions    []string  `json:"mentions"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
	// Joined
	SenderName  *string             `json:"sender_name,omitempty"`
	Reactions   []Reaction          `json:"reactions"`
	Attachments []MessageAttachment `json:"attachments"`
	ReplyCount  int                 `json:"reply_count"`
}

type SendMessageInput struct {
	Content  string   `json:"content"`
	Type     string   `json:"type"`
	Priority string   `json:"priority"` // normal, everyone, urgent, priority
	ParentID *string  `json:"parent_id"`
	Mentions []string `json:"mentions"`
}

type Reaction struct {
	Emoji     string   `json:"emoji"`
	Count     int      `json:"count"`
	UserEmail []string `json:"users"`
}

type MessageAttachment struct {
	ID          string    `json:"id"`
	MessageID   string    `json:"message_id"`
	FileName    string    `json:"file_name"`
	FileURL     string    `json:"file_url"`
	FileType    *string   `json:"file_type"`
	FileSize    int64     `json:"file_size"`
	FileContent []byte    `json:"-"` // bytea — never sent in JSON responses
	CreatedAt   time.Time `json:"created_at"`
}

// ── Voice Sessions ──

type VoiceSession struct {
	ID         string     `json:"id"`
	ChannelID  string     `json:"channel_id"`
	UserEmail  string     `json:"user_email"`
	JoinedAt   time.Time  `json:"joined_at"`
	LeftAt     *time.Time `json:"left_at,omitempty"`
	IsMuted    bool       `json:"is_muted"`
	IsDeafened bool       `json:"is_deafened"`
	// Joined
	DisplayName *string `json:"display_name,omitempty"`
}

type VoiceSignal struct {
	ChannelID  string      `json:"channel_id"`
	FromEmail  string      `json:"from_email"`
	ToEmail    string      `json:"to_email"`
	SignalType string      `json:"signal_type"` // offer, answer, ice-candidate
	Payload    interface{} `json:"payload"`
}

// ── Direct Messages ──

type DMConversation struct {
	ID           string          `json:"id"`
	Participants []DMParticipant `json:"participants"`
	LastMessage  *DMMessage      `json:"last_message,omitempty"`
	UnreadCount  int             `json:"unread_count"`
	CreatedAt    time.Time       `json:"created_at"`
	UpdatedAt    time.Time       `json:"updated_at"`
}

type DMParticipant struct {
	Email       string    `json:"email"`
	DisplayName *string   `json:"display_name"`
	Status      string    `json:"status"`
	LastReadAt  time.Time `json:"last_read_at"`
	// Joined from public.mail_accounts
	AccountName *string `json:"account_name,omitempty"`
}

type DMMessage struct {
	ID             string    `json:"id"`
	ConversationID string    `json:"conversation_id"`
	SenderEmail    string    `json:"sender_email"`
	Content        string    `json:"content"`
	IsEdited       bool      `json:"is_edited"`
	IsDeleted      bool      `json:"is_deleted"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
	SenderName     *string   `json:"sender_name,omitempty"`
}

type SendDMInput struct {
	Content string `json:"content"`
}

type CreateDMInput struct {
	ParticipantEmail string `json:"participant_email"`
}

// ── Notifications ──

type Notification struct {
	ID             string    `json:"id"`
	RecipientEmail string    `json:"recipient_email"`
	Type           string    `json:"type"`
	Title          string    `json:"title"`
	Body           *string   `json:"body"`
	SourceID       *string   `json:"source_id"`
	SourceType     *string   `json:"source_type"`
	IsRead         bool      `json:"is_read"`
	CreatedAt      time.Time `json:"created_at"`
}

// ── Tasks ──

type Task struct {
	ID            string     `json:"id"`
	TeamID        string     `json:"team_id"`
	Title         string     `json:"title"`
	Description   *string    `json:"description"`
	AssigneeEmail *string    `json:"assignee_email"`
	Status        string     `json:"status"`
	Priority      string     `json:"priority"`
	DueDate       *time.Time `json:"due_date"`
	CreatedBy     string     `json:"created_by"`
	CreatedAt     time.Time  `json:"created_at"`
	UpdatedAt     time.Time  `json:"updated_at"`
}

type CreateTaskInput struct {
	Title         string     `json:"title"`
	Description   *string    `json:"description"`
	AssigneeEmail *string    `json:"assignee_email"`
	Status        string     `json:"status"`
	Priority      string     `json:"priority"`
	DueDate       *time.Time `json:"due_date"`
}

// ── Events / Audit Log ──

type Event struct {
	ID           string                 `json:"id"`
	ActorEmail   string                 `json:"actor_email"`
	Action       string                 `json:"action"`        // e.g. "message.sent", "channel.created"
	ResourceType string                 `json:"resource_type"` // "message", "channel", "team", "member", "dm"
	ResourceID   *string                `json:"resource_id"`
	TeamID       *string                `json:"team_id"`
	Metadata     map[string]interface{} `json:"metadata"`
	IPAddress    *string                `json:"ip_address"`
	UserAgent    *string                `json:"user_agent"`
	CreatedAt    time.Time              `json:"created_at"`
}

type EventQueryParams struct {
	TeamID       *string `json:"team_id"`
	ActorEmail   *string `json:"actor_email"`
	Action       *string `json:"action"`
	ResourceType *string `json:"resource_type"`
	Page         int     `json:"page"`
	Limit        int     `json:"limit"`
}

// ── Webhooks ──

type Webhook struct {
	ID              string     `json:"id"`
	TeamID          string     `json:"team_id"`
	Name            string     `json:"name"`
	URL             string     `json:"url"`
	Secret          *string    `json:"secret,omitempty"`
	Events          []string   `json:"events"`
	IsActive        bool       `json:"is_active"`
	CreatedBy       string     `json:"created_by"`
	LastTriggeredAt *time.Time `json:"last_triggered_at,omitempty"`
	FailureCount    int        `json:"failure_count"`
	CreatedAt       time.Time  `json:"created_at"`
	UpdatedAt       time.Time  `json:"updated_at"`
}

type CreateWebhookInput struct {
	TeamID string   `json:"team_id"`
	Name   string   `json:"name"`
	URL    string   `json:"url"`
	Secret *string  `json:"secret"`
	Events []string `json:"events"`
}

type WebhookDelivery struct {
	ID             string     `json:"id"`
	WebhookID      string     `json:"webhook_id"`
	EventID        *string    `json:"event_id"`
	Payload        string     `json:"payload"` // JSON string
	ResponseStatus *int       `json:"response_status"`
	ResponseBody   *string    `json:"response_body"`
	Status         string     `json:"status"` // pending, success, failed, retrying
	Attempts       int        `json:"attempts"`
	NextRetryAt    *time.Time `json:"next_retry_at"`
	CreatedAt      time.Time  `json:"created_at"`
	CompletedAt    *time.Time `json:"completed_at"`
}

// ── Permissions (OpenFGA-inspired tuples) ──

type Permission struct {
	ID         string    `json:"id"`
	ObjectType string    `json:"object_type"` // "team", "channel"
	ObjectID   string    `json:"object_id"`
	Relation   string    `json:"relation"` // "owner", "admin", "member", "viewer", "can_post", "can_invite"
	UserEmail  string    `json:"user_email"`
	CreatedAt  time.Time `json:"created_at"`
}

// ── Invitations ──

type Invitation struct {
	ID           string     `json:"id"`
	TeamID       string     `json:"team_id"`
	InviterEmail string     `json:"inviter_email"`
	InviteeEmail string     `json:"invitee_email"`
	Role         string     `json:"role"`
	Status       string     `json:"status"` // pending, accepted, declined, expired
	Token        string     `json:"token"`
	ExpiresAt    time.Time  `json:"expires_at"`
	CreatedAt    time.Time  `json:"created_at"`
	RespondedAt  *time.Time `json:"responded_at,omitempty"`
}

type CreateInvitationInput struct {
	TeamID       string `json:"team_id"`
	InviterEmail string `json:"inviter_email"`
	InviteeEmail string `json:"invitee_email"`
	Role         string `json:"role"`
}

// ── Polls ──

type Poll struct {
	ID            string       `json:"id"`
	ChannelID     string       `json:"channel_id"`
	CreatedBy     string       `json:"created_by"`
	Question      string       `json:"question"`
	IsMultiSelect bool         `json:"is_multi_select"`
	IsAnonymous   bool         `json:"is_anonymous"`
	IsClosed      bool         `json:"is_closed"`
	ExpiresAt     *time.Time   `json:"expires_at"`
	CreatedAt     time.Time    `json:"created_at"`
	UpdatedAt     time.Time    `json:"updated_at"`
	Options       []PollOption `json:"options"`
	TotalVotes    int          `json:"total_votes"`
	// Joined
	CreatorName *string `json:"creator_name,omitempty"`
}

type PollOption struct {
	ID         string   `json:"id"`
	PollID     string   `json:"poll_id"`
	Text       string   `json:"text"`
	VoteCount  int      `json:"vote_count"`
	VoterEmail []string `json:"voters,omitempty"` // omitted when anonymous
	Position   int      `json:"position"`
}

type CreatePollInput struct {
	Question      string   `json:"question"`
	Options       []string `json:"options"`
	IsMultiSelect bool     `json:"is_multi_select"`
	IsAnonymous   bool     `json:"is_anonymous"`
	ExpiresAt     *string  `json:"expires_at"` // ISO 8601 string
}

type VotePollInput struct {
	OptionIDs []string `json:"option_ids"`
}

// ── WebSocket Messages ──

type WSMessage struct {
	Event   string      `json:"event"`   // "message.new", "typing.start", "presence.update", etc.
	Channel string      `json:"channel"` // channelId or dmId
	Data    interface{} `json:"data"`
}

type WSTypingPayload struct {
	ChannelID string `json:"channel_id"`
	Email     string `json:"email"`
	Name      string `json:"name"`
	IsTyping  bool   `json:"is_typing"`
}

type WSPresencePayload struct {
	Email  string `json:"email"`
	Status string `json:"status"`
}

// ── Pagination ──

type PaginationParams struct {
	Page  int `json:"page"`
	Limit int `json:"limit"`
}

type PaginatedResponse struct {
	Items      interface{} `json:"items"`
	Total      int         `json:"total"`
	Page       int         `json:"page"`
	Limit      int         `json:"limit"`
	TotalPages int         `json:"total_pages"`
}

// CursorPaginatedResponse is used for cursor-based (infinite scroll) pagination.
type CursorPaginatedResponse struct {
	Items      interface{} `json:"items"`
	NextCursor string      `json:"next_cursor"`
	HasMore    bool        `json:"has_more"`
	Limit      int         `json:"limit"`
}

// ── API Response ──

type APIResponse struct {
	Success bool        `json:"success"`
	Result  interface{} `json:"result"`
	Message string      `json:"message"`
	Error   string      `json:"error,omitempty"`
}
