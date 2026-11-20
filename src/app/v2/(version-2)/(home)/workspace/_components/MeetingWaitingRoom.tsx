"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { DoorOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { meetingApi, type MeetingWaitingGuest } from "../_lib/api";

const POLL_MS = 4000;
const SIGNED_OUT_POLL_MS = 60000;

export default function MeetingWaitingRoom({ enabled }: { enabled: boolean }) {
  const [waiting, setWaiting] = useState<MeetingWaitingGuest[]>([]);
  const [busy, setBusy] = useState<Record<string, boolean>>({});
  const [error, setError] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const refresh = useCallback(async (): Promise<number> => {
    if (typeof document !== "undefined" && document.visibilityState === "hidden") return POLL_MS;
    try {
      setWaiting(await meetingApi.waitingRoom());
      return POLL_MS;
    } catch (failure) {
      if ((failure as { status?: number }).status === 401) {
        setWaiting([]);
        return SIGNED_OUT_POLL_MS;
      }
      return POLL_MS * 2;
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;
    let stopped = false;
    const loop = async () => {
      const next = await refresh();
      if (!stopped) timer.current = setTimeout(() => void loop(), next);
    };
    void loop();
    const onVisible = () => {
      if (document.visibilityState === "visible") void refresh();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      stopped = true;
      if (timer.current) clearTimeout(timer.current);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [enabled, refresh]);

  const answer = async (guest: MeetingWaitingGuest, admit: boolean) => {
    setBusy((current) => ({ ...current, [guest.id]: true }));
    setError("");
    try {
      await meetingApi.answerGuest(guest.roomId, guest.id, admit);
      setWaiting((current) => current.filter((item) => item.id !== guest.id));
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Could not answer that request");
    } finally {
      setBusy((current) => {
        const next = { ...current };
        delete next[guest.id];
        return next;
      });
    }
  };

  if (!enabled || waiting.length === 0) return null;

  return (
    <div className="fixed bottom-4 left-4 z-[60] flex w-80 flex-col gap-2" role="region" aria-label="People waiting to join your meetings" data-testid="meeting-waiting-room">
      {waiting.slice(0, 4).map((guest) => (
        <div key={guest.id} className="rounded-lg border border-border bg-popover p-3 text-popover-foreground shadow-lg" data-testid="meeting-waiting-guest">
          <div className="flex items-start gap-2">
            <DoorOpen className="mt-0.5 size-4 shrink-0 text-primary" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{guest.name || "Guest"} wants to join</p>
              <p className="truncate text-xs text-muted-foreground">
                {guest.email ? `${guest.email} · ` : "Not signed in · "}meeting {guest.roomId}
              </p>
            </div>
          </div>
          <div className="mt-2 flex justify-end gap-2">
            <Button size="sm" variant="outline" disabled={!!busy[guest.id]} onClick={() => void answer(guest, false)} data-testid="meeting-waiting-deny">
              Deny
            </Button>
            <Button size="sm" disabled={!!busy[guest.id]} onClick={() => void answer(guest, true)} data-testid="meeting-waiting-admit">
              Let in
            </Button>
          </div>
        </div>
      ))}
      {waiting.length > 4 && (
        <p className="rounded-md bg-popover px-3 py-1.5 text-xs text-muted-foreground shadow">{waiting.length - 4} more waiting</p>
      )}
      {error && (
        <p className="rounded-md bg-destructive/10 px-3 py-1.5 text-xs text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
