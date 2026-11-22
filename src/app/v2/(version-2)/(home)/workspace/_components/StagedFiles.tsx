"use client";

import React from "react";
import { Link2, Paperclip, X } from "lucide-react";
import { formatBytes } from "../_lib/file-utils";
import type { DraftFile } from "../_lib/drafts";

// ---------------------------------------------------------------------------
// StagedFiles — files attached in the composer but not sent yet (they are
// part of the draft). Enter / Send sends them; × removes one.
// ---------------------------------------------------------------------------

const CHIP =
  "flex max-w-[16rem] items-center gap-1.5 rounded-md border border-border/60 bg-accent/40 px-2 py-1 text-xs";

interface StagedFilesProps {
  files: DraftFile[];
  onRemove: (id: string) => void;
}

export default function StagedFiles({ files, onRemove }: StagedFilesProps) {
  if (!files.length) return null;
  return (
    <div className="mb-2 flex flex-wrap gap-1.5">
      {files.map((f) => (
        <div
          key={f.id}
          className={CHIP}
          title={f.existingFileId ? `${f.name} (already uploaded, will be reused)` : f.name}
        >
          {f.existingFileId ? (
            <Link2 className="size-3.5 shrink-0 text-primary" />
          ) : (
            <Paperclip className="size-3.5 shrink-0 text-muted-foreground" />
          )}
          <span className="truncate font-medium">{f.name}</span>
          <span className="shrink-0 text-muted-foreground">{formatBytes(f.size)}</span>
          <button
            type="button"
            onClick={() => onRemove(f.id)}
            aria-label={`Remove ${f.name}`}
            className="shrink-0 text-muted-foreground hover:text-foreground"
          >
            <X className="size-3" />
          </button>
        </div>
      ))}
    </div>
  );
}
