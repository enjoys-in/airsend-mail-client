"use client";

import { useCallback, useEffect, useState } from "react";
import { Link2, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Colleague, IntercomParticipant } from "../_lib/types";
import { intercomApi } from "../_lib/voice-api";

interface AddPeopleProps {
  participants: IntercomParticipant[];
  onInvite: (extension: string) => Promise<void>;
  onGuestLink?: () => Promise<string>;
}

const refreshMs = 6000;

export default function AddPeople({ participants, onInvite, onGuestLink }: AddPeopleProps) {
  const [people, setPeople] = useState<Colleague[] | undefined>(undefined);
  const [pending, setPending] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const load = useCallback(async () => {
    try {
      const result = await intercomApi.colleagues();
      setPeople(result.colleagues);
    } catch {
      setPeople([]);
    }
  }, []);

  useEffect(() => {
    void load();
    const timer = window.setInterval(() => void load(), refreshMs);
    return () => window.clearInterval(timer);
  }, [load]);

  const engaged = new Set(
    participants.filter((person) => person.state === "ringing" || person.state === "joined").map((person) => person.email),
  );
  const available = (people ?? []).filter((person) => person.online && !engaged.has(person.email));

  const add = async (person: Colleague) => {
    setPending(person.email);
    setError("");
    try {
      await onInvite(person.extension);
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Could not add this person");
    } finally {
      setPending("");
    }
  };

  const copyLink = async () => {
    if (!onGuestLink) return;
    setError("");
    try {
      const link = await onGuestLink();
      await navigator.clipboard.writeText(link);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 3000);
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Could not create a guest link");
    }
  };

  return (
    <div className="space-y-2 rounded-lg border border-border/60 p-3 text-left" data-testid="add-people">
      <p className="text-xs font-medium text-muted-foreground">Add someone to this call</p>
      {people === undefined ? (
        <p className="py-2 text-xs text-muted-foreground">Loading colleagues</p>
      ) : available.length === 0 ? (
        <p className="py-2 text-xs text-muted-foreground" data-testid="add-people-empty">
          No one else is online right now.
        </p>
      ) : (
        <ul className="divide-y divide-border/50">
          {available.map((person) => (
            <li key={person.email} className="flex items-center gap-2 py-1.5" data-testid="add-people-item">
              <span className="size-2 shrink-0 rounded-full bg-emerald-500" />
              <span className="min-w-0 flex-1 truncate text-sm">{person.name}</span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 gap-1 px-2"
                disabled={pending !== ""}
                onClick={() => void add(person)}
                data-testid="add-people-add"
              >
                <UserPlus className="size-3.5" />
                Add
              </Button>
            </li>
          ))}
        </ul>
      )}
      {onGuestLink && (
        <div className="border-t border-border/50 pt-2">
          <Button type="button" variant="outline" size="sm" className="h-8 w-full gap-1.5" onClick={() => void copyLink()} data-testid="copy-guest-link">
            <Link2 className="size-3.5" />
            {copied ? "Link copied" : "Copy a guest link for someone outside"}
          </Button>
          <p className="mt-1 text-[11px] text-muted-foreground">They enter their name and you let them in.</p>
        </div>
      )}
      {error && (
        <p className="text-xs text-destructive" role="alert" data-testid="add-people-error">
          {error}
        </p>
      )}
    </div>
  );
}
