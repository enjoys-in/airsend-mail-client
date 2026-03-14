package handlers

import (
	"strconv"

	"github.com/AirSend/workspace-server/internal/middleware"
	"github.com/AirSend/workspace-server/internal/models"
	"github.com/AirSend/workspace-server/internal/service"
	"github.com/gofiber/fiber/v2"
)

// ═══════════════════════════════════════════════════════════════════════════
// Handler — DI container for all HTTP handlers
// ═══════════════════════════════════════════════════════════════════════════

type Handler struct {
	Teams       *service.TeamService
	Channels    *service.ChannelService
	Messages    *service.MessageService
	Members     *service.MemberService
	DMs         *service.DMService
	Events      *service.EventService
	Webhooks    *service.WebhookService
	Invitations *service.InvitationService
	Polls       *service.PollService
	Attachments *service.AttachmentService
	Voice       *service.VoiceService
}

func NewHandler(
	teams *service.TeamService,
	channels *service.ChannelService,
	messages *service.MessageService,
	members *service.MemberService,
	dms *service.DMService,
	events *service.EventService,
	webhooks *service.WebhookService,
	invitations *service.InvitationService,
	polls *service.PollService,
	attachments *service.AttachmentService,
	voice *service.VoiceService,
) *Handler {
	return &Handler{
		Teams:       teams,
		Channels:    channels,
		Messages:    messages,
		Members:     members,
		DMs:         dms,
		Events:      events,
		Webhooks:    webhooks,
		Invitations: invitations,
		Polls:       polls,
		Attachments: attachments,
		Voice:       voice,
	}
}

// ── helpers ──

func email(c *fiber.Ctx) string { return middleware.GetUserEmail(c) }
func ip(c *fiber.Ctx) string    { return c.IP() }
func ua(c *fiber.Ctx) string    { return c.Get("User-Agent") }

func page(c *fiber.Ctx) int {
	p, _ := strconv.Atoi(c.Query("page", "1"))
	if p < 1 {
		p = 1
	}
	return p
}

func limit(c *fiber.Ctx) int {
	l, _ := strconv.Atoi(c.Query("limit", "50"))
	if l < 1 || l > 100 {
		l = 50
	}
	return l
}

func ok(c *fiber.Ctx, data interface{}) error {
	return c.JSON(models.APIResponse{Success: true, Result: data, Message: "success"})
}

func created(c *fiber.Ctx, data interface{}) error {
	return c.Status(fiber.StatusCreated).JSON(models.APIResponse{Success: true, Result: data, Message: "created"})
}

func errResp(c *fiber.Ctx, status int, msg string) error {
	return c.Status(status).JSON(models.APIResponse{Success: false, Result: nil, Message: msg, Error: msg})
}

func handleErr(c *fiber.Ctx, err error) error {
	if err == service.ErrForbidden {
		return errResp(c, fiber.StatusForbidden, err.Error())
	}
	if err == service.ErrNotFound {
		return errResp(c, fiber.StatusNotFound, err.Error())
	}
	if err == service.ErrBadInput {
		return errResp(c, fiber.StatusBadRequest, err.Error())
	}
	if err == service.ErrPollClosed {
		return errResp(c, fiber.StatusConflict, err.Error())
	}
	return errResp(c, fiber.StatusInternalServerError, err.Error())
}

// ═══════════════════════════════════════════════════════════════════════════
// Teams
// ═══════════════════════════════════════════════════════════════════════════

func (h *Handler) ListTeams(c *fiber.Ctx) error {
	teams, err := h.Teams.List(c.Context(), email(c))
	if err != nil {
		return handleErr(c, err)
	}
	return ok(c, teams)
}

func (h *Handler) GetTeam(c *fiber.Ctx) error {
	team, err := h.Teams.Get(c.Context(), c.Params("teamId"), email(c))
	if err != nil {
		return handleErr(c, err)
	}
	return ok(c, team)
}

