"use client";

import React from "react";
import { AlertTriangle, Download, Loader2, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { SharedWithMe } from "../../_lib/files-api";
import { formatBytes, formatFileDate } from "../../_lib/file-utils";
import { SharedFileContextMenu } from "./FileContextMenu";
import { FileTypeIcon, categoryOfName } from "./FileTypeIcon";

const headCls = "h-9 text-[11px] font-semibold uppercase tracking-wider";

interface SharedWithMeViewProps {
  items: SharedWithMe[];
  loading: boolean;
  error: string | null;
  downloadingId: string | null;
  onDownload: (item: SharedWithMe) => void;
  onDetails: (item: SharedWithMe) => void;
  onRefresh: () => void;
}

/** Files other people in the organization shared with me. */
export function SharedWithMeView(props: SharedWithMeViewProps) {
  const { items, loading, error, downloadingId } = props;

  if (loading && items.length === 0) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    );
  }
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        {error ? (
          <AlertTriangle className="mb-2 size-10 text-amber-500 opacity-60" />
        ) : (
          <Share2 className="mb-2 size-12 text-muted-foreground opacity-30" />
        )}
        <p className="text-xs font-semibold text-foreground">{error ?? "Nothing shared with you yet"}</p>
        <p className="mt-0.5 text-[11px] text-muted-foreground">
          Files people in your organization share with you show up here.
        </p>
        {error && (
          <Button size="sm" variant="outline" onClick={props.onRefresh} className="mt-4 text-xs">
            Try again
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border/40 bg-card overflow-hidden shadow-sm">
      <Table className="text-xs">
        <TableHeader className="bg-muted/40">
          <TableRow className="hover:bg-transparent">
            <TableHead className={headCls}>Name</TableHead>
            <TableHead className={`${headCls} text-right`}>Size</TableHead>
            <TableHead className={`${headCls} hidden sm:table-cell`}>Shared by</TableHead>
            <TableHead className={`${headCls} hidden sm:table-cell`}>Date</TableHead>
            <TableHead className={`${headCls} w-10`} />
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <SharedFileContextMenu
              key={item.id}
              onDownload={() => props.onDownload(item)}
              onDetails={() => props.onDetails(item)}
              onRefresh={props.onRefresh}
            >
              <TableRow className="cursor-default" onDoubleClick={() => props.onDetails(item)}>
                <TableCell className="max-w-0 w-1/2 py-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <FileTypeIcon category={categoryOfName(item.name, item.mimeType)} className="size-4 shrink-0" />
                    <span className="truncate font-medium text-foreground">{item.name}</span>
                  </div>
                </TableCell>
                <TableCell className="py-2 text-right text-muted-foreground whitespace-nowrap">
                  {formatBytes(item.size)}
                </TableCell>
                <TableCell className="hidden sm:table-cell py-2 text-muted-foreground truncate">
                  {item.sharedBy}
                </TableCell>
                <TableCell className="hidden sm:table-cell py-2 text-muted-foreground whitespace-nowrap">
                  {formatFileDate(item.createdAt)}
                </TableCell>
                <TableCell className="py-1.5 text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7"
                    title="Download"
                    disabled={downloadingId === item.id}
                    onClick={() => props.onDownload(item)}
                  >
                    {downloadingId === item.id ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <Download className="size-3.5" />
                    )}
                  </Button>
                </TableCell>
              </TableRow>
            </SharedFileContextMenu>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
