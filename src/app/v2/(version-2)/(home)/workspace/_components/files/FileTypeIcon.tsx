"use client";

import React from "react";
import {
  FileText,
  FileSpreadsheet,
  Image as ImageIcon,
  FileCode,
  FileArchive,
  Pin,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { WorkspaceFile } from "../../_lib/chat-types";
import { categoryFor, extensionOf, fileKind } from "../../_lib/file-utils";

type Category = WorkspaceFile["category"];

/** Category from a bare name + mime type (files that are not WorkspaceFile records). */
export function categoryOfName(name: string, mimeType?: string): Category {
  return categoryFor(fileKind(extensionOf(name), mimeType));
}

export function FileTypeIcon({ category, className }: { category: Category; className?: string }) {
  const cls = (color: string) => cn("size-5", color, className);
  switch (category) {
    case "document":
      return <FileText className={cls("text-blue-500")} />;
    case "spreadsheet":
      return <FileSpreadsheet className={cls("text-emerald-500")} />;
    case "media":
      return <ImageIcon className={cls("text-purple-500")} />;
    case "code":
      return <FileCode className={cls("text-amber-500")} />;
    case "archive":
      return <FileArchive className={cls("text-rose-500")} />;
    default:
      return <FileText className={cls("text-slate-500")} />;
  }
}

/** Small marker next to a pinned file's name. */
export function PinnedMark({ className }: { className?: string }) {
  return (
    <span title="Pinned" className={cn("inline-flex shrink-0 text-amber-500", className)}>
      <Pin className="size-3 fill-current" />
    </span>
  );
}
