"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Hash, Megaphone, Volume2, Globe, Lock, EyeOff, MessageSquareOff, Trash2, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { workspaceApi, apiErrorMessage, toChannel } from "../../../../../_lib/api";
import { useChatStore } from "../../../../../_lib/chat-store";
import { useChannelPermissions, settingsPath } from "../../../../../_lib/use-access";
import { confirmAction } from "../../../../../_components/ConfirmHost";
import type { Channel } from "../../../../../_lib/chat-types";
import { useTeamSettings } from "../../_components/use-team-settings";
import { LoadingBlock, LockedHint, NoPermission, SaveBar, SettingsCard } from "../../_components/settings-ui";
import { ChannelOverridesEditor } from "../../_components/channel-overrides";
import { LegacyChannelMatrix } from "../../_components/legacy-matrix";

interface Draft {
  name: string;
  topic: string;
  description: string;
  type: Channel["type"];
  visibility: Channel["visibility"];
  postingPermission: "everyone" | "admins_only";
  isLocked: boolean;
  isArchived: boolean;
}

const draftOf = (c: Channel): Draft => ({
  name: c.name,
  topic: c.topic ?? "",
  description: c.description ?? "",
  type: c.type,
  visibility: c.visibility,
  postingPermission: c.postingPermission ?? "everyone",
  isLocked: c.isLocked,
  isArchived: !!c.isArchived,
});

const slug = (v: string) => v.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9_-]/g, "");

