"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  Hash,
  Lock,
  Bell,
  Volume2,
  Video,
  VideoOff,
  Shield,
  ChevronDown,
  ChevronUp,
  Image,
  Smile,
  BarChart2,
  MessageSquare,
  AtSign,
} from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useAppSelector } from "@/store/hooks";
import { useChatStore } from "../_lib/chat-store";
import { workspaceApi, toChannel } from "../_lib/api";
import type {
  Channel,
  ChannelPermissions,
  ChannelPostingPermission,
} from "../_lib/chat-types";
import { useChannelPermissionDefaults } from "../_lib/permission-catalog";

// ---------------------------------------------------------------------------
// ChannelCreateEditDialog — create or edit a channel with meet & lock controls
// ---------------------------------------------------------------------------

interface ChannelCreateEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** If provided, dialog enters edit mode */
  channel?: Channel | null;
}


// Permission-related fields the server resolves (OpenFGA tuples + channel policy).
function serverPermissionFields(c: Channel): Partial<Channel> {
  const fields: Partial<Channel> = {
    permissions: c.permissions,
    rolePermissions: c.rolePermissions,
    effectivePermissions: c.effectivePermissions,
    isLocked: c.isLocked,
    postingPermission: c.postingPermission,
  };
  // An older server may not send everything — never clobber with undefined.
  for (const k of Object.keys(fields) as (keyof Channel)[]) {
    if (fields[k] === undefined) delete fields[k];
  }
  return fields;
}

