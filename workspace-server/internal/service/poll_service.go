package service

import (
	"context"

	"github.com/AirSend/workspace-server/internal/models"
)

// ═══════════════════════════════════════════════════════════════════════════
// PollService — business logic for channel polls
// ═══════════════════════════════════════════════════════════════════════════

type PollService struct {
	d *Deps
}

func NewPollService(d *Deps) *PollService {
	return &PollService{d: d}
}

// Create creates a new poll in a channel.
func (s *PollService) Create(ctx context.Context, channelID string, input models.CreatePollInput, email, ip, ua string) (*models.Poll, error) {
	// Verify channel exists and user is a member
	ch, err := s.d.Channels.GetByID(ctx, channelID)
	if err != nil {
		return nil, err
	}
	ok, _ := s.d.Members.IsMember(ctx, ch.TeamID, email)
	if !ok {
		return nil, ErrForbidden
	}

	// Validate input
	if len(input.Options) < 2 {
		return nil, ErrBadInput
	}
	if input.Question == "" {
		return nil, ErrBadInput
	}

	poll, err := s.d.Polls.Create(ctx, channelID, input, email)
	if err != nil {
		return nil, err
	}

	// Log event
	s.d.Events.Log(ctx, models.Event{
		ActorEmail:   email,
		Action:       "poll.created",
		ResourceType: "poll",
		ResourceID:   strPtr(poll.ID),
		TeamID:       &ch.TeamID,
		Metadata:     map[string]interface{}{"question": poll.Question, "channel_id": channelID},
		IPAddress:    &ip,
		UserAgent:    &ua,
	})

	// Broadcast to channel
	s.d.Hub.BroadcastToChannel(channelID, "poll.created", map[string]interface{}{
		"poll": poll,
	})

	return poll, nil
}

// Get returns a poll by ID with voter's own choices injected.
func (s *PollService) Get(ctx context.Context, pollID, email string) (*models.Poll, []string, error) {
	poll, err := s.d.Polls.GetByID(ctx, pollID)
	if err != nil {
		return nil, nil, err
	}

	// Verify membership
	ch, err := s.d.Channels.GetByID(ctx, poll.ChannelID)
	if err != nil {
		return nil, nil, err
	}
	ok, _ := s.d.Members.IsMember(ctx, ch.TeamID, email)
	if !ok {
		return nil, nil, ErrForbidden
	}

	myVotes, _ := s.d.Polls.GetVoterChoices(ctx, pollID, email)
	return poll, myVotes, nil
}

// ListByChannel returns all polls for a channel.
func (s *PollService) ListByChannel(ctx context.Context, channelID, email string) ([]models.Poll, error) {
	ch, err := s.d.Channels.GetByID(ctx, channelID)
	if err != nil {
		return nil, err
	}
	ok, _ := s.d.Members.IsMember(ctx, ch.TeamID, email)
	if !ok {
		return nil, ErrForbidden
	}

	return s.d.Polls.ListByChannel(ctx, channelID)
}

// Vote casts vote(s) on a poll.
func (s *PollService) Vote(ctx context.Context, pollID string, input models.VotePollInput, email string) (*models.Poll, error) {
	poll, err := s.d.Polls.GetByID(ctx, pollID)
	if err != nil {
		return nil, err
	}

	if poll.IsClosed {
		return nil, ErrPollClosed
	}

	// Verify membership
	ch, err := s.d.Channels.GetByID(ctx, poll.ChannelID)
	if err != nil {
		return nil, err
	}
	ok, _ := s.d.Members.IsMember(ctx, ch.TeamID, email)
	if !ok {
		return nil, ErrForbidden
	}

	// If not multi-select, ensure only one option
	if !poll.IsMultiSelect && len(input.OptionIDs) > 1 {
		return nil, ErrBadInput
	}

	if err := s.d.Polls.Vote(ctx, pollID, input.OptionIDs, email); err != nil {
		return nil, err
	}

	// Return updated poll
	updated, err := s.d.Polls.GetByID(ctx, pollID)
	if err != nil {
		return nil, err
	}

	// Broadcast updated poll
	s.d.Hub.BroadcastToChannel(poll.ChannelID, "poll.updated", map[string]interface{}{
		"poll": updated,
	})

	return updated, nil
}

// Close marks a poll as closed. Only creator or admin/owner can close.
func (s *PollService) Close(ctx context.Context, pollID, email, ip, ua string) error {
	poll, err := s.d.Polls.GetByID(ctx, pollID)
	if err != nil {
		return err
	}

	ch, err := s.d.Channels.GetByID(ctx, poll.ChannelID)
	if err != nil {
		return err
	}

	// Only creator, admin, or owner can close
	if poll.CreatedBy != email {
		role, _ := s.d.Members.GetRole(ctx, ch.TeamID, email)
		if role != "owner" && role != "admin" {
			return ErrForbidden
		}
	}

	if err := s.d.Polls.Close(ctx, pollID); err != nil {
		return err
	}

	s.d.Events.Log(ctx, models.Event{
		ActorEmail:   email,
		Action:       "poll.closed",
		ResourceType: "poll",
		ResourceID:   strPtr(pollID),
		TeamID:       &ch.TeamID,
		IPAddress:    &ip,
		UserAgent:    &ua,
	})

	s.d.Hub.BroadcastToChannel(poll.ChannelID, "poll.closed", map[string]interface{}{
		"poll_id": pollID,
	})

	return nil
}

// Delete removes a poll. Only creator, admin, or owner.
func (s *PollService) Delete(ctx context.Context, pollID, email, ip, ua string) error {
	poll, err := s.d.Polls.GetByID(ctx, pollID)
	if err != nil {
		return err
	}

	ch, err := s.d.Channels.GetByID(ctx, poll.ChannelID)
	if err != nil {
		return err
	}

	if poll.CreatedBy != email {
		role, _ := s.d.Members.GetRole(ctx, ch.TeamID, email)
		if role != "owner" && role != "admin" {
			return ErrForbidden
		}
	}

	if err := s.d.Polls.Delete(ctx, pollID); err != nil {
		return err
	}

	s.d.Events.Log(ctx, models.Event{
		ActorEmail:   email,
		Action:       "poll.deleted",
		ResourceType: "poll",
		ResourceID:   strPtr(pollID),
		TeamID:       &ch.TeamID,
		IPAddress:    &ip,
		UserAgent:    &ua,
	})

	s.d.Hub.BroadcastToChannel(poll.ChannelID, "poll.deleted", map[string]interface{}{
		"poll_id": pollID,
	})

	return nil
}
