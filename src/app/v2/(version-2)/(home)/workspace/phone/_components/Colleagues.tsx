"use client";

import { useCallback, useEffect, useState } from "react";
import { Phone, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { Colleague } from "../_lib/types";
import { intercomApi } from "../_lib/voice-api";

interface ColleaguesProps {
  onCall: (extension: string) => void;
  disabled?: boolean;
}

const refreshMs = 8000;

export default function Colleagues({ onCall, disabled }: ColleaguesProps) {
  const [people, setPeople] = useState<Colleague[] | undefined>(undefined);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const result = await intercomApi.colleagues();
      setPeople(result.colleagues);
      setError("");
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Could not load colleagues");
    }
  }, []);

  useEffect(() => {
    void load();
    const timer = window.setInterval(() => void load(), refreshMs);
    return () => window.clearInterval(timer);
  }, [load]);

  if (error && !people) {
    return (
      <div className="space-y-2 py-6 text-center text-sm text-muted-foreground" data-testid="colleagues-error">
        <p>{error}</p>
        <Button variant="outline" size="sm" onClick={() => void load()} className="gap-1.5">
          <RefreshCw className="size-3.5" />
          Retry
        </Button>
      </div>
    );
  }

  if (!people) {
    return (
      <div className="space-y-2" data-testid="colleagues-loading">
        {[0, 1, 2].map((index) => (
          <Skeleton key={index} className="h-14 w-full" />
        ))}
      </div>
    );
  }

  if (people.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-muted-foreground" data-testid="colleagues-empty">
        No colleagues yet. People show up here once they have opened AirSend.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-border/50" data-testid="colleagues-list">
      {people.map((person) => (
        <li key={person.email} className="flex items-center gap-3 py-2.5" data-testid="colleague-item">
          <span
            className={cn("size-2.5 shrink-0 rounded-full", person.online ? "bg-emerald-500" : "bg-muted-foreground/30")}
            title={person.online ? "Online" : "Offline"}
            data-online={person.online}
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{person.name}</p>
            <p className="truncate text-xs text-muted-foreground">
              Ext. {person.extension} · {person.online ? "Online" : "Offline"}
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 gap-1.5"
            disabled={disabled || !person.online}
            onClick={() => onCall(person.extension)}
            data-testid="colleague-call"
          >
            <Phone className="size-3.5" />
            Call
          </Button>
        </li>
      ))}
    </ul>
  );
}
