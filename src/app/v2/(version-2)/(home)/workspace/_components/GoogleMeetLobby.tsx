"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  ScreenShare,
  Sparkles,
  Settings,
  Shield,
  Copy,
  Check,
  ArrowLeft,
  Users,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatMeetUrl } from "../_lib/api";
import type { LiveCallParticipant } from "../_lib/chat-types";

interface GoogleMeetLobbyProps {
  callId: string;
  title: string;
  participants: LiveCallParticipant[];
  localVideoRef: React.RefObject<HTMLVideoElement | null>;
  isMyCameraOn: boolean;
  isMyMicMuted: boolean;
  toggleCamera: () => void;
  toggleMic: () => void;
  onJoin: (startWithScreenShare?: boolean) => void;
}

export default function GoogleMeetLobby({
  callId,
  title,
  participants,
  localVideoRef,
  isMyCameraOn,
  isMyMicMuted,
  toggleCamera,
  toggleMic,
  onJoin,
}: GoogleMeetLobbyProps) {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("Alex Chen");
  const [blurBackground, setBlurBackground] = useState(false);
  const [copied, setCopied] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);

  const meetUrl = formatMeetUrl(callId);

  // Simulated mic level animation when unmuted
  useEffect(() => {
    if (isMyMicMuted) {
      setAudioLevel(0);
      return;
    }
    const interval = setInterval(() => {
      setAudioLevel(Math.floor(Math.random() * 80) + 15);
    }, 150);
    return () => clearInterval(interval);
  }, [isMyMicMuted]);

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(meetUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-slate-950 text-slate-100 select-none">
      {/* ── Lobby Top Bar ── */}
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-800/80 bg-slate-900/60 px-6 backdrop-blur">
        <div className="flex items-center gap-3">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => router.push("/v2/workspace/calls")}
            className="size-9 rounded-full text-slate-400 hover:bg-slate-800 hover:text-white"
            title="Back to Calls"
          >
            <ArrowLeft className="size-5" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-blue-600 font-bold text-white shadow-md shadow-blue-600/30">
              A
            </div>
            <div>
              <span className="font-semibold text-white tracking-tight">AirSend Meet</span>
              <span className="ml-2 font-mono text-xs text-slate-400">{callId}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant="outline" className="border-slate-700 bg-slate-800/60 text-slate-300 font-mono text-xs hidden sm:inline-flex">
            meet.airsend.in
          </Badge>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleCopyLink}
            className="h-8 gap-1.5 text-xs text-slate-300 hover:bg-slate-800 hover:text-white"
          >
            {copied ? <Check className="size-3.5 text-emerald-400" /> : <Copy className="size-3.5" />}
            <span>{copied ? "Copied" : "Copy link"}</span>
          </Button>
          <a
            href={meetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 h-8 px-2.5 rounded-lg border border-slate-700 text-xs text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <ExternalLink className="size-3.5" />
            <span className="hidden sm:inline">Open in meet.airsend.in</span>
          </a>
        </div>
      </header>

      {/* ── Lobby Content ── */}
      <main className="flex flex-1 items-center justify-center p-4 sm:p-8">
        <div className="grid w-full max-w-5xl grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* ── Left Column: Live Green Room Video Preview ── */}
          <div className="lg:col-span-7 flex flex-col items-center">
            <div className="relative aspect-video w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden shadow-2xl flex items-center justify-center group">
              {isMyCameraOn ? (
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`size-full object-cover transition-all duration-300 ${
                    blurBackground ? "filter blur-md scale-105" : ""
                  }`}
                  style={{ transform: "scaleX(-1)" }}
                />
              ) : (
                <div className="flex flex-col items-center justify-center gap-3">
                  <Avatar className="size-24 border-2 border-slate-700 shadow-xl">
                    <AvatarFallback className="bg-slate-800 text-2xl font-bold text-slate-300">
                      {displayName.split(" ").map((n) => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-slate-400 font-medium">Camera is off</span>
                </div>
              )}

              {/* Top Overlay: Name & Audio Level */}
              <div className="absolute top-3 left-3 flex items-center gap-2 rounded-full bg-slate-950/70 backdrop-blur px-3 py-1 border border-slate-800/80">
                <span className="text-xs font-medium text-slate-200">{displayName}</span>
                {!isMyMicMuted && (
                  <div className="flex items-center gap-0.5">
                    <span
                      className="w-1 rounded-full bg-emerald-400 transition-all duration-150"
                      style={{ height: `${Math.max(4, audioLevel * 0.16)}px` }}
                    />
                    <span
                      className="w-1 rounded-full bg-emerald-400 transition-all duration-150"
                      style={{ height: `${Math.max(6, audioLevel * 0.22)}px` }}
                    />
                    <span
                      className="w-1 rounded-full bg-emerald-400 transition-all duration-150"
                      style={{ height: `${Math.max(4, audioLevel * 0.14)}px` }}
                    />
                  </div>
                )}
              </div>

              {/* Floating Bottom Media Controls */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 rounded-full bg-slate-950/80 backdrop-blur-md px-4 py-2 border border-slate-800 shadow-xl">
                {/* Mic toggle */}
                <Button
                  size="icon"
                  variant="outline"
                  onClick={toggleMic}
                  className={`size-11 rounded-full border transition-all ${
                    isMyMicMuted
                      ? "bg-red-500/20 border-red-500 text-red-400 hover:bg-red-500/30"
                      : "bg-slate-800 border-slate-700 text-white hover:bg-slate-700"
                  }`}
                  title={isMyMicMuted ? "Unmute mic" : "Mute mic"}
                >
                  {isMyMicMuted ? <MicOff className="size-5" /> : <Mic className="size-5" />}
                </Button>

                {/* Camera toggle */}
                <Button
                  size="icon"
                  variant="outline"
                  onClick={toggleCamera}
                  className={`size-11 rounded-full border transition-all ${
                    !isMyCameraOn
                      ? "bg-red-500/20 border-red-500 text-red-400 hover:bg-red-500/30"
                      : "bg-slate-800 border-slate-700 text-white hover:bg-slate-700"
                  }`}
                  title={isMyCameraOn ? "Turn camera off" : "Turn camera on"}
                >
                  {isMyCameraOn ? <Video className="size-5" /> : <VideoOff className="size-5" />}
                </Button>

                {/* Blur / Effects toggle */}
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => setBlurBackground(!blurBackground)}
                  className={`size-11 rounded-full border transition-all ${
                    blurBackground
                      ? "bg-blue-600 border-blue-500 text-white"
                      : "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
                  }`}
                  title="Toggle Visual Effects & Background Blur"
                >
                  <Sparkles className="size-5" />
                </Button>
              </div>
            </div>

            {/* Device readiness caption */}
            <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
              <Shield className="size-4 text-emerald-400" />
              <span>Camera & microphone ready • End-to-end WebRTC secure</span>
            </div>
          </div>

          {/* ── Right Column: Join Actions & Attendee Status ── */}
          <div className="lg:col-span-5 flex flex-col justify-center space-y-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
                Ready to join?
              </h1>
              <p className="text-sm text-slate-400 line-clamp-2">
                {title}
              </p>
            </div>

            {/* Display Name Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">
                Your name in meeting
              </label>
              <Input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Enter your name"
                className="bg-slate-900 border-slate-800 text-white placeholder:text-slate-500 h-11 text-sm focus-visible:ring-blue-500"
              />
            </div>

            {/* Who is already in the call */}
            <div className="rounded-2xl border border-slate-800/80 bg-slate-900/50 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className="size-4 text-blue-400" />
                <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                  In this call ({participants.length})
                </span>
              </div>
              {participants.length > 0 ? (
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2 overflow-hidden">
                    {participants.slice(0, 4).map((p, idx) => (
                      <Avatar key={p.id || idx} className="size-8 border-2 border-slate-900">
                        <AvatarFallback className="bg-slate-800 text-[10px] font-bold text-slate-300">
                          {p.name.split(" ").map((n) => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                  </div>
                  <span className="text-xs text-slate-400">
                    {participants.map((p) => p.name).slice(0, 2).join(", ")}
                    {participants.length > 2 ? ` and ${participants.length - 2} others` : ""} are here
                  </span>
                </div>
              ) : (
                <p className="text-xs text-slate-400">
                  No one else is in this call yet. Be the first to join!
                </p>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                onClick={() => onJoin(false)}
                className="flex-1 h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-lg shadow-blue-600/30 transition-all"
              >
                Join now
              </Button>
              <Button
                variant="outline"
                onClick={() => onJoin(true)}
                className="h-12 rounded-xl border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-slate-200 font-medium text-sm gap-2"
              >
                <ScreenShare className="size-4 text-blue-400" />
                Present
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