export default function ChannelSettingsPage() {
  const s = useTeamSettings();
  const router = useRouter();
  const { channelId } = useParams<{ channelId: string }>();
  const channel = s.channels.find((c) => c.id === channelId);
  const perms = useChannelPermissions(channel);

  const [draft, setDraft] = useState<Draft | null>(channel ? draftOf(channel) : null);
  const [saving, setSaving] = useState(false);
  const original = channel ? draftOf(channel) : null;
  const dirty = !!draft && !!original && JSON.stringify(draft) !== JSON.stringify(original);

  useEffect(() => {
    if (channel && (!draft || !dirty)) setDraft(draftOf(channel));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channel]);

  if (!channel || !draft || !original) {
    return s.channels.length === 0 ? (
      <LoadingBlock />
    ) : (
      <div className="py-16 text-center">
        <p className="text-sm text-muted-foreground">This channel no longer exists, or you can&apos;t see it.</p>
        <Link href={settingsPath.team(s.teamId, "channels")} className="mt-2 inline-block text-xs text-primary hover:underline">
          Back to channels
        </Link>
      </div>
    );
  }

  const canGeneral = perms.canManage;
  const canOverrides = perms.canEditOverrides;
  if (!canGeneral && !canOverrides) return <NoPermission what="manage this channel" />;

  const set = (patch: Partial<Draft>) => setDraft((d) => (d ? { ...d, ...patch } : d));

  const save = async () => {
    const name = slug(draft.name);
    if (!name) {
      toast.error("The channel needs a name");
      return;
    }
    setSaving(true);
    try {
      const saved = toChannel(
        await workspaceApi.updateChannel(channel.id, { ...draft, name, topic: draft.topic.trim(), description: draft.description.trim() }, ""),
      );
      useChatStore.setState((st) => ({
        channels: st.channels.map((c) =>
          c.id === saved.id ? { ...saved, myPermissions: saved.myPermissions ?? c.myPermissions, isPinned: c.isPinned, unreadCount: c.unreadCount } : c,
        ),
      }));
      // Lock / announcement / visibility change what everyone (me included) may do.
      const chat = useChatStore.getState();
      void chat.fetchChannels(channel.teamId, chat.currentUserId);
      toast.success("Channel saved");
    } catch (err) {
      toast.error(apiErrorMessage(err, "Could not save the channel"));
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    const ok = await confirmAction({
      title: `Delete #${channel.name}?`,
      description: "All of its messages, pins and files are removed for everyone. This cannot be undone.",
      confirmLabel: "Delete channel",
      destructive: true,
    });
    if (!ok) return;
    try {
      await workspaceApi.deleteChannel(channel.id, "");
      useChatStore.setState((st) => ({ channels: st.channels.filter((c) => c.id !== channel.id) }));
      router.push(settingsPath.team(s.teamId, "channels"));
      toast.success("Channel deleted");
    } catch (err) {
      toast.error(apiErrorMessage(err, "Could not delete the channel"));
    }
  };

  const Icon = channel.type === "voice" ? Volume2 : channel.type === "announcement" ? Megaphone : Hash;

  return (
    <>
      <Link
        href={settingsPath.team(s.teamId, "channels")}
        className="mb-3 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" /> Channels
      </Link>
      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <Icon className="size-5 shrink-0 text-muted-foreground" />
          <h1 className="truncate text-lg font-semibold">{channel.name}</h1>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href={`/v2/workspace/c/${channel.id}`}>
            <ExternalLink className="mr-1.5 size-3.5" /> Open
          </Link>
        </Button>
      </div>

      <Tabs defaultValue={canGeneral ? "overview" : "permissions"}>
        <TabsList className="mb-4">
          {canGeneral && <TabsTrigger value="overview">Overview</TabsTrigger>}
          {canOverrides && <TabsTrigger value="permissions">Permissions</TabsTrigger>}
          {canGeneral && <TabsTrigger value="danger">Delete</TabsTrigger>}
        </TabsList>

        {canGeneral && (
          <TabsContent value="overview" className="space-y-4">
            <SettingsCard title="Details">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="ch-name">Name</Label>
                  <div className="relative">
                    <Hash className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                    <Input id="ch-name" value={draft.name} maxLength={80} onChange={(e) => set({ name: e.target.value })} className="pl-8" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="ch-topic">Topic</Label>
                  <Input id="ch-topic" value={draft.topic} maxLength={250} onChange={(e) => set({ topic: e.target.value })} placeholder="What's being discussed right now" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="ch-desc">Description</Label>
                  <Textarea id="ch-desc" value={draft.description} rows={3} maxLength={1000} onChange={(e) => set({ description: e.target.value })} className="resize-none" />
                </div>
              </div>
            </SettingsCard>

            <SettingsCard title="Type & visibility">
              <div className="grid gap-4 sm:grid-cols-2">
                <ChoiceGroup
                  label="Type"
                  value={draft.type}
                  onChange={(v) => set({ type: v as Channel["type"] })}
                  options={[
                    { value: "text", label: "Text", icon: Hash },
                    { value: "announcement", label: "Announcement", icon: Megaphone },
                    { value: "voice", label: "Voice", icon: Volume2 },
                  ]}
                />
                <ChoiceGroup
                  label="Visibility"
                  value={draft.visibility}
                  onChange={(v) => set({ visibility: v as Channel["visibility"] })}
                  options={[
                    { value: "public", label: "Every member", icon: Globe },
                    { value: "private", label: "Private", icon: EyeOff },
                  ]}
                />
              </div>
              {draft.visibility === "private" && original.visibility !== "private" && (
                <p className="mt-3 text-xs text-amber-600 dark:text-amber-400">
                  After saving, only roles and members allowed View Channel in Permissions can see it.
                </p>
              )}
            </SettingsCard>

            <SettingsCard title="Posting">
              <div className="space-y-4">
                <ToggleRow
                  icon={MessageSquareOff}
                  title="Only moderators can post"
                  description="Members can read and react; only members with Manage Messages can post."
                  checked={draft.postingPermission === "admins_only"}
                  onChange={(v) => set({ postingPermission: v ? "admins_only" : "everyone" })}
                />
                <ToggleRow
                  icon={Lock}
                  title="Lock channel"
                  description="Freezes the conversation and disables calls. Members with Manage Messages can still post."
                  checked={draft.isLocked}
                  onChange={(v) => set({ isLocked: v })}
                />
                <ToggleRow
                  icon={EyeOff}
                  title="Archive channel"
                  description="Keeps history readable but hides it from the channel list."
                  checked={draft.isArchived}
                  onChange={(v) => set({ isArchived: v })}
                />
              </div>
            </SettingsCard>

            <SaveBar visible={dirty} saving={saving} onReset={() => setDraft(original)} onSave={save} />
          </TabsContent>
        )}

        {canOverrides && (
          <TabsContent value="permissions">
            {s.customRoles ? (
              <ChannelOverridesEditor channel={channel} s={s} />
            ) : (
              <LegacyChannelMatrix channel={channel} canEdit={canOverrides} />
            )}
          </TabsContent>
        )}

        {canGeneral && (
          <TabsContent value="danger">
            <SettingsCard danger title="Delete channel" description="Removes the channel and everything in it for everyone.">
              {channel.isDefault ? (
                <LockedHint>The team&apos;s default channel can&apos;t be deleted</LockedHint>
              ) : (
                <Button variant="destructive" size="sm" onClick={remove}>
                  <Trash2 className="mr-1.5 size-4" /> Delete #{channel.name}
                </Button>
              )}
            </SettingsCard>
          </TabsContent>
        )}
      </Tabs>
    </>
  );
}

function ChoiceGroup({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string; icon: React.ElementType }[];
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <div role="radiogroup" aria-label={label} className="flex flex-col gap-1.5">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={value === o.value}
            onClick={() => onChange(o.value)}
            className={cn(
              "flex items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm transition-colors",
              value === o.value
                ? "border-primary bg-primary/10 font-medium text-primary"
                : "border-border/60 text-muted-foreground hover:bg-accent/40",
            )}
          >
            <o.icon className="size-4 shrink-0" />
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function ToggleRow({
  icon: Icon,
  title,
  description,
  checked,
  onChange,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4">
      <div className="flex min-w-0 gap-2.5">
        <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
        <div>
          <p className="text-sm font-medium">{title}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} aria-label={title} />
    </label>
  );
}
