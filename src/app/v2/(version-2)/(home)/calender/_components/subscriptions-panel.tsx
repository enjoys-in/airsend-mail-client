"use client";

import { useState } from "react";
import {
  RiAddLine,
  RiDeleteBinLine,
  RiRefreshLine,
  RiCheckLine,
  RiCloseLine,
  RiExternalLinkLine,
  RiMore2Line,
} from "@remixicon/react";
import { formatDistanceToNow } from "date-fns";

import { useCalDevStore } from "../_lib/caldev-store";
import type { CalDevSubscription } from "../_lib/caldev-types";

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function SubscriptionsPanel() {
  const subscriptions = useCalDevStore((s) => s.subscriptions);
  const subscriptionsLoading = useCalDevStore((s) => s.subscriptionsLoading);
  const addSubscription = useCalDevStore((s) => s.addSubscription);
  const removeSubscription = useCalDevStore((s) => s.removeSubscription);
  const triggerSync = useCalDevStore((s) => s.triggerSync);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [sourceUrl, setSourceUrl] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [color, setColor] = useState("#6B7280");
  const [syncing, setSyncing] = useState<string | null>(null);

  const handleAdd = async () => {
    if (!sourceUrl.trim()) return;
    await addSubscription(sourceUrl, displayName || undefined, color);
    setDialogOpen(false);
    setSourceUrl("");
    setDisplayName("");
    setColor("#6B7280");
  };

  const handleSync = async (id: string) => {
    setSyncing(id);
    try {
      await triggerSync(id);
    } finally {
      setSyncing(null);
    }
  };

  const handleDelete = async (id: string) => {
    await removeSubscription(id, true);
  };

  if (subscriptions.length === 0 && !subscriptionsLoading) {
    return (
      <SidebarGroup className="px-1 mt-3 pt-4 border-t">
        <SidebarGroupLabel className="uppercase text-muted-foreground/65 flex items-center justify-between">
          <span>Subscriptions</span>
          <Button
            variant="ghost"
            size="icon"
            className="size-6"
            onClick={() => setDialogOpen(true)}
          >
            <RiAddLine size={14} />
          </Button>
        </SidebarGroupLabel>
        <SidebarGroupContent>
          <p className="text-xs text-muted-foreground/50 px-2 py-2">
            Import external calendars (Google, Outlook, ICS)
          </p>
        </SidebarGroupContent>

        {/* Add dialog */}
        <AddSubscriptionDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          sourceUrl={sourceUrl}
          setSourceUrl={setSourceUrl}
          displayName={displayName}
          setDisplayName={setDisplayName}
          color={color}
          setColor={setColor}
          onAdd={handleAdd}
        />
      </SidebarGroup>
    );
  }

  return (
    <SidebarGroup className="px-1 mt-3 pt-4 border-t">
      <SidebarGroupLabel className="uppercase text-muted-foreground/65 flex items-center justify-between">
        <span>Subscriptions</span>
        <Button
          variant="ghost"
          size="icon"
          className="size-6"
          onClick={() => setDialogOpen(true)}
        >
          <RiAddLine size={14} />
        </Button>
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {subscriptions.map((sub) => (
            <SidebarMenuItem key={sub.id} className="group">
              <SidebarMenuButton
                asChild
                className="relative rounded-md justify-between"
              >
                <span>
                  <span className="flex items-center gap-2 min-w-0">
                    <span
                      className="size-2 rounded-full shrink-0"
                      style={{ backgroundColor: sub.color }}
                    />
                    <span className="truncate text-sm">{sub.display_name}</span>
                  </span>
                  <span className="flex items-center gap-1 shrink-0">
                    {sub.last_error ? (
                      <Badge variant="destructive" className="text-[9px] px-1 h-4">
                        Error
                      </Badge>
                    ) : (
                      <span className="text-[10px] text-muted-foreground/50">
                        {sub.events_count} events
                      </span>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <button className="size-5 flex items-center justify-center rounded opacity-0 group-hover:opacity-100 hover:bg-sidebar-accent">
                          <RiMore2Line size={14} />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="min-w-36 dark bg-sidebar">
                        <DropdownMenuItem onClick={() => handleSync(sub.id)} disabled={syncing === sub.id}>
                          <RiRefreshLine
                            size={14}
                            className={cn("mr-2", syncing === sub.id && "animate-spin")}
                          />
                          {syncing === sub.id ? "Syncing..." : "Sync Now"}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => handleDelete(sub.id)}
                        >
                          <RiDeleteBinLine size={14} className="mr-2" />
                          Remove
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </span>
                </span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>

      <AddSubscriptionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        sourceUrl={sourceUrl}
        setSourceUrl={setSourceUrl}
        displayName={displayName}
        setDisplayName={setDisplayName}
        color={color}
        setColor={setColor}
        onAdd={handleAdd}
      />
    </SidebarGroup>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-component: Add Subscription Dialog
// ─────────────────────────────────────────────────────────────────────────────

function AddSubscriptionDialog({
  open,
  onOpenChange,
  sourceUrl,
  setSourceUrl,
  displayName,
  setDisplayName,
  color,
  setColor,
  onAdd,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  sourceUrl: string;
  setSourceUrl: (v: string) => void;
  displayName: string;
  setDisplayName: (v: string) => void;
  color: string;
  setColor: (v: string) => void;
  onAdd: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Add External Calendar</DialogTitle>
          <DialogDescription>
            Paste an ICS feed URL from Google Calendar, Outlook, or any CalDAV provider.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="*:not-first:mt-1.5">
            <Label htmlFor="sub-url">ICS Feed URL</Label>
            <Input
              id="sub-url"
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
              placeholder="https://calendar.google.com/calendar/ical/.../basic.ics"
            />
          </div>
          <div className="*:not-first:mt-1.5">
            <Label htmlFor="sub-name">Display Name</Label>
            <Input
              id="sub-name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Indian Holidays, Team Calendar, etc."
            />
          </div>
          <div className="*:not-first:mt-1.5">
            <Label htmlFor="sub-color">Color</Label>
            <Input
              id="sub-color"
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-12 h-8 p-0.5 cursor-pointer"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onAdd} disabled={!sourceUrl.trim()}>
            Subscribe
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
