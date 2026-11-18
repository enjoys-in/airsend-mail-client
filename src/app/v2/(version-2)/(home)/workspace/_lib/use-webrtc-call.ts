// ============================================================================
// useWebRTCCall — production-grade hook for live video, audio & screen sharing
// ============================================================================

"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { workspaceApi } from "./api";
import { useChatStore } from "./chat-store";

interface WebRTCCallProps {
  callId: string;
  userEmail: string;
  enabled?: boolean;
}

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
  ],
};

export function useWebRTCCall({ callId, userEmail, enabled = true }: WebRTCCallProps) {
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const screenVideoRef = useRef<HTMLVideoElement | null>(null);

  const localStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionsRef = useRef<Map<string, RTCPeerConnection>>(new Map());

  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(new Map());
  const [hasMediaPermission, setHasMediaPermission] = useState(false);
  const [mediaError, setMediaError] = useState<string | null>(null);

  const {
    isMyCameraOn,
    isMyMicMuted,
    isMyScreenSharing,
    isMyHandRaised,
    toggleCamera: storeToggleCamera,
    toggleMic: storeToggleMic,
    toggleScreenShare: storeToggleScreenShare,
    toggleHandRaise: storeToggleHandRaise,
  } = useChatStore();

  // Helper to get or create RTCPeerConnection for a remote peer
  const getOrCreatePeerConnection = useCallback(
    (peerEmail: string): RTCPeerConnection => {
      let pc = peerConnectionsRef.current.get(peerEmail);
      if (pc && pc.signalingState !== "closed") {
        return pc;
      }

      pc = new RTCPeerConnection(ICE_SERVERS);
      peerConnectionsRef.current.set(peerEmail, pc);

      // Add local media tracks
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => {
          pc?.addTrack(track, localStreamRef.current!);
        });
      }

      // Handle ICE candidates
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          workspaceApi
            .sendCallSignal(callId, peerEmail, "ice-candidate", event.candidate, userEmail)
            .catch(() => {});
        }
      };

      // Handle incoming remote media tracks
      pc.ontrack = (event) => {
        const stream = event.streams[0] || new MediaStream([event.track]);
        setRemoteStreams((prev) => new Map(prev).set(peerEmail, stream));
      };

      pc.onconnectionstatechange = () => {
        if (pc?.connectionState === "disconnected" || pc?.connectionState === "failed") {
          setRemoteStreams((prev) => {
            const next = new Map(prev);
            next.delete(peerEmail);
            return next;
          });
        }
      };

      return pc;
    },
    [callId, userEmail]
  );

  // Initialize camera & microphone
  useEffect(() => {
    if (!enabled || typeof window === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      return;
    }

    let isMounted = true;

    async function initMedia() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: true,
        });

        if (!isMounted) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        localStreamRef.current = stream;
        setHasMediaPermission(true);
        setMediaError(null);

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        // Apply initial mute/camera states
        stream.getAudioTracks().forEach((t) => {
          t.enabled = !isMyMicMuted;
        });
        stream.getVideoTracks().forEach((t) => {
          t.enabled = isMyCameraOn;
        });
      } catch (err: any) {
        if (isMounted) {
          console.warn("[WebRTC] Local media not accessible:", err.message);
          setMediaError(err.message || "Microphone/Camera permission denied");
        }
      }
    }

    initMedia();

    return () => {
      isMounted = false;
      localStreamRef.current?.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
      screenStreamRef.current?.getTracks().forEach((t) => t.stop());
      screenStreamRef.current = null;
      peerConnectionsRef.current.forEach((pc) => pc.close());
      peerConnectionsRef.current.clear();
    };
  }, [enabled]);

  // Handle incoming signaling messages from window event
  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;

    const handleSignalEvent = async (event: Event) => {
      const customEv = event as CustomEvent;
      const data = customEv.detail;
      if (!data || data.call_id !== callId || data.from_email === userEmail) {
        return;
      }

      const peerEmail = data.from_email;
      const signalType = data.signal_type;
      const payload = data.payload;

      const pc = getOrCreatePeerConnection(peerEmail);

      try {
        if (signalType === "offer") {
          await pc.setRemoteDescription(new RTCSessionDescription(payload));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          await workspaceApi.sendCallSignal(callId, peerEmail, "answer", answer, userEmail);
        } else if (signalType === "answer") {
          await pc.setRemoteDescription(new RTCSessionDescription(payload));
        } else if (signalType === "ice-candidate") {
          if (payload) {
            await pc.addIceCandidate(new RTCIceCandidate(payload));
          }
        }
      } catch (e) {
        console.warn("[WebRTC] Signal handling error:", e);
      }
    };

    window.addEventListener("airsend:call-signal", handleSignalEvent);
    return () => {
      window.removeEventListener("airsend:call-signal", handleSignalEvent);
    };
  }, [callId, userEmail, enabled, getOrCreatePeerConnection]);

  // Toggle Camera
  const toggleCamera = useCallback(() => {
    storeToggleCamera();
    const nextState = !isMyCameraOn;
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach((t) => {
        t.enabled = nextState;
      });
    }
  }, [isMyCameraOn, storeToggleCamera]);

  // Toggle Mic
  const toggleMic = useCallback(() => {
    storeToggleMic();
    const nextState = !isMyMicMuted;
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((t) => {
        t.enabled = !nextState; // if muted is false, track is enabled
      });
    }
  }, [isMyMicMuted, storeToggleMic]);

  // Screen Share Handler
  const startScreenShare = useCallback(async () => {
    if (!navigator.mediaDevices?.getDisplayMedia) return;

    try {
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: { cursor: "always" } as any,
        audio: true,
      });

      screenStreamRef.current = displayStream;
      if (screenVideoRef.current) {
        screenVideoRef.current.srcObject = displayStream;
      }

      // Replace video tracks in peer connections with screen share track
      const screenVideoTrack = displayStream.getVideoTracks()[0];
      if (screenVideoTrack) {
        peerConnectionsRef.current.forEach((pc) => {
          const senders = pc.getSenders();
          const videoSender = senders.find((s) => s.track?.kind === "video");
          if (videoSender) {
            videoSender.replaceTrack(screenVideoTrack);
          }
        });

        // Auto-stop when user clicks "Stop Sharing" on native browser prompt
        screenVideoTrack.onended = () => {
          stopScreenShare();
        };
      }

      storeToggleScreenShare();
      workspaceApi.updateCallState(callId, { is_screen_sharing: true }, userEmail).catch(() => {});
    } catch (err) {
      console.warn("[WebRTC] Screen sharing cancelled or denied:", err);
    }
  }, [callId, userEmail, storeToggleScreenShare]);

  const stopScreenShare = useCallback(() => {
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((t) => t.stop());
      screenStreamRef.current = null;
    }

    // Revert peer connection tracks back to local camera
    const localVideoTrack = localStreamRef.current?.getVideoTracks()[0] || null;
    peerConnectionsRef.current.forEach((pc) => {
      const senders = pc.getSenders();
      const videoSender = senders.find((s) => s.track?.kind === "video");
      if (videoSender && localVideoTrack) {
        videoSender.replaceTrack(localVideoTrack);
      }
    });

    if (isMyScreenSharing) {
      storeToggleScreenShare();
    }
    workspaceApi.updateCallState(callId, { is_screen_sharing: false }, userEmail).catch(() => {});
  }, [callId, userEmail, isMyScreenSharing, storeToggleScreenShare]);

  const toggleScreenShare = useCallback(() => {
    if (isMyScreenSharing) {
      stopScreenShare();
    } else {
      startScreenShare();
    }
  }, [isMyScreenSharing, startScreenShare, stopScreenShare]);

  // Toggle Hand Raise
  const toggleHandRaise = useCallback(() => {
    storeToggleHandRaise();
    const next = !isMyHandRaised;
    workspaceApi.updateCallState(callId, { is_hand_raised: next }, userEmail).catch(() => {});
  }, [callId, userEmail, isMyHandRaised, storeToggleHandRaise]);

  return {
    localVideoRef,
    screenVideoRef,
    remoteStreams,
    hasMediaPermission,
    mediaError,
    isMyCameraOn,
    isMyMicMuted,
    isMyScreenSharing,
    isMyHandRaised,
    toggleCamera,
    toggleMic,
    toggleScreenShare,
    toggleHandRaise,
  };
}