export default function ChannelCreateEditDialog({
  open,
  onOpenChange,
  channel,
}: ChannelCreateEditDialogProps) {
  const isEdit = !!channel;
  const currAccount = useAppSelector((s) => s.accounts.currAccount);
  const email = currAccount?.email ?? "";
  const { activeTeamId, teams, addChannel, updateChannel: updateStoreChannel } = useChatStore();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<"text" | "voice" | "announcement">("text");
  const [isPrivate, setIsPrivate] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [allowMeetings, setAllowMeetings] = useState(true);
  const [postingPermission, setPostingPermission] = useState<ChannelPostingPermission>("everyone");
  const [showAdvancedPerms, setShowAdvancedPerms] = useState(false);
  // Defaults come from the workspace server, not the client.
  const defaults = useChannelPermissionDefaults();
  const [permissions, setPermissions] = useState<ChannelPermissions>(
    () => ({ ...defaults.everyone }) as ChannelPermissions,
  );
  const [selectedTeamId, setSelectedTeamId] = useState<string>("");
  const [loading, setLoading] = useState(false);

  // Resolve the target team: private channels use picker, public use active team
  const targetTeamId = isPrivate
    ? selectedTeamId || activeTeamId
    : activeTeamId || teams[0]?.id;

  // Reset form when dialog opens or channel changes
  useEffect(() => {
    if (open) {
      if (channel) {
        setName(channel.name);
        setDescription(channel.description || "");
        setType(channel.type);
        setIsPrivate(channel.visibility === "private");
        setIsLocked(channel.isLocked ?? false);
        setAllowMeetings(channel.permissions?.start_calls ?? true);
        setPostingPermission(channel.postingPermission ?? "everyone");
        setPermissions({
          ...defaults.everyone,
          ...(channel.permissions || {}),
        } as ChannelPermissions);
        setSelectedTeamId(channel.teamId || "");
      } else {
        setName("");
        setDescription("");
        setType("text");
        setIsPrivate(false);
        setIsLocked(false);
        setAllowMeetings(true);
        setPostingPermission("everyone");
        setPermissions({ ...defaults.everyone } as ChannelPermissions);
        setSelectedTeamId(activeTeamId || "");
      }
      setShowAdvancedPerms(false);
    }
  }, [open, channel, activeTeamId, defaults]);

  const handleTogglePerm = (key: keyof ChannelPermissions) => {
    setPermissions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Channel name is required");
      return;
    }
    if (!targetTeamId) {
      toast.error("Please select a team first");
      return;
    }

    setLoading(true);

    // Locked channels disable calls/voice on the server (policy), so only the
    // user's own toggles are sent — no derived denies that would outlive an unlock.
    const effectivePerms: ChannelPermissions = {
      ...permissions,
      start_calls: allowMeetings,
    };

    try {
      if (isEdit && channel) {
        // Update channel on server
        const saved = await workspaceApi.updateChannel(
          channel.id,
          {
            name: name.trim(),
            description: description.trim() || undefined,
            type,
            visibility: isPrivate ? "private" : "public",
            is_locked: isLocked,
            posting_permission: postingPermission,
            permissions: effectivePerms,
          },
          email,
        );

        // Update local store immediately
        updateStoreChannel(channel.id, {
          name: name.trim(),
          description: description.trim(),
          type,
          visibility: isPrivate ? "private" : "public",
          isLocked,
          postingPermission,
          permissions: effectivePerms,
          // Adopt what the server actually resolved (OpenFGA tuples + policy)
          ...(saved ? serverPermissionFields(toChannel(saved)) : {}),
        });

        toast.success("Channel updated");
        onOpenChange(false);
      } else {
        // Create channel on server
        const res = await workspaceApi.createChannel(
          targetTeamId,
          {
            name: name.trim(),
            type,
            visibility: isPrivate ? "private" : "public",
            description: description.trim() || undefined,
            posting_permission: postingPermission,
            is_locked: isLocked,
            permissions: effectivePerms,
          },
          email,
        );

        // Add to local store
        addChannel({
          id: res?.id || `ch-${Date.now()}`,
          teamId: targetTeamId,
          name: name.trim(),
          description: description.trim(),
          type,
          visibility: isPrivate ? "private" : "public",
          isPinned: false,
          isDefault: false,
          isLocked,
          postingPermission,
          permissions: effectivePerms,
          ...(res ? serverPermissionFields(toChannel(res)) : {}),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          unreadCount: 0,
        });

        toast.success("Channel created");
        onOpenChange(false);
      }
    } catch {
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
      <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto pr-2">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TypeIcon className="size-4" />
            {isEdit ? "Edit Channel" : "Create Channel"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update channel settings, meeting access, and permissions."
              : "Create a channel for conversations, video meetings, and announcements."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {/* Channel Name */}
          <div className="space-y-1.5">
            <Label htmlFor="channel-name">Channel Name</Label>
            <div className="relative">
              <TypeIcon className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="channel-name"
                placeholder="e.g. general, sprint-planning"
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
              Lowercase letters, numbers, and dashes only.
            </p>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="channel-desc">
              Description <span className="text-muted-foreground text-xs">(optional)</span>
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
          <div className="space-y-1.5">
            <Label>Channel Type</Label>
            <Select value={type} onValueChange={(v) => setType(v as typeof type)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">
                  <div className="flex items-center gap-2">
                    <Hash className="size-3.5 text-sky-500" />
                    <span>Text — Messages, files, GIFs, and polls</span>
                  </div>
                </SelectItem>
                <SelectItem value="voice">
                  <div className="flex items-center gap-2">
                    <Volume2 className="size-3.5 text-emerald-500" />
                    <span>Voice Space — Live WebRTC audio room</span>
                  </div>
                </SelectItem>
                <SelectItem value="announcement">
                  <div className="flex items-center gap-2">
                    <Bell className="size-3.5 text-amber-500" />
                    <span>Announcement — Broadcast channel</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Access & Channel Governance Section */}
          <div className="space-y-2.5 pt-1 border-t border-border/40">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Access & Governance
            </span>

            {/* Private Channel Switch */}
            <div className="flex items-center justify-between rounded-lg border border-border/40 p-3 bg-card/40">
              <div className="space-y-0.5 pr-2">
                <div className="flex items-center gap-1.5">
                  <Lock className="size-3.5 text-muted-foreground" />
                  <Label className="text-sm font-medium cursor-pointer">
                    Private Channel
                  </Label>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Only invited members can view and join this channel.
                </p>
              </div>
              <Switch checked={isPrivate} onCheckedChange={setIsPrivate} />
            </div>

            {/* Locked Channel Switch */}
            <div className="flex items-center justify-between rounded-lg border border-amber-500/30 p-3 bg-amber-500/5">
              <div className="space-y-0.5 pr-2">
                <div className="flex items-center gap-1.5">
                  <Shield className="size-3.5 text-amber-500" />
                  <Label className="text-sm font-medium cursor-pointer text-amber-600 dark:text-amber-400">
                    Lock Channel
                  </Label>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  When locked, only admins and moderators can post. Video meetings will be disabled.
                </p>
              </div>
              <Switch checked={isLocked} onCheckedChange={setIsLocked} />
            </div>

            {/* Allow Meetings & Calls Switch */}
            <div className={cn(
              "flex items-center justify-between rounded-lg border p-3 transition-colors",
              isLocked
                ? "border-border/30 bg-muted/30 opacity-70"
                : "border-blue-500/30 bg-blue-500/5"
            )}>
              <div className="space-y-0.5 pr-2">
                <div className="flex items-center gap-1.5">
                  {allowMeetings && !isLocked ? (
                    <Video className="size-3.5 text-blue-500" />
                  ) : (
                    <VideoOff className="size-3.5 text-muted-foreground" />
                  )}
                  <Label className="text-sm font-medium cursor-pointer">
                    Allow Meetings (Meet)
                  </Label>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  {isLocked
                    ? "Meetings are disabled while this channel is locked."
                    : "Allow members to launch live video calls in this channel."}
                </p>
              </div>
              <Switch
                checked={!isLocked && allowMeetings}
                disabled={isLocked}
                onCheckedChange={setAllowMeetings}
              />
            </div>
          </div>

          {/* Team selector — shown for private channels when multiple teams exist */}
          {isPrivate && teams.length > 1 && !isEdit && (
            <div className="space-y-1.5">
              <Label>Team</Label>
              <Select
                value={selectedTeamId || activeTeamId || ""}
                onValueChange={setSelectedTeamId}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a team" />
                </SelectTrigger>
                <SelectContent>
                  {teams.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Advanced OpenFGA Granular Permissions Toggle */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setShowAdvancedPerms(!showAdvancedPerms)}
              className="flex w-full items-center justify-between text-xs font-medium text-muted-foreground hover:text-foreground py-1 px-0.5"
            >
              <span>Granular Channel Permissions (OpenFGA)</span>
              {showAdvancedPerms ? (
                <ChevronUp className="size-3.5" />
              ) : (
                <ChevronDown className="size-3.5" />
              )}
            </button>

            {showAdvancedPerms && (
              <div className="mt-2 space-y-2 rounded-lg border border-border/40 p-3 bg-muted/20 animate-in fade-in duration-150">
                {/* Posting policy */}
                <div className="space-y-1 pb-2 border-b border-border/30">
                  <Label className="text-xs">Posting Policy</Label>
                  <Select
                    value={postingPermission}
                    onValueChange={(v) => setPostingPermission(v as ChannelPostingPermission)}
                  >
                    <SelectTrigger className="h-7 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="everyone">Everyone can post</SelectItem>
                      <SelectItem value="admins_only">Admins & Moderators only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Granular switches */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <Image className="size-3" />
                      Attach Media & Files
                    </span>
                    <Switch
                      checked={permissions.send_media}
                      onCheckedChange={() => handleTogglePerm("send_media")}
                      className="scale-75"
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <Smile className="size-3" />
                      Send GIFs
                    </span>
                    <Switch
                      checked={permissions.send_gifs}
                      onCheckedChange={() => handleTogglePerm("send_gifs")}
                      className="scale-75"
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <BarChart2 className="size-3" />
                      Create Polls
                    </span>
                    <Switch
                      checked={permissions.create_polls}
                      onCheckedChange={() => handleTogglePerm("create_polls")}
                      className="scale-75"
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <MessageSquare className="size-3" />
                      Reply in Threads
                    </span>
                    <Switch
                      checked={permissions.reply_threads}
                      onCheckedChange={() => handleTogglePerm("reply_threads")}
                      className="scale-75"
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <AtSign className="size-3" />
                      Mention @everyone
                    </span>
                    <Switch
                      checked={permissions.mention_everyone}
                      onCheckedChange={() => handleTogglePerm("mention_everyone")}
                      className="scale-75"
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <Video className="size-3" />
                      Share Screen & Webcam
                    </span>
                    <Switch
                      checked={permissions.share_screen && permissions.video_camera}
                      onCheckedChange={(val) => {
                        setPermissions((prev) => ({
                          ...prev,
                          share_screen: val,
                          video_camera: val,
                        }));
                      }}
                      className="scale-75"
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <Shield className="size-3" />
                      Rich Link Embeds & History
                    </span>
                    <Switch
                      checked={permissions.embed_links && permissions.read_history}
                      onCheckedChange={(val) => {
                        setPermissions((prev) => ({
                          ...prev,
                          embed_links: val,
                          read_history: val,
                        }));
                      }}
                      className="scale-75"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Live Preview */}
          <div className="flex flex-wrap items-center gap-1.5 rounded-md bg-accent/40 px-3 py-2 text-xs">
            <TypeIcon className="size-3.5 text-muted-foreground" />
            <span className="font-medium text-foreground">
              #{name || "channel-name"}
            </span>

            {isPrivate && (
              <Badge variant="secondary" className="text-[10px] py-0 h-4">
                Private
              </Badge>
            )}

            {isLocked && (
              <Badge variant="outline" className="text-[10px] py-0 h-4 border-amber-500/40 text-amber-500 bg-amber-500/10">
                Locked
              </Badge>
            )}

            {!isLocked && allowMeetings && (
              <Badge variant="outline" className="text-[10px] py-0 h-4 border-blue-500/40 text-blue-500 bg-blue-500/10">
                Meet Enabled
              </Badge>
            )}

            {(!allowMeetings || isLocked) && (
              <Badge variant="outline" className="text-[10px] py-0 h-4 border-border text-muted-foreground">
                Meet Disabled
              </Badge>
            )}
          </div>

          <DialogFooter className="pt-2">
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
