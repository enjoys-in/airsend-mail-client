"use client";

import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { clearWorkspaceCache, getCacheStats, type CacheStats } from "../../../../_lib/workspace-cache";
import { SettingsCard } from "./settings-ui";

function formatBytes(bytes: number | null) {
  if (bytes === null) return "unknown";
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function LocalDataCard() {
  const [stats, setStats] = useState<CacheStats | null>(null);
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void getCacheStats().then((s) => {
      if (!cancelled) setStats(s);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const clear = async () => {
    setClearing(true);
    await clearWorkspaceCache();
    toast.success("Local workspace data cleared");
    window.location.reload();
  };

  return (
    <SettingsCard
      title="Local data"
      description="Channels, direct messages and recent conversations are kept in this browser so the workspace opens instantly. They are refreshed from the server in the background."
    >
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div className="space-y-0.5 text-xs text-muted-foreground">
          {stats ? (
            <>
              <p>
                {stats.conversations} conversations, {stats.channelMessages + stats.dmMessages} cached messages
                {stats.outbox > 0 ? `, ${stats.outbox} waiting to send` : ""}
              </p>
              <p>Browser storage used by this site: {formatBytes(stats.bytes)}</p>
            </>
          ) : (
            <p>Local data is not available in this browser.</p>
          )}
        </div>
        <Button variant="outline" size="sm" disabled={clearing || !stats} onClick={() => void clear()}>
          Clear local data
        </Button>
      </div>
    </SettingsCard>
  );
}
