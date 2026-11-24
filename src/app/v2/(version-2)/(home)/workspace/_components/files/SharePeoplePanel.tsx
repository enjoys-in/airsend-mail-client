"use client";

import React, { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Loader2, Send, UserMinus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useChatStore } from "../../_lib/chat-store";
import {
  filesErrorMessage,
  listShareUsers,
  removeShareUser,
  shareWithUsers,
  type ShareUser,
} from "../../_lib/files-api";
import { formatFileDate } from "../../_lib/file-utils";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const lower = (s: string) => s.trim().toLowerCase();

/** Team members of the active team (minus me), as share suggestions. */
function useTeamPeople() {
  const members = useChatStore((s) => s.members);
  const activeTeamId = useChatStore((s) => s.activeTeamId);
  const me = useChatStore((s) => s.currentUserId);
  return useMemo(
    () =>
      members.filter(
        (m) => m.email && (!activeTeamId || m.teamId === activeTeamId) && lower(m.email) !== lower(me ?? ""),
      ),
    [members, activeTeamId, me],
  );
}

/** "People" tab of the share dialog: share one files-service file with people in the organization. */
export function SharePeoplePanel({ fileId }: { fileId: string }) {
  const people = useTeamPeople();
  const [shares, setShares] = useState<ShareUser[] | null>(null);
  const [emails, setEmails] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setShares(null);
    listShareUsers(fileId)
      .then((s) => !cancelled && setShares(s))
      .catch((err) => {
        if (cancelled) return;
        setShares([]);
        toast.error(filesErrorMessage(err, "Could not load who this file is shared with"));
      });
    return () => {
      cancelled = true;
    };
  }, [fileId]);

  const taken = new Set([...emails, ...(shares ?? []).map((s) => s.sharedWith)].map(lower));
  const q = lower(query);
  const suggestions = people
    .filter((m) => !taken.has(lower(m.email)))
    .filter((m) => !q || lower(m.email).includes(q) || lower(m.displayName ?? "").includes(q))
    .slice(0, 6);

  const add = (email: string) => {
    const e = email.trim();
    if (!e) return;
    if (!EMAIL.test(e)) return void toast.error(`"${e}" is not a valid email`);
    if (!taken.has(lower(e))) setEmails((l) => [...l, e]);
    setQuery("");
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      add(query);
    } else if (e.key === "Backspace" && !query && emails.length) {
      setEmails((l) => l.slice(0, -1));
    }
  };

  const share = async () => {
    const pending = query.trim();
    if (pending && !EMAIL.test(pending)) return void toast.error(`"${pending}" is not a valid email`);
    const list = pending && !taken.has(lower(pending)) ? [...emails, pending] : emails;
    if (!list.length) return;
    setSharing(true);
    try {
      const added = await shareWithUsers(fileId, list);
      setShares((s) => [...added, ...(s ?? []).filter((x) => !added.some((a) => a.id === x.id))]);
      setEmails([]);
      setQuery("");
      toast.success(`Shared with ${list.length === 1 ? list[0] : `${list.length} people`}`);
    } catch (err) {
      toast.error(filesErrorMessage(err, "Could not share the file"));
    } finally {
      setSharing(false);
    }
  };

  const remove = async (s: ShareUser) => {
    setBusyId(s.id);
    try {
      await removeShareUser(s.id);
      setShares((l) => (l ?? []).filter((x) => x.id !== s.id));
      toast.success(`Removed ${s.sharedWith}`);
    } catch (err) {
      toast.error(filesErrorMessage(err, "Could not remove access"));
    } finally {
      setBusyId(null);
    }
  };

  const nameOf = (email: string) => people.find((m) => lower(m.email) === lower(email))?.displayName;

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label className="text-xs">Share with people in your organization</Label>
        <div className="flex items-start gap-2">
          <div className="relative flex-1">
            <div className="flex min-h-8 flex-wrap items-center gap-1 rounded-md border border-input bg-background px-1.5 py-1">
              {emails.map((e) => (
                <span key={e} className="flex items-center gap-1 rounded bg-accent px-1.5 py-0.5 text-[11px]">
                  {e}
                  <button
                    type="button"
                    onClick={() => setEmails((l) => l.filter((x) => x !== e))}
                    aria-label={`Remove ${e}`}
                    className="opacity-60 hover:opacity-100"
                  >
                    <X className="size-3" />
                  </button>
                </span>
              ))}
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onKeyDown}
                onFocus={() => setFocused(true)}
                onBlur={() => setTimeout(() => setFocused(false), 150)}
                placeholder={emails.length ? "" : "Name or email"}
                className="h-6 min-w-24 flex-1 border-0 p-0 px-1 text-xs shadow-none focus-visible:ring-0"
              />
            </div>
            {focused && suggestions.length > 0 && (
              <ul className="absolute z-50 mt-1 w-full overflow-hidden rounded-lg border border-border/60 bg-popover p-1 shadow-lg">
                {suggestions.map((m) => (
                  <li key={m.id}>
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => add(m.email)}
                      className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs hover:bg-accent"
                    >
                      <PersonAvatar label={m.displayName || m.email} />
                      <span className="truncate font-medium">{m.displayName || m.username}</span>
                      <span className="ml-auto truncate text-[11px] text-muted-foreground">{m.email}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <Button
            size="sm"
            onClick={share}
            disabled={sharing || (!emails.length && !query.trim())}
            className="h-8 gap-1.5 text-xs"
          >
            {sharing ? <Loader2 className="size-3.5 animate-spin" /> : <Send className="size-3.5" />}
            Share
          </Button>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">Shared with</Label>
        {shares === null ? (
          <div className="flex justify-center py-4">
            <Loader2 className="size-4 animate-spin text-muted-foreground" />
          </div>
        ) : shares.length === 0 ? (
          <p className="py-3 text-center text-xs text-muted-foreground">Not shared with anyone yet.</p>
        ) : (
          <ul className="max-h-56 divide-y divide-border/40 overflow-y-auto rounded-lg border border-border/40">
            {shares.map((s) => (
              <li key={s.id} className="flex items-center gap-2 px-3 py-2 text-xs">
                <PersonAvatar label={nameOf(s.sharedWith) || s.sharedWith} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{nameOf(s.sharedWith) || s.sharedWith}</p>
                  <p className="truncate text-[10px] text-muted-foreground">
                    {s.sharedWith} · {formatFileDate(s.createdAt, false)}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7 text-muted-foreground hover:text-destructive"
                  title="Remove access"
                  disabled={busyId === s.id}
                  onClick={() => remove(s)}
                >
                  {busyId === s.id ? <Loader2 className="size-3.5 animate-spin" /> : <UserMinus className="size-3.5" />}
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function PersonAvatar({ label }: { label: string }) {
  return (
    <Avatar className="size-5 shrink-0">
      <AvatarFallback className="bg-primary/10 text-[9px] font-bold text-primary">
        {label.charAt(0).toUpperCase()}
      </AvatarFallback>
    </Avatar>
  );
}
