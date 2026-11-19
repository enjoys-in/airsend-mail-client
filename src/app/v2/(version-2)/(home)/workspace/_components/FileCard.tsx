"use client";

import React, { useEffect, useState } from "react";
import {
  Download,
  File as FileIcon,
  FileArchive,
  FileAudio,
  FileCode,
  FileSpreadsheet,
  FileText,
  FileVideo,
  Image as ImageIcon,
  Loader2,
  Presentation,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  downloadWorkspaceFile,
  fetchWorkspaceFileBlob,
  filesErrorMessage,
} from "../_lib/files-api";
import { workspaceApi } from "../_lib/api";
import { extensionOf, fileKind, formatBytes, isImageFile, type FileKind } from "../_lib/file-utils";
import type { MessageAttachment } from "../_lib/chat-types";

// ---------------------------------------------------------------------------
// FileCard — a file attached to a message (channel or DM).
//
// Shows icon, name, extension badge and size. Download fetches the bytes from the
// files service by `fileId`; attachments from before the files service (no fileId)
// keep downloading from the workspace server's legacy URL.
// ---------------------------------------------------------------------------

const KIND_STYLE: Record<FileKind, { icon: React.ComponentType<{ className?: string }>; tone: string }> = {
  image: { icon: ImageIcon, tone: "bg-purple-500/10 text-purple-600 dark:text-purple-400" },
  video: { icon: FileVideo, tone: "bg-pink-500/10 text-pink-600 dark:text-pink-400" },
  audio: { icon: FileAudio, tone: "bg-orange-500/10 text-orange-600 dark:text-orange-400" },
  pdf: { icon: FileText, tone: "bg-red-500/10 text-red-600 dark:text-red-400" },
  document: { icon: FileText, tone: "bg-blue-500/10 text-blue-600 dark:text-blue-400" },
  spreadsheet: { icon: FileSpreadsheet, tone: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
  presentation: { icon: Presentation, tone: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
  code: { icon: FileCode, tone: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400" },
  archive: { icon: FileArchive, tone: "bg-rose-500/10 text-rose-600 dark:text-rose-400" },
  other: { icon: FileIcon, tone: "bg-slate-500/10 text-slate-600 dark:text-slate-400" },
};

export function FileKindIcon({ extension, mimeType, className }: { extension?: string; mimeType?: string; className?: string }) {
  const { icon: Icon, tone } = KIND_STYLE[fileKind(extension, mimeType)];
  return (
    <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-lg", tone, className)}>
      <Icon className="size-4" />
    </span>
  );
}

/** Legacy attachments (stored by the workspace server) download from its own URL. */
function legacyUrl(att: MessageAttachment): string {
  return att.url || workspaceApi.getAttachmentUrl(att.id);
}

const PREVIEW_MAX_BYTES = 5 * 1024 * 1024;

export function FileCard({ attachment, className }: { attachment: MessageAttachment; className?: string }) {
  const ext = attachment.extension || extensionOf(attachment.name);
  const pending = typeof attachment.uploadProgress === "number" && attachment.uploadProgress < 100;
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  // Images from the files service are previewed through an authenticated fetch (the bytes are not public).
  useEffect(() => {
    if (pending || !attachment.fileId || !isImageFile(ext, attachment.mimeType) || attachment.size > PREVIEW_MAX_BYTES) return;
    let revoked = false;
    let objectUrl: string | null = null;
    fetchWorkspaceFileBlob(attachment.fileId)
      .then(({ blob }) => {
        if (revoked) return;
        objectUrl = URL.createObjectURL(blob);
        setPreview(objectUrl);
      })
      .catch(() => {
        /* no preview: the card still downloads */
      });
    return () => {
      revoked = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [attachment.fileId, attachment.mimeType, attachment.size, ext, pending]);

  const handleDownload = async () => {
    if (busy || pending) return;
    if (!attachment.fileId) {
      window.open(legacyUrl(attachment), "_blank", "noopener,noreferrer");
      return;
    }
    setBusy(true);
    try {
      await downloadWorkspaceFile(attachment.fileId, attachment.name);
    } catch (err) {
      toast.error(filesErrorMessage(err, "Couldn't download the file"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className={cn(
        "w-full max-w-sm overflow-hidden rounded-lg border border-border/50 bg-accent/30 text-xs",
        className,
      )}
    >
      {preview && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={preview} alt={attachment.name} className="max-h-60 w-full object-cover" loading="lazy" />
      )}
      <div className="flex items-center gap-2.5 px-3 py-2">
        <FileKindIcon extension={ext} mimeType={attachment.mimeType} />
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-foreground" title={attachment.name}>
            {attachment.name}
          </p>
          <p className="mt-0.5 flex items-center gap-1.5 text-[11px] text-muted-foreground">
            {ext && (
              <span className="rounded bg-background/70 px-1 py-px font-semibold uppercase tracking-wide">{ext}</span>
            )}
            <span>{formatBytes(attachment.size)}</span>
            {pending && <span>· Uploading {attachment.uploadProgress}%</span>}
          </p>
          {pending && (
            <div className="mt-1 h-1 overflow-hidden rounded-full bg-border/60">
              <div className="h-full bg-primary transition-all" style={{ width: `${attachment.uploadProgress}%` }} />
            </div>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="size-8 shrink-0"
          onClick={handleDownload}
          disabled={busy || pending}
          title="Download"
          aria-label={`Download ${attachment.name}`}
        >
          {busy || pending ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
        </Button>
      </div>
    </div>
  );
}

export function AttachmentList({ attachments }: { attachments: MessageAttachment[] }) {
  if (!attachments?.length) return null;
  return (
    <div className="mt-1 flex flex-wrap gap-2">
      {attachments.map((att) => (
        <FileCard key={att.id} attachment={att} />
      ))}
    </div>
  );
}
