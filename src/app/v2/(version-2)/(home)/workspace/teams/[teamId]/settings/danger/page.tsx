"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { DoorOpen, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { workspaceApi, apiErrorMessage } from "../../../../_lib/api";
import { useChatStore } from "../../../../_lib/chat-store";
import { confirmAction } from "../../../../_components/ConfirmHost";
import { useTeamSettings } from "../_components/use-team-settings";
import { SettingsCard, SettingsHeader } from "../_components/settings-ui";

export default function DangerZonePage() {
  const s = useTeamSettings();
  const router = useRouter();
  const [confirmName, setConfirmName] = useState("");
  const [busy, setBusy] = useState(false);
  const teamName = s.team?.name ?? "";

  const dropTeam = () => {
    useChatStore.setState((st) => ({
      teams: st.teams.filter((t) => t.id !== s.teamId),
      channels: st.channels.filter((c) => c.teamId !== s.teamId),
      members: st.members.filter((m) => m.teamId !== s.teamId),
      activeTeamId: st.activeTeamId === s.teamId ? null : st.activeTeamId,
    }));
    router.push("/v2/workspace");
  };

  const leave = async () => {
    const ok = await confirmAction({
      title: `Leave ${teamName}?`,
      description: "You lose access to its channels until someone invites you again.",
      confirmLabel: "Leave team",
      destructive: true,
    });
    if (!ok) return;
    setBusy(true);
    try {
      await workspaceApi.removeMember(s.teamId, s.currentUserId, s.currentUserId);
      toast.success(`You left ${teamName}`);
      dropTeam();
    } catch (err) {
      toast.error(apiErrorMessage(err, "Could not leave the team"));
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    setBusy(true);
    try {
      await workspaceApi.deleteTeam(s.teamId, s.currentUserId);
      toast.success(`${teamName} was deleted`);
      dropTeam();
    } catch (err) {
      toast.error(apiErrorMessage(err, "Could not delete the team"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <SettingsHeader title={s.isOwner ? "Delete Team" : "Leave Team"} />

      {s.isOwner ? (
        <SettingsCard
          danger
          title="Delete this team"
          description="Every channel, message, file and role in it is removed for everyone. This cannot be undone."
        >
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="confirm-team-name" className="text-xs">
                Type <strong>{teamName}</strong> to confirm
              </Label>
              <Input
                id="confirm-team-name"
                value={confirmName}
                onChange={(e) => setConfirmName(e.target.value)}
                autoComplete="off"
              />
            </div>
            <Button variant="destructive" size="sm" disabled={busy || confirmName !== teamName} onClick={remove}>
              {busy ? <Loader2 className="mr-1.5 size-4 animate-spin" /> : <Trash2 className="mr-1.5 size-4" />}
              Delete team
            </Button>
            <p className="text-xs text-muted-foreground">
              As the owner you can&apos;t leave the team; delete it instead.
            </p>
          </div>
        </SettingsCard>
      ) : (
        <SettingsCard danger title="Leave this team" description="You can be invited back later.">
          <Button variant="outline" size="sm" className="border-destructive/40 text-destructive hover:bg-destructive/10" disabled={busy} onClick={leave}>
            {busy ? <Loader2 className="mr-1.5 size-4 animate-spin" /> : <DoorOpen className="mr-1.5 size-4" />}
            Leave team
          </Button>
        </SettingsCard>
      )}
    </>
  );
}
