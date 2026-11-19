"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  MonitorUp,
  Hand,
  MessageSquare,
  Users,
  PhoneOff,
  Copy,
  Check,
  Maximize2,
  Minimize2,
  Shield,
  Send,
  ScreenShare,
  AlertCircle,
  Info,
  ClosedCaption,
  Edit3,
  LayoutGrid,
  Smile,
  Bot,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useChatStore } from "../../_lib/chat-store";
import { useWebRTCCall } from "../../_lib/use-webrtc-call";
import { formatMeetUrl, meetingApi } from "../../_lib/api";
import LiveCallTile from "../../_components/LiveCallTile";
import WorkspaceErrorBoundary from "../../_components/WorkspaceErrorBoundary";
import GoogleMeetLobby from "../../_components/GoogleMeetLobby";
import MeetDetailsDrawer from "../../_components/MeetDetailsDrawer";
import MeetHostControlsDrawer from "../../_components/MeetHostControlsDrawer";
import MeetCaptionsOverlay from "../../_components/MeetCaptionsOverlay";
import MeetWhiteboardDrawer from "../../_components/MeetWhiteboardDrawer";
import type { LiveCallParticipant } from "../../_lib/chat-types";

interface CallRoomPageProps {
  params: Promise<{ callId: string }>;
}

export default function CallRoomPage({ params }: CallRoomPageProps) {
  const { callId } = React.use(params);
  return (
    <WorkspaceErrorBoundary fallbackTitle="Unable to load Live Call Room">
      <LiveCallRoomContent callId={callId} />
    </WorkspaceErrorBoundary>
  );
}

