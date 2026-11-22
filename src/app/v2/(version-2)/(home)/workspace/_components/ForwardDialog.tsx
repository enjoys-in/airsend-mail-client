"use client";

import React, { useMemo, useState } from "react";
import { Hash, Loader2, MessageCircle, Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useChatStore } from "../_lib/chat-store";
import { useSelection } from "../_lib/selection-store";
import { isValidUUID } from "../_lib/api";
import type { ChatMessage, DirectMessage } from "../_lib/chat-types";
import type { ForwardTarget } from "../_lib/outbox";

// ---------------------------------------------------------------------------
// ForwardDialog — pick channels / DMs and forward the chosen messages there.
// Text is re-sent with a "Forwarded from" line; files are shared by reference
// (the files service adds the target message to the same stored file).
// ---------------------------------------------------------------------------

interface Option extends ForwardTarget {
  label: string;
}

function dmLabel(dm: DirectMessage, me: string): string {
  if (dm.name) return dm.name;
  const others = dm.participants.filter((p) => p.userId.toLowerCase() !== me.toLowerCase());
  return others.map((p) => p.displayName || p.userId).join(", ") || "Direct message";
}

const keyOf = (o: ForwardTarget) => `${o.kind}:${o.id}`;

interface ForwardDialogProps {
  conversationId: string;
  messages: ChatMessage[];
}

export default function ForwardDialog({ conversationId, messages }: ForwardDialogProps) {
  const forwardIds = useSelection((s) => (s.forwardFrom === conversationId ? s.forwardIds : null));
  const closeForward = useSelection((s) => s.closeForward);
  const clearSelection = useSelection((s) => s.clear);
  const channels = useChatStore((s) => s.channels);
  const dms = useChatStore((s) => s.directMessages);
  const me = useChatStore((s) => s.currentUserId);
  const forwardMessages = useChatStore((s) => s.forwardMessages);

  const [query, setQuery] = useState("");
  const [picked, setPicked] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  const options = useMemo<Option[]>(() => {
    const all: Option[] = [
      ...channels.filter((c) => isValidUUID(c.id)).map((c) => ({ kind: "channel" as const, id: c.id, label: c.name })),
      ...dms.filter((d) => isValidUUID(d.id)).map((d) => ({ kind: "dm" as const, id: d.id, label: dmLabel(d, me) })),
    ];
    const q = query.trim().toLowerCase();
    return q ? all.filter((o) => o.label.toLowerCase().includes(q)) : all;
  }, [channels, dms, me, query]);

  const open = !!forwardIds?.length;
  const chosen = messages.filter((m) => forwardIds?.includes(m.id));

  const close = () => {
    closeForward();
    setPicked([]);
    setQuery("");
  };

  const toggle = (o: ForwardTarget) => {
    const k = keyOf(o);
    setPicked((p) => (p.includes(k) ? p.filter((x) => x !== k) : [...p, k]));
  };

  const submit = async () => {
    const targets = options.filter((o) => picked.includes(keyOf(o)));
    if (!targets.length || !chosen.length) return;
    setBusy(true);
    try {
      await forwardMessages(chosen, targets.map(({ kind, id }) => ({ kind, id })));
      toast.success(`Forwarded to ${targets.length} conversation${targets.length === 1 ? "" : "s"}`);
      clearSelection();
      close();
    } catch {
      toast.error("Could not forward the messages");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && close()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            Forward {chosen.length} message{chosen.length === 1 ? "" : "s"}
          </DialogTitle>
        </DialogHeader>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search channels and people"
            className="pl-8"
            autoFocus
          />
        </div>
        <div className="max-h-72 space-y-0.5 overflow-y-auto">
          {options.map((o) => (
            <label
              key={keyOf(o)}
              className="flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 text-sm hover:bg-accent/50"
            >
              <Checkbox checked={picked.includes(keyOf(o))} onCheckedChange={() => toggle(o)} />
              {o.kind === "channel" ? (
                <Hash className="size-4 text-muted-foreground" />
              ) : (
                <MessageCircle className="size-4 text-muted-foreground" />
              )}
              <span className="truncate">{o.label}</span>
            </label>
          ))}
          {!options.length && <p className="px-2 py-4 text-center text-sm text-muted-foreground">No matches</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={close}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={!picked.length || busy}>
            {busy && <Loader2 className="mr-1.5 size-4 animate-spin" />}
            Forward{picked.length ? ` (${picked.length})` : ""}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