func (h *Handler) CreateTeam(c *fiber.Ctx) error {
	var input models.CreateTeamInput
	if err := c.BodyParser(&input); err != nil {
		return errResp(c, fiber.StatusBadRequest, "invalid body")
	}
	team, err := h.Teams.Create(c.Context(), input, email(c), ip(c), ua(c))
	if err != nil {
		return handleErr(c, err)
	}
	return created(c, team)
}

func (h *Handler) UpdateTeam(c *fiber.Ctx) error {
	var fields map[string]interface{}
	if err := c.BodyParser(&fields); err != nil {
		return errResp(c, fiber.StatusBadRequest, "invalid body")
	}
	team, err := h.Teams.Update(c.Context(), c.Params("teamId"), fields, email(c), ip(c), ua(c))
	if err != nil {
		return handleErr(c, err)
	}
	return ok(c, team)
}

func (h *Handler) DeleteTeam(c *fiber.Ctx) error {
	if err := h.Teams.Delete(c.Context(), c.Params("teamId"), email(c), ip(c), ua(c)); err != nil {
		return handleErr(c, err)
	}
	return ok(c, fiber.Map{"deleted": true})
}

// ═══════════════════════════════════════════════════════════════════════════
// Channels
// ═══════════════════════════════════════════════════════════════════════════

func (h *Handler) ListChannels(c *fiber.Ctx) error {
	chs, err := h.Channels.List(c.Context(), c.Params("teamId"), email(c))
	if err != nil {
		return handleErr(c, err)
	}
	return ok(c, chs)
}

func (h *Handler) GetChannel(c *fiber.Ctx) error {
	ch, err := h.Channels.Get(c.Context(), c.Params("channelId"), email(c))
	if err != nil {
		return handleErr(c, err)
	}
	return ok(c, ch)
}

func (h *Handler) CreateChannel(c *fiber.Ctx) error {
	var input models.CreateChannelInput
	if err := c.BodyParser(&input); err != nil {
		return errResp(c, fiber.StatusBadRequest, "invalid body")
	}
	ch, err := h.Channels.Create(c.Context(), c.Params("teamId"), input, email(c), ip(c), ua(c))
	if err != nil {
		return handleErr(c, err)
	}
	return created(c, ch)
}

func (h *Handler) UpdateChannel(c *fiber.Ctx) error {
	var fields map[string]interface{}
	if err := c.BodyParser(&fields); err != nil {
		return errResp(c, fiber.StatusBadRequest, "invalid body")
	}
	ch, err := h.Channels.Update(c.Context(), c.Params("channelId"), fields, email(c), ip(c), ua(c))
	if err != nil {
		return handleErr(c, err)
	}
	return ok(c, ch)
}

func (h *Handler) DeleteChannel(c *fiber.Ctx) error {
	if err := h.Channels.Delete(c.Context(), c.Params("channelId"), email(c), ip(c), ua(c)); err != nil {
		return handleErr(c, err)
	}
	return ok(c, fiber.Map{"deleted": true})
}

func (h *Handler) LockChannel(c *fiber.Ctx) error {
	var body struct {
		Locked bool `json:"locked"`
	}
	if err := c.BodyParser(&body); err != nil {
		return errResp(c, fiber.StatusBadRequest, "invalid body")
	}
	ch, err := h.Channels.Update(c.Context(), c.Params("channelId"), map[string]interface{}{"is_locked": body.Locked}, email(c), ip(c), ua(c))
	if err != nil {
		return handleErr(c, err)
	}
	return ok(c, ch)
}

// ═══════════════════════════════════════════════════════════════════════════
// Messages
// ═══════════════════════════════════════════════════════════════════════════

