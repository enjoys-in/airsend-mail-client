"use client";

import React, { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  X,
  Settings2,
  Users,
  Shield,
  Bell,
  Link as LinkIcon,
  Webhook,
  Workflow,
  Palette,
  Trash2,
  ChevronRight,
  UserPlus,
  Crown,
  ShieldCheck,
  UserMinus,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useAppSelector } from "@/store/hooks";
import { useChatStore } from "../_lib/chat-store";
import InviteMemberDialog from "./InviteMemberDialog";
import type { TeamMember, MemberRole } from "../_lib/chat-types";

// ---------------------------------------------------------------------------
// TeamSettingsDialog — full team management dialog
// ---------------------------------------------------------------------------

type SettingsTab =
  | "general"
  | "members"
  | "roles"
  | "notifications"
  | "integrations"
  | "danger";

const TABS: { id: SettingsTab; label: string; icon: React.ElementType }[] = [
  { id: "general", label: "General", icon: Settings2 },
  { id: "members", label: "Members", icon: Users },
  { id: "roles", label: "Roles & Permissions", icon: Shield },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "integrations", label: "Integrations", icon: LinkIcon },
  { id: "danger", label: "Danger Zone", icon: Trash2 },
];

export default function TeamSettingsDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [activeTab, setActiveTab] = useState<SettingsTab>("general");
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const { teams, activeTeamId, members, getTeamMembers } = useChatStore();

  const team = teams.find((t) => t.id === activeTeamId);
  const teamMembers = activeTeamId ? getTeamMembers(activeTeamId) : [];

  if (!team) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl h-[80vh] p-0 gap-0 overflow-hidden">
          <div className="flex h-full">
            {/* Sidebar navigation */}
            <div className="w-52 shrink-0 border-r border-border/40 bg-muted/30">
              <div className="p-4">
                <h3 className="text-sm font-semibold">{team.name}</h3>
                <p className="text-xs text-muted-foreground">Team Settings</p>
              </div>
              <nav className="px-2 space-y-0.5">
                {TABS.map((tab: { id: SettingsTab; label: string; icon: React.ElementType }) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                      activeTab === tab.id
                        ? "bg-accent text-accent-foreground font-medium"
                        : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
                      tab.id === "danger" && "text-red-500 hover:text-red-500",
                    )}
                  >
                    <tab.icon className="size-4" />
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="p-6">
                  {activeTab === "general" && (
                    <GeneralSettings team={team} />
                  )}
                  {activeTab === "members" && (
                    <MembersSettings
                      members={teamMembers}
                      onOpenInvite={() => setInviteDialogOpen(true)}
                    />
                  )}
                  {activeTab === "roles" && <RolesSettings />}
                  {activeTab === "notifications" && (
                    <NotificationsSettings />
                  )}
                  {activeTab === "integrations" && (
                    <IntegrationsSettings />
                  )}
                  {activeTab === "danger" && (
                    <DangerSettings teamName={team.name} />
                  )}
                </div>
              </ScrollArea>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <InviteMemberDialog
        open={inviteDialogOpen}
        onOpenChange={setInviteDialogOpen}
      />
    </>
  );
}

// ---------------------------------------------------------------------------
// General settings
// ---------------------------------------------------------------------------

