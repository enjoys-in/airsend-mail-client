"use client";

import React from "react";
import { Download, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatBytes } from "../../_lib/file-utils";
import { FileContextMenu, isFilePinned, type FileViewProps } from "./FileContextMenu";
import { FileTypeIcon, PinnedMark } from "./FileTypeIcon";

/** Team files as cards. */
export function FilesGridView({ files, actions: a, pinned, downloadingId }: FileViewProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {files.map((file) => {
        const isPinned = isFilePinned(file, pinned);
        return (
          <FileContextMenu key={file.id} file={file} actions={a} pinned={isPinned}>
            <div className="group rounded-xl border border-border/40 bg-card p-4 space-y-3 hover:border-primary/40 hover:shadow-sm transition-all">
              <div className="flex items-start justify-between">
                <div className="flex size-10 items-center justify-center rounded-xl bg-accent/60">
                  <FileTypeIcon category={file.category} />
                </div>
                <div className="flex items-center gap-1">
                  {isPinned && <PinnedMark className="p-1" />}
                  {a.onDelete && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => a.onDelete?.(file)}
                      className="size-6 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="size-3" />
                    </Button>
                  )}
                </div>
              </div>

              <div>
                <h4
                  onClick={() => a.onOpen(file)}
                  className="text-xs font-semibold text-foreground truncate cursor-pointer hover:text-primary transition-colors"
                >
                  {file.name}
                </h4>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {formatBytes(file.size)} • {file.uploaderName}
                </p>
              </div>

              <div className="pt-2 border-t border-border/30 flex items-center justify-between text-[11px] text-muted-foreground">
                <span className="truncate">#{file.channelName || "general"}</span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => a.onDownload(file)}
                  disabled={downloadingId === file.id}
                  className="h-6 text-[10px] px-2 gap-1"
                >
                  {downloadingId === file.id ? (
                    <Loader2 className="size-3 animate-spin" />
                  ) : (
                    <Download className="size-3" />
                  )}
                  Download
                </Button>
              </div>
            </div>
          </FileContextMenu>
        );
      })}
    </div>
  );
}
