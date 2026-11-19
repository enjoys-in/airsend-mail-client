"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { HardDrive, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTeamSettings } from "../_components/use-team-settings";
import { LoadingBlock, Notice, SettingsCard, SettingsHeader } from "../_components/settings-ui";
import {
  clearTeamStorage,
  filesErrorMessage,
  getTeamStorage,
  listStorageAccounts,
  setTeamStorage,
  type StorageAccount,
  type TeamStorage,
} from "../../../../_lib/files-api";

// ---------------------------------------------------------------------------
// Team storage: where this team's workspace uploads (chat attachments, DMs and the
// Files tab) are stored. The owner or an admin picks one of their own connected
// accounts in the files service (S3-compatible or Telegram); members only see the status.
// ---------------------------------------------------------------------------

const PROVIDER_LABEL: Record<string, string> = { s3: "S3-compatible", telegram: "Telegram" };
const providerLabel = (id: string) => PROVIDER_LABEL[id] ?? id;
const accountLabel = (a: { nickname?: string | null; providerId: string; accountId: string }) =>
  `${a.nickname?.trim() || a.accountId} · ${providerLabel(a.providerId)}`;

export default function StorageSettingsPage() {
  const s = useTeamSettings();
  const canManage = s.isOwner || s.isAdmin;

  // undefined = loading, null = not configured
  const [storage, setStorage] = useState<TeamStorage | null | undefined>(undefined);
  const [accounts, setAccounts] = useState<StorageAccount[]>([]);
  const [selected, setSelected] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!s.teamId) return;
    setError(null);
    try {
      const [current, mine] = await Promise.all([
        getTeamStorage(s.teamId),
        canManage ? listStorageAccounts() : Promise.resolve([] as StorageAccount[]),
      ]);
      setStorage(current);
      setAccounts(mine);
      // Pre-select the current storage in the picker (the picker holds account row ids, the storage holds the account id).
      setSelected(mine.find((a) => a.accountId === current?.accountId || a.id === current?.accountId)?.id ?? "");
    } catch (err) {
      setStorage(null);
      setError(filesErrorMessage(err, "Could not load the team storage"));
    }
  }, [s.teamId, canManage]);

  useEffect(() => {
    void load();
  }, [load]);

  const save = async () => {
    if (!selected || saving) return;
    setSaving(true);
    try {
      await setTeamStorage(s.teamId, selected);
      toast.success("Team storage updated");
      await load();
    } catch (err) {
      toast.error(filesErrorMessage(err, "Could not update the team storage"));
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (saving) return;
    setSaving(true);
    try {
      await clearTeamStorage(s.teamId);
      toast.success("Team storage removed. Uploads are blocked until another is connected.");
      await load();
    } catch (err) {
      toast.error(filesErrorMessage(err, "Could not remove the team storage"));
    } finally {
      setSaving(false);
    }
  };

  if (storage === undefined && !error) {
    return (
      <>
        <SettingsHeader title="Storage" />
        <LoadingBlock />
      </>
    );
  }

  const current = storage ?? null;

  return (
    <>
      <SettingsHeader
        title="Storage"
        description="Where files shared in this team's channels, direct messages and Files tab are stored."
      />

      <div className="space-y-4">
        {error && <Notice tone="warning">{error}</Notice>}

        <SettingsCard title="Current storage">
          {current ? (
            <div className="flex items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
                <HardDrive className="size-4 text-primary" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{accountLabel(current)}</p>
                <p className="text-xs text-muted-foreground">New uploads from this team are stored here.</p>
              </div>
            </div>
          ) : (
            <Notice tone="warning">
              No storage is connected. File uploads in this team are blocked until an owner or admin connects one.
            </Notice>
          )}
        </SettingsCard>

        {canManage ? (
          <SettingsCard
            title={current ? "Change storage" : "Connect storage"}
            description="Pick one of your connected storage accounts (S3-compatible or Telegram)."
          >
            {accounts.length === 0 ? (
              <Notice>
                You have no storage accounts yet.{" "}
                <Link href="/v2/files" className="font-semibold text-primary underline underline-offset-2">
                  Connect an S3-compatible or Telegram account in Files
                </Link>{" "}
                first, then come back here to select it.
              </Notice>
            ) : (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Select value={selected} onValueChange={setSelected}>
                  <SelectTrigger className="sm:w-80">
                    <SelectValue placeholder="Choose a storage account" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((a) => (
                      <SelectItem key={a.id} value={a.id}>
                        {accountLabel(a)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex items-center gap-2">
                  <Button onClick={save} disabled={!selected || saving}>
                    {saving && <Loader2 className="size-3.5 animate-spin" />}
                    {current ? "Save" : "Connect"}
                  </Button>
                  {current && (
                    <Button variant="outline" onClick={remove} disabled={saving} className="gap-1.5 text-destructive">
                      <Trash2 className="size-3.5" />
                      Remove
                    </Button>
                  )}
                </div>
              </div>
            )}
            <p className="mt-3 text-xs text-muted-foreground">
              The account stays yours: if you disconnect it from Files, this team can no longer upload or download until
              another one is selected.
            </p>
          </SettingsCard>
        ) : (
          <Notice>Only the team owner and admins can change the storage.</Notice>
        )}
      </div>
    </>
  );
}
