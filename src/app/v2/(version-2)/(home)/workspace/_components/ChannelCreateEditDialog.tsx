"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Hash, Lock, Bell, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useAppSelector } from "@/store/hooks";
import { useChatStore } from "../_lib/chat-store";
import { workspaceApi } from "../_lib/api";
import type { Channel } from "../_lib/chat-types";

// ---------------------------------------------------------------------------
// ChannelCreateEditDialog — create or edit a channel
// ---------------------------------------------------------------------------

interface ChannelCreateEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** If provided, dialog enters edit mode */
  channel?: Channel | null;
}

export default function ChannelCreateEditDialog({
  open,
  onOpenChange,
  channel,
}: ChannelCreateEditDialogProps) {
  const isEdit = !!channel;
  const currAccount = useAppSelector((s) => s.accounts.currAccount);
  const email = currAccount?.email ?? "";
  const { activeTeamId, addChannel } = useChatStore();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<"text" | "voice" | "announcement">("text");
  const [isPrivate, setIsPrivate] = useState(false);
  const [loading, setLoading] = useState(false);

  // Reset form when dialog opens or channel changes
  useEffect(() => {
    if (open) {
      if (channel) {
        setName(channel.name);
        setDescription(channel.description || "");
        setType(channel.type);
        setIsPrivate(channel.visibility === "private");
      } else {
        setName("");
        setDescription("");
        setType("text");
        setIsPrivate(false);
      }
    }
  }, [open, channel]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Channel name is required");
      return;
    }
    if (!activeTeamId) {
      toast.error("No active team selected");
      return;
    }

    setLoading(true);
    try {
      if (isEdit && channel) {
        // Update channel
        const res = await workspaceApi.updateChannel(
          channel.id,
          {
            name: name.trim(),
            description: description.trim() || undefined,
            type,
            visibility: isPrivate ? "private" : "public",
          },
          email,
        );
        if (res) {
          toast.success("Channel updated");
          onOpenChange(false);
        }
      } else {
        // Create channel
        const res = await workspaceApi.createChannel(
          activeTeamId,
          {
            name: name.trim(),
            type,
            visibility: isPrivate ? "private" : "public",
            description: description.trim() || undefined,
          },
          email,
        );
        if (res) {
          // Add to store
          addChannel({
            id: res.id || `ch-${Date.now()}`,
            teamId: activeTeamId,
            name: name.trim(),
            description: description.trim(),
            type,
            visibility: isPrivate ? "private" : "public",
            isPinned: false,
            isDefault: false,
            isLocked: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            unreadCount: 0,
          });
          toast.success("Channel created");
          onOpenChange(false);
        }
      }
    } catch (err) {
      toast.error(isEdit ? "Failed to update channel" : "Failed to create channel");
    } finally {
      setLoading(false);
    }
  };

  const TypeIcon =
    type === "voice"
      ? Volume2
      : type === "announcement"
        ? Bell
        : isPrivate
          ? Lock
          : Hash;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TypeIcon className="size-4" />
            {isEdit ? "Edit Channel" : "Create Channel"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the channel settings."
              : "Channels are where your team communicates. Create one for a topic or project."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Channel Name */}
          <div className="space-y-2">
            <Label htmlFor="channel-name">Channel Name</Label>
            <div className="relative">
              <TypeIcon className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="channel-name"
                placeholder="e.g. marketing, design-feedback"
                value={name}
                onChange={(e) =>
                  setName(
                    e.target.value
                      .toLowerCase()
                      .replace(/\s+/g, "-")
                      .replace(/[^a-z0-9-]/g, ""),
                  )
                }
                className="pl-8"
                maxLength={80}
                autoFocus
              />
            </div>
            <p className="text-[11px] text-muted-foreground">
              Names must be lowercase, without spaces or special characters.
            </p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="channel-desc">
              Description <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Textarea
              id="channel-desc"
              placeholder="What's this channel about?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="resize-none"
              rows={2}
              maxLength={250}
            />
          </div>

          {/* Channel Type */}
          <div className="space-y-2">
            <Label>Channel Type</Label>
            <Select value={type} onValueChange={(v) => setType(v as typeof type)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">
                  <div className="flex items-center gap-2">
                    <Hash className="size-3.5" />
                    Text
                  </div>
                </SelectItem>
                <SelectItem value="voice">
                  <div className="flex items-center gap-2">
                    <Volume2 className="size-3.5" />
                    Voice
                  </div>
                </SelectItem>
                <SelectItem value="announcement">
                  <div className="flex items-center gap-2">
                    <Bell className="size-3.5" />
                    Announcement
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Private toggle */}
          <div className="flex items-center justify-between rounded-lg border border-border/40 p-3">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium cursor-pointer">
                Private Channel
              </Label>
              <p className="text-[11px] text-muted-foreground">
                Only invited members can view and join this channel.
              </p>
            </div>
            <Switch checked={isPrivate} onCheckedChange={setIsPrivate} />
          </div>

          {/* Preview */}
          <div className="flex items-center gap-2 rounded-md bg-accent/50 px-3 py-2 text-sm">
            <TypeIcon className="size-4 text-muted-foreground" />
            <span className="font-medium">{name || "channel-name"}</span>
            {isPrivate && (
              <span className="text-[10px] rounded bg-muted px-1.5 py-0.5 text-muted-foreground">
                Private
              </span>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !name.trim()}>
              {loading
                ? isEdit
                  ? "Saving..."
                  : "Creating..."
                : isEdit
                  ? "Save Changes"
                  : "Create Channel"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
