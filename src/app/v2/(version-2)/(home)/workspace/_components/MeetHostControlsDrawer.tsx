"use client";

import React, { useState } from "react";
import { X, Shield, Lock, Unlock, MicOff, MessageSquare, ScreenShare, Video, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

interface MeetHostControlsDrawerProps {
  onClose: () => void;
  onMuteAll: () => void;
}

export default function MeetHostControlsDrawer({
  onClose,
  onMuteAll,
}: MeetHostControlsDrawerProps) {
  const [hostManagement, setHostManagement] = useState(true);
  const [lockMeeting, setLockMeeting] = useState(false);
  const [allowScreenShare, setAllowScreenShare] = useState(true);
  const [allowChat, setAllowChat] = useState(true);
  const [allowMic, setAllowMic] = useState(true);
  const [allowVideo, setAllowVideo] = useState(true);
  const [mutedAllFeedback, setMutedAllFeedback] = useState(false);

  const handleMuteAll = () => {
    onMuteAll();
    setMutedAllFeedback(true);
    setTimeout(() => setMutedAllFeedback(false), 2500);
  };

  return (
    <div className="flex h-full w-80 md:w-96 flex-col border-l border-slate-800 bg-slate-900/95 backdrop-blur-md text-slate-100 z-30 shadow-2xl">
      {/* Header */}
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-slate-800 px-4">
        <div className="flex items-center gap-2">
          <Shield className="size-4 text-blue-400" />
          <h3 className="text-sm font-semibold text-white">Host controls</h3>
        </div>
        <Button
          size="icon"
          variant="ghost"
          onClick={onClose}
          className="size-8 text-slate-400 hover:bg-slate-800 hover:text-white"
        >
          <X className="size-4" />
        </Button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 text-xs">
        {/* Host Management Master Toggle */}
        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-semibold text-white block">Host management</span>
              <span className="text-[11px] text-slate-400">
                Lets you restrict what participants can do in the meeting
              </span>
            </div>
            <Switch
              checked={hostManagement}
              onCheckedChange={setHostManagement}
              className="data-[state=checked]:bg-blue-600"
            />
          </div>
        </div>

        {/* Meeting Lock */}
        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-start gap-2.5">
              {lockMeeting ? (
                <Lock className="size-4 text-amber-400 shrink-0 mt-0.5" />
              ) : (
                <Unlock className="size-4 text-slate-400 shrink-0 mt-0.5" />
              )}
              <div>
                <span className="font-semibold text-white block">Lock meeting</span>
                <span className="text-[11px] text-slate-400">
                  When locked, no new participants can join this call
                </span>
              </div>
            </div>
            <Switch
              checked={lockMeeting}
              onCheckedChange={setLockMeeting}
              className="data-[state=checked]:bg-amber-600"
            />
          </div>
        </div>

        {/* Participant Permissions */}
        <div className="space-y-3">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Let everyone
          </span>

          <div className="rounded-2xl border border-slate-800 bg-slate-950 divide-y divide-slate-800/80">
            {/* Share screen */}
            <div className="flex items-center justify-between p-3.5">
              <div className="flex items-center gap-2.5 text-slate-200">
                <ScreenShare className="size-4 text-slate-400" />
                <span>Share their screen</span>
              </div>
              <Switch
                checked={allowScreenShare}
                onCheckedChange={setAllowScreenShare}
                disabled={!hostManagement}
                className="data-[state=checked]:bg-blue-600"
              />
            </div>

            {/* Chat */}
            <div className="flex items-center justify-between p-3.5">
              <div className="flex items-center gap-2.5 text-slate-200">
                <MessageSquare className="size-4 text-slate-400" />
                <span>Send chat messages</span>
              </div>
              <Switch
                checked={allowChat}
                onCheckedChange={setAllowChat}
                disabled={!hostManagement}
                className="data-[state=checked]:bg-blue-600"
              />
            </div>

            {/* Microphones */}
            <div className="flex items-center justify-between p-3.5">
              <div className="flex items-center gap-2.5 text-slate-200">
                <MicOff className="size-4 text-slate-400" />
                <span>Turn on their microphone</span>
              </div>
              <Switch
                checked={allowMic}
                onCheckedChange={setAllowMic}
                disabled={!hostManagement}
                className="data-[state=checked]:bg-blue-600"
              />
            </div>

            {/* Video */}
            <div className="flex items-center justify-between p-3.5">
              <div className="flex items-center gap-2.5 text-slate-200">
                <Video className="size-4 text-slate-400" />
                <span>Turn on their video</span>
              </div>
              <Switch
                checked={allowVideo}
                onCheckedChange={setAllowVideo}
                disabled={!hostManagement}
                className="data-[state=checked]:bg-blue-600"
              />
            </div>
          </div>
        </div>

        {/* Mute All Action */}
        <div className="pt-2">
          <Button
            onClick={handleMuteAll}
            className="w-full h-11 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 font-semibold text-xs gap-2 transition-all"
          >
            {mutedAllFeedback ? <Check className="size-4 text-emerald-400" /> : <MicOff className="size-4" />}
            <span>{mutedAllFeedback ? "Muted all participants" : "Mute all participants"}</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