function LiveCallRoomContent({ callId }: { callId: string }) {
  const router = useRouter();
  const {
    activeCallTitle,
    callParticipants,
    isMyCameraOn,
    isMyMicMuted,
    isMyScreenSharing,
    isMyHandRaised,
    leaveCall,
    startCall,
    currentUserId,
    meetings,
  } = useChatStore();

  // Find meeting if any
  const matchedMeeting = meetings.find((m) => m.id === callId || m.meetingUrl.includes(callId));
  const title = matchedMeeting?.title || activeCallTitle || `Meeting: ${callId}`;

  // Pre-join lobby state
  const [isLobbyJoined, setIsLobbyJoined] = useState(false);
  const [isMeetingBotActive, setIsMeetingBotActive] = useState(true);

  // Ensure call is active in store
  useEffect(() => {
    startCall(callId, title);
  }, [callId, title, startCall]);

  // WebRTC Media & Signaling Hook
  const {
    localVideoRef,
    screenVideoRef,
    remoteStreams,
    hasMediaPermission,
    mediaError,
    toggleCamera,
    toggleMic,
    toggleScreenShare,
    toggleHandRaise,
  } = useWebRTCCall({
    callId,
    userEmail: currentUserId || "alex@airsend.io",
  });

  // Duration timer
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  useEffect(() => {
    if (!isLobbyJoined) return;
    const timer = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isLobbyJoined]);

  // Mint or verify token from dedicated meeting backend (../meeting, meet.airsend.in)
  useEffect(() => {
    meetingApi
      .mintToken(callId, currentUserId || "u-self", undefined, "Alex Chen")
      .then((res) => {
        console.log("[MeetBackend] Token minted from meet.airsend.in:", res.role);
      })
      .catch((err) => {
        console.warn("[MeetBackend] Dedicated meet server offline, peer fallback active:", err.message);
      });
  }, [callId, currentUserId]);

  // Reactions state & animation
  const REACTION_EMOJIS = ["👍", "🎉", "❤️", "😂", "😮", "😢", "🙏", "👏"] as const;
  const [floatingReactions, setFloatingReactions] = useState<{ id: string; emoji: string; left: number }[]>([]);
  const [showReactionsMenu, setShowReactionsMenu] = useState(false);

  const handleTriggerReaction = (emoji: string) => {
    const id = `react-${Date.now()}-${Math.random()}`;
    const left = Math.floor(Math.random() * 60) + 20;
    setFloatingReactions((prev) => [...prev, { id, emoji, left }]);
    setTimeout(() => {
      setFloatingReactions((prev) => prev.filter((r) => r.id !== id));
    }, 2400);
    setShowReactionsMenu(false);
  };

  const formatTimer = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // UI state
  type DrawerType = "chat" | "participants" | "details" | "host" | "notes" | null;
  const [activeDrawer, setActiveDrawer] = useState<DrawerType>(null);
  const [showCaptions, setShowCaptions] = useState(false);
  const [layoutMode, setLayoutMode] = useState<"grid" | "spotlight" | "sidebar">("grid");
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [spotlightId, setSpotlightId] = useState<string | null>(null);

  // In-call chat messages
  const [chatMessages, setChatMessages] = useState<
    { id: string; sender: string; text: string; time: string }[]
  >([
    { id: "cm-1", sender: "Sarah Chen", text: "Welcome everyone! Feel free to share your screen or raise your hand.", time: "Just now" },
  ]);
  const [inputMessage, setInputMessage] = useState("");

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;
    setChatMessages((prev) => [
      ...prev,
      {
        id: `cm-${Date.now()}`,
        sender: "You",
        text: inputMessage.trim(),
        time: "Just now",
      },
    ]);
    setInputMessage("");
  };

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(formatMeetUrl(callId));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLeaveCall = () => {
    leaveCall();
    router.push("/v2/workspace/calls");
  };

  // Build current live roster
  const selfParticipant: LiveCallParticipant = {
    id: currentUserId || "u-self",
    name: "You",
    email: currentUserId || "you@airsend.io",
    isAudioMuted: isMyMicMuted,
    isVideoOff: !isMyCameraOn,
    isScreenSharing: isMyScreenSharing,
    isHandRaised: isMyHandRaised,
    isSpeaking: !isMyMicMuted,
    role: "host",
  };

  const meetingBotParticipant: LiveCallParticipant = {
    id: "airsend-meeting-bot",
    name: "Meeting Bot (AI Assistant)",
    email: "bot@airsend.io",
    isAudioMuted: false,
    isVideoOff: true,
    isScreenSharing: false,
    isHandRaised: false,
    isSpeaking: false,
    role: "attendee",
  };

  const allParticipants = [
    selfParticipant,
    ...(isMeetingBotActive ? [meetingBotParticipant] : []),
    ...callParticipants.filter((p) => p.email !== selfParticipant.email && p.id !== selfParticipant.id),
  ];

  // Screen share presenter if someone is sharing
  const screenSharer = allParticipants.find((p) => p.isScreenSharing);

  // If in Green Room Pre-Join Lobby, render Google Meet Lobby
  if (!isLobbyJoined) {
    return (
      <GoogleMeetLobby
        callId={callId}
        title={title}
        participants={allParticipants}
        localVideoRef={localVideoRef}
        isMyCameraOn={isMyCameraOn}
        isMyMicMuted={isMyMicMuted}
        toggleCamera={toggleCamera}
        toggleMic={toggleMic}
        onJoin={(startWithScreenShare) => {
          setIsLobbyJoined(true);
          if (startWithScreenShare) {
            toggleScreenShare();
          }
        }}
      />
    );
  }

  const toggleDrawer = (type: DrawerType) => {
    setActiveDrawer((prev) => (prev === type ? null : type));
  };

  return (
    <div className="relative flex h-full w-full flex-1 flex-col overflow-hidden bg-slate-950 text-slate-100 select-none">
      {/* ── Top Bar ── */}
      <div className="flex h-13 shrink-0 items-center justify-between border-b border-slate-800/80 bg-slate-900/60 px-4 backdrop-blur">
        <div className="flex items-center gap-3">
          <Badge className="bg-red-500/20 text-red-400 border-red-500/40 text-[10px] gap-1 animate-pulse">
            <span className="size-1.5 rounded-full bg-red-500" />
            REC
          </Badge>
          {isMeetingBotActive && (
            <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/40 text-[10px] gap-1 hidden sm:flex">
              <Bot className="size-3 text-purple-400 animate-pulse" />
              Bot Attending
            </Badge>
          )}
          <div className="space-y-0.5">
            <h2 className="text-xs sm:text-sm font-semibold truncate max-w-[200px] sm:max-w-md text-white">
              {title}
            </h2>
            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <span className="font-mono text-emerald-400">{formatTimer(secondsElapsed)}</span>
              <span>•</span>
              <span className="font-mono text-slate-300">{callId}</span>
              <span>•</span>
              <span>{allParticipants.length} in call</span>
              {mediaError && (
                <span className="text-amber-400 flex items-center gap-1">
                  <AlertCircle className="size-3" /> (Simulated Media)
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Layout switcher */}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setLayoutMode((prev) => (prev === "grid" ? "spotlight" : prev === "spotlight" ? "sidebar" : "grid"))}
            className="h-8 gap-1 text-xs text-slate-300 hover:bg-slate-800 hover:text-white hidden sm:flex"
            title="Switch Video Layout (Grid / Spotlight / Sidebar)"
          >
            <LayoutGrid className="size-3.5" />
            <span className="capitalize">{layoutMode}</span>
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={handleCopyLink}
            className="h-8 gap-1.5 text-xs text-slate-300 hover:bg-slate-800 hover:text-white"
          >
            {copied ? <Check className="size-3.5 text-emerald-400" /> : <Copy className="size-3.5" />}
            <span className="hidden sm:inline">{copied ? "Copied" : "meet.airsend.in"}</span>
          </Button>

          <Button
            size="icon"
            variant="ghost"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="size-8 text-slate-300 hover:bg-slate-800"
          >
            {isFullscreen ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
          </Button>
        </div>
      </div>

      {/* ── Main Stage (Video Tiles Grid & Presentation View) ── */}
      <div className="relative flex flex-1 overflow-hidden">
        <div className="flex flex-1 flex-col p-3 sm:p-4 overflow-y-auto justify-center">
          {screenSharer ? (
            /* Spotlight Presentation Layout */
            <div className="flex flex-col lg:flex-row gap-3 h-full max-h-full items-stretch">
              {/* Primary Screen Share Feed */}
              <div className="relative flex flex-1 flex-col justify-center items-center rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden min-h-[300px]">
                {screenSharer.id === selfParticipant.id ? (
                  <video
                    ref={screenVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="size-full object-contain"
                  />
                ) : remoteStreams.get(screenSharer.email) ? (
                  <video
                    ref={(el) => {
                      if (el && remoteStreams.get(screenSharer.email)) {
                        el.srcObject = remoteStreams.get(screenSharer.email)!;
                      }
                    }}
                    autoPlay
                    playsInline
                    className="size-full object-contain"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center p-8 text-center">
                    <div className="flex size-16 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400 mb-3 border border-blue-500/30">
                      <ScreenShare className="size-8 animate-pulse" />
                    </div>
                    <h3 className="text-sm font-semibold text-white">
                      {screenSharer.name}&apos;s Screen is Live
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Presenting high-resolution screen share to all meeting participants
                    </p>
                  </div>
                )}
                <div className="absolute top-3 left-3 flex items-center gap-2 rounded-full bg-slate-950/80 px-3 py-1 border border-slate-800">
                  <ScreenShare className="size-3.5 text-blue-400" />
                  <span className="text-xs font-medium text-slate-200">
                    {screenSharer.name}&apos;s Presentation
                  </span>
                </div>
              </div>

              {/* Sidebar Roster Video Tiles */}
              <div className="flex lg:flex-col gap-3 shrink-0 overflow-x-auto lg:overflow-y-auto lg:w-72">
                {allParticipants.map((participant) => (
                  <div key={participant.id} className="min-w-[180px] lg:min-w-0 aspect-video">
                    <LiveCallTile
                      participant={participant}
                      isSelf={participant.id === selfParticipant.id}
                      videoRef={participant.id === selfParticipant.id ? localVideoRef : undefined}
                      stream={remoteStreams.get(participant.email)}
                      isSpotlight={false}
                      onSpotlight={() => setSpotlightId(spotlightId === participant.id ? null : participant.id)}
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Adaptive Grid Layout */
            <div
              className={`grid gap-3 sm:gap-4 h-full max-h-full items-center justify-center ${
                allParticipants.length === 1
                  ? "grid-cols-1 max-w-4xl mx-auto w-full"
                  : allParticipants.length === 2
                    ? "grid-cols-1 sm:grid-cols-2 max-w-5xl mx-auto w-full"
                    : allParticipants.length <= 4
                      ? "grid-cols-2 max-w-6xl mx-auto w-full"
                      : "grid-cols-2 md:grid-cols-3 xl:grid-cols-4 w-full"
              }`}
            >
              {allParticipants.map((participant) => (
                <div
                  key={participant.id}
                  className={`w-full aspect-video transition-all ${
                    spotlightId === participant.id
                      ? "col-span-full row-span-2 h-full z-10"
                      : ""
                  }`}
                >
                  <LiveCallTile
                    participant={participant}
                    isSelf={participant.id === selfParticipant.id}
                    videoRef={participant.id === selfParticipant.id ? localVideoRef : undefined}
                    stream={remoteStreams.get(participant.email)}
                    isSpotlight={spotlightId === participant.id}
                    onSpotlight={() => setSpotlightId(spotlightId === participant.id ? null : participant.id)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Floating Emojis Overlay ── */}
        <div className="pointer-events-none absolute inset-0 z-40 overflow-hidden">
          {floatingReactions.map((r) => (
            <div
              key={r.id}
              className="absolute bottom-16 text-3xl sm:text-4xl select-none transition-all"
              style={{
                left: `${r.left}%`,
                animation: "floatUpAndFade 2.2s forwards ease-in-out",
              }}
            >
              {r.emoji}
            </div>
          ))}
        </div>

        {/* ── Live Captions Overlay ── */}
        {showCaptions && (
          <MeetCaptionsOverlay onClose={() => setShowCaptions(false)} />
        )}

        {/* ── Side Drawers ── */}
        {activeDrawer === "details" && (
          <MeetDetailsDrawer
            callId={callId}
            title={title}
            onClose={() => setActiveDrawer(null)}
          />
        )}

        {activeDrawer === "host" && (
          <MeetHostControlsDrawer
            onClose={() => setActiveDrawer(null)}
            onMuteAll={() => {
              // Mute all other participants
            }}
          />
        )}

        {activeDrawer === "notes" && (
          <MeetWhiteboardDrawer onClose={() => setActiveDrawer(null)} />
        )}

        {activeDrawer === "chat" && (
          <div className="flex h-full w-80 sm:w-88 flex-col border-l border-slate-800 bg-slate-900/95 backdrop-blur text-slate-100 z-30 shadow-2xl">
            <div className="flex h-14 shrink-0 items-center justify-between border-b border-slate-800 px-4">
              <h3 className="text-sm font-semibold text-white">In-call messages</h3>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setActiveDrawer(null)}
                className="size-8 text-slate-400 hover:text-white"
              >
                ✕
              </Button>
            </div>
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-3">
                {chatMessages.map((msg) => (
                  <div key={msg.id} className="rounded-xl bg-slate-950/70 p-3 border border-slate-800/80">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-xs text-blue-400">{msg.sender}</span>
                      <span className="text-[10px] text-slate-500">{msg.time}</span>
                    </div>
                    <p className="text-xs text-slate-200 leading-relaxed">{msg.text}</p>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <div className="border-t border-slate-800 p-3 flex gap-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="Send a message to everyone..."
                className="bg-slate-950 border-slate-800 text-xs h-9 text-white focus-visible:ring-blue-500"
              />
              <Button size="icon" onClick={handleSendMessage} className="size-9 bg-blue-600 hover:bg-blue-700 text-white shrink-0">
                <Send className="size-4" />
              </Button>
            </div>
          </div>
        )}

        {activeDrawer === "participants" && (
          <div className="flex h-full w-80 sm:w-88 flex-col border-l border-slate-800 bg-slate-900/95 backdrop-blur text-slate-100 z-30 shadow-2xl">
            <div className="flex h-14 shrink-0 items-center justify-between border-b border-slate-800 px-4">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-white">People</h3>
                <Badge variant="outline" className="border-slate-700 text-[10px] text-slate-300">
                  {allParticipants.length}
                </Badge>
              </div>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setActiveDrawer(null)}
                className="size-8 text-slate-400 hover:text-white"
              >
                ✕
              </Button>
            </div>
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-2">
                {allParticipants.map((p) => (
                  <div key={p.id} className="flex items-center justify-between rounded-xl bg-slate-950/60 p-2.5 border border-slate-800/80">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Avatar className="size-8">
                        <AvatarFallback className="bg-slate-800 text-xs text-slate-300 font-bold">
                          {p.name.split(" ").map((n) => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <span className="text-xs font-medium text-slate-200 block truncate">
                          {p.name} {p.id === selfParticipant.id ? "(You)" : ""}
                        </span>
                        <span className="text-[10px] text-slate-400 capitalize">{p.role}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {p.isAudioMuted ? (
                        <MicOff className="size-3.5 text-red-400" />
                      ) : (
                        <Mic className="size-3.5 text-emerald-400" />
                      )}
                      {p.isVideoOff ? (
                        <VideoOff className="size-3.5 text-red-400" />
                      ) : (
                        <Video className="size-3.5 text-blue-400" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}
      </div>

      {/* ── Fixed Bottom Controls Bar ── */}
      <div className="flex h-16 shrink-0 items-center justify-between border-t border-slate-800/80 bg-slate-900/80 px-4 md:px-6 backdrop-blur">
        {/* Left: Meeting Details Trigger & Code */}
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => toggleDrawer("details")}
            className={`h-9 px-2.5 gap-2 rounded-xl border transition-all ${
              activeDrawer === "details"
                ? "border-blue-500 bg-blue-500/20 text-blue-400"
                : "border-transparent text-slate-400 hover:bg-slate-800 hover:text-white"
            }`}
            title="Meeting Details"
          >
            <Info className="size-4" />
            <span className="hidden md:inline font-mono">{callId}</span>
          </Button>
        </div>

        {/* Center: Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3 mx-auto">
          {/* Mic Button */}
          <Button
            size="icon"
            variant="outline"
            onClick={toggleMic}
            className={`size-10 rounded-full border transition-all ${
              isMyMicMuted
                ? "bg-red-500/20 border-red-500 text-red-400 hover:bg-red-500/30"
                : "bg-slate-800 border-slate-700 text-white hover:bg-slate-700"
            }`}
            title={isMyMicMuted ? "Unmute Microphone" : "Mute Microphone"}
          >
            {isMyMicMuted ? <MicOff className="size-4" /> : <Mic className="size-4" />}
          </Button>

          {/* Camera Button */}
          <Button
            size="icon"
            variant="outline"
            onClick={toggleCamera}
            className={`size-10 rounded-full border transition-all ${
              !isMyCameraOn
                ? "bg-red-500/20 border-red-500 text-red-400 hover:bg-red-500/30"
                : "bg-slate-800 border-slate-700 text-white hover:bg-slate-700"
            }`}
            title={isMyCameraOn ? "Turn Camera Off" : "Turn Camera On"}
          >
            {isMyCameraOn ? <Video className="size-4" /> : <VideoOff className="size-4" />}
          </Button>

          {/* Live Captions Button */}
          <Button
            size="icon"
            variant="outline"
            onClick={() => setShowCaptions(!showCaptions)}
            className={`size-10 rounded-full border transition-all ${
              showCaptions
                ? "bg-blue-600 border-blue-500 text-white"
                : "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
            }`}
            title={showCaptions ? "Turn Off Captions" : "Turn On Captions"}
          >
            <ClosedCaption className="size-4" />
          </Button>

          {/* Screen Share Button */}
          <Button
            size="icon"
            variant="outline"
            onClick={toggleScreenShare}
            className={`size-10 rounded-full border transition-all ${
              isMyScreenSharing
                ? "bg-blue-600 border-blue-500 text-white"
                : "bg-slate-800 border-slate-700 text-white hover:bg-slate-700"
            }`}
            title="Share / Stop Screen"
          >
            <MonitorUp className="size-4" />
          </Button>

          {/* Raise Hand Button */}
          <Button
            size="icon"
            variant="outline"
            onClick={toggleHandRaise}
            className={`size-10 rounded-full border transition-all ${
              isMyHandRaised
                ? "bg-amber-500 border-amber-400 text-slate-950 font-bold"
                : "bg-slate-800 border-slate-700 text-white hover:bg-slate-700"
            }`}
            title="Raise / Lower Hand"
          >
            <Hand className="size-4" />
          </Button>

          {/* Emoji Reactions Button & Menu */}
          <div className="relative">
            <Button
              size="icon"
              variant="outline"
              onClick={() => setShowReactionsMenu(!showReactionsMenu)}
              className={`size-10 rounded-full border transition-all ${
                showReactionsMenu
                  ? "bg-blue-600 border-blue-500 text-white"
                  : "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white"
              }`}
              title="Send a reaction (Emoji)"
            >
              <Smile className="size-4" />
            </Button>

            {showReactionsMenu && (
              <div className="absolute bottom-14 left-1/2 -translate-x-1/2 flex items-center gap-1 p-1.5 rounded-full bg-slate-900/95 border border-slate-700 shadow-2xl backdrop-blur-md z-50">
                {REACTION_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => handleTriggerReaction(emoji)}
                    className="size-8 flex items-center justify-center text-lg hover:scale-125 hover:bg-slate-800 rounded-full transition-all duration-150"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Whiteboard / Notes Button */}
          <Button
            size="icon"
            variant="outline"
            onClick={() => toggleDrawer("notes")}
            className={`size-10 rounded-full border transition-all ${
              activeDrawer === "notes"
                ? "bg-emerald-600/30 border-emerald-500 text-emerald-400"
                : "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
            }`}
            title="Meeting Notes & Whiteboard"
          >
            <Edit3 className="size-4" />
          </Button>

          {/* Meeting Bot Attend & Transcribe Button */}
          <Button
            size="icon"
            variant="outline"
            onClick={() => setIsMeetingBotActive(!isMeetingBotActive)}
            className={`size-10 rounded-full border transition-all ${
              isMeetingBotActive
                ? "bg-purple-600 border-purple-500 text-white shadow-md shadow-purple-600/30"
                : "bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-white"
            }`}
            title={isMeetingBotActive ? "Meeting Bot Active (Recording & Transcribing)" : "Invite Meeting Bot to Attend"}
          >
            <Bot className="size-4" />
          </Button>

          {/* Chat Toggle Button */}
          <Button
            size="icon"
            variant="outline"
            onClick={() => toggleDrawer("chat")}
            className={`size-10 rounded-full border transition-all ${
              activeDrawer === "chat"
                ? "bg-blue-600/30 border-blue-500 text-blue-400"
                : "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white"
            }`}
            title="In-Call Chat"
          >
            <MessageSquare className="size-4" />
          </Button>

          {/* Participants Toggle Button */}
          <Button
            size="icon"
            variant="outline"
            onClick={() => toggleDrawer("participants")}
            className={`size-10 rounded-full border transition-all ${
              activeDrawer === "participants"
                ? "bg-blue-600/30 border-blue-500 text-blue-400"
                : "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white"
            }`}
            title="Participants List"
          >
            <Users className="size-4" />
          </Button>

          {/* Host Controls Button */}
          <Button
            size="icon"
            variant="outline"
            onClick={() => toggleDrawer("host")}
            className={`size-10 rounded-full border transition-all ${
              activeDrawer === "host"
                ? "bg-blue-600/30 border-blue-500 text-blue-400"
                : "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
            }`}
            title="Host Controls"
          >
            <Shield className="size-4" />
          </Button>

          {/* End Call Button */}
          <Button
            size="icon"
            onClick={handleLeaveCall}
            className="size-11 rounded-full bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-600/30 ml-2 sm:ml-4"
            title="Leave / Hang Up Call"
          >
            <PhoneOff className="size-5" />
          </Button>
        </div>

        {/* Right: Security info */}
        <div className="hidden lg:flex items-center gap-1.5 text-xs text-slate-500">
          <Shield className="size-3.5 text-emerald-400" />
          <span>Encrypted</span>
        </div>
      </div>

      <style jsx global>{`
        @keyframes floatUpAndFade {
          0% {
            transform: translateY(0) scale(0.6);
            opacity: 0;
          }
          15% {
            opacity: 1;
            transform: translateY(-20px) scale(1.2);
          }
          80% {
            opacity: 0.9;
            transform: translateY(-160px) scale(1);
          }
          100% {
            transform: translateY(-220px) scale(0.8);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
