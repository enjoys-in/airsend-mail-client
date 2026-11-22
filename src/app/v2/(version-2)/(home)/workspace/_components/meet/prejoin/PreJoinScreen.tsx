"use client";

import React, { useState } from "react";
import { ArrowLeft, Check, Copy, Sparkles, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { BackgroundOption, EffectMode, EffectsStatus } from "../../../_lib/meet/types";
import BackgroundPicker from "./BackgroundPicker";
import DevicePicker from "./DevicePicker";
import JoinOptions, { type JoinAudio } from "./JoinOptions";
import MediaToggleBar from "./MediaToggleBar";
import PresenceSummary, { type PresenceSummaryProps } from "./PresenceSummary";
import VideoPreview from "./VideoPreview";

/** What the page gets back from the background-effects hook. */
export interface PreJoinEffects {
  outputStream: MediaStream | null;
  mode: EffectMode;
  setMode: (mode: EffectMode) => void;
  status: EffectsStatus;
  error?: string;
  backgrounds: BackgroundOption[];
  addCustomBackground: (file: File) => Promise<BackgroundOption>;
  removeCustomBackground: (id: string) => Promise<void>;
}

export interface PreJoinDevices {
  videoDeviceId?: string;
  audioDeviceId?: string;
  speakerDeviceId?: string;
  onVideoDeviceChange?: (deviceId: string) => void;
  onAudioDeviceChange?: (deviceId: string) => void;
  onSpeakerDeviceChange?: (deviceId: string) => void;
}

export interface PreJoinJoinOptions {
  audio: JoinAudio;
  /** Start sharing the screen straight after joining. */
  present?: boolean;
}

export interface PreJoinScreenProps {
  roomId: string;
  title: string;
  displayName: string;
  onDisplayNameChange: (name: string) => void;
  /** The stream to preview (pass the effects output). Leave undefined when `previewVideoRef` is used instead. */
  previewStream?: MediaStream | null;
  /** For callers that already attach the camera to a video element themselves. */
  previewVideoRef?: React.Ref<HTMLVideoElement>;
  cameraOn: boolean;
  micMuted: boolean;
  onToggleCamera: () => void;
  onToggleMic: () => void;
  /** The stream whose microphone level is shown. */
  micStream?: MediaStream | null;
  /** Omit to hide the background filters button and panel. */
  effects?: PreJoinEffects;
  presence: PresenceSummaryProps["presence"];
  devices?: PreJoinDevices;
  mediaError?: string | null;
  /** Shown with a "Copy link" button. */
  joinLink?: string;
  onJoin: (options: PreJoinJoinOptions) => void;
  onBack: () => void;
}

function deviceStatus(preview?: MediaStream | null, mic?: MediaStream | null, error?: string | null): { tone: "ok" | "warn"; text: string } {
  if (error) return { tone: "warn", text: `We could not use your camera or microphone: ${error}` };
  const live = (tracks: MediaStreamTrack[] | undefined) => !!tracks?.some((t) => t.readyState === "live");
  // With a caller-attached preview element there is no preview stream; the mic stream carries the camera then.
  const hasVideo = live((preview ?? mic)?.getVideoTracks());
  const hasAudio = live(mic?.getAudioTracks());
  if (hasVideo && hasAudio) return { tone: "ok", text: "Your camera and microphone are ready." };
  if (hasAudio) return { tone: "ok", text: "Your microphone is ready." };
  if (hasVideo) return { tone: "ok", text: "Your camera is ready." };
  return { tone: "warn", text: "Allow camera and microphone access in your browser to see yourself and be heard." };
}

/**
 * The green room, laid out like Microsoft Teams: your preview with the camera / mic / effects buttons on the left, and on
 * the right your name, who is already in the meeting, devices, how to join audio, and "Join now".
 * Pure presentation: every piece of state (devices, effects, presence) comes in through props.
 */
export default function PreJoinScreen({
  roomId,
  title,
  displayName,
  onDisplayNameChange,
  previewStream,
  previewVideoRef,
  cameraOn,
  micMuted,
  onToggleCamera,
  onToggleMic,
  micStream,
  effects,
  presence,
  devices,
  mediaError,
  joinLink,
  onJoin,
  onBack,
}: PreJoinScreenProps) {
  const [audio, setAudio] = useState<JoinAudio>("computer");
  const [effectsOpen, setEffectsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const name = displayName.trim();
  const blockReason = presence.ended ? "This meeting has ended." : !name ? "Enter your name to join." : null;
  const status = deviceStatus(previewStream, micStream, mediaError);
  const effectsActive = !!effects && effects.mode.type !== "none";
  const effectsNotice =
    effects && effects.mode.type !== "none" && (effects.status === "unsupported" || effects.status === "error")
      ? "Background effect is not running"
      : null;

  const join = (present?: boolean) => {
    if (blockReason) return;
    onJoin({ audio, present });
  };

  const copyLink = () => {
    if (!joinLink) return;
    void navigator.clipboard?.writeText(joinLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-slate-950 text-slate-100">
      <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-slate-800/80 bg-slate-900/60 px-4 backdrop-blur sm:px-6">
        <div className="flex min-w-0 items-center gap-2">
          <Button
            type="button"
            size="icon"
            variant="ghost"
            onClick={onBack}
            aria-label="Back"
            className="size-9 shrink-0 rounded-full text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <ArrowLeft className="size-5" />
          </Button>
          <div className="min-w-0">
            <p className="truncate text-sm text-white">{title}</p>
            <p className="truncate font-mono text-[11px] text-slate-400">{roomId}</p>
          </div>
        </div>
        {joinLink && (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={copyLink}
            className="h-8 shrink-0 gap-1.5 text-xs text-slate-300 hover:bg-slate-800 hover:text-white"
          >
            {copied ? <Check className="size-3.5 text-emerald-400" /> : <Copy className="size-3.5" />}
            {copied ? "Copied" : "Copy meeting link"}
          </Button>
        )}
      </header>

      <main className="flex flex-1 justify-center px-4 py-6 sm:px-8 sm:py-10">
        <div className="w-full max-w-6xl">
          <h1 className="mb-6 text-xl text-white sm:text-2xl">Choose your video and audio options</h1>

          <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
            {/* ── Preview ── */}
            <div className="space-y-3">
              <VideoPreview
                stream={previewStream}
                videoRef={previewVideoRef}
                cameraOn={cameraOn}
                // A mirrored preview would also flip a picture background (everyone else sees it the right way round).
                mirrored={effects?.mode.type !== "image"}
                name={name || "You"}
                micMuted={micMuted}
                levelStream={micStream ?? null}
                loading={effects?.status === "loading"}
                notice={effectsNotice}
              >
                <MediaToggleBar
                  micMuted={micMuted}
                  cameraOn={cameraOn}
                  onToggleMic={onToggleMic}
                  onToggleCamera={onToggleCamera}
                  onOpenEffects={effects ? () => setEffectsOpen((open) => !open) : undefined}
                  effectsActive={effectsActive}
                  effectsOpen={effectsOpen}
                />
              </VideoPreview>

              <div className="flex flex-wrap items-center justify-between gap-2">
                <p
                  className={`flex items-center gap-2 text-xs ${status.tone === "ok" ? "text-slate-400" : "text-amber-300"}`}
                  role="status"
                >
                  {status.tone === "warn" && <TriangleAlert className="size-3.5 shrink-0" />}
                  {status.text}
                </p>
                {effects && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setEffectsOpen((open) => !open)}
                    aria-expanded={effectsOpen}
                    className="h-8 gap-1.5 text-xs text-slate-300 hover:bg-slate-800 hover:text-white"
                  >
                    <Sparkles className="size-3.5 text-blue-400" />
                    Background filters
                  </Button>
                )}
              </div>
            </div>

            {/* ── Side column: background filters or join settings ── */}
            <div className="space-y-5">
              {effects && effectsOpen ? (
                <BackgroundPicker
                  mode={effects.mode}
                  onModeChange={effects.setMode}
                  status={effects.status}
                  error={effects.error}
                  backgrounds={effects.backgrounds}
                  onUpload={effects.addCustomBackground}
                  onRemove={effects.removeCustomBackground}
                  onClose={() => setEffectsOpen(false)}
                />
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    join();
                  }}
                  className="space-y-5"
                >
                  <div className="space-y-1.5">
                    <label htmlFor="prejoin-name" className="text-xs text-slate-300">
                      Your name
                    </label>
                    <Input
                      id="prejoin-name"
                      value={displayName}
                      onChange={(e) => onDisplayNameChange(e.target.value)}
                      placeholder="Enter your name"
                      autoComplete="name"
                      maxLength={80}
                      className="h-11 border-slate-700 bg-slate-900 text-sm text-white placeholder:text-slate-500 focus-visible:ring-blue-500"
                    />
                  </div>

                  <PresenceSummary presence={presence} />

                  <DevicePicker
                    videoDeviceId={devices?.videoDeviceId}
                    audioDeviceId={devices?.audioDeviceId}
                    speakerDeviceId={devices?.speakerDeviceId}
                    onVideoDeviceChange={devices?.onVideoDeviceChange}
                    onAudioDeviceChange={devices?.onAudioDeviceChange}
                    onSpeakerDeviceChange={devices?.onSpeakerDeviceChange}
                    refreshKey={previewStream ?? micStream}
                  />

                  <JoinOptions
                    audio={audio}
                    onAudioChange={setAudio}
                    onPresent={() => join(true)}
                    presentDisabled={!!blockReason}
                  />

                  <div className="space-y-2">
                    <Button
                      type="submit"
                      disabled={!!blockReason}
                      className="h-12 w-full rounded-lg bg-blue-600 text-sm text-white hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500"
                    >
                      Join now
                    </Button>
                    {blockReason && <p className="text-center text-xs text-slate-400">{blockReason}</p>}
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
