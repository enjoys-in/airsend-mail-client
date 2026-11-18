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
import type { Channel } from "../_lib/chat-types";

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

            {/* ── Tab: Permissions ── */}
            <TabsContent value="permissions" className="m-0 space-y-4">
              <div className="rounded-xl border border-border/60 bg-card p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-xs font-semibold text-foreground block">
                      Who can post messages
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      Restrict sending to admins and moderators for broadcast channels
                    </span>
                  </div>
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
                      <span className="block font-medium">Admins Only</span>
                      <span className="text-[10px] opacity-80">Moderators and owners only</span>
                    </div>
                  </button>
                </div>
              </div>

              <div className="rounded-xl border border-border/60 bg-card p-4 flex items-center justify-between">
                <div className="space-y-0.5 pr-4">
                  <span className="text-xs font-semibold text-foreground block">
                    Lock Channel
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    Prevent any new messages, reactions, or edits in this channel
                  </span>
                </div>
                <Switch
                  checked={isLocked}
                  onCheckedChange={setIsLocked}
                  className="data-[state=checked]:bg-primary"
                />
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
