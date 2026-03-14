"use client";

import React, { useState } from "react";
import { Users } from "lucide-react";
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
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useAppSelector } from "@/store/hooks";
import { useChatStore } from "../_lib/chat-store";
import { workspaceApi, toTeam, toChannel } from "../_lib/api";

// ---------------------------------------------------------------------------
// TeamCreateDialog — create a new team / workspace
// Backend auto-creates #general and #announcements channels on team creation.
// ---------------------------------------------------------------------------

interface TeamCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function TeamCreateDialog({
  open,
  onOpenChange,
}: TeamCreateDialogProps) {
  const currAccount = useAppSelector((s) => s.accounts.currAccount);
  const email = currAccount?.email ?? "";
  const { addTeam, setActiveTeam, fetchChannels, fetchMembers } = useChatStore();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setName("");
    setDescription("");
    setIsPrivate(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Team name is required");
      return;
    }

    setLoading(true);
    try {
      const res = await workspaceApi.createTeam(
        {
          name: name.trim(),
          description: description.trim() || undefined,
          is_private: isPrivate,
        },
        email,
      );

      if (res) {
        const team = toTeam(res);
        addTeam(team);

        // Fetch the auto-created channels (general + announcements) and members
        await Promise.all([
          fetchChannels(team.id, email),
          fetchMembers(team.id, email),
        ]);

        // Switch to the new team (auto-selects #general)
        setActiveTeam(team.id);

        toast.success(`Team "${team.name}" created with #general channel`);
        resetForm();
        onOpenChange(false);
      }
    } catch (err) {
      toast.error("Failed to create team");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) resetForm();
        onOpenChange(v);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="size-4" />
            Create Team
          </DialogTitle>
          <DialogDescription>
            Teams are shared spaces for your group. A <strong>#general</strong>{" "}
            channel will be created automatically.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Team Name */}
          <div className="space-y-2">
            <Label htmlFor="team-name">Team Name</Label>
            <Input
              id="team-name"
              placeholder="e.g. Engineering, Marketing"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={60}
              autoFocus
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="team-desc">
              Description{" "}
              <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Textarea
              id="team-desc"
              placeholder="What's this team about?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="resize-none"
              rows={2}
              maxLength={250}
            />
          </div>

          {/* Private toggle */}
          <div className="flex items-center justify-between rounded-lg border border-border/40 p-3">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium cursor-pointer">
                Private Team
              </Label>
              <p className="text-[11px] text-muted-foreground">
                Only invited members can see and join this team.
              </p>
            </div>
            <Switch checked={isPrivate} onCheckedChange={setIsPrivate} />
          </div>

          {/* Preview */}
          <div className="rounded-md bg-accent/50 px-3 py-2 text-sm space-y-1">
            <div className="flex items-center gap-2">
              <Users className="size-4 text-muted-foreground" />
              <span className="font-medium">{name || "Team Name"}</span>
              {isPrivate && (
                <span className="text-[10px] rounded bg-muted px-1.5 py-0.5 text-muted-foreground">
                  Private
                </span>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground pl-6">
              Includes #general and #announcements channels
            </p>
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
              {loading ? "Creating..." : "Create Team"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