function GeneralSettings({
  team,
}: {
  team: { name: string; description: string };
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">General Settings</h2>
        <p className="text-sm text-muted-foreground">
          Manage your team&apos;s basic information.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="team-name">Team Name</Label>
          <Input id="team-name" defaultValue={team.name} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="team-desc">Description</Label>
          <Textarea
            id="team-desc"
            defaultValue={team.description}
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label>Team Logo</Label>
          <div className="flex items-center gap-3">
            <div className="flex size-16 items-center justify-center rounded-xl bg-primary text-2xl font-bold text-primary-foreground">
              {team.name.slice(0, 2).toUpperCase()}
            </div>
            <Button variant="outline" size="sm">
              Upload Logo
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label>Privacy</Label>
            <p className="text-xs text-muted-foreground">
              Make this team visible to everyone
            </p>
          </div>
          <Switch defaultChecked />
        </div>

        <Separator />

        <Button>Save Changes</Button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Members settings
// ---------------------------------------------------------------------------

function MembersSettings({
  members,
  onOpenInvite,
}: {
  members: TeamMember[];
  onOpenInvite: () => void;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const currAccount = useAppSelector((s) => s.accounts.currAccount);
  const actorEmail = currAccount?.email ?? "";
  const { activeTeamId, updateMemberRole, removeMember } = useChatStore();

  const filtered = searchQuery.trim()
    ? members.filter(
        (m:any) =>
          m.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.email?.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : members;

  const roleIcon = (role: MemberRole) => {
    switch (role) {
      case "owner":
        return <Crown className="size-3 text-yellow-500" />;
      case "admin":
        return <ShieldCheck className="size-3 text-blue-500" />;
      case "moderator":
        return <Shield className="size-3 text-green-500" />;
      default:
        return null;
    }
  };

  const handleRoleChange = async (memberEmail: string, memberName: string, newRole: MemberRole) => {
    if (!activeTeamId) return;
    const success = await updateMemberRole(activeTeamId, memberEmail, newRole, actorEmail);
    if (success) {
      toast.success(`Updated ${memberName || memberEmail}'s role to ${newRole}`);
    } else {
      toast.error("Failed to update member role");
    }
  };

  const handleRemoveMember = async (memberEmail: string, memberName: string) => {
    if (!activeTeamId) return;
    if (confirm(`Are you sure you want to remove ${memberName || memberEmail} from this team?`)) {
      const success = await removeMember(activeTeamId, memberEmail, actorEmail);
      if (success) {
        toast.success(`Removed ${memberName || memberEmail}`);
      } else {
        toast.error("Failed to remove member");
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Members</h2>
          <p className="text-sm text-muted-foreground">
            {members.length} member{members.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button size="sm" onClick={onOpenInvite}>
          <UserPlus className="mr-1 size-4" />
          Invite
        </Button>
      </div>

      <Input
        placeholder="Search members by name or email..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="h-8"
      />

      <div className="space-y-1">
        {filtered.map((member) => (
          <div
            key={member.id || member.email}
            className="flex items-center gap-3 rounded-md px-3 py-2 hover:bg-accent/50 transition-colors"
          >
            <span className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
              {(member.displayName || member.username || member.email || "?").charAt(0).toUpperCase()}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-medium">
                  {member.displayName || member.username || member.email}
                </span>
                {roleIcon(member.role)}
              </div>
              <span className="text-xs text-muted-foreground">
                {member.email}
              </span>
            </div>
            <Select
              value={member.role}
              onValueChange={(val) =>
                handleRoleChange(member.email, member.displayName, val as MemberRole)
              }
            >
              <SelectTrigger className="w-28 h-7 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="owner">Owner</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="moderator">Moderator</SelectItem>
                <SelectItem value="member">Member</SelectItem>
                <SelectItem value="guest">Guest</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="ghost"
              size="icon"
              className="size-7 hover:bg-destructive/10 hover:text-destructive"
              title="Remove member"
              onClick={() => handleRemoveMember(member.email, member.displayName)}
            >
              <UserMinus className="size-3.5 text-muted-foreground hover:text-destructive" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Roles settings — OpenFGA Zanzibar model
// ---------------------------------------------------------------------------

function RolesSettings() {
  const roles: {
    name: string;
    roleKey: MemberRole;
    hierarchy: number;
    description: string;
    fgaRelation: string;
    permissions: string[];
  }[] = [
    {
      name: "Owner",
      roleKey: "owner",
      hierarchy: 100,
      description: "Full control over the team, members, channels, billing, and root OpenFGA authority",
      fgaRelation: "team#owner",
      permissions: [
        "Manage team",
        "Delete team",
        "Manage billing",
        "Manage roles",
        "Channel admin bypass",
        "Zanzibar root admin",
      ],
    },
    {
      name: "Admin",
      roleKey: "admin",
      hierarchy: 80,
      description: "Can manage members, create channels, configure integrations, and lock channels",
      fgaRelation: "team#admin",
      permissions: [
        "Manage members",
        "Create & edit channels",
        "Lock channels",
        "Manage integrations & webhooks",
        "Bypass channel locks",
      ],
    },
    {
      name: "Moderator",
      roleKey: "moderator",
      hierarchy: 60,
      description: "Content moderation, post in locked channels, and manage channel communications",
      fgaRelation: "team#moderator",
      permissions: [
        "Post in locked channels",
        "Pin & unpin messages",
        "Delete any message",
        "Mention @everyone",
        "Kick & mute participants",
      ],
    },
    {
      name: "Member",
      roleKey: "member",
      hierarchy: 40,
      description: "Standard member with full participation rights in open channels",
      fgaRelation: "team#member",
      permissions: [
        "Send messages",
        "Upload files & media",
        "Send GIFs",
        "Create polls",
        "Connect to voice channels",
        "Start calls",
        "Add reactions",
        "Reply in threads",
      ],
    },
    {
      name: "Guest",
      roleKey: "guest",
      hierarchy: 20,
      description: "External partner or guest with restricted channel permissions",
      fgaRelation: "team#guest",
      permissions: [
        "View assigned channels",
        "Send text messages",
        "Reply in threads",
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <Shield className="size-5 text-primary" />
          <h2 className="text-lg font-semibold">Roles & OpenFGA Permissions</h2>
        </div>
        <p className="text-sm text-muted-foreground mt-0.5">
          Role-based authorization modeled after OpenFGA Zanzibar relationship tuples with hierarchical inheritance.
        </p>
      </div>

      {/* Zanzibar Explanation Card */}
      <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-primary">
          <Workflow className="size-3.5" />
          <span>OpenFGA Zanzibar Relationship Tuples</span>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Access control is evaluated dynamically: higher roles inherit all lower role privileges.
          When a channel is locked or configured for admins only, OpenFGA checks require a <code className="bg-muted px-1 py-0.5 rounded text-primary font-mono text-[11px]">moderator</code> or higher relation to post, while regular members and guests are restricted with an informative alert banner.
        </p>
        <div className="flex flex-wrap gap-1.5 pt-1">
          <span className="font-mono text-[10px] bg-background border px-2 py-0.5 rounded text-muted-foreground">
            owner &gt; admin &gt; moderator &gt; member &gt; guest
          </span>
          <span className="font-mono text-[10px] bg-background border px-2 py-0.5 rounded text-muted-foreground">
            channel:reader &larr; team#member
          </span>
          <span className="font-mono text-[10px] bg-background border px-2 py-0.5 rounded text-muted-foreground">
            channel:writer &larr; team#member
          </span>
          <span className="font-mono text-[10px] bg-background border px-2 py-0.5 rounded text-muted-foreground">
            channel:admin &larr; team#admin
          </span>
        </div>
      </div>

      <div className="space-y-3">
        {roles.map((role) => (
          <div
            key={role.name}
            className="rounded-lg border border-border/40 p-4 space-y-2.5 bg-card/40"
          >
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold">{role.name}</h3>
                  <Badge variant="outline" className="text-[10px] font-mono py-0 h-4 border-primary/30 text-primary">
                    {role.fgaRelation}
                  </Badge>
                  <span className="text-[10px] text-muted-foreground">
                    Level {role.hierarchy}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {role.description}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-1">
              {role.permissions.map((perm) => (
                <Badge key={perm} variant="secondary" className="text-[10px]">
                  {perm}
                </Badge>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Notifications settings
// ---------------------------------------------------------------------------

function NotificationsSettings() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Notifications</h2>
        <p className="text-sm text-muted-foreground">
          Configure how you receive notifications.
        </p>
      </div>

      <div className="space-y-4">
        {[
          {
            label: "All messages",
            desc: "Get notified for every message",
          },
          {
            label: "Mentions & replies",
            desc: "Only when someone mentions you or replies",
          },
          {
            label: "Direct messages",
            desc: "Get notified for DMs",
          },
          {
            label: "Thread updates",
            desc: "Updates on threads you're involved in",
          },
          {
            label: "Push notifications",
            desc: "Receive browser push notifications",
          },
          {
            label: "Sound alerts",
            desc: "Play a sound for new messages",
          },
        ].map((item) => (
          <div
            key={item.label}
            className="flex items-center justify-between"
          >
            <div>
              <Label>{item.label}</Label>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
            </div>
            <Switch defaultChecked />
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Integrations settings
// ---------------------------------------------------------------------------

function IntegrationsSettings() {
  const integrations = [
    {
      name: "Workflows & Automations",
      description: "Parent orchestration engine powering automated triggers, tasks, and incoming/outgoing webhooks",
      icon: Workflow,
      connected: true,
      href: "/v2/workspace/workflows",
    },
    {
      name: "Webhooks",
      description: "Send notifications to external services & configure channel hooks",
      icon: Webhook,
      connected: true,
      href: "/v2/workspace/workflows",
    },
    {
      name: "API Access",
      description: "Manage API keys and developer integration tokens for this team",
      icon: LinkIcon,
      connected: true,
    },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Integrations & Workflows</h2>
        <p className="text-sm text-muted-foreground">
          Connect with external services and configure Power Automate-style workflows.
        </p>
      </div>

      <div className="space-y-3">
        {integrations.map((int: any) => (
          <div
            key={int.name}
            className="flex items-center gap-3 rounded-lg border border-border/40 p-4"
          >
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
              <int.icon className="size-5 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold">{int.name}</h3>
              <p className="text-xs text-muted-foreground">
                {int.description}
              </p>
            </div>
            {int.href ? (
              <Button asChild variant="outline" size="sm" className="text-xs h-7">
                <Link href={int.href}>Configure</Link>
              </Button>
            ) : (
              <Button
                variant={int.connected ? "outline" : "default"}
                size="sm"
                className="text-xs h-7"
              >
                {int.connected ? "Configure" : "Connect"}
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Danger zone
// ---------------------------------------------------------------------------

function DangerSettings({ teamName }: { teamName: string }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-red-500">Danger Zone</h2>
        <p className="text-sm text-muted-foreground">
          Irreversible actions for this team.
        </p>
      </div>

      <div className="space-y-4">
        <div className="rounded-lg border border-red-500/30 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold">Leave Team</h3>
              <p className="text-xs text-muted-foreground">
                Leave this team. You can be re-invited later.
              </p>
            </div>
            <Button variant="outline" size="sm" className="text-red-500 border-red-500/30 hover:bg-red-500/10">
              Leave
            </Button>
          </div>
        </div>

        <div className="rounded-lg border border-red-500/30 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold">Delete Team</h3>
              <p className="text-xs text-muted-foreground">
                Permanently delete &quot;{teamName}&quot; and all its data.
              </p>
            </div>
            <Button variant="destructive" size="sm">
              Delete Team
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
