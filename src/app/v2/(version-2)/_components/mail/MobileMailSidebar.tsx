"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Menu,
  Inbox,
  Send,
  File,
  Trash2,
  Star,
  Archive,
  AlertCircle,
  Folder,
  Tag,
  ChevronDown,
  ChevronRight,
  Plus,
  Check,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useMailStore } from "@/store/mails";
import { AccountSwitcherV2 } from "./AccountSwitcher";
import { airsendDB } from "@/db";
import { MailLablesType } from "@/lib/types/MailBoxListResponse.interface";
import { API } from "@/lib/api/handler";

// Well-known folder icons
const folderIconMap: Record<string, React.ElementType> = {
  inbox: Inbox,
  sent: Send,
  drafts: File,
  trash: Trash2,
  starred: Star,
  archive: Archive,
  spam: AlertCircle,
  junk: AlertCircle,
};

// ==========================================================================
// MobileMailSidebar — sheet-based mail sidebar for mobile
// ==========================================================================

export function MobileMailSidebar() {
  const pathname = usePathname();
  const all_folders = useMailStore((state) => state.all_folders);
  const all_labels = useMailStore((state) => state.all_labels);
  const all_mailbox = useMailStore((state) => state.all_mailbox);
  const setAllFolders = useMailStore((state) => state.setAllFolders);
  const setAllLabels = useMailStore((state) => state.setAllLabels);
  const setAllMailbox = useMailStore((state) => state.setAllMailbox);

  const [sheetOpen, setSheetOpen] = useState(false);
  const [foldersOpen, setFoldersOpen] = useState(true);
  const [labelsOpen, setLabelsOpen] = useState(true);
  const [creatingFolder, setCreatingFolder] = useState(false);
  const [creatingLabel, setCreatingLabel] = useState(false);
  const [newItemName, setNewItemName] = useState("");

  // Hydrate folders/labels from IndexDB (or API) if the desktop sidebar hasn't loaded them
  useEffect(() => {
    if (all_folders && all_folders.length > 0) return;
    if (all_mailbox && all_mailbox.length > 0) return;

    airsendDB.getAllItems("mailboxes").then((data) => {
      if (!data || data.length === 0) {
        // Nothing cached — fetch from API
        API.fetchUserFolderLabels(MailLablesType.ALL)
          .then(({ data: res }) => {
            if (!res?.success) return;
            setAllMailbox(
              res.result.filter((item: any) => item.type === MailLablesType.MAILBOX) as any[]
            );
            setAllLabels(
              res.result.filter((item: any) => item.type === MailLablesType.LABEL) as any[]
            );
            setAllFolders(
              res.result.filter((item: any) => item.type === MailLablesType.FOLDER) as any[]
            );
            airsendDB.bulkPutItems("mailboxes", res.result as any);
          })
          .catch(() => {});
        return;
      }

      setAllMailbox(
        data.filter((item: any) => item.type === MailLablesType.MAILBOX) as any[]
      );
      setAllLabels(
        data.filter((item: any) => item.type === MailLablesType.LABEL) as any[]
      );
      setAllFolders(
        data.filter((item: any) => item.type === MailLablesType.FOLDER) as any[]
      );
    });
  }, []);

  // Extract current folder from pathname
  const folderMatch = pathname.match(/\/mail\/([^/]+)/);
  const currentFolder = folderMatch?.[1] ?? "inbox";

  return (
    <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="size-8 md:hidden shrink-0">
          <Menu className="size-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] p-0 flex flex-col">
        <SheetHeader className="border-b p-0">
          <SheetTitle className="sr-only">Mail</SheetTitle>
          <AccountSwitcherV2 />
        </SheetHeader>

        <ScrollArea className="flex-1">
          <div className="px-2 py-2">
            {/* Mailboxes (Inbox, Sent, Drafts, Trash, etc.) */}
            <nav className="space-y-0.5">
              {(all_mailbox || []).map((mailbox) => {
                const mailboxName = mailbox.path?.toLowerCase() ?? "";
                const Icon = folderIconMap[mailboxName] || Inbox;
                const isActive =
                  currentFolder === mailboxName ||
                  currentFolder === mailbox.path;
                const hasUnread = (mailbox.unread_count ?? 0) > 0;
                return (
                  <Link
                    key={mailbox.path}
                    href={`/v2/u/mail/${mailbox.path.toLowerCase()}`}
                    onClick={() => setSheetOpen(false)}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm transition-colors",
                      isActive
                        ? "bg-accent text-accent-foreground font-medium"
                        : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
                    )}
                  >
                    <Icon className="size-4 shrink-0" />
                    <span className="truncate text-xs capitalize">
                      {mailbox.title}
                    </span>
                    {(mailbox.total_count ?? 0) > 0 && (
                      <span
                        className={cn(
                          "ml-auto text-[10px] font-medium tabular-nums",
                          hasUnread
                            ? "text-foreground font-semibold"
                            : "text-muted-foreground",
                        )}
                      >
                        {mailbox.total_count}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            {(all_mailbox || []).length > 0 && (
              <div className="mx-2 my-2">
                <Separator className="bg-border/30" />
              </div>
            )}

            {/* Custom Folders — always visible (matches desktop) */}
            <Collapsible open={foldersOpen} onOpenChange={setFoldersOpen}>
              <div className="flex items-center justify-between py-1.5">
                <CollapsibleTrigger asChild>
                  <button className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground">
                    {foldersOpen ? (
                      <ChevronDown className="size-3" />
                    ) : (
                      <ChevronRight className="size-3" />
                    )}
                    Folders
                  </button>
                </CollapsibleTrigger>
              </div>
              <CollapsibleContent className="space-y-0.5">
                {(all_folders || []).map((folder) => {
                  const folderName = folder.title?.toLowerCase() ?? "";
                  const Icon = folderIconMap[folderName] || Folder;
                  const isActive = currentFolder === folderName || currentFolder === folder.title;
                  return (
                    <Link
                      key={folder.title}
                      href={`/v2/u/mail/${folder.title}`}
                      onClick={() => setSheetOpen(false)}
                      className={cn(
                        "flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm transition-colors",
                        isActive
                          ? "bg-accent text-accent-foreground font-medium"
                          : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
                      )}
                    >
                      <Icon className="size-4 shrink-0" />
                      <span className="truncate text-xs capitalize">
                        {folder.title}
                      </span>
                      {(folder.total_count ?? 0) > 0 && (
                        <span className="ml-auto text-[10px] font-medium tabular-nums text-muted-foreground">
                          {folder.total_count}
                        </span>
                      )}
                    </Link>
                  );
                })}

                {creatingFolder && (
                  <div className="flex items-center gap-2 rounded-md px-2 py-1.5 bg-muted/50">
                    <Folder className="size-4 shrink-0 text-muted-foreground" />
                    <input
                      type="text"
                      value={newItemName}
                      onChange={(e) => setNewItemName(e.target.value)}
                      placeholder="New folder"
                      className="flex-1 text-xs bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground/40"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && newItemName.trim()) {
                          const updated = [...(all_folders || []), {
                            title: newItemName.trim(),
                            path: newItemName.trim(),
                            total_count: 0,
                            unread_count: 0,
                            read_count: 0,
                            type: MailLablesType.FOLDER,
                          } as any];
                          setAllFolders(updated);
                          setNewItemName("");
                          setCreatingFolder(false);
                        }
                        if (e.key === "Escape") {
                          setNewItemName("");
                          setCreatingFolder(false);
                        }
                      }}
                    />
                    <button
                      onClick={() => {
                        if (newItemName.trim()) {
                          const updated = [...(all_folders || []), {
                            title: newItemName.trim(),
                            path: newItemName.trim(),
                            total_count: 0,
                            unread_count: 0,
                            read_count: 0,
                            type: MailLablesType.FOLDER,
                          } as any];
                          setAllFolders(updated);
                          setNewItemName("");
                          setCreatingFolder(false);
                        }
                      }}
                      className="p-0.5 rounded hover:bg-accent text-emerald-500"
                    >
                      <Check className="size-3" />
                    </button>
                    <button
                      onClick={() => { setNewItemName(""); setCreatingFolder(false); }}
                      className="p-0.5 rounded hover:bg-accent text-red-400"
                    >
                      <X className="size-3" />
                    </button>
                  </div>
                )}

                <button
                  onClick={() => { setCreatingFolder(true); setCreatingLabel(false); setNewItemName(""); }}
                  className="flex items-center gap-1 px-2 py-1 text-[11px] text-muted-foreground/50 hover:text-muted-foreground transition-colors"
                >
                  <Plus className="size-3" />
                  Add
                </button>
              </CollapsibleContent>
            </Collapsible>

            <div className="mx-2 my-1">
              <Separator className="bg-border/30" />
            </div>

            {/* Labels — always visible (matches desktop) */}
            <Collapsible open={labelsOpen} onOpenChange={setLabelsOpen}>
              <div className="flex items-center justify-between py-1.5">
                <CollapsibleTrigger asChild>
                  <button className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground">
                    {labelsOpen ? (
                      <ChevronDown className="size-3" />
                    ) : (
                      <ChevronRight className="size-3" />
                    )}
                    Labels
                  </button>
                </CollapsibleTrigger>
              </div>
              <CollapsibleContent className="space-y-0.5">
                {(all_labels || []).map((label) => {
                  const isActive = currentFolder === label.title;
                  return (
                    <Link
                      key={label.title}
                      href={`/v2/u/mail/${label.title}`}
                      onClick={() => setSheetOpen(false)}
                      className={cn(
                        "flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm transition-colors",
                        isActive
                          ? "bg-accent text-accent-foreground font-medium"
                          : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
                      )}
                    >
                      <Tag className="size-4 shrink-0" />
                      <span className="truncate text-xs capitalize">
                        {label.title}
                      </span>
                      {(label.total_count ?? 0) > 0 && (
                        <span className="ml-auto text-[10px] font-medium tabular-nums text-muted-foreground">
                          {label.total_count}
                        </span>
                      )}
                    </Link>
                  );
                })}

                {creatingLabel && (
                  <div className="flex items-center gap-2 rounded-md px-2 py-1.5 bg-muted/50">
                    <Tag className="size-4 shrink-0 text-muted-foreground" />
                    <input
                      type="text"
                      value={newItemName}
                      onChange={(e) => setNewItemName(e.target.value)}
                      placeholder="New label"
                      className="flex-1 text-xs bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground/40"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && newItemName.trim()) {
                          const updated = [...(all_labels || []), {
                            title: newItemName.trim(),
                            path: newItemName.trim(),
                            total_count: 0,
                            unread_count: 0,
                            read_count: 0,
                            type: MailLablesType.LABEL,
                          } as any];
                          setAllLabels(updated);
                          setNewItemName("");
                          setCreatingLabel(false);
                        }
                        if (e.key === "Escape") {
                          setNewItemName("");
                          setCreatingLabel(false);
                        }
                      }}
                    />
                    <button
                      onClick={() => {
                        if (newItemName.trim()) {
                          const updated = [...(all_labels || []), {
                            title: newItemName.trim(),
                            path: newItemName.trim(),
                            total_count: 0,
                            unread_count: 0,
                            read_count: 0,
                            type: MailLablesType.LABEL,
                          } as any];
                          setAllLabels(updated);
                          setNewItemName("");
                          setCreatingLabel(false);
                        }
                      }}
                      className="p-0.5 rounded hover:bg-accent text-emerald-500"
                    >
                      <Check className="size-3" />
                    </button>
                    <button
                      onClick={() => { setNewItemName(""); setCreatingLabel(false); }}
                      className="p-0.5 rounded hover:bg-accent text-red-400"
                    >
                      <X className="size-3" />
                    </button>
                  </div>
                )}

                <button
                  onClick={() => { setCreatingLabel(true); setCreatingFolder(false); setNewItemName(""); }}
                  className="flex items-center gap-1 px-2 py-1 text-[11px] text-muted-foreground/50 hover:text-muted-foreground transition-colors"
                >
                  <Plus className="size-3" />
                  Add
                </button>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
