"use client";

import React, { useState } from "react";
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

  const [sheetOpen, setSheetOpen] = useState(false);
  const [foldersOpen, setFoldersOpen] = useState(true);
  const [labelsOpen, setLabelsOpen] = useState(true);

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
            {/* Folders */}
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
              </CollapsibleContent>
            </Collapsible>

            <div className="mx-2 my-2">
              <Separator className="bg-border/30" />
            </div>

            {/* Labels */}
            {(all_labels || []).length > 0 && (
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
                </CollapsibleContent>
              </Collapsible>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
