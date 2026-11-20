"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { workspaceApi } from "../_lib/api";
import { useChatStore } from "../_lib/chat-store";

interface NewGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentUserId: string;
}

export default function NewGroupDialog({ open, onOpenChange, currentUserId }: NewGroupDialogProps) {
  const router = useRouter();
  const members = useChatStore((s) => s.members);
  const fetchDMs = useChatStore((s) => s.fetchDMs);
  const [chosen, setChosen] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [filter, setFilter] = useState("");
  const [typed, setTyped] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const me = currentUserId.toLowerCase();
  const people = useMemo(() => {
    const seen = new Set<string>();
    const list = [];
    for (const member of members) {
      const email = (member.email || member.userId || "").toLowerCase();
      if (!email || email === me || seen.has(email)) continue;
      seen.add(email);
      list.push({ email, name: member.displayName || email });
    }
    const needle = filter.trim().toLowerCase();
    return needle ? list.filter((person) => person.name.toLowerCase().includes(needle) || person.email.includes(needle)) : list;
  }, [members, me, filter]);

  const addTyped = () => {
    const email = typed.trim().toLowerCase();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || email === me) return;
    setChosen((current) => (current.includes(email) ? current : [...current, email]));
    setTyped("");
  };

  const toggle = (email: string) => setChosen((current) => (current.includes(email) ? current.filter((item) => item !== email) : [...current, email]));

  const create = async () => {
    setBusy(true);
    setError("");
    try {
      const group = await workspaceApi.createGroupDM(chosen, name.trim() || undefined, currentUserId);
      await fetchDMs(currentUserId);
      setChosen([]);
      setName("");
      onOpenChange(false);
      router.push(`/v2/workspace/dm/${group.id}`);
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "The group could not be created");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md" data-testid="new-group-dialog">
        <DialogHeader>
          <DialogTitle>New group chat</DialogTitle>
          <DialogDescription>Pick at least two people. You will be the group&apos;s owner.</DialogDescription>
        </DialogHeader>
        <Input value={filter} onChange={(event) => setFilter(event.target.value)} placeholder="Search people" aria-label="Search people" />
        <div className="flex gap-2">
          <Input value={typed} onChange={(event) => setTyped(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); addTyped(); } }} placeholder="Or add by email" aria-label="Add by email" data-testid="new-group-email" />
          <Button type="button" variant="outline" onClick={addTyped} data-testid="new-group-email-add">
            Add
          </Button>
        </div>
        {chosen.filter((email) => !people.some((person) => person.email === email)).length > 0 && (
          <ul className="space-y-1 text-sm" data-testid="new-group-typed">
            {chosen
              .filter((email) => !people.some((person) => person.email === email))
              .map((email) => (
                <li key={email} className="flex items-center justify-between rounded bg-muted px-2 py-1">
                  <span className="truncate">{email}</span>
                  <button type="button" className="text-xs text-muted-foreground hover:text-foreground" onClick={() => toggle(email)} aria-label={`Remove ${email}`}>
                    Remove
                  </button>
                </li>
              ))}
          </ul>
        )}
        <ul className="max-h-60 divide-y divide-border/50 overflow-y-auto" data-testid="new-group-people">
          {people.length === 0 && <li className="py-4 text-center text-sm text-muted-foreground">No one to add.</li>}
          {people.map((person) => (
            <li key={person.email}>
              <label className="flex cursor-pointer items-center gap-2 py-2">
                <input type="checkbox" checked={chosen.includes(person.email)} onChange={() => toggle(person.email)} data-testid="new-group-person" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm">{person.name}</span>
                  <span className="block truncate text-xs text-muted-foreground">{person.email}</span>
                </span>
              </label>
            </li>
          ))}
        </ul>
        <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Group name (optional)" maxLength={120} aria-label="Group name" data-testid="new-group-name" />
        {error && (
          <p className="text-sm text-destructive" role="alert" data-testid="new-group-error">
            {error}
          </p>
        )}
        <Button type="button" disabled={busy || chosen.length < 2} onClick={() => void create()} data-testid="new-group-create">
          Create group ({chosen.length} selected)
        </Button>
      </DialogContent>
    </Dialog>
  );
}
