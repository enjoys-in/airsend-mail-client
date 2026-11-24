"use client";

import React from "react";
import { Check, Copy, Download, Eye, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatBytes } from "../../_lib/file-utils";
import { FileContextMenu, isFilePinned, type FileViewProps } from "./FileContextMenu";
import { FileTypeIcon, PinnedMark } from "./FileTypeIcon";

/** Team files as compact rows with inline actions. */
export function FilesListView({ files, actions: a, pinned, downloadingId, copiedId }: FileViewProps) {
  return (
    <div className="rounded-xl border border-border/40 bg-card overflow-hidden shadow-sm">
      <div className="grid grid-cols-12 gap-3 px-4 py-2.5 bg-muted/40 border-b border-border/40 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
        <div className="col-span-6 sm:col-span-5">Name</div>
        <div className="col-span-3 sm:col-span-2 hidden sm:block">Channel</div>
        <div className="col-span-3 sm:col-span-2">Uploaded By</div>
        <div className="col-span-3 sm:col-span-2">Size</div>
        <div className="col-span-3 sm:col-span-1 text-right">Actions</div>
      </div>

      <div className="divide-y divide-border/30">
        {files.map((file) => {
          const isPinned = isFilePinned(file, pinned);
          return (
            <FileContextMenu key={file.id} file={file} actions={a} pinned={isPinned}>
              <div className="grid grid-cols-12 gap-3 px-4 py-3 items-center hover:bg-accent/30 transition-colors text-xs">
                {/* Name */}
                <div className="col-span-6 sm:col-span-5 flex items-center gap-2.5 min-w-0 pr-2">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent/60">
                    <FileTypeIcon category={file.category} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1 min-w-0">
                      <button
                        onClick={() => a.onOpen(file)}
                        className="font-medium text-foreground hover:text-primary transition-colors text-left truncate block max-w-full"
                      >
                        {file.name}
                      </button>
                      {isPinned && <PinnedMark />}
                    </div>
                    <span className="text-[10px] text-muted-foreground uppercase">{file.extension}</span>
                  </div>
                </div>

                {/* Channel */}
                <div className="col-span-3 sm:col-span-2 hidden sm:flex items-center gap-1 text-muted-foreground truncate">
                  {file.channelName && (
                    <span className="bg-accent/60 px-1.5 py-0.5 rounded text-[11px]">#{file.channelName}</span>
                  )}
                </div>

                {/* Uploader */}
                <div className="col-span-3 sm:col-span-2 flex items-center gap-2 text-muted-foreground truncate">
                  <Avatar className="size-5 shrink-0">
                    <AvatarFallback className="text-[9px] bg-primary/10 text-primary font-bold">
                      {(file.uploaderName || file.uploadedBy || "?").charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="truncate">{file.uploaderName}</span>
                </div>

                {/* Size */}
                <div className="col-span-3 sm:col-span-2 text-muted-foreground text-[11px]">
                  {formatBytes(file.size)}
                </div>

                {/* Actions */}
                <div className="col-span-3 sm:col-span-1 flex items-center justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => a.onDownload(file)}
                    disabled={downloadingId === file.id}
                    className="size-7"
                    title="Download"
                  >
                    {downloadingId === file.id ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <Download className="size-3.5" />
                    )}
                  </Button>
                  {!file.fileId && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => a.onCopyLink(file)}
                      className="size-7"
                      title="Copy file link"
                    >
                      {copiedId === file.id ? (
                        <Check className="size-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="size-3.5" />
                      )}
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" onClick={() => a.onOpen(file)} className="size-7" title="Preview">
                    <Eye className="size-3.5" />
                  </Button>
                  {a.onDelete && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => a.onDelete?.(file)}
                      className="size-7 text-muted-foreground hover:text-destructive"
                      title="Delete file"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  )}
                </div>
              </div>
            </FileContextMenu>
          );
        })}
      </div>
    </div>
  );
}