func (h *Handler) ListMessages(c *fiber.Ctx) error {
	lim := limit(c)
	if lim > 150 {
		lim = 150
	}
	cursor := c.Query("cursor", "")
	result, err := h.Messages.List(c.Context(), c.Params("channelId"), email(c), lim, cursor)
	if err != nil {
		return handleErr(c, err)
	}
	return ok(c, result)
}

func (h *Handler) GetMessage(c *fiber.Ctx) error {
	ch, err := h.Messages.GetByID(c.Context(), c.Params("messageId"))
	if err != nil {
		return handleErr(c, err)
	}
	return ok(c, ch)
}

func (h *Handler) SendMessage(c *fiber.Ctx) error {
	var input models.SendMessageInput
	if err := c.BodyParser(&input); err != nil {
		return errResp(c, fiber.StatusBadRequest, "invalid body")
	}
	msg, err := h.Messages.Send(c.Context(), c.Params("channelId"), input, email(c), ip(c), ua(c))
	if err != nil {
		return handleErr(c, err)
	}
	return created(c, msg)
}

func (h *Handler) EditMessage(c *fiber.Ctx) error {
	var body struct {
		Content string `json:"content"`
	}
	if err := c.BodyParser(&body); err != nil {
		return errResp(c, fiber.StatusBadRequest, "invalid body")
	}
	msg, err := h.Messages.Edit(c.Context(), c.Params("messageId"), body.Content, email(c))
	if err != nil {
		return handleErr(c, err)
	}
	return ok(c, msg)
}

func (h *Handler) DeleteMessage(c *fiber.Ctx) error {
	if err := h.Messages.Delete(c.Context(), c.Params("messageId"), email(c)); err != nil {
		return handleErr(c, err)
	}
	return ok(c, fiber.Map{"deleted": true})
}

func (h *Handler) PinMessage(c *fiber.Ctx) error {
	var body struct {
		Pin bool `json:"pin"`
	}
	if err := c.BodyParser(&body); err != nil {
		return errResp(c, fiber.StatusBadRequest, "invalid body")
	}
	if err := h.Messages.Pin(c.Context(), c.Params("messageId"), body.Pin, email(c), ip(c), ua(c)); err != nil {
		return handleErr(c, err)
	}
	return ok(c, fiber.Map{"pinned": body.Pin})
}

func (h *Handler) AddReaction(c *fiber.Ctx) error {
	var body struct {
		Emoji string `json:"emoji"`
	}
	if err := c.BodyParser(&body); err != nil {
		return errResp(c, fiber.StatusBadRequest, "invalid body")
	}
	if err := h.Messages.AddReaction(c.Context(), c.Params("messageId"), body.Emoji, email(c)); err != nil {
		return handleErr(c, err)
	}
	return ok(c, fiber.Map{"added": true})
}

func (h *Handler) RemoveReaction(c *fiber.Ctx) error {
	if err := h.Messages.RemoveReaction(c.Context(), c.Params("messageId"), c.Params("emoji"), email(c)); err != nil {
		return handleErr(c, err)
	}
	return ok(c, fiber.Map{"removed": true})
}

func (h *Handler) GetThread(c *fiber.Ctx) error {
	msgs, err := h.Messages.GetThread(c.Context(), c.Params("messageId"), email(c))
	if err != nil {
		return handleErr(c, err)
	}
	return ok(c, msgs)
}

func (h *Handler) ReplyToThread(c *fiber.Ctx) error {
	var input models.SendMessageInput
	if err := c.BodyParser(&input); err != nil {
		return errResp(c, fiber.StatusBadRequest, "invalid body")
	}
	parentID := c.Params("messageId")
	input.ParentID = &parentID

	// Need channel ID from parent message
	parent, err := h.Messages.GetByID(c.Context(), parentID)
	if err != nil {
		return handleErr(c, err)
	}

	msg, err := h.Messages.Send(c.Context(), parent.ChannelID, input, email(c), ip(c), ua(c))
	if err != nil {
		return handleErr(c, err)
	}
	return created(c, msg)
}

