"use client";

import { useState } from "react";
import { Crown, LogOut, Shield, UserMinus, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { workspaceApi } from "../_lib/api";
import { useChatStore } from "../_lib/chat-store";
import type { DirectMessage } from "../_lib/chat-types";

type Role = "owner" | "admin" | "member";

interface GroupMembersDialogProps {
  group: DirectMessage;
  currentUserId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLeft: () => void;
}

const roleLabel: Record<Role, string> = { owner: "Owner", admin: "Admin", member: "Member" };

export default function GroupMembersDialog({ group, currentUserId, open, onOpenChange, onLeft }: GroupMembersDialogProps) {
  const fetchDMs = useChatStore((s) => s.fetchDMs);
  const [newEmail, setNewEmail] = useState("");
  const [name, setName] = useState(group.name ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const me = currentUserId.toLowerCase();
  const roleOf = (email: string): Role => group.roles?.[email.toLowerCase()] ?? "member";
  const myRole = roleOf(me);
  const canManage = myRole === "owner" || myRole === "admin";
  const isOwner = myRole === "owner";

  const run = async (task: () => Promise<unknown>) => {
    setBusy(true);
    setError("");
    try {
      await task();
      await fetchDMs(currentUserId);
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "That did not work");
    } finally {
      setBusy(false);
    }
  };

  const canRemove = (email: string) => {
    if (email.toLowerCase() === me) return false;
    const target = roleOf(email);
    if (isOwner) return true;
    return myRole === "admin" && target === "member";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md" data-testid="group-members-dialog">
        <DialogHeader>
          <DialogTitle>{group.name || "Group chat"}</DialogTitle>
          <DialogDescription>{group.participants.length} people. The person who started the group is its owner.</DialogDescription>
        </DialogHeader>

        {canManage && (
          <form
            className="flex gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              const trimmed = name.trim();
              if (trimmed === (group.name ?? "")) return;
              void run(() => workspaceApi.renameGroup(group.id, trimmed, currentUserId));
            }}
          >
            <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Group name (leave empty for automatic)" maxLength={120} aria-label="Group name" data-testid="group-name" />
            <Button type="submit" variant="outline" disabled={busy}>
              Rename
            </Button>
          </form>
        )}

        <ul className="max-h-72 divide-y divide-border/50 overflow-y-auto" data-testid="group-member-list">
          {group.participants.map((person) => {
            const role = roleOf(person.userId);
            return (
              <li key={person.userId} className="flex items-center gap-2 py-2" data-testid="group-member">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {person.displayName}
                    {person.userId.toLowerCase() === me ? " (you)" : ""}
                  </p>
                  <p className="flex items-center gap-1 text-xs text-muted-foreground">
                    {role === "owner" ? <Crown className="size-3 text-amber-500" /> : role === "admin" ? <Shield className="size-3 text-blue-500" /> : null}
                    {roleLabel[role]}
                  </p>
                </div>
                {isOwner && role !== "owner" && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 px-2 text-xs"
                    disabled={busy}
                    onClick={() => void run(() => workspaceApi.setGroupMemberRole(group.id, person.userId, role === "admin" ? "member" : "admin", currentUserId))}
                    data-testid="group-role"
                  >
                    {role === "admin" ? "Make member" : "Make admin"}
                  </Button>
                )}
                {canRemove(person.userId) && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-7 text-destructive"
                    disabled={busy}
                    aria-label={`Remove ${person.displayName}`}
                    onClick={() => void run(() => workspaceApi.removeGroupMember(group.id, person.userId, currentUserId))}
                    data-testid="group-remove"
                  >
                    <UserMinus className="size-4" />
                  </Button>
                )}
              </li>
            );
          })}
        </ul>

        <form
          className="flex gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            const email = newEmail.trim().toLowerCase();
            if (!email) return;
            void run(async () => {
              await workspaceApi.addGroupMember(group.id, email, currentUserId);
              setNewEmail("");
            });
          }}
        >
          <Input value={newEmail} onChange={(event) => setNewEmail(event.target.value)} placeholder="Add someone by email" type="email" aria-label="Email to add" data-testid="group-add-email" />
          <Button type="submit" variant="outline" disabled={busy || !newEmail.trim()} className="gap-1.5" data-testid="group-add">
            <UserPlus className="size-4" />
            Add
          </Button>
        </form>

        {error && (
          <p className="text-sm text-destructive" role="alert" data-testid="group-error">
            {error}
          </p>
        )}

        <Button
          type="button"
          variant="ghost"
          className="justify-start gap-2 text-destructive"
          disabled={busy}
          onClick={() =>
            void run(async () => {
              await workspaceApi.leaveGroup(group.id, currentUserId);
              onOpenChange(false);
              onLeft();
            })
          }
          data-testid="group-leave"
        >
          <LogOut className="size-4" />
          Leave this group
        </Button>
      </DialogContent>
    </Dialog>
  );
}
