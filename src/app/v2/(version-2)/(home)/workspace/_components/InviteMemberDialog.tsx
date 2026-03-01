"use client";

import React, { useState } from "react";
import { UserPlus, Mail, Shield, ShieldCheck, Crown, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { toast } from "sonner";
import { useAppSelector } from "@/store/hooks";
import { useChatStore } from "../_lib/chat-store";
import { workspaceApi } from "../_lib/api";
import type { MemberRole } from "../_lib/chat-types";

// ---------------------------------------------------------------------------
// InviteMemberDialog — invite members with role selector
// ---------------------------------------------------------------------------

interface InviteMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const roleOptions: { value: MemberRole; label: string; description: string; icon: React.ElementType }[] = [
  { value: "member", label: "Member", description: "Can view and participate in channels", icon: Users },
  { value: "moderator", label: "Moderator", description: "Can manage messages and moderate channels", icon: Shield },
  { value: "admin", label: "Admin", description: "Can manage channels, members, and settings", icon: ShieldCheck },
  { value: "owner", label: "Owner", description: "Full control over the team", icon: Crown },
];

export default function InviteMemberDialog({
  open,
  onOpenChange,
}: InviteMemberDialogProps) {
  const currAccount = useAppSelector((s) => s.accounts.currAccount);
  const email = currAccount?.email ?? "";
  const { activeTeamId, teams } = useChatStore();
  const activeTeam = teams.find((t:any) => t.id === activeTeamId);

  const [inviteeEmail, setInviteeEmail] = useState("");
  const [role, setRole] = useState<MemberRole>("member");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inviteeEmail.trim()) {
      toast.error("Email address is required");
      return;
    }
    if (!activeTeamId) {
      toast.error("No active team selected");
      return;
    }

    // Basic email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inviteeEmail.trim())) {
      toast.error("Please enter a valid email address");
      return;
    }

    setLoading(true);
    try {
      await workspaceApi.createInvitation(
        activeTeamId,
        inviteeEmail.trim(),
        role,
        email,
      );
      toast.success(`Invitation sent to ${inviteeEmail.trim()}`);
      setInviteeEmail("");
      setRole("member");
      onOpenChange(false);
    } catch (err) {
      toast.error("Failed to send invitation");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="size-4" />
            Invite Member
          </DialogTitle>
          <DialogDescription>
            Invite someone to{" "}
            <span className="font-medium text-foreground">
              {activeTeam?.name || "your team"}
            </span>
            . They'll receive an invitation to join.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="invite-email">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="invite-email"
                type="email"
                placeholder="colleague@example.com"
                value={inviteeEmail}
                onChange={(e) => setInviteeEmail(e.target.value)}
                className="pl-8"
                autoFocus
              />
            </div>
          </div>

          {/* Role */}
          <div className="space-y-2">
            <Label>Role</Label>
            <Select value={role} onValueChange={(v) => setRole(v as MemberRole)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {roleOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    <div className="flex items-center gap-2">
                      <opt.icon className="size-3.5" />
                      <div>
                        <span className="font-medium">{opt.label}</span>
                        <span className="ml-2 text-[11px] text-muted-foreground">
                          {opt.description}
                        </span>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-[11px] text-muted-foreground">
              Default role is <span className="font-medium">Member</span>. You can change it later.
            </p>
          </div>

          {/* Preview */}
          <div className="flex items-center gap-3 rounded-md bg-accent/50 px-3 py-2.5 text-sm">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <UserPlus className="size-4 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium">
                {inviteeEmail || "email@example.com"}
              </p>
              <p className="text-[10px] text-muted-foreground capitalize">
                Will join as {role}
              </p>
            </div>
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
            <Button type="submit" disabled={loading || !inviteeEmail.trim()}>
              {loading ? "Sending..." : "Send Invitation"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
