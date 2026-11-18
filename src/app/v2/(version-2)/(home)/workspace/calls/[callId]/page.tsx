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
  Settings,
  Radio,
  Maximize2,
  Minimize2,
  Shield,
  Send,
  Sparkles,
  ScreenShare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useChatStore } from "../../_lib/chat-store";
import WorkspaceErrorBoundary from "../../_components/WorkspaceErrorBoundary";
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
    toggleCamera,
    toggleMic,
    toggleScreenShare,
    toggleHandRaise,
    leaveCall,
    startCall,
    currentUserId,
    meetings,
  } = useChatStore();

  // Find meeting if any
  const matchedMeeting = meetings.find((m) => m.id === callId);
  const title = matchedMeeting?.title || activeCallTitle || "Teams Video Conference";

  // Ensure call is active in store
  useEffect(() => {
    startCall(callId, title);
  }, [callId, title, startCall]);

  // Duration timer
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

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
  const [showChat, setShowChat] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // In-call chat messages
  const [chatMessages, setChatMessages] = useState<
    { id: string; sender: string; text: string; time: string }[]
  >([
    { id: "cm-1", sender: "Sarah Chen", text: "Hey team! Can everyone see my presentation screen?", time: "Just now" },
    { id: "cm-2", sender: "Raj Patel", text: "Yes Sarah, crisp and clear!", time: "Just now" },
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
    const url = typeof window !== "undefined" ? window.location.href : "";
    navigator.clipboard?.writeText(url);
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
    email: "you@airsend.io",
    isAudioMuted: isMyMicMuted,
    isVideoOff: !isMyCameraOn,
    isScreenSharing: isMyScreenSharing,
    isHandRaised: isMyHandRaised,
    isSpeaking: !isMyMicMuted && Math.random() > 0.5,
    role: "host",
  };

  const allParticipants = [
    selfParticipant,
    ...callParticipants.filter((p) => p.id !== selfParticipant.id),
  ];

  // Screen share presenter if someone is sharing
  const screenSharer = allParticipants.find((p) => p.isScreenSharing);

  return (
    <div className="relative flex h-full w-full flex-1 flex-col overflow-hidden bg-slate-950 text-slate-100 select-none">
      {/* ── Top Bar ── */}
      <div className="flex h-13 shrink-0 items-center justify-between border-b border-slate-800/80 bg-slate-900/60 px-4 backdrop-blur">
        <div className="flex items-center gap-3">
          <Badge className="bg-red-500/20 text-red-400 border-red-500/40 text-[10px] gap-1 animate-pulse">
            <span className="size-1.5 rounded-full bg-red-500" />
            REC
          </Badge>
          <div className="space-y-0.5">
            <h2 className="text-xs sm:text-sm font-semibold truncate max-w-[200px] sm:max-w-md text-white">
              {title}
            </h2>
            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <span className="font-mono text-emerald-400">{formatTimer(secondsElapsed)}</span>
              <span>•</span>
              <span>{allParticipants.length} in call</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            size="sm"
            variant="ghost"
            onClick={handleCopyLink}
            className="h-8 gap-1.5 text-xs text-slate-300 hover:bg-slate-800 hover:text-white"
          >
            {copied ? <Check className="size-3.5 text-emerald-400" /> : <Copy className="size-3.5" />}
            <span className="hidden sm:inline">{copied ? "Copied Link" : "Copy Invite"}</span>
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
                <div className="flex flex-col items-center justify-center p-8 text-center">
                  <div className="flex size-16 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400 mb-3 border border-blue-500/30">
                    <ScreenShare className="size-8 animate-pulse" />
                  </div>
                  <h3 className="text-sm font-semibold text-white">
                    {screenSharer.name}&apos;s Screen is Live
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-md">
                    Showing high-definition presentation & workspace stream • 1080p 60fps
                  </p>
                </div>

                <div className="absolute bottom-3 left-3 flex items-center gap-2 rounded-lg bg-slate-950/80 px-2.5 py-1 text-xs backdrop-blur border border-slate-800">
                  <span className="size-2 rounded-full bg-blue-400 animate-pulse" />
                  <span>Presenting: {screenSharer.name}</span>
                </div>
              </div>

              {/* Sidebar Thumbnails of Participants */}
              <div className="flex lg:flex-col gap-2 w-full lg:w-48 shrink-0 overflow-x-auto lg:overflow-y-auto">
                {allParticipants.map((p) => (
                  <div
                    key={p.id}
                    className="relative flex items-center justify-center rounded-xl bg-slate-900 border border-slate-800 h-24 lg:h-32 min-w-[120px] lg:min-w-0 shrink-0 overflow-hidden"
                  >
                    <Avatar className="size-10 shadow-md">
                      <AvatarFallback className="bg-primary/20 text-primary font-bold text-xs">
                        {p.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute bottom-1.5 left-1.5 right-1.5 flex items-center justify-between text-[10px] bg-slate-950/70 px-1.5 py-0.5 rounded backdrop-blur">
                      <span className="truncate max-w-[80px]">{p.name}</span>
                      {p.isAudioMuted && <MicOff className="size-2.5 text-red-400 shrink-0" />}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Classic Teams Grid Layout (1, 2, 4 tiles) */
            <div
              className={`grid gap-3 sm:gap-4 max-w-5xl mx-auto w-full aspect-video items-center ${
                allParticipants.length <= 2
                  ? "grid-cols-1 sm:grid-cols-2"
                  : allParticipants.length <= 4
                    ? "grid-cols-2"
                    : "grid-cols-2 lg:grid-cols-3"
              }`}
            >
              {allParticipants.map((participant) => {
                const isSpeaking = participant.isSpeaking;
                const isMuted = participant.isAudioMuted;
                const isVideoOff = participant.isVideoOff;

                return (
                  <div
                    key={participant.id}
                    className={`relative flex flex-col items-center justify-center rounded-2xl bg-slate-900/90 border transition-all duration-200 overflow-hidden aspect-video shadow-md ${
                      isSpeaking
                        ? "border-emerald-500 ring-2 ring-emerald-500/40"
                        : "border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    {/* Simulated Live Video vs Avatar */}
                    {!isVideoOff ? (
                      <div className="relative flex size-full items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950">
                        {/* Video simulation wave indicator */}
                        <div className="flex flex-col items-center gap-3">
                          <Avatar className="size-16 sm:size-20 border-2 border-slate-700 shadow-xl">
                            <AvatarFallback className="bg-primary/20 text-primary font-bold text-lg sm:text-2xl">
                              {participant.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          {isSpeaking && (
                            <div className="flex items-center gap-1">
                              <span className="size-1 rounded-full bg-emerald-400 animate-bounce" />
                              <span className="size-1.5 rounded-full bg-emerald-400 animate-bounce [animation-delay:0.2s]" />
                              <span className="size-1 rounded-full bg-emerald-400 animate-bounce [animation-delay:0.4s]" />
                              <span className="text-[11px] text-emerald-400 ml-1">Speaking</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      /* Camera Off View */
                      <div className="flex flex-col items-center justify-center p-4">
                        <Avatar className="size-16 sm:size-20 border border-slate-800 shadow-lg">
                          <AvatarFallback className="bg-slate-800 text-slate-300 font-bold text-lg sm:text-2xl">
                            {participant.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-slate-500 mt-2">Camera off</span>
                      </div>
                    )}

                    {/* Hand Raised Banner */}
                    {participant.isHandRaised && (
                      <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-amber-500 px-2 py-0.5 text-[11px] font-bold text-slate-950 shadow-md animate-bounce">
                        <Hand className="size-3" />
                        <span>Hand Raised</span>
                      </div>
                    )}

                    {/* Participant Name & Status Badge */}
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between rounded-lg bg-slate-950/80 px-2.5 py-1 text-xs backdrop-blur border border-slate-800/80">
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="truncate font-medium">{participant.name}</span>
                        {participant.role === "host" && (
                          <Badge className="bg-blue-600/30 text-blue-400 border-none text-[9px] px-1 h-3.5">
                            Host
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0 ml-2">
                        {isMuted ? (
                          <div className="flex size-5 items-center justify-center rounded-full bg-red-500/20 text-red-400">
                            <MicOff className="size-3" />
                          </div>
                        ) : (
                          <div className="flex size-5 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                            <Mic className="size-3" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Right Side Drawers: Chat or Participants ── */}
        {showChat && (
          <div className="w-80 shrink-0 border-l border-slate-800 bg-slate-900/90 flex flex-col backdrop-blur">
            <div className="flex h-12 shrink-0 items-center justify-between border-b border-slate-800 px-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <MessageSquare className="size-3.5 text-blue-400" />
                In-Meeting Chat
              </h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowChat(false)}
                className="size-7 text-slate-400 hover:text-white"
              >
                ✕
              </Button>
            </div>

            <ScrollArea className="flex-1 p-3">
              <div className="space-y-3">
                {chatMessages.map((msg) => (
                  <div key={msg.id} className="space-y-0.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-slate-200">{msg.sender}</span>
                      <span className="text-slate-500 text-[10px]">{msg.time}</span>
                    </div>
                    <p className="text-xs text-slate-300 bg-slate-800/60 p-2 rounded-lg">
                      {msg.text}
                    </p>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="p-3 border-t border-slate-800 flex items-center gap-2">
              <Input
                placeholder="Message in call..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                className="h-8 text-xs bg-slate-800/80 border-slate-700 text-white placeholder:text-slate-500"
              />
              <Button size="icon" onClick={handleSendMessage} className="size-8 bg-blue-600 hover:bg-blue-700 text-white shrink-0">
                <Send className="size-3.5" />
              </Button>
            </div>
          </div>
        )}

        {showParticipants && (
          <div className="w-72 shrink-0 border-l border-slate-800 bg-slate-900/90 flex flex-col backdrop-blur">
            <div className="flex h-12 shrink-0 items-center justify-between border-b border-slate-800 px-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Users className="size-3.5 text-emerald-400" />
                Participants ({allParticipants.length})
              </h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowParticipants(false)}
                className="size-7 text-slate-400 hover:text-white"
              >
                ✕
              </Button>
            </div>

            <ScrollArea className="flex-1 p-3">
              <div className="space-y-2">
                {allParticipants.map((p) => (
                  <div key={p.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-800/40">
                    <div className="flex items-center gap-2 min-w-0 pr-1">
                      <Avatar className="size-7">
                        <AvatarFallback className="text-[10px] bg-primary/20 text-primary font-bold">
                          {p.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs text-slate-200 truncate">{p.name}</span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {p.isAudioMuted ? (
                        <MicOff className="size-3 text-red-400" />
                      ) : (
                        <Mic className="size-3 text-emerald-400" />
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
        {/* Left: Meeting Name / Status Info */}
        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
          <Shield className="size-4 text-emerald-400" />
          <span>Encrypted Peer-to-Peer Media</span>
        </div>

        {/* Center: Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3 mx-auto sm:mx-0">
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
            title="Share Screen"
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

          {/* Chat Drawer Button */}
          <Button
            size="icon"
            variant="outline"
            onClick={() => {
              setShowChat(!showChat);
              if (showParticipants) setShowParticipants(false);
            }}
            className={`size-10 rounded-full border transition-all ${
              showChat
                ? "bg-blue-600 border-blue-500 text-white"
                : "bg-slate-800 border-slate-700 text-white hover:bg-slate-700"
            }`}
            title="Meeting Chat"
          >
            <MessageSquare className="size-4" />
          </Button>

          {/* Participants Drawer Button */}
          <Button
            size="icon"
            variant="outline"
            onClick={() => {
              setShowParticipants(!showParticipants);
              if (showChat) setShowChat(false);
            }}
            className={`size-10 rounded-full border transition-all ${
              showParticipants
                ? "bg-emerald-600 border-emerald-500 text-white"
                : "bg-slate-800 border-slate-700 text-white hover:bg-slate-700"
            }`}
            title="View Participants"
          >
            <Users className="size-4" />
          </Button>

          {/* End / Leave Call Button */}
          <Button
            onClick={handleLeaveCall}
            className="h-10 px-4 rounded-full bg-red-600 hover:bg-red-700 text-white font-semibold gap-1.5 shadow-md"
          >
            <PhoneOff className="size-4" />
            <span className="hidden sm:inline">Leave</span>
          </Button>
        </div>

        {/* Right side filler */}
        <div className="hidden sm:block w-24" />
      </div>
    </div>
  );
}
