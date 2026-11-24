"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import type { WorkspaceFile } from "../../_lib/chat-types";
import type { SharedWithMe } from "../../_lib/files-api";
import { formatBytes, formatFileDate } from "../../_lib/file-utils";
import { FileTypeIcon, categoryOfName } from "./FileTypeIcon";

export interface FileDetails {
  name: string;
  category: WorkspaceFile["category"];
  rows: { label: string; value: React.ReactNode }[];
}

export function workspaceFileDetails(f: WorkspaceFile): FileDetails {
  return {
    name: f.name,
    category: f.category,
    rows: [
      { label: "Type", value: f.mimeType || f.extension.toUpperCase() || "—" },
      { label: "Size", value: formatBytes(f.size) },
      { label: "Uploaded by", value: f.uploaderName || f.uploadedBy || "—" },
      { label: "Channel", value: f.channelName ? `#${f.channelName}` : "—" },
      { label: "Created", value: formatFileDate(f.createdAt) },
      { label: "Updated", value: formatFileDate(f.updatedAt) },
      { label: "Downloads", value: String(f.downloadCount ?? 0) },
    ],
  };
}

export function sharedFileDetails(s: SharedWithMe): FileDetails {
  return {
    name: s.name,
    category: categoryOfName(s.name, s.mimeType),
    rows: [
      { label: "Type", value: s.mimeType || "—" },
      { label: "Size", value: formatBytes(s.size) },
      { label: "Shared by", value: s.sharedBy || "—" },
      { label: "Shared on", value: formatFileDate(s.createdAt) },
    ],
  };
}

interface FileDetailsDialogProps {
  details: FileDetails | null;
  onClose: () => void;
}

export function FileDetailsDialog({ details, onClose }: FileDetailsDialogProps) {
  return (
    <Dialog open={!!details} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 pr-6">
            {details && <FileTypeIcon category={details.category} />}
            <span className="truncate">{details?.name}</span>
          </DialogTitle>
          <DialogDescription>File details</DialogDescription>
        </DialogHeader>
        <dl className="divide-y divide-border/40 rounded-lg border border-border/40 text-xs">
          <DetailRow label="Name" value={details?.name} />
          {details?.rows.map((r) => <DetailRow key={r.label} label={r.label} value={r.value} />)}
        </dl>
      </DialogContent>
    </Dialog>
  );
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 px-3 py-2">
      <dt className="w-24 shrink-0 text-muted-foreground">{label}</dt>
      <dd className="min-w-0 flex-1 break-words font-medium text-foreground">{value}</dd>
    </div>
  );
}
