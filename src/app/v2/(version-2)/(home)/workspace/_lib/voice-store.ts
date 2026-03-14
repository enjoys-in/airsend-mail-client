// ============================================================================
// Voice Channel Store — WebRTC peer connection management (mesh topology)
// ============================================================================

import { create } from "zustand";
import { workspaceApi, type ServerVoiceSession } from "./api";
import type { VoiceParticipant } from "./chat-types";

// ── Transform server → client ──

function toVoiceParticipant(s: ServerVoiceSession): VoiceParticipant {
  return {
    id: s.id,
    channelId: s.channel_id,
    userEmail: s.user_email,
    displayName: s.display_name ?? s.user_email.split("@")[0],
    joinedAt: s.joined_at,
    isMuted: s.is_muted,
    isDeafened: s.is_deafened,
  };
}

// ── Store shape ──

interface VoiceStore {
  channelId: string | null;
  participants: VoiceParticipant[];
  isMuted: boolean;
  isDeafened: boolean;
  isConnecting: boolean;
  localStream: MediaStream | null;
  peers: Map<string, RTCPeerConnection>;
  remoteStreams: Map<string, MediaStream>;

  join: (channelId: string, email: string) => Promise<void>;
  leave: (email: string) => Promise<void>;
  toggleMute: (email: string) => void;
  toggleDeafen: (email: string) => void;
  handleSignal: (fromEmail: string, signalType: string, payload: any, email: string) => void;
  setParticipants: (participants: VoiceParticipant[]) => void;
  addParticipant: (participant: VoiceParticipant) => void;
  removeParticipant: (userEmail: string) => void;
  cleanup: () => void;
}

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

export const useVoiceStore = create<VoiceStore>()((set, get) => ({
  channelId: null,
  participants: [],
  isMuted: false,
  isDeafened: false,
  isConnecting: false,
  localStream: null,
  peers: new Map(),
  remoteStreams: new Map(),

  join: async (channelId, email) => {
    set({ isConnecting: true });

    try {
      // Get microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false,
      });

      // Notify server
      const res = await workspaceApi.joinVoice(channelId, email);

      const participants = (res.participants ?? []).map(toVoiceParticipant);

      set({
        channelId,
        localStream: stream,
        participants,
        isMuted: false,
        isDeafened: false,
        isConnecting: false,
      });

      // Create peer connections to existing participants
      for (const p of participants) {
        if (p.userEmail !== email) {
          await createPeerConnection(p.userEmail, email, channelId, stream, true);
        }
      }
    } catch (err) {
      set({ isConnecting: false });
      throw err;
    }
  },

  leave: async (email) => {
    const { channelId, localStream, cleanup } = get();
    if (!channelId) return;

    // Notify server
    await workspaceApi.leaveVoice(channelId, email).catch(() => {});

    // Stop all tracks
    localStream?.getTracks().forEach((t) => t.stop());

    cleanup();

    set({
      channelId: null,
      localStream: null,
      participants: [],
      isMuted: false,
      isDeafened: false,
    });
  },

  toggleMute: (email) => {
    const { isMuted, localStream, channelId } = get();
    const newMuted = !isMuted;

    // Toggle audio track
    localStream?.getAudioTracks().forEach((t) => {
      t.enabled = !newMuted;
    });

    set({ isMuted: newMuted });

    if (channelId) {
      workspaceApi.voiceMute(channelId, newMuted, get().isDeafened, email).catch(() => {});
    }
  },

  toggleDeafen: (email) => {
    const { isDeafened, channelId, remoteStreams } = get();
    const newDeafened = !isDeafened;

    // Mute/unmute all remote audio
    remoteStreams.forEach((stream) => {
      stream.getAudioTracks().forEach((t) => {
        t.enabled = !newDeafened;
      });
    });

    set({ isDeafened: newDeafened });

    if (channelId) {
      workspaceApi.voiceMute(channelId, get().isMuted, newDeafened, email).catch(() => {});
    }
  },

  handleSignal: async (fromEmail, signalType, payload, email) => {
    const { channelId, localStream, peers } = get();
    if (!channelId || !localStream) return;

    let pc = peers.get(fromEmail);

    if (signalType === "offer") {
      // Create a new peer connection for the offerer
      pc = await createPeerConnection(fromEmail, email, channelId, localStream, false);

      await pc.setRemoteDescription(new RTCSessionDescription(payload));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      workspaceApi.voiceSignal(channelId, fromEmail, "answer", answer, email).catch(() => {});
    } else if (signalType === "answer" && pc) {
      await pc.setRemoteDescription(new RTCSessionDescription(payload));
    } else if (signalType === "ice-candidate" && pc) {
      if (payload) {
        await pc.addIceCandidate(new RTCIceCandidate(payload)).catch(() => {});
      }
    }
  },

  setParticipants: (participants) => set({ participants }),
  addParticipant: (participant) =>
    set((s) => {
      if (s.participants.some((p) => p.userEmail === participant.userEmail)) return s;
      return { participants: [...s.participants, participant] };
    }),
  removeParticipant: (userEmail) =>
    set((s) => {
      // Close peer connection
      const pc = s.peers.get(userEmail);
      if (pc) {
        pc.close();
        s.peers.delete(userEmail);
      }
      s.remoteStreams.delete(userEmail);
      return {
        participants: s.participants.filter((p) => p.userEmail !== userEmail),
        peers: new Map(s.peers),
        remoteStreams: new Map(s.remoteStreams),
      };
    }),

  cleanup: () => {
    const { peers, remoteStreams } = get();
    peers.forEach((pc) => pc.close());
    set({
      peers: new Map(),
      remoteStreams: new Map(),
    });
  },
}));

// ── Helper: Create a WebRTC peer connection for a remote user ──

async function createPeerConnection(
  remoteEmail: string,
  localEmail: string,
  channelId: string,
  localStream: MediaStream,
  isInitiator: boolean,
): Promise<RTCPeerConnection> {
  const pc = new RTCPeerConnection(ICE_SERVERS);

  // Add local audio tracks
  localStream.getTracks().forEach((track) => {
    pc.addTrack(track, localStream);
  });

  // Handle remote stream
  pc.ontrack = (event) => {
    const remoteStream = event.streams[0];
    if (remoteStream) {
      useVoiceStore.setState((s) => ({
        remoteStreams: new Map(s.remoteStreams).set(remoteEmail, remoteStream),
      }));
    }
  };

  // ICE candidates
  pc.onicecandidate = (event) => {
    if (event.candidate) {
      workspaceApi
        .voiceSignal(channelId, remoteEmail, "ice-candidate", event.candidate.toJSON(), localEmail)
        .catch(() => {});
    }
  };

  // Store peer connection
  useVoiceStore.setState((s) => ({
    peers: new Map(s.peers).set(remoteEmail, pc),
  }));

  // Initiator creates and sends offer
  if (isInitiator) {
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    workspaceApi
      .voiceSignal(channelId, remoteEmail, "offer", offer, localEmail)
      .catch(() => {});
  }

  return pc;
}
