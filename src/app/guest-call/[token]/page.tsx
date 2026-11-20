"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Loader2, Mic, MicOff, PhoneOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGuestCall } from "./_lib/use-guest-call";

export default function GuestCallPage() {
  const params = useParams<{ token: string }>();
  const token = decodeURIComponent(params.token ?? "");
  const { phase, message, muted, join, leave, toggleMute } = useGuestCall(token);
  const [name, setName] = useState("");

  const submit = () => {
    const trimmed = name.trim();
    if (trimmed) void join(trimmed);
  };

  return (
    <main className="flex min-h-svh items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm space-y-5 rounded-2xl border border-border bg-card p-6 text-center shadow-sm" data-testid="guest-call" data-phase={phase}>
        <h1 className="text-lg font-semibold">Join the call</h1>

        {(phase === "form" || phase === "joining") && (
          <form
            className="space-y-3"
            onSubmit={(event) => {
              event.preventDefault();
              submit();
            }}
          >
            <p className="text-sm text-muted-foreground">Enter your name so the host knows who is joining. You will need to allow your microphone.</p>
            <Input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Your name"
              maxLength={60}
              autoFocus
              disabled={phase === "joining"}
              aria-label="Your name"
              data-testid="guest-name"
            />
            {message && (
              <p className="text-sm text-destructive" role="alert" data-testid="guest-error">
                {message}
              </p>
            )}
            <Button type="submit" className="w-full" disabled={!name.trim() || phase === "joining"} data-testid="guest-join">
              {phase === "joining" ? <Loader2 className="size-4 animate-spin" /> : "Ask to join"}
            </Button>
          </form>
        )}

        {phase === "waiting" && (
          <div className="space-y-3 py-4" data-testid="guest-waiting">
            <Loader2 className="mx-auto size-6 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Waiting for the host to let you in</p>
            <Button type="button" variant="outline" onClick={() => void leave()}>
              Cancel
            </Button>
          </div>
        )}

        {phase === "connecting" && (
          <div className="space-y-3 py-4">
            <Loader2 className="mx-auto size-6 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Connecting your audio</p>
          </div>
        )}

        {phase === "connected" && (
          <div className="space-y-4 py-2" data-testid="guest-connected">
            <p className="text-sm text-emerald-600">You are on the call</p>
            <div className="flex items-center justify-center gap-3">
              <Button
                type="button"
                variant={muted ? "secondary" : "outline"}
                size="icon"
                className="size-12 rounded-full"
                onClick={() => void toggleMute()}
                aria-pressed={muted}
                aria-label={muted ? "Unmute" : "Mute"}
                data-testid="guest-mute"
              >
                {muted ? <MicOff className="size-5" /> : <Mic className="size-5" />}
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="size-14 rounded-full"
                onClick={() => void leave()}
                aria-label="Leave the call"
                data-testid="guest-leave"
              >
                <PhoneOff className="size-6" />
              </Button>
            </div>
          </div>
        )}

        {(phase === "denied" || phase === "ended" || phase === "error") && (
          <div className="space-y-2 py-4" data-testid="guest-finished">
            <p className={phase === "error" ? "text-sm text-destructive" : "text-sm text-muted-foreground"} role="status">
              {message || "The call has ended."}
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
