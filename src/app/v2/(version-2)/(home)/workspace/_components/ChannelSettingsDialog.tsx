"use client";

import React, { useState } from "react";
import {
  Settings,
  Hash,
  Volume2,
  Megaphone,
  Lock,
  Globe,
  Shield,
  Webhook,
  Archive,
  Trash2,
  Copy,
  Check,
  Plus,
  AlertTriangle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useChatStore } from "../_lib/chat-store";
import type {
  Channel,
  MemberRole,
  ChannelPermissionKey,
  ChannelPermissions,
  ChannelRolePermissionOverrides,
} from "../_lib/chat-types";
import {
  DEFAULT_CHANNEL_PERMISSIONS,
  PERMISSION_METADATA,
} from "../_lib/permissions";

interface ChannelSettingsDialogProps {
  channel: Channel;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ChannelSettingsDialog({
  channel,
  open,
  onOpenChange,
}: ChannelSettingsDialogProps) {
  const { updateChannel, deleteChannel } = useChatStore();

  const [activeTab, setActiveTab] = useState("general");
  const [name, setName] = useState(channel.name);
  const [topic, setTopic] = useState(channel.topic || "");
  const [description, setDescription] = useState(channel.description || "");
  const [channelType, setChannelType] = useState<Channel["type"]>(channel.type);
  const [visibility, setVisibility] = useState<Channel["visibility"]>(channel.visibility);
  const [postingPermission, setPostingPermission] = useState<"everyone" | "admins_only">(
    channel.postingPermission || "everyone"
  );
  const [isLocked, setIsLocked] = useState(channel.isLocked);
  const [isArchived, setIsArchived] = useState(channel.isArchived || false);

  // Discord & OpenFGA-inspired permissions state
  const [permissions, setPermissions] = useState<Partial<ChannelPermissions>>(
    channel.permissions || { ...DEFAULT_CHANNEL_PERMISSIONS }
  );
  const [rolePermissions, setRolePermissions] = useState<ChannelRolePermissionOverrides>(
    channel.rolePermissions || {
      owner: {
        ...DEFAULT_CHANNEL_PERMISSIONS,
        mention_everyone: true,
        manage_channel: true,
        manage_messages: true,
        mute_participants: true,
        manage_integrations: true,
        view_audit_logs: true,
      },
      admin: {
        ...DEFAULT_CHANNEL_PERMISSIONS,
        mention_everyone: true,
        manage_channel: true,
        manage_messages: true,
        mute_participants: true,
        manage_integrations: true,
        view_audit_logs: true,
      },
      moderator: {
        ...DEFAULT_CHANNEL_PERMISSIONS,
        mention_everyone: true,
        manage_messages: true,
        mute_participants: true,
      },
      member: { ...DEFAULT_CHANNEL_PERMISSIONS },
      guest: {
        ...DEFAULT_CHANNEL_PERMISSIONS,
        send_media: false,
        send_gifs: false,
        create_polls: false,
        start_calls: false,
        share_screen: false,
        video_camera: false,
        create_channels: false,
      },
    }
  );
  const [selectedRole, setSelectedRole] = useState<MemberRole | "@everyone">("@everyone");

  // Webhooks state
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [mockWebhooks, setMockWebhooks] = useState([
    {
      id: "wh-1",
      name: `${channel.name}-alerts`,
      url: `https://meet.airsend.in/api/v1/workflows/incoming/wh_tok_${channel.id.replace(/-/g, "").slice(0, 16)}`,
      createdAt: "3 days ago",
    },
  ]);
  const [newWebhookName, setNewWebhookName] = useState("");
  const [isAddingWebhook, setIsAddingWebhook] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleSaveGeneral = async () => {
    setIsSaving(true);
    await updateChannel(channel.id, {
      name: name.trim().toLowerCase().replace(/\s+/g, "-"),
      topic: topic.trim(),
      description: description.trim(),
      type: channelType,
      visibility,
      postingPermission,
      isLocked,
      isArchived,
      permissions,
      rolePermissions,
    });
    setIsSaving(false);
    onOpenChange(false);
  };

  const handleCreateWebhook = () => {
    if (!newWebhookName.trim()) return;
    const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    setMockWebhooks((prev) => [
      ...prev,
      {
        id: `wh-${Date.now()}`,
        name: newWebhookName.trim(),
        url: `https://meet.airsend.in/api/v1/workflows/incoming/wh_tok_${token}`,
        createdAt: "Just now",
      },
    ]);
    setNewWebhookName("");
    setIsAddingWebhook(false);
  };

  const handleDeleteWebhook = (whId: string) => {
    setMockWebhooks((prev) => prev.filter((w) => w.id !== whId));
  };

  const handleArchiveToggle = async () => {
    const next = !isArchived;
    setIsArchived(next);
    await updateChannel(channel.id, { isArchived: next });
  };

  const handleDeleteChannel = async () => {
    await deleteChannel(channel.id);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[85vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-2 border-b border-border/40">
          <div className="flex items-center gap-2">
            <Settings className="size-5 text-primary" />
            <DialogTitle className="text-base font-bold">
              Channel Settings • #{channel.name}
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs">
            Manage channel metadata, posting policies, integrations, and archiving.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
          <div className="px-6 border-b border-border/40 bg-muted/20">
            <TabsList className="h-10 p-0 bg-transparent gap-4">
              <TabsTrigger
                value="general"
                className="text-xs h-9 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-1 font-semibold"
              >
                General
              </TabsTrigger>
              <TabsTrigger
                value="permissions"
                className="text-xs h-9 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-1 font-semibold"
              >
                Permissions
              </TabsTrigger>
              <TabsTrigger
                value="webhooks"
                className="text-xs h-9 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-1 font-semibold"
              >
                Webhooks ({mockWebhooks.length})
              </TabsTrigger>
              <TabsTrigger
                value="danger"
                className="text-xs h-9 rounded-none border-b-2 border-transparent data-[state=active]:border-destructive data-[state=active]:text-destructive data-[state=active]:bg-transparent px-1 font-semibold"
              >
                Danger Zone
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {/* ── Tab: General ── */}
            <TabsContent value="general" className="m-0 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Channel Name</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">#</span>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. announcements"
                    className="pl-7 text-xs h-9"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Topic</label>
                <Input
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Set a topic for this channel (e.g. Q4 Deliverables & Roadmap)"
                  className="text-xs h-9"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Description</label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What is this channel about?"
                  className="text-xs resize-none h-20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Channel Type</label>
                  <div className="flex flex-col gap-1.5">
                    {[
                      { id: "text", label: "Text Channel", icon: Hash },
                      { id: "announcement", label: "Announcement", icon: Megaphone },
                      { id: "voice", label: "Voice / Audio", icon: Volume2 },
                    ].map((t) => {
                      const Icon = t.icon;
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setChannelType(t.id as any)}
                          className={`flex items-center gap-2 p-2 rounded-lg border text-left text-xs transition-all ${
                            channelType === t.id
                              ? "border-primary bg-primary/10 text-primary font-semibold"
                              : "border-border/60 hover:bg-muted/50 text-muted-foreground"
                          }`}
                        >
                          <Icon className="size-3.5 shrink-0" />
                          <span>{t.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Visibility</label>
                  <div className="flex flex-col gap-1.5">
                    {[
                      { id: "public", label: "Public (All members)", icon: Globe },
                      { id: "private", label: "Private (Invite only)", icon: Lock },
                    ].map((v) => {
                      const Icon = v.icon;
                      return (
                        <button
                          key={v.id}
                          type="button"
                          onClick={() => setVisibility(v.id as any)}
                          className={`flex items-center gap-2 p-2 rounded-lg border text-left text-xs transition-all ${
                            visibility === v.id
                              ? "border-primary bg-primary/10 text-primary font-semibold"
                              : "border-border/60 hover:bg-muted/50 text-muted-foreground"
                          }`}
                        >
                          <Icon className="size-3.5 shrink-0" />
                          <span>{v.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* ── Tab: Permissions (Discord & OpenFGA-inspired) ── */}
            <TabsContent value="permissions" className="m-0 space-y-4">
              {/* 1. Who can post messages */}
              <div className="rounded-xl border border-border/60 bg-card p-4 space-y-3">
                <div className="space-y-0.5">
                  <span className="text-xs font-semibold text-foreground block">
                    Who can post messages
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    Control default messaging access for this channel
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setPostingPermission("everyone")}
                    className={`flex items-center gap-2 p-3 rounded-lg border text-left text-xs transition-all ${
                      postingPermission === "everyone"
                        ? "border-primary bg-primary/10 text-primary font-semibold"
                        : "border-border/60 hover:bg-muted/40 text-muted-foreground"
                    }`}
                  >
                    <Globe className="size-4 shrink-0" />
                    <div>
                      <span className="block font-medium">Everyone</span>
                      <span className="text-[10px] opacity-80">All team members can talk</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPostingPermission("admins_only")}
                    className={`flex items-center gap-2 p-3 rounded-lg border text-left text-xs transition-all ${
                      postingPermission === "admins_only"
                        ? "border-primary bg-primary/10 text-primary font-semibold"
                        : "border-border/60 hover:bg-muted/40 text-muted-foreground"
                    }`}
                  >
                    <Shield className="size-4 shrink-0" />
                    <div>
                      <span className="block font-medium">Admins & Moderators Only</span>
                      <span className="text-[10px] opacity-80">Announcement / broadcast mode</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* 2. Channel Lock Switch with Warning */}
              <div className="rounded-xl border border-border/60 bg-card p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5 pr-4">
                    <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <Lock className="size-3.5 text-amber-500" />
                      Lock Channel
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      Temporarily freeze all conversations and activity in #{channel.name}
                    </span>
                  </div>
                  <Switch
                    checked={isLocked}
                    onCheckedChange={setIsLocked}
                    className="data-[state=checked]:bg-amber-500"
                  />
                </div>

                {isLocked && (
                  <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-3 text-xs text-amber-700 dark:text-amber-300 flex items-start gap-2">
                    <AlertTriangle className="size-4 shrink-0 mt-0.5 text-amber-500" />
                    <div>
                      <p className="font-semibold text-amber-600 dark:text-amber-400">Channel is Currently Locked</p>
                      <p className="text-[11px] opacity-90 mt-0.5">
                        Only team owners, admins, and moderators can send messages. Video meetings and voice calls are disabled while locked. Regular members and guests will see the locked warning banner.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* 3. Discord-Style OpenFGA Granular Role Permissions */}
              <div className="rounded-xl border border-border/60 bg-card p-4 space-y-4">
                <div className="space-y-0.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <Shield className="size-3.5 text-primary" />
                      OpenFGA Role & Permission Overrides
                    </span>
                    <Badge variant="outline" className="text-[10px] uppercase font-mono tracking-wider border-primary/30 text-primary">
                      Discord-Style RBAC
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Define granular capabilities for roles. Permissions are evaluated against OpenFGA Zanzibar relationship tuples.
                  </p>
                </div>

                {/* Role Selector Pills */}
                <div className="flex flex-wrap items-center gap-1.5 p-1 bg-muted/40 rounded-lg border border-border/40">
                  {(["@everyone", "admin", "moderator", "member", "guest"] as const).map((r) => {
                    const isSelected = selectedRole === r;
                    return (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setSelectedRole(r)}
                        className={`px-3 py-1 text-xs rounded-md font-medium transition-all ${
                          isSelected
                            ? "bg-background text-foreground shadow-sm font-semibold border border-border/60"
                            : "text-muted-foreground hover:text-foreground hover:bg-background/40"
                        }`}
                      >
                        {r === "@everyone" ? "@everyone (Default)" : `@${r}`}
                      </button>
                    );
                  })}
                </div>

                {/* Role Note */}
                <div className="px-3 py-2 bg-muted/20 border border-border/40 rounded-lg text-[11px] text-muted-foreground flex items-center justify-between">
                  <span>
                    Configuring permissions for{" "}
                    <strong className="text-foreground">
                      {selectedRole === "@everyone" ? "@everyone" : `@${selectedRole}`}
                    </strong>
                    {selectedRole === "admin" && " (Admins inherit all permissions by default)"}
                  </span>
                  <span className="font-mono text-[10px] text-primary/80">
                    tuple: (channel, #{channel.name}, *, {selectedRole === "@everyone" ? "@everyone" : `role:${selectedRole}`})
                  </span>
                </div>

                {/* Granular Permissions List */}
                <div className="space-y-4 divide-y divide-border/40 pt-1">
                  {/* Category: Text & Media */}
                  <div className="space-y-2.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
                      Text & Media Permissions
                    </span>

                    {(
                      [
                        "send_messages",
                        "send_media",
                        "send_gifs",
                        "create_polls",
                        "add_reactions",
                        "use_emojis",
                        "reply_threads",
                        "embed_links",
                        "read_history",
                        "mention_everyone",
                      ] as ChannelPermissionKey[]
                    ).map((key) => {
                      const meta = PERMISSION_METADATA[key];
                      const currentValue =
                        selectedRole === "@everyone"
                          ? permissions[key] ?? DEFAULT_CHANNEL_PERMISSIONS[key]
                          : rolePermissions[selectedRole]?.[key] ??
                            permissions[key] ??
                            DEFAULT_CHANNEL_PERMISSIONS[key];

                      return (
                        <div
                          key={key}
                          className="flex items-center justify-between py-1.5 hover:bg-muted/20 px-2 rounded-lg transition-colors"
                        >
                          <div className="space-y-0.5 pr-4">
                            <span className="text-xs font-medium text-foreground block">
                              {meta.name}
                            </span>
                            <span className="text-[10px] text-muted-foreground block">
                              {meta.description}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="outline"
                              className={`text-[9px] font-mono ${
                                currentValue
                                  ? "text-emerald-500 border-emerald-500/30 bg-emerald-500/5"
                                  : "text-red-500 border-red-500/30 bg-red-500/5"
                              }`}
                            >
                              {currentValue ? "ALLOW" : "DENY"}
                            </Badge>
                            <Switch
                              checked={currentValue}
                              onCheckedChange={(val) => {
                                if (selectedRole === "@everyone") {
                                  setPermissions((prev) => ({ ...prev, [key]: val }));
                                } else {
                                  setRolePermissions((prev) => ({
                                    ...prev,
                                    [selectedRole]: {
                                      ...(prev[selectedRole] || {}),
                                      [key]: val,
                                    },
                                  }));
                                }
                              }}
                              className="data-[state=checked]:bg-primary"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Category: Voice & Calls */}
                  <div className="space-y-2.5 pt-3">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
                      Voice & Call Permissions
                    </span>

                    {(
                      [
                        "connect_voice",
                        "speak_voice",
                        "start_calls",
                        "share_screen",
                        "video_camera",
                        "mute_participants",
                      ] as ChannelPermissionKey[]
                    ).map((key) => {
                      const meta = PERMISSION_METADATA[key];
                      const currentValue =
                        selectedRole === "@everyone"
                          ? permissions[key] ?? DEFAULT_CHANNEL_PERMISSIONS[key]
                          : rolePermissions[selectedRole]?.[key] ??
                            permissions[key] ??
                            DEFAULT_CHANNEL_PERMISSIONS[key];

                      return (
                        <div
                          key={key}
                          className="flex items-center justify-between py-1.5 hover:bg-muted/20 px-2 rounded-lg transition-colors"
                        >
                          <div className="space-y-0.5 pr-4">
                            <span className="text-xs font-medium text-foreground block">
                              {meta.name}
                            </span>
                            <span className="text-[10px] text-muted-foreground block">
                              {meta.description}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="outline"
                              className={`text-[9px] font-mono ${
                                currentValue
                                  ? "text-emerald-500 border-emerald-500/30 bg-emerald-500/5"
                                  : "text-red-500 border-red-500/30 bg-red-500/5"
                              }`}
                            >
                              {currentValue ? "ALLOW" : "DENY"}
                            </Badge>
                            <Switch
                              checked={currentValue}
                              onCheckedChange={(val) => {
                                if (selectedRole === "@everyone") {
                                  setPermissions((prev) => ({ ...prev, [key]: val }));
                                } else {
                                  setRolePermissions((prev) => ({
                                    ...prev,
                                    [selectedRole]: {
                                      ...(prev[selectedRole] || {}),
                                      [key]: val,
                                    },
                                  }));
                                }
                              }}
                              className="data-[state=checked]:bg-primary"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Category: Moderation & Management */}
                  <div className="space-y-2.5 pt-3">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
                      Channel Management & Moderation
                    </span>

                    {(
                      [
                        "manage_channel",
                        "manage_messages",
                        "create_channels",
                        "manage_integrations",
                        "view_audit_logs",
                      ] as ChannelPermissionKey[]
                    ).map((key) => {
                      const meta = PERMISSION_METADATA[key];
                      const currentValue =
                        selectedRole === "@everyone"
                          ? permissions[key] ?? DEFAULT_CHANNEL_PERMISSIONS[key]
                          : rolePermissions[selectedRole]?.[key] ??
                            permissions[key] ??
                            DEFAULT_CHANNEL_PERMISSIONS[key];

                      return (
                        <div
                          key={key}
                          className="flex items-center justify-between py-1.5 hover:bg-muted/20 px-2 rounded-lg transition-colors"
                        >
                          <div className="space-y-0.5 pr-4">
                            <span className="text-xs font-medium text-foreground block">
                              {meta.name}
                            </span>
                            <span className="text-[10px] text-muted-foreground block">
                              {meta.description}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="outline"
                              className={`text-[9px] font-mono ${
                                currentValue
                                  ? "text-emerald-500 border-emerald-500/30 bg-emerald-500/5"
                                  : "text-red-500 border-red-500/30 bg-red-500/5"
                              }`}
                            >
                              {currentValue ? "ALLOW" : "DENY"}
                            </Badge>
                            <Switch
                              checked={currentValue}
                              onCheckedChange={(val) => {
                                if (selectedRole === "@everyone") {
                                  setPermissions((prev) => ({ ...prev, [key]: val }));
                                } else {
                                  setRolePermissions((prev) => ({
                                    ...prev,
                                    [selectedRole]: {
                                      ...(prev[selectedRole] || {}),
                                      [key]: val,
                                    },
                                  }));
                                }
                              }}
                              className="data-[state=checked]:bg-primary"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* ── Tab: Webhooks ── */}
            <TabsContent value="webhooks" className="m-0 space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-xs font-semibold text-foreground block">
                    Incoming Webhooks
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    Post automated notifications directly into #{channel.name} via HTTP POST
                  </span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsAddingWebhook(true)}
                  className="h-7 text-xs gap-1 border-primary/30 text-primary hover:bg-primary/10"
                >
                  <Plus className="size-3" />
                  Add webhook
                </Button>
              </div>

              {isAddingWebhook && (
                <div className="rounded-xl border border-primary/40 bg-primary/5 p-3.5 space-y-2">
                  <span className="text-xs font-semibold text-foreground block">New Webhook</span>
                  <div className="flex gap-2">
                    <Input
                      value={newWebhookName}
                      onChange={(e) => setNewWebhookName(e.target.value)}
                      placeholder="e.g. github-ci-cd"
                      className="text-xs h-8 bg-background"
                    />
                    <Button
                      size="sm"
                      onClick={handleCreateWebhook}
                      className="h-8 text-xs bg-primary text-primary-foreground font-semibold"
                    >
                      Create
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setIsAddingWebhook(false)}
                      className="h-8 text-xs"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                {mockWebhooks.map((wh) => (
                  <div
                    key={wh.id}
                    className="rounded-xl border border-border/60 bg-card p-3 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Webhook className="size-3.5 text-blue-500" />
                        <span className="text-xs font-semibold text-foreground">{wh.name}</span>
                        <Badge variant="outline" className="text-[10px] py-0 px-1 text-muted-foreground">
                          {wh.createdAt}
                        </Badge>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDeleteWebhook(wh.id)}
                        className="size-7 text-muted-foreground hover:text-red-500"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>

                    <div className="flex items-center justify-between rounded-lg bg-muted/60 p-2 text-[11px] font-mono text-muted-foreground">
                      <span className="truncate pr-2 select-all">{wh.url}</span>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          navigator.clipboard?.writeText(wh.url);
                          setCopiedToken(wh.id);
                          setTimeout(() => setCopiedToken(null), 2000);
                        }}
                        className="size-6 text-muted-foreground hover:text-foreground shrink-0"
                      >
                        {copiedToken === wh.id ? (
                          <Check className="size-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="size-3.5" />
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* ── Tab: Danger Zone ── */}
            <TabsContent value="danger" className="m-0 space-y-4">
              <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-foreground block">
                      Archive Channel
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      Mark this channel as read-only and hide it from the active channel list.
                    </span>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleArchiveToggle}
                    className={`h-8 text-xs gap-1.5 ${
                      isArchived
                        ? "border-emerald-500/40 text-emerald-500 hover:bg-emerald-500/10"
                        : "border-border text-foreground hover:bg-muted"
                    }`}
                  >
                    <Archive className="size-3.5" />
                    <span>{isArchived ? "Unarchive" : "Archive"}</span>
                  </Button>
                </div>

                <div className="border-t border-destructive/20 pt-4 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-destructive block">
                      Delete Channel
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      Permanently delete #{channel.name} and all its messages. This cannot be undone.
                    </span>
                  </div>
                  {confirmDelete ? (
                    <div className="flex items-center gap-1.5">
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={handleDeleteChannel}
                        className="h-8 text-xs font-bold"
                      >
                        Confirm Delete
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setConfirmDelete(false)}
                        className="h-8 text-xs"
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => setConfirmDelete(true)}
                      className="h-8 text-xs gap-1.5"
                    >
                      <Trash2 className="size-3.5" />
                      Delete
                    </Button>
                  )}
                </div>
              </div>
            </TabsContent>
          </div>

          <DialogFooter className="p-4 border-t border-border/40 bg-muted/10 gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="text-xs h-9"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveGeneral}
              disabled={isSaving}
              className="text-xs h-9 bg-primary text-primary-foreground font-semibold"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
