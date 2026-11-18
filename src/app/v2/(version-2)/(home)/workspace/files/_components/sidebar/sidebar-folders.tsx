"use client";

import React, { useState } from "react";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../ui/sidebar";
import { ChevronDown, FileText, Folder, PinOff } from "lucide-react";
import { useDriveOps } from "../../_hooks/useDriveOps";
import { useNavigate, useSearch } from "../../_lib/router-shim";
import { Skeleton } from "../ui/skeleton";
import type { PinnedFile } from "../../_lib/files-types";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";

function getFileIcon(type?: string) {
  if (type === "folder") {
    return <Folder className="h-4 w-4 text-blue-500 fill-blue-500/20" />;
  }
  return <FileText className="h-4 w-4 text-muted-foreground" />;
}

export default function SidebarPinnedFiles() {
  const searchParams = useSearch();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(true);
  const { pinnedFiles, isLoadingPinnedFiles, unpinFile } = useDriveOps();

  const handleFileClick = (fileId: string) => {
    navigate({
      search: { ...searchParams, folderId: fileId },
    });
  };

  return (
    <SidebarGroup>
      <SidebarGroupLabel
        onClick={() => setIsOpen(!isOpen)}
        className="flex cursor-pointer items-center justify-between px-2 text-xs font-semibold text-muted-foreground"
      >
        <span>Pinned</span>
        <ChevronDown className={cn("h-4 w-4 transition-transform", !isOpen && "-rotate-90")} />
      </SidebarGroupLabel>
      {isOpen && (
        <SidebarGroupContent>
          <SidebarMenu>
            {isLoadingPinnedFiles ? (
              <div className="space-y-1 p-2">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
              </div>
            ) : pinnedFiles.length === 0 ? (
              <div className="px-2 py-1.5 text-xs text-muted-foreground">No pinned items</div>
            ) : (
              pinnedFiles.map((file) => (
                <SidebarMenuItem key={file.id}>
                  <SidebarMenuButton
                    onClick={() => handleFileClick(file.fileId)}
                    className="flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2 truncate">
                      {getFileIcon()}
                      <span className="truncate">{file.fileId}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 opacity-0 hover:opacity-100 group-hover:opacity-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        unpinFile(file.fileId);
                      }}
                    >
                      <PinOff className="h-3 w-3" />
                    </Button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))
            )}
          </SidebarMenu>
        </SidebarGroupContent>
      )}
    </SidebarGroup>
  );
}
