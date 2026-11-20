"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { GripHorizontal, Maximize2, MessageSquare, Mic, MicOff, MonitorUp, PhoneOff, UserPlus, Users, Video, VideoOff, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatClock } from "../_lib/number";
import type { PhoneCallState } from "../_lib/use-phone-call";
import AddPeople from "./AddPeople";
import { VideoGrid } from "./VideoTile";

interface FloatingCallPanelProps {
  state: PhoneCallState;
  selfExtension: string | undefined;
  onHangup: () => void;
  onMute: () => void;
  onDismiss: () => void;
  onExpand: () => void;
  onOpenChat?: () => void;
  onCamera: () => void;
  onScreen: () => void;
  onInvite: (extension: string) => Promise<void>;
  onGuestLink: () => Promise<string>;
  onAnswerGuest: (guestId: string, admit: boolean) => Promise<void>;
}

interface Position {
  x: number;
  y: number;
}

const margin = 8;
const finishedDismissMs = 5000;

const statusLabel: Record<string, string> = {
  starting: "Starting call",
  dialing: "Calling",
  connected: "Connected",
  ended: "Call ended",
  failed: "Call failed",
};

export default function FloatingCallPanel({
  state,
  selfExtension,
  onHangup,
  onMute,
  onDismiss,
  onExpand,
  onOpenChat,
  onCamera,
  onScreen,
  onInvite,
  onGuestLink,
  onAnswerGuest,
}: FloatingCallPanelProps) {
  const [position, setPosition] = useState<Position | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ dx: number; dy: number } | null>(null);

  const live = state.phase === "starting" || state.phase === "dialing" || state.phase === "connected";
  const connected = state.phase === "connected";
  const internal = state.kind === "internal";
  const waitingGuests = state.participants.filter((person) => person.role === "guest" && person.state === "waiting");
  const onCall = state.participants.filter((person) => person.state === "joined").length;
  const others = state.participants.filter((person) => person.extension !== selfExtension);
  const ringing = others.filter((person) => person.state === "ringing").length;

  useEffect(() => {
    if (state.phase !== "ended") return;
    const timer = window.setTimeout(onDismiss, finishedDismissMs);
    return () => window.clearTimeout(timer);
  }, [state.phase, onDismiss]);

  useEffect(() => {
    const clamp = () => {
      setPosition((current) => {
        const panel = panelRef.current;
        if (!current || !panel) return current;
        return {
          x: Math.min(Math.max(margin, current.x), Math.max(margin, window.innerWidth - panel.offsetWidth - margin)),
          y: Math.min(Math.max(margin, current.y), Math.max(margin, window.innerHeight - panel.offsetHeight - margin)),
        };
      });
    };
    window.addEventListener("resize", clamp);
    return () => window.removeEventListener("resize", clamp);
  }, []);

  const startDrag = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    const panel = panelRef.current;
    if (!panel || event.button !== 0) return;
    const rect = panel.getBoundingClientRect();
    dragRef.current = { dx: event.clientX - rect.left, dy: event.clientY - rect.top };
    event.currentTarget.setPointerCapture(event.pointerId);
  }, []);

  const moveDrag = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    const panel = panelRef.current;
    if (!drag || !panel) return;
    setPosition({
      x: Math.min(Math.max(margin, event.clientX - drag.dx), Math.max(margin, window.innerWidth - panel.offsetWidth - margin)),
      y: Math.min(Math.max(margin, event.clientY - drag.dy), Math.max(margin, window.innerHeight - panel.offsetHeight - margin)),
    });
  }, []);

  const endDrag = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    dragRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  }, []);

  const placement = position ? { left: position.x, top: position.y } : { right: 16, bottom: 88 };

  return (
    <div
      ref={panelRef}
      style={placement}
      className="fixed z-50 w-[22rem] max-w-[calc(100vw-1rem)] rounded-xl border border-border bg-card shadow-2xl"
      role="region"
      aria-label="Call in progress"
      data-testid="floating-call"
      data-phase={state.phase}
    >
      <div
        className="flex cursor-grab touch-none items-center justify-center rounded-t-xl py-0.5 text-muted-foreground/60 active:cursor-grabbing"
        onPointerDown={startDrag}
        onPointerMove={moveDrag}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        data-testid="floating-call-handle"
      >
        <GripHorizontal className="size-4" />
      </div>

      <div className="space-y-3 px-3 pb-3">
        {state.videos.length > 0 && <VideoGrid videos={state.videos} compact />}

        <div className="flex items-center gap-2.5">
          <span
            className={cn(
              "size-2.5 shrink-0 rounded-full",
              connected ? "bg-emerald-500" : live ? "animate-pulse bg-amber-500" : state.phase === "failed" ? "bg-destructive" : "bg-muted-foreground",
            )}
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold" data-testid="floating-call-name">
              {state.number || "Call"}
            </p>
            <p className="truncate text-xs text-muted-foreground" role="status" data-testid="floating-call-status">
              {connected ? (
                <>
                  <span className="font-mono tabular-nums" data-testid="floating-call-timer">
                    {formatClock(state.seconds)}
                  </span>
                  {internal && onCall > 1 ? ` · ${onCall} on the call` : ""}
                  {ringing > 0 ? ` · ${ringing} ringing` : ""}
                </>
              ) : state.phase === "ended" || state.phase === "failed" ? (
                state.message || statusLabel[state.phase]
              ) : (
                statusLabel[state.phase]
              )}
            </p>
          </div>

          {live ? (
            <div className="flex shrink-0 items-center gap-1">
              <Button
                type="button"
                variant={state.muted ? "secondary" : "ghost"}
                size="icon"
                className="size-8"
                onClick={onMute}
                disabled={!connected}
                aria-pressed={state.muted}
                aria-label={state.muted ? "Unmute" : "Mute"}
                data-testid="floating-call-mute"
              >
                {state.muted ? <MicOff className="size-4" /> : <Mic className="size-4" />}
              </Button>
              {internal && (
                <Button
                  type="button"
                  variant={state.cameraOn ? "secondary" : "ghost"}
                  size="icon"
                  className="size-8"
                  onClick={onCamera}
                  disabled={!connected}
                  aria-pressed={state.cameraOn}
                  aria-label={state.cameraOn ? "Turn camera off" : "Turn camera on"}
                  data-testid="floating-call-camera"
                >
                  {state.cameraOn ? <Video className="size-4" /> : <VideoOff className="size-4" />}
                </Button>
              )}
              {internal && (
                <Button
                  type="button"
                  variant={state.sharing ? "secondary" : "ghost"}
                  size="icon"
                  className="size-8"
                  onClick={onScreen}
                  disabled={!connected}
                  aria-pressed={state.sharing}
                  aria-label={state.sharing ? "Stop sharing your screen" : "Share your screen"}
                  data-testid="floating-call-screen"
                >
                  <MonitorUp className="size-4" />
                </Button>
              )}
              {onOpenChat && (
                <Button type="button" variant="ghost" size="icon" className="size-8" onClick={onOpenChat} aria-label="Open the chat" data-testid="floating-call-chat">
                  <MessageSquare className="size-4" />
                </Button>
              )}
              {internal && (
                <Button
                  type="button"
                  variant={showAdd ? "secondary" : "ghost"}
                  size="icon"
                  className="size-8"
                  onClick={() => setShowAdd((current) => !current)}
                  disabled={state.phase === "starting"}
                  aria-pressed={showAdd}
                  aria-label="Add people"
                  data-testid="floating-call-add"
                >
                  <UserPlus className="size-4" />
                </Button>
              )}
              <Button type="button" variant="ghost" size="icon" className="size-8" onClick={onExpand} aria-label="Open the call page" data-testid="floating-call-expand">
                <Maximize2 className="size-4" />
              </Button>
              <Button type="button" variant="destructive" size="icon" className="size-8" onClick={onHangup} aria-label="Hang up" data-testid="floating-call-hangup">
                <PhoneOff className="size-4" />
              </Button>
            </div>
          ) : (
            <Button type="button" variant="ghost" size="icon" className="size-8" onClick={onDismiss} aria-label="Dismiss" data-testid="floating-call-dismiss">
              <X className="size-4" />
            </Button>
          )}
        </div>

        {live && internal && waitingGuests.length > 0 && (
          <ul className="space-y-1.5 rounded-lg border border-amber-500/40 bg-amber-500/5 p-2" data-testid="floating-guest-lobby">
            {waitingGuests.map((guest) => {
              const guestId = guest.email.split("@")[0];
              return (
                <li key={guest.email} className="flex items-center justify-between gap-2 text-xs">
                  <span className="flex min-w-0 items-center gap-1.5">
                    <Users className="size-3.5 shrink-0 text-amber-600" />
                    <span className="truncate">
                      <b>{guest.name}</b> wants to join
                    </span>
                  </span>
                  <span className="flex shrink-0 gap-1">
                    <Button type="button" variant="outline" size="sm" className="h-6 px-2 text-xs" onClick={() => void onAnswerGuest(guestId, false)} data-testid="floating-guest-deny">
                      Deny
                    </Button>
                    <Button type="button" size="sm" className="h-6 px-2 text-xs" onClick={() => void onAnswerGuest(guestId, true)} data-testid="floating-guest-admit">
                      Admit
                    </Button>
                  </span>
                </li>
              );
            })}
          </ul>
        )}

        {live && internal && showAdd && (
          <AddPeople participants={state.participants} onInvite={onInvite} onGuestLink={connected ? onGuestLink : undefined} />
        )}
      </div>
    </div>
  );
}
