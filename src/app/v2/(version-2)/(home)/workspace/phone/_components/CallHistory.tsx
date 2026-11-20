"use client";

import { useCallback, useEffect, useState } from "react";
import { PhoneIncoming, PhoneOutgoing, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { formatClock, formatWhen, reasonText } from "../_lib/number";
import type { PhoneCall } from "../_lib/types";
import { voiceApi } from "../_lib/voice-api";

interface CallHistoryProps {
  refreshKey: number;
  onCall: (number: string) => void;
  disabled?: boolean;
}

export default function CallHistory({ refreshKey, onCall, disabled }: CallHistoryProps) {
  const [calls, setCalls] = useState<PhoneCall[] | undefined>(undefined);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const result = await voiceApi.calls(30);
      setCalls(result.calls);
      setError("");
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Could not load call history");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load, refreshKey]);

  const unsettled = calls?.some((call) => call.status === "dialing" || call.status === "ringing" || call.status === "answered");

  useEffect(() => {
    if (!unsettled) return;
    const timer = window.setTimeout(() => void load(), 2000);
    return () => window.clearTimeout(timer);
  }, [unsettled, calls, load]);

  if (error && !calls) {
    return (
      <div className="space-y-2 py-6 text-center text-sm text-muted-foreground" data-testid="history-error">
        <p>{error}</p>
        <Button variant="outline" size="sm" onClick={() => void load()} className="gap-1.5">
          <RefreshCw className="size-3.5" />
          Retry
        </Button>
      </div>
    );
  }

  if (!calls) {
    return (
      <div className="space-y-2" data-testid="history-loading">
        {[0, 1, 2, 3].map((index) => (
          <Skeleton key={index} className="h-14 w-full" />
        ))}
      </div>
    );
  }

  if (calls.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-muted-foreground" data-testid="history-empty">
        No calls yet. Dial a number to get started.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-border/50" data-testid="history-list">
      {calls.map((call) => {
        const inbound = call.direction === "inbound";
        const number = inbound ? call.from : call.to;
        const missed = call.status === "failed" || call.status === "blocked";
        const Icon = inbound ? PhoneIncoming : PhoneOutgoing;
        const detail = missed
          ? reasonText(call.endReason) || "Not connected"
          : call.durationSeconds > 0
            ? formatClock(call.durationSeconds)
            : call.status === "ended"
              ? "Ended"
              : call.status;
        return (
          <li key={call.id} className="flex items-center gap-3 py-2.5" data-testid="history-item">
            <Icon className={cn("size-4 shrink-0", missed ? "text-destructive" : "text-muted-foreground")} />
            <div className="min-w-0 flex-1">
              <p className="truncate font-mono text-sm">{number}</p>
              <p className={cn("text-xs", missed ? "text-destructive" : "text-muted-foreground")}>{detail}</p>
            </div>
            <span className="shrink-0 text-xs text-muted-foreground">{formatWhen(call.createdAt)}</span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs"
              disabled={disabled || !number.startsWith("+")}
              onClick={() => onCall(number)}
              data-testid="history-call"
            >
              Call
            </Button>
          </li>
        );
      })}
    </ul>
  );
}
