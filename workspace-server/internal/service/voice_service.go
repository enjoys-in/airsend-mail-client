package service

import (
	"context"

	"github.com/AirSend/workspace-server/internal/models"
)

// ═══════════════════════════════════════════════════════════════════════════
// VoiceService — voice channel join/leave/signaling
// ═══════════════════════════════════════════════════════════════════════════

type VoiceService struct {
	d *Deps
}

func NewVoiceService(d *Deps) *VoiceService {
	return &VoiceService{d: d}
}

// Join adds a user to a voice channel and notifies other participants.
func (s *VoiceService) Join(ctx context.Context, channelID, email string) (*models.VoiceSession, []models.VoiceSession, error) {
	ch, err := s.d.Channels.GetByID(ctx, channelID)
	if err != nil {
		return nil, nil, ErrNotFound
	}
	if ch.Type != "voice" {
		return nil, nil, ErrBadInput
	}

	ok, _ := s.d.Members.IsMember(ctx, ch.TeamID, email)
	if !ok {
		return nil, nil, ErrForbidden
	}

	session, err := s.d.Voice.Join(ctx, channelID, email)
	if err != nil {
		return nil, nil, err
	}

	// Notify others in the channel
	s.d.Hub.BroadcastToChannel(channelID, "voice.joined", map[string]interface{}{
		"channel_id": channelID,
		"user_email": email,
		"session":    session,
	})

	// Return existing participants so the client knows who to connect to
	participants, err := s.d.Voice.ListParticipants(ctx, channelID)
	if err != nil {
		return session, nil, nil
	}

	return session, participants, nil
}

// Leave removes a user from a voice channel.
func (s *VoiceService) Leave(ctx context.Context, channelID, email string) error {
	if err := s.d.Voice.Leave(ctx, channelID, email); err != nil {
		return err
	}

	s.d.Hub.BroadcastToChannel(channelID, "voice.left", map[string]interface{}{
		"channel_id": channelID,
		"user_email": email,
	})

	return nil
}

// ListParticipants returns who is currently in a voice channel.
func (s *VoiceService) ListParticipants(ctx context.Context, channelID, email string) ([]models.VoiceSession, error) {
	ch, err := s.d.Channels.GetByID(ctx, channelID)
	if err != nil {
		return nil, ErrNotFound
	}
	ok, _ := s.d.Members.IsMember(ctx, ch.TeamID, email)
	if !ok {
		return nil, ErrForbidden
	}
	return s.d.Voice.ListParticipants(ctx, channelID)
}

// Signal relays WebRTC signaling (offer/answer/ICE) between peers.
func (s *VoiceService) Signal(ctx context.Context, signal models.VoiceSignal, email string) error {
	ch, err := s.d.Channels.GetByID(ctx, signal.ChannelID)
	if err != nil {
		return ErrNotFound
	}
	ok, _ := s.d.Members.IsMember(ctx, ch.TeamID, email)
	if !ok {
		return ErrForbidden
	}

	// Forward signal directly to the target user via WebSocket
	s.d.Hub.SendToUser(signal.ToEmail, "voice.signal", map[string]interface{}{
		"channel_id":  signal.ChannelID,
		"from_email":  email,
		"signal_type": signal.SignalType,
		"payload":     signal.Payload,
	})

	return nil
}

// UpdateMute toggles mute/deafen and broadcasts to peers.
func (s *VoiceService) UpdateMute(ctx context.Context, channelID, email string, muted, deafened bool) error {
	if err := s.d.Voice.UpdateMute(ctx, channelID, email, muted, deafened); err != nil {
		return err
	}

	s.d.Hub.BroadcastToChannel(channelID, "voice.mute_update", map[string]interface{}{
		"channel_id":  channelID,
		"user_email":  email,
		"is_muted":    muted,
		"is_deafened": deafened,
	})

	return nil
}
