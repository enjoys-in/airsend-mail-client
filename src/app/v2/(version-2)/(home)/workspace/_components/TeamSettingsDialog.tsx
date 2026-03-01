"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import {
  X,
  Settings2,
  Users,
  Shield,
  Bell,
  Link as LinkIcon,
  Webhook,
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
import { useChatStore } from "../_lib/chat-store";
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
  const { teams, activeTeamId, members, getTeamMembers } = useChatStore();

  const team = teams.find((t) => t.id === activeTeamId);
  const teamMembers = activeTeamId ? getTeamMembers(activeTeamId) : [];

  if (!team) return null;

  return (
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
                  <MembersSettings members={teamMembers} />
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

function MembersSettings({ members }: { members: TeamMember[] }) {
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = searchQuery.trim()
    ? members.filter(
        (m:any) =>
          m.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.email.toLowerCase().includes(searchQuery.toLowerCase()),
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Members</h2>
          <p className="text-sm text-muted-foreground">
            {members.length} members
          </p>
        </div>
        <Button size="sm">
          <UserPlus className="mr-1 size-4" />
          Invite
        </Button>
      </div>

      <Input
        placeholder="Search members..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="h-8"
      />

      <div className="space-y-1">
        {filtered.map((member) => (
          <div
            key={member.id}
            className="flex items-center gap-3 rounded-md px-3 py-2 hover:bg-accent/50 transition-colors"
          >
            <span className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
              {member.displayName.charAt(0)}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-medium">
                  {member.displayName}
                </span>
                {roleIcon(member.role)}
              </div>
              <span className="text-xs text-muted-foreground">
                {member.email}
              </span>
            </div>
            <Select defaultValue={member.role}>
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
            <Button variant="ghost" size="icon" className="size-7">
              <UserMinus className="size-3.5 text-muted-foreground" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Roles settings
// ---------------------------------------------------------------------------

function RolesSettings() {
  const roles = [
    {
      name: "Owner",
      description: "Full control over the team",
      permissions: [
        "Manage team",
        "Delete team",
        "Manage billing",
        "Manage roles",
      ],
    },
    {
      name: "Admin",
      description: "Can manage members and channels",
      permissions: [
        "Manage members",
        "Manage channels",
        "Pin messages",
        "Delete messages",
      ],
    },
    {
      name: "Moderator",
      description: "Can moderate content",
      permissions: ["Pin messages", "Delete messages", "Mute members"],
    },
    {
      name: "Member",
      description: "Basic member access",
      permissions: ["Send messages", "Create threads", "React to messages"],
    },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Roles & Permissions</h2>
        <p className="text-sm text-muted-foreground">
          Configure what each role can do.
        </p>
      </div>

      <div className="space-y-3">
        {roles.map((role) => (
          <div
            key={role.name}
            className="rounded-lg border border-border/40 p-4 space-y-2"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold">{role.name}</h3>
                <p className="text-xs text-muted-foreground">
                  {role.description}
                </p>
              </div>
              <Button variant="outline" size="sm" className="text-xs h-7">
                Edit
              </Button>
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
      name: "Webhooks",
      description: "Send notifications to external services",
      icon: Webhook,
      connected: false,
    },
    {
      name: "API Access",
      description: "Manage API keys for this team",
      icon: LinkIcon,
      connected: true,
    },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Integrations</h2>
        <p className="text-sm text-muted-foreground">
          Connect with external services.
        </p>
      </div>

      <div className="space-y-3">
        {integrations.map((int:any) => (
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
            <Button
              variant={int.connected ? "outline" : "default"}
              size="sm"
              className="text-xs h-7"
            >
              {int.connected ? "Configure" : "Connect"}
            </Button>
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
