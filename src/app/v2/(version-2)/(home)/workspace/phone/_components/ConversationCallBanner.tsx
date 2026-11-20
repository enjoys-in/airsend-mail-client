"use client";

import { useCallback, useEffect, useState } from "react";
import { Phone, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { IntercomCall } from "../_lib/types";
import { usePhone } from "../_lib/phone-context";
import { intercomApi } from "../_lib/voice-api";

interface ConversationCallBannerProps {
  conversationId: string;
  title: string;
}

const refreshMs = 8000;

export default function ConversationCallBanner({ conversationId, title }: ConversationCallBannerProps) {
  const { state, joinExisting, me } = usePhone();
  const [call, setCall] = useState<IntercomCall | null>(null);

  const load = useCallback(async () => {
    try {
      const result = await intercomApi.activeCall(conversationId);
      setCall(result.call);
    } catch {
      setCall(null);
    }
  }, [conversationId]);

  useEffect(() => {
    if (!me) return;
    void load();
    const timer = window.setInterval(() => void load(), refreshMs);
    const onCallEvent = () => void load();
    window.addEventListener("airsend:call-event", onCallEvent);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("airsend:call-event", onCallEvent);
    };
  }, [load, me, state.phase]);

  const inThisCall =
    call !== null && state.callId === call.id && (state.phase === "starting" || state.phase === "dialing" || state.phase === "connected");
  if (!call || inThisCall) return null;

  const joined = call.participants.filter((person) => person.state === "joined");
  const busy = state.phase === "starting" || state.phase === "dialing" || state.phase === "connected";

  return (
    <div
      className="flex items-center justify-between gap-3 border-b border-emerald-500/30 bg-emerald-500/10 px-4 py-2"
      role="status"
      data-testid="conversation-call-banner"
    >
      <div className="flex min-w-0 items-center gap-2 text-sm">
        {call.media === "video" ? <Video className="size-4 shrink-0 text-emerald-600" /> : <Phone className="size-4 shrink-0 text-emerald-600" />}
        <span className="truncate">
          A {call.media === "video" ? "video call" : "call"} is in progress
          {joined.length > 0 ? ` with ${joined.map((person) => person.name).join(", ")}` : ""}
        </span>
      </div>
      <Button
        type="button"
        size="sm"
        className="h-7 bg-emerald-600 text-white hover:bg-emerald-700"
        disabled={busy}
        onClick={() => void joinExisting(call.id, title)}
        data-testid="conversation-call-join"
      >
        Join
      </Button>
    </div>
  );
}