func (h *Handler) GetPinnedMessages(c *fiber.Ctx) error {
	msgs, err := h.Messages.GetPinned(c.Context(), c.Params("channelId"), email(c))
	if err != nil {
		return handleErr(c, err)
	}
	return ok(c, msgs)
}

// ═══════════════════════════════════════════════════════════════════════════
// Members
// ═══════════════════════════════════════════════════════════════════════════

func (h *Handler) ListMembers(c *fiber.Ctx) error {
	members, err := h.Members.List(c.Context(), c.Params("teamId"), email(c))
	if err != nil {
		return handleErr(c, err)
	}
	return ok(c, members)
}

func (h *Handler) AddMember(c *fiber.Ctx) error {
	var input models.AddMemberInput
	if err := c.BodyParser(&input); err != nil {
		return errResp(c, fiber.StatusBadRequest, "invalid body")
	}
	member, err := h.Members.Add(c.Context(), c.Params("teamId"), input, email(c), ip(c), ua(c))
	if err != nil {
		return handleErr(c, err)
	}
	return created(c, member)
}

func (h *Handler) ChangeMemberRole(c *fiber.Ctx) error {
	var body struct {
		Role string `json:"role"`
	}
	if err := c.BodyParser(&body); err != nil {
		return errResp(c, fiber.StatusBadRequest, "invalid body")
	}
	if err := h.Members.ChangeRole(c.Context(), c.Params("teamId"), c.Params("email"), body.Role, email(c), ip(c), ua(c)); err != nil {
		return handleErr(c, err)
	}
	return ok(c, fiber.Map{"updated": true})
}

func (h *Handler) RemoveMember(c *fiber.Ctx) error {
	if err := h.Members.Remove(c.Context(), c.Params("teamId"), c.Params("email"), email(c), ip(c), ua(c)); err != nil {
		return handleErr(c, err)
	}
	return ok(c, fiber.Map{"removed": true})
}

func (h *Handler) UpdateMyStatus(c *fiber.Ctx) error {
	var body struct {
		Status       string `json:"status"`
		CustomStatus string `json:"custom_status"`
	}
	if err := c.BodyParser(&body); err != nil {
		return errResp(c, fiber.StatusBadRequest, "invalid body")
	}
	if err := h.Members.UpdateStatus(c.Context(), c.Params("teamId"), email(c), body.Status, body.CustomStatus); err != nil {
		return handleErr(c, err)
	}
	return ok(c, fiber.Map{"updated": true})
}

// ═══════════════════════════════════════════════════════════════════════════
// Direct Messages
// ═══════════════════════════════════════════════════════════════════════════

func (h *Handler) ListDMs(c *fiber.Ctx) error {
	convos, err := h.DMs.ListConversations(c.Context(), email(c))
	if err != nil {
		return handleErr(c, err)
	}
	return ok(c, convos)
}

func (h *Handler) CreateDM(c *fiber.Ctx) error {
	var input models.CreateDMInput
	if err := c.BodyParser(&input); err != nil {
		return errResp(c, fiber.StatusBadRequest, "invalid body")
	}
	convo, err := h.DMs.CreateConversation(c.Context(), email(c), input.ParticipantEmail)
	if err != nil {
		return handleErr(c, err)
	}
	return created(c, convo)
}

func (h *Handler) GetDM(c *fiber.Ctx) error {
	convo, err := h.DMs.GetConversation(c.Context(), c.Params("dmId"), email(c))
	if err != nil {
		return handleErr(c, err)
	}
	return ok(c, convo)
}

func (h *Handler) ListDMMessages(c *fiber.Ctx) error {
	result, err := h.DMs.ListMessages(c.Context(), c.Params("dmId"), email(c), page(c), limit(c))
	if err != nil {
		return handleErr(c, err)
	}
	return ok(c, result)
}

