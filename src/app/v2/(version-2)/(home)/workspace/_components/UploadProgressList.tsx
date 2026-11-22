"use client";

import React from "react";
import { AlertTriangle, Clock, Loader2, RotateCw, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatBytes } from "../_lib/file-utils";
import type { PendingUpload } from "../_lib/chat-types";

// ---------------------------------------------------------------------------
// UploadProgressList — files of the open conversation that are queued,
// uploading, being attached, or failed (Retry / Discard). Uploads keep going
// when the user switches conversations; this only shows them.
// ---------------------------------------------------------------------------

interface UploadProgressListProps {
  uploads: PendingUpload[];
  onCancel: (id: string) => void;
  onRetry: (id: string) => void;
}

function statusText(u: PendingUpload): string {
  if (u.status === "queued") return u.error ?? "Waiting…";
  if (u.status === "sending") return "Sending…";
  return `${u.progress}%`;
}

export default function UploadProgressList({ uploads, onCancel, onRetry }: UploadProgressListProps) {
  if (!uploads.length) return null;
  return (
    <div className="mb-2 flex max-h-48 flex-col gap-1.5 overflow-y-auto">
      {uploads.map((u) => {
        const failed = u.status === "error";
        return (
          <div
            key={u.id}
            className={cn(
              "flex items-center gap-2 rounded-md border px-3 py-1.5 text-xs",
              failed ? "border-destructive/30 bg-destructive/10 text-destructive" : "border-border/50 bg-accent/40",
            )}
          >
            {failed ? (
              <AlertTriangle className="size-3.5 shrink-0" />
            ) : u.status === "queued" ? (
              <Clock className="size-3.5 shrink-0 text-muted-foreground" />
            ) : (
              <Loader2 className="size-3.5 shrink-0 animate-spin text-muted-foreground" />
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">
                {u.name} <span className="font-normal opacity-70">· {formatBytes(u.size)}</span>
              </p>
              {failed ? (
                <p className="truncate text-[11px]">{u.error ?? "Upload failed"}</p>
              ) : (
                <div className="mt-1 flex items-center gap-2">
                  <div className="h-1 flex-1 overflow-hidden rounded-full bg-border/60">
                    <div className="h-full bg-primary transition-all" style={{ width: `${u.progress}%` }} />
                  </div>
                  <span className="max-w-[50%] truncate text-[11px] text-muted-foreground">{statusText(u)}</span>
                </div>
              )}
            </div>
            {failed && (
              <button
                type="button"
                onClick={() => onRetry(u.id)}
                className="shrink-0 opacity-70 hover:opacity-100"
                aria-label="Retry upload"
                title="Retry"
              >
                <RotateCw className="size-3.5" />
              </button>
            )}
            <button
              type="button"
              onClick={() => onCancel(u.id)}
              className="shrink-0 opacity-70 hover:opacity-100"
              aria-label={failed ? "Discard" : "Cancel upload"}
              title={failed ? "Discard" : "Cancel"}
            >
              <X className="size-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
