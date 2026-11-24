"use client";

import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatBytes, formatFileDate } from "../../_lib/file-utils";
import { FileContextMenu, isFilePinned, type FileViewProps } from "./FileContextMenu";
import { FileTypeIcon, PinnedMark } from "./FileTypeIcon";

const headCls = "h-9 text-[11px] font-semibold uppercase tracking-wider";

/** Team files as a dense table (Name, Uploaded by, Channel, Size, Date). */
export function FilesDetailsView({ files, actions: a, pinned }: FileViewProps) {
  return (
    <div className="rounded-xl border border-border/40 bg-card overflow-hidden shadow-sm">
      <Table className="text-xs">
        <TableHeader className="bg-muted/40">
          <TableRow className="hover:bg-transparent">
            <TableHead className={headCls}>Name</TableHead>
            <TableHead className={`${headCls} hidden sm:table-cell`}>Uploaded by</TableHead>
            <TableHead className={`${headCls} hidden md:table-cell`}>Channel</TableHead>
            <TableHead className={`${headCls} text-right`}>Size</TableHead>
            <TableHead className={`${headCls} hidden sm:table-cell`}>Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {files.map((file) => {
            const isPinned = isFilePinned(file, pinned);
            return (
              <FileContextMenu key={file.id} file={file} actions={a} pinned={isPinned}>
                <TableRow className="cursor-default" onDoubleClick={() => a.onOpen(file)}>
                  <TableCell className="max-w-0 w-1/2 py-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <FileTypeIcon category={file.category} className="size-4 shrink-0" />
                      <button
                        onClick={() => a.onOpen(file)}
                        className="truncate text-left font-medium text-foreground hover:text-primary"
                      >
                        {file.name}
                      </button>
                      {isPinned && <PinnedMark />}
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell py-2 text-muted-foreground truncate">
                    {file.uploaderName || file.uploadedBy}
                  </TableCell>
                  <TableCell className="hidden md:table-cell py-2 text-muted-foreground">
                    {file.channelName ? `#${file.channelName}` : "—"}
                  </TableCell>
                  <TableCell className="py-2 text-right text-muted-foreground whitespace-nowrap">
                    {formatBytes(file.size)}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell py-2 text-muted-foreground whitespace-nowrap">
                    {formatFileDate(file.createdAt)}
                  </TableCell>
                </TableRow>
              </FileContextMenu>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