func (h *Handler) SendDM(c *fiber.Ctx) error {
	var input models.SendDMInput
	if err := c.BodyParser(&input); err != nil {
		return errResp(c, fiber.StatusBadRequest, "invalid body")
	}
	msg, err := h.DMs.SendMessage(c.Context(), c.Params("dmId"), input, email(c))
	if err != nil {
		return handleErr(c, err)
	}
	return created(c, msg)
}

// ═══════════════════════════════════════════════════════════════════════════
// Events (Audit Log)
// ═══════════════════════════════════════════════════════════════════════════

func (h *Handler) ListEvents(c *fiber.Ctx) error {
	params := models.EventQueryParams{
		Page:  page(c),
		Limit: limit(c),
	}
	if v := c.Query("team_id"); v != "" {
		params.TeamID = &v
	}
	if v := c.Query("action"); v != "" {
		params.Action = &v
	}
	if v := c.Query("resource_type"); v != "" {
		params.ResourceType = &v
	}

	result, err := h.Events.List(c.Context(), params, email(c))
	if err != nil {
		return handleErr(c, err)
	}
	return ok(c, result)
}

func (h *Handler) GetEvent(c *fiber.Ctx) error {
	event, err := h.Events.GetByID(c.Context(), c.Params("eventId"), email(c))
	if err != nil {
		return handleErr(c, err)
	}
	return ok(c, event)
}

// ═══════════════════════════════════════════════════════════════════════════
// Webhooks
// ═══════════════════════════════════════════════════════════════════════════

func (h *Handler) ListWebhooks(c *fiber.Ctx) error {
	hooks, err := h.Webhooks.List(c.Context(), c.Params("teamId"), email(c))
	if err != nil {
		return handleErr(c, err)
	}
	return ok(c, hooks)
}

func (h *Handler) CreateWebhook(c *fiber.Ctx) error {
	var input models.CreateWebhookInput
	if err := c.BodyParser(&input); err != nil {
		return errResp(c, fiber.StatusBadRequest, "invalid body")
	}
	input.TeamID = c.Params("teamId")
	hook, err := h.Webhooks.Create(c.Context(), input, email(c), ip(c), ua(c))
	if err != nil {
		return handleErr(c, err)
	}
	return created(c, hook)
}

func (h *Handler) DeleteWebhook(c *fiber.Ctx) error {
	if err := h.Webhooks.Delete(c.Context(), c.Params("webhookId"), c.Params("teamId"), email(c), ip(c), ua(c)); err != nil {
		return handleErr(c, err)
	}
	return ok(c, fiber.Map{"deleted": true})
}

// ═══════════════════════════════════════════════════════════════════════════
// Invitations
// ═══════════════════════════════════════════════════════════════════════════

func (h *Handler) CreateInvitation(c *fiber.Ctx) error {
	var body struct {
		InviteeEmail string `json:"invitee_email"`
		Role         string `json:"role"`
	}
	if err := c.BodyParser(&body); err != nil {
		return errResp(c, fiber.StatusBadRequest, "invalid body")
	}
	inv, err := h.Invitations.Create(c.Context(), c.Params("teamId"), body.InviteeEmail, body.Role, email(c), ip(c), ua(c))
	if err != nil {
		return handleErr(c, err)
	}
	return created(c, inv)
}

func (h *Handler) ListTeamInvitations(c *fiber.Ctx) error {
	invs, err := h.Invitations.ListByTeam(c.Context(), c.Params("teamId"), email(c))
	if err != nil {
		return handleErr(c, err)
	}
	return ok(c, invs)
}

func (h *Handler) ListMyInvitations(c *fiber.Ctx) error {
	invs, err := h.Invitations.ListMyPending(c.Context(), email(c))
	if err != nil {
		return handleErr(c, err)
	}
	return ok(c, invs)
}

