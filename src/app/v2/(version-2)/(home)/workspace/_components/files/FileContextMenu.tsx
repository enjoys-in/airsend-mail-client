"use client";

import React from "react";
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
} from "@/components/ui/context-menu";
import {
  Eye,
  Download,
  Pin,
  PinOff,
  Share2,
  Link as LinkIcon,
  Info,
  Trash2,
  RefreshCw,
} from "lucide-react";
import type { WorkspaceFile } from "../../_lib/chat-types";

/** What the team Files views can do with a file (all wired by the Files page). */
export interface FileActions {
  onOpen: (file: WorkspaceFile) => void;
  onDownload: (file: WorkspaceFile) => void;
  onCopyLink: (file: WorkspaceFile) => void;
  onShare: (file: WorkspaceFile) => void;
  onDetails: (file: WorkspaceFile) => void;
  onTogglePin: (file: WorkspaceFile) => void;
  /** Absent when the file cannot be deleted here. */
  onDelete?: (file: WorkspaceFile) => void;
  onRefresh: () => void;
}

const contentCls =
  "w-52 rounded-xl shadow-xl border-border/80 bg-popover/95 backdrop-blur-md p-1.5";
const itemCls = "gap-2.5 text-xs py-1.5 cursor-pointer rounded-lg";
const iconCls = "size-3.5 text-muted-foreground";
const sepCls = "my-1 bg-border/60";
const dangerCls = `${itemCls} text-destructive focus:text-destructive focus:bg-destructive/10`;

// Let the menu close (and release focus) before a dialog opens or a download starts.
const later = (fn: () => void) => () => setTimeout(fn, 0);

// A file's menu must not also open the file area's menu behind it.
const stop = (e: React.MouseEvent) => e.stopPropagation();

function MenuItem(props: {
  icon: React.ElementType;
  label: string;
  onSelect: () => void;
  disabled?: boolean;
  hint?: string;
}) {
  const Icon = props.icon;
  return (
    <ContextMenuItem
      onSelect={later(props.onSelect)}
      disabled={props.disabled}
      className={itemCls}
      title={props.disabled ? props.hint : undefined}
    >
      <Icon className={iconCls} />
      <span>{props.label}</span>
    </ContextMenuItem>
  );
}

function RefreshItem({ onRefresh }: { onRefresh: () => void }) {
  return <MenuItem icon={RefreshCw} label="Refresh" onSelect={onRefresh} />;
}

interface FileContextMenuProps {
  file: WorkspaceFile;
  actions: FileActions;
  pinned: boolean;
  children: React.ReactNode;
}

/** Right-click menu of one team file (grid card, list row or details row). */
export function FileContextMenu({ file, actions: a, pinned, children }: FileContextMenuProps) {
  // Pins and shares live in the files service: older files (no file id) cannot use them.
  const legacy = !file.fileId;
  const legacyHint = "Only for files stored in your organization's storage";
  const onDelete = a.onDelete;

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild onContextMenu={stop}>
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent className={contentCls}>
        <MenuItem icon={Eye} label="Open" onSelect={() => a.onOpen(file)} />
        <MenuItem icon={Download} label="Download" onSelect={() => a.onDownload(file)} />
        <MenuItem
          icon={pinned ? PinOff : Pin}
          label={pinned ? "Unpin" : "Pin"}
          onSelect={() => a.onTogglePin(file)}
          disabled={legacy}
          hint={legacyHint}
        />
        <MenuItem
          icon={Share2}
          label="Share…"
          onSelect={() => a.onShare(file)}
          disabled={legacy}
          hint={legacyHint}
        />
        <MenuItem
          icon={LinkIcon}
          label="Copy link"
          onSelect={() => a.onCopyLink(file)}
          disabled={!legacy}
          hint="Private file: use Share… to create a link"
        />
        <MenuItem icon={Info} label="Details" onSelect={() => a.onDetails(file)} />
        {onDelete && (
          <>
            <ContextMenuSeparator className={sepCls} />
            <ContextMenuItem onSelect={later(() => onDelete(file))} className={dangerCls}>
              <Trash2 className="size-3.5" />
              <span>Delete</span>
            </ContextMenuItem>
          </>
        )}
        <ContextMenuSeparator className={sepCls} />
        <RefreshItem onRefresh={a.onRefresh} />
      </ContextMenuContent>
    </ContextMenu>
  );
}

interface SharedFileContextMenuProps {
  onDownload: () => void;
  onDetails: () => void;
  onRefresh: () => void;
  children: React.ReactNode;
}

/** Right-click menu of a file someone shared with me. */
export function SharedFileContextMenu(props: SharedFileContextMenuProps) {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild onContextMenu={stop}>
        {props.children}
      </ContextMenuTrigger>
      <ContextMenuContent className={contentCls}>
        <MenuItem icon={Download} label="Download" onSelect={props.onDownload} />
        <MenuItem icon={Info} label="Details" onSelect={props.onDetails} />
        <ContextMenuSeparator className={sepCls} />
        <RefreshItem onRefresh={props.onRefresh} />
      </ContextMenuContent>
    </ContextMenu>
  );
}

/** Right-click on empty space in the file area: just Refresh. */
export function FilesAreaContextMenu(props: { onRefresh: () => void; children: React.ReactNode }) {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{props.children}</ContextMenuTrigger>
      <ContextMenuContent className={contentCls}>
        <RefreshItem onRefresh={props.onRefresh} />
      </ContextMenuContent>
    </ContextMenu>
  );
}

/** Props shared by the grid, list and details views of team files. */
export interface FileViewProps {
  files: WorkspaceFile[];
  actions: FileActions;
  /** files-service file id -> pinned */
  pinned: Record<string, true>;
  downloadingId: string | null;
  copiedId: string | null;
}

export const isFilePinned = (file: WorkspaceFile, pinned: Record<string, true>) =>
  !!file.fileId && !!pinned[file.fileId];
