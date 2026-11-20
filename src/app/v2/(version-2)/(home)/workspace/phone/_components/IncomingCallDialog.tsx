"use client";

import { Phone, PhoneOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { IncomingCall } from "../_lib/types";

interface IncomingCallDialogProps {
  incoming: IncomingCall;
  onAccept: () => void;
  onDecline: () => void;
}

export default function IncomingCallDialog({ incoming, onAccept, onDecline }: IncomingCallDialogProps) {
  return (
    <div
      role="alertdialog"
      aria-live="assertive"
      aria-label={`Incoming call from ${incoming.from.name}`}
      className="fixed bottom-4 right-4 z-50 w-80 max-w-[calc(100vw-2rem)] rounded-xl border border-border bg-card p-4 shadow-2xl"
      data-testid="incoming-call"
    >
      <div className="flex items-center gap-3">
        <div className="flex size-11 shrink-0 animate-pulse items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600">
          <Phone className="size-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs text-muted-foreground">
            {incoming.invited ? "Adding you to a " : "Incoming "}
            {incoming.media === "video" ? "video call" : "call"}
          </p>
          <p className="truncate text-sm font-semibold" data-testid="incoming-call-name">
            {incoming.context?.kind === "group" ? incoming.context.name : incoming.from.name}
          </p>
          <p className="truncate font-mono text-xs text-muted-foreground" data-testid="incoming-call-detail">
            {incoming.context?.kind === "group"
              ? `${incoming.from.name} started a call`
              : incoming.invited && incoming.participants?.length
                ? `With ${incoming.participants.join(", ")}`
                : `Ext. ${incoming.from.extension}`}
          </p>
        </div>
      </div>
      <div className="mt-4 flex gap-2">
        <Button
          type="button"
          variant="destructive"
          className="flex-1 gap-1.5"
          onClick={onDecline}
          data-testid="incoming-call-decline"
        >
          <PhoneOff className="size-4" />
          Decline
        </Button>
        <Button
          type="button"
          className="flex-1 gap-1.5 bg-emerald-600 text-white hover:bg-emerald-700"
          onClick={onAccept}
          data-testid="incoming-call-accept"
        >
          <Phone className="size-4" />
          Accept
        </Button>
      </div>
    </div>
  );
}