func (h *Handler) AcceptInvitation(c *fiber.Ctx) error {
	var body struct {
		Token string `json:"token"`
	}
	if err := c.BodyParser(&body); err != nil {
		return errResp(c, fiber.StatusBadRequest, "invalid body")
	}
	if err := h.Invitations.Accept(c.Context(), body.Token, email(c), ip(c), ua(c)); err != nil {
		return handleErr(c, err)
	}
	return ok(c, fiber.Map{"accepted": true})
}

func (h *Handler) DeclineInvitation(c *fiber.Ctx) error {
	var body struct {
		Token string `json:"token"`
	}
	if err := c.BodyParser(&body); err != nil {
		return errResp(c, fiber.StatusBadRequest, "invalid body")
	}
	if err := h.Invitations.Decline(c.Context(), body.Token, email(c)); err != nil {
		return handleErr(c, err)
	}
	return ok(c, fiber.Map{"declined": true})
}

func (h *Handler) RevokeInvitation(c *fiber.Ctx) error {
	if err := h.Invitations.Revoke(c.Context(), c.Params("invitationId"), c.Params("teamId"), email(c)); err != nil {
		return handleErr(c, err)
	}
	return ok(c, fiber.Map{"revoked": true})
}

// ═══════════════════════════════════════════════════════════════════════════
// Polls
// ═══════════════════════════════════════════════════════════════════════════

func (h *Handler) CreatePoll(c *fiber.Ctx) error {
	var input models.CreatePollInput
	if err := c.BodyParser(&input); err != nil {
		return errResp(c, fiber.StatusBadRequest, "invalid body")
	}
	poll, err := h.Polls.Create(c.Context(), c.Params("channelId"), input, email(c), ip(c), ua(c))
	if err != nil {
		return handleErr(c, err)
	}
	return created(c, poll)
}

func (h *Handler) GetPoll(c *fiber.Ctx) error {
	poll, myVotes, err := h.Polls.Get(c.Context(), c.Params("pollId"), email(c))
	if err != nil {
		return handleErr(c, err)
	}
	return ok(c, fiber.Map{"poll": poll, "my_votes": myVotes})
}

func (h *Handler) ListChannelPolls(c *fiber.Ctx) error {
	polls, err := h.Polls.ListByChannel(c.Context(), c.Params("channelId"), email(c))
	if err != nil {
		return handleErr(c, err)
	}
	return ok(c, polls)
}

func (h *Handler) VotePoll(c *fiber.Ctx) error {
	var input models.VotePollInput
	if err := c.BodyParser(&input); err != nil {
		return errResp(c, fiber.StatusBadRequest, "invalid body")
	}
	poll, err := h.Polls.Vote(c.Context(), c.Params("pollId"), input, email(c))
	if err != nil {
		return handleErr(c, err)
	}
	return ok(c, poll)
}

func (h *Handler) ClosePoll(c *fiber.Ctx) error {
	if err := h.Polls.Close(c.Context(), c.Params("pollId"), email(c), ip(c), ua(c)); err != nil {
		return handleErr(c, err)
	}
	return ok(c, fiber.Map{"closed": true})
}

func (h *Handler) DeletePoll(c *fiber.Ctx) error {
	if err := h.Polls.Delete(c.Context(), c.Params("pollId"), email(c), ip(c), ua(c)); err != nil {
		return handleErr(c, err)
	}
	return ok(c, fiber.Map{"deleted": true})
}

// ═══════════════════════════════════════════════════════════════════════════
// Attachments
// ═══════════════════════════════════════════════════════════════════════════

