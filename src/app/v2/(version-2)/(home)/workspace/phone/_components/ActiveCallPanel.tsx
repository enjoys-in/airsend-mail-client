"use client";

import { useState } from "react";
import { Grid3x3, Mic, MicOff, MonitorUp, PhoneOff, RotateCcw, UserPlus, Video, VideoOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { PhoneCallState } from "../_lib/use-phone-call";
import { formatClock } from "../_lib/number";
import AddPeople from "./AddPeople";
import Keypad from "./Keypad";
import { VideoGrid } from "./VideoTile";

interface ActiveCallPanelProps {
  state: PhoneCallState;
  onHangup: () => void;
  onMute: () => void;
  onDigit: (digit: string) => void;
  onDone: () => void;
  onRedial: () => void;
  onInvite?: (extension: string) => Promise<void>;
  onCamera?: () => void;
  onScreen?: () => void;
  onGuestLink?: () => Promise<string>;
  onAnswerGuest?: (guestId: string, admit: boolean) => Promise<void>;
  selfExtension?: string;
}

const participantLabel: Record<string, string> = {
  ringing: "Ringing",
  joined: "On the call",
  declined: "Declined",
  missed: "No answer",
  left: "Left",
};

const statusLabel: Record<string, string> = {
  starting: "Starting call",
  dialing: "Calling",
  connected: "Connected",
  ended: "Call ended",
  failed: "Call failed",
};

export default function ActiveCallPanel({ state, onHangup, onMute, onDigit, onDone, onRedial, onInvite, onGuestLink, onAnswerGuest, onCamera, onScreen, selfExtension }: ActiveCallPanelProps) {
  const [showPad, setShowPad] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [sent, setSent] = useState("");
  const live = state.phase === "starting" || state.phase === "dialing" || state.phase === "connected";
  const connected = state.phase === "connected";
  const number = state.number;
  const canAdd = state.kind === "internal" && Boolean(onInvite) && (state.phase === "dialing" || connected);
  const others = state.participants.filter((person) => person.extension !== selfExtension);
  const waitingGuests = state.participants.filter((person) => person.role === "guest" && person.state === "waiting");
  const roster = others.filter((person) => person.state === "ringing" || person.state === "joined" || person.state === "declined" || person.state === "missed");

  const digit = (value: string) => {
    setSent((current) => (current + value).slice(-24));
    onDigit(value);
  };

  return (
    <div className="space-y-5 text-center" data-testid="phone-active-call" data-phase={state.phase}>
      <div className="space-y-1 pt-2">
        <div
          className={cn(
            "mx-auto mb-3 flex size-16 items-center justify-center rounded-full",
            connected ? "bg-emerald-500/15 text-emerald-600" : live ? "animate-pulse bg-primary/10 text-primary" : "bg-muted text-muted-foreground",
          )}
        >
          {state.muted ? <MicOff className="size-7" /> : <Mic className="size-7" />}
        </div>
        <p className="font-mono text-xl font-semibold" data-testid="phone-call-number">
          {number}
        </p>
        <p
          className={cn("text-sm", state.phase === "failed" ? "text-destructive" : "text-muted-foreground")}
          data-testid="phone-call-status"
          role="status"
          aria-live="polite"
        >
          {state.phase === "failed" || state.phase === "ended"
            ? state.message || statusLabel[state.phase]
            : statusLabel[state.phase]}
        </p>
        {connected && (
          <p className="font-mono text-2xl tabular-nums" data-testid="phone-call-timer">
            {formatClock(state.seconds)}
          </p>
        )}
      </div>

      {state.videos.length > 0 && <VideoGrid videos={state.videos} />}

      {state.kind === "internal" && onAnswerGuest && waitingGuests.length > 0 && (
        <ul className="space-y-2 rounded-lg border border-amber-500/40 bg-amber-500/5 p-3 text-left" data-testid="guest-lobby">
          {waitingGuests.map((guest) => {
            const guestId = guest.email.split("@")[0];
            return (
              <li key={guest.email} className="flex items-center justify-between gap-2 text-sm" data-testid="guest-waiting-item">
                <span className="min-w-0 truncate">
                  <b>{guest.name}</b> wants to join
                </span>
                <span className="flex shrink-0 gap-1.5">
                  <Button type="button" variant="outline" size="sm" className="h-7 px-2" onClick={() => void onAnswerGuest(guestId, false)} data-testid="guest-deny">
                    Deny
                  </Button>
                  <Button type="button" size="sm" className="h-7 px-2" onClick={() => void onAnswerGuest(guestId, true)} data-testid="guest-admit">
                    Admit
                  </Button>
                </span>
              </li>
            );
          })}
        </ul>
      )}

      {state.kind === "internal" && roster.length > 1 && (
        <ul className="space-y-1 text-left" data-testid="call-participants">
          {roster.map((person) => (
            <li key={person.email} className="flex items-center justify-between gap-2 text-sm" data-state={person.state}>
              <span className="truncate">
                {person.name}
                {person.role === "guest" && <span className="ml-1.5 rounded bg-muted px-1 text-[10px] uppercase text-muted-foreground">guest</span>}
              </span>
              <span className={cn("shrink-0 text-xs", person.state === "joined" ? "text-emerald-600" : "text-muted-foreground")}>
                {participantLabel[person.state] ?? person.state}
              </span>
            </li>
          ))}
        </ul>
      )}

      {live && (
        <>
          {showAdd && canAdd && onInvite && <AddPeople participants={state.participants} onInvite={onInvite} onGuestLink={connected ? onGuestLink : undefined} />}
          {showPad && connected && (
            <div className="space-y-2">
              <p className="h-5 font-mono text-sm tracking-widest text-muted-foreground" data-testid="phone-sent-digits">
                {sent}
              </p>
              <Keypad value="" onChange={() => undefined} onDial={() => undefined} onDigit={digit} showDial={false} />
            </div>
          )}

          <div className="flex items-center justify-center gap-3">
            <Button
              type="button"
              variant={state.muted ? "secondary" : "outline"}
              size="icon"
              className="size-12 rounded-full"
              onClick={onMute}
              disabled={!connected}
              aria-pressed={state.muted}
              aria-label={state.muted ? "Unmute" : "Mute"}
              data-testid="phone-mute"
            >
              {state.muted ? <MicOff className="size-5" /> : <Mic className="size-5" />}
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="size-14 rounded-full"
              onClick={onHangup}
              aria-label="Hang up"
              data-testid="phone-hangup"
            >
              <PhoneOff className="size-6" />
            </Button>
            <Button
              type="button"
              variant={showPad ? "secondary" : "outline"}
              size="icon"
              className="size-12 rounded-full"
              onClick={() => setShowPad((current) => !current)}
              disabled={!connected}
              aria-pressed={showPad}
              aria-label="Toggle keypad"
              data-testid="phone-toggle-pad"
            >
              <Grid3x3 className="size-5" />
            </Button>
            {state.kind === "internal" && onCamera && (
              <Button
                type="button"
                variant={state.cameraOn ? "secondary" : "outline"}
                size="icon"
                className="size-12 rounded-full"
                onClick={onCamera}
                disabled={!connected}
                aria-pressed={state.cameraOn}
                aria-label={state.cameraOn ? "Turn camera off" : "Turn camera on"}
                data-testid="phone-camera"
              >
                {state.cameraOn ? <Video className="size-5" /> : <VideoOff className="size-5" />}
              </Button>
            )}
            {state.kind === "internal" && onScreen && (
              <Button
                type="button"
                variant={state.sharing ? "secondary" : "outline"}
                size="icon"
                className="size-12 rounded-full"
                onClick={onScreen}
                disabled={!connected}
                aria-pressed={state.sharing}
                aria-label={state.sharing ? "Stop sharing your screen" : "Share your screen"}
                data-testid="phone-screen"
              >
                <MonitorUp className="size-5" />
              </Button>
            )}
            {state.kind === "internal" && (
              <Button
                type="button"
                variant={showAdd ? "secondary" : "outline"}
                size="icon"
                className="size-12 rounded-full"
                onClick={() => setShowAdd((current) => !current)}
                disabled={!canAdd}
                aria-pressed={showAdd}
                aria-label="Add people"
                data-testid="phone-add-people"
              >
                <UserPlus className="size-5" />
              </Button>
            )}
          </div>
        </>
      )}

      {!live && (
        <div className="flex items-center justify-center gap-2">
          <Button type="button" variant="outline" onClick={onDone} data-testid="phone-done">
            Done
          </Button>
          {number && (
            <Button type="button" onClick={onRedial} className="gap-1.5" data-testid="phone-redial">
              <RotateCcw className="size-4" />
              Call again
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