func (h *Handler) UploadAttachment(c *fiber.Ctx) error {
	messageID := c.Params("messageId")

	// Support multipart file upload
	file, err := c.FormFile("file")
	if err == nil && file != nil {
		f, err := file.Open()
		if err != nil {
			return errResp(c, fiber.StatusBadRequest, "cannot read file")
		}
		defer f.Close()

		data := make([]byte, file.Size)
		if _, err := f.Read(data); err != nil {
			return errResp(c, fiber.StatusBadRequest, "cannot read file content")
		}

		contentType := file.Header.Get("Content-Type")
		if contentType == "" {
			contentType = "application/octet-stream"
		}

		att, err := h.Attachments.Upload(c.Context(), messageID, file.Filename, contentType, data, email(c))
		if err != nil {
			return handleErr(c, err)
		}
		return created(c, att)
	}

	// Fallback: JSON body with base64
	var body struct {
		FileName string `json:"file_name"`
		FileType string `json:"file_type"`
		Data     string `json:"data"` // base64 encoded
	}
	if err := c.BodyParser(&body); err != nil || body.Data == "" {
		return errResp(c, fiber.StatusBadRequest, "provide a file upload or JSON with base64 data")
	}

	att, err := h.Attachments.UploadBase64(c.Context(), messageID, body.FileName, body.FileType, body.Data, email(c))
	if err != nil {
		return handleErr(c, err)
	}
	return created(c, att)
}

func (h *Handler) DownloadAttachment(c *fiber.Ctx) error {
	att, content, err := h.Attachments.Download(c.Context(), c.Params("attachmentId"))
	if err != nil {
		return errResp(c, fiber.StatusNotFound, "attachment not found")
	}

	contentType := "application/octet-stream"
	if att.FileType != nil {
		contentType = *att.FileType
	}

	c.Set("Content-Type", contentType)
	c.Set("Content-Disposition", "inline; filename=\""+att.FileName+"\"")
	return c.Send(content)
}

// ═══════════════════════════════════════════════════════════════════════════
// Voice Channels
// ═══════════════════════════════════════════════════════════════════════════

func (h *Handler) JoinVoice(c *fiber.Ctx) error {
	session, participants, err := h.Voice.Join(c.Context(), c.Params("channelId"), email(c))
	if err != nil {
		return handleErr(c, err)
	}
	return ok(c, fiber.Map{"session": session, "participants": participants})
}

func (h *Handler) LeaveVoice(c *fiber.Ctx) error {
	if err := h.Voice.Leave(c.Context(), c.Params("channelId"), email(c)); err != nil {
		return handleErr(c, err)
	}
	return ok(c, fiber.Map{"left": true})
}

func (h *Handler) VoiceParticipants(c *fiber.Ctx) error {
	participants, err := h.Voice.ListParticipants(c.Context(), c.Params("channelId"), email(c))
	if err != nil {
		return handleErr(c, err)
	}
	return ok(c, participants)
}

func (h *Handler) VoiceSignal(c *fiber.Ctx) error {
	var body struct {
		ToEmail    string      `json:"to_email"`
		SignalType string      `json:"signal_type"`
		Payload    interface{} `json:"payload"`
	}
	if err := c.BodyParser(&body); err != nil {
		return errResp(c, fiber.StatusBadRequest, "invalid body")
	}

	signal := models.VoiceSignal{
		ChannelID:  c.Params("channelId"),
		FromEmail:  email(c),
		ToEmail:    body.ToEmail,
		SignalType: body.SignalType,
		Payload:    body.Payload,
	}

	if err := h.Voice.Signal(c.Context(), signal, email(c)); err != nil {
		return handleErr(c, err)
	}
	return ok(c, fiber.Map{"sent": true})
}

func (h *Handler) VoiceMute(c *fiber.Ctx) error {
	var body struct {
		IsMuted    bool `json:"is_muted"`
		IsDeafened bool `json:"is_deafened"`
	}
	if err := c.BodyParser(&body); err != nil {
		return errResp(c, fiber.StatusBadRequest, "invalid body")
	}
	if err := h.Voice.UpdateMute(c.Context(), c.Params("channelId"), email(c), body.IsMuted, body.IsDeafened); err != nil {
		return handleErr(c, err)
	}
	return ok(c, fiber.Map{"updated": true})
}
