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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { UpdateTagDialog } from "../dialogs/update-tag-dialog";
import { DeleteTagDialog } from "../dialogs/delete-tag-dialog";
import { CreateTagDialog } from "../dialogs/create-tag-dialog";
import { Skeleton } from "../ui/skeleton";
import { ChevronDown, Plus, MoreHorizontal, Edit, Trash } from "lucide-react";
import { Button } from "../ui/button";
import { useTags } from "../../_hooks/useTags";
import type { Tag } from "../../_lib/files-types";

export default function TagMenu() {
  const { tags, isLoading, createTag, updateTag, deleteTag } = useTags();
  const [isOpen, setIsOpen] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [deletingTag, setDeletingTag] = useState<Tag | null>(null);

  const handleCreate = (data: { name: string; color: string; parentId?: string | null }) => {
    createTag(data as any, {
      onSuccess: () => setIsCreateOpen(false),
    });
  };

  const handleUpdate = (data: { id: string; name?: string; color?: string }) => {
    updateTag(data as any, {
      onSuccess: () => setEditingTag(null),
    });
  };

  const handleDelete = () => {
    if (deletingTag) {
      deleteTag(deletingTag.id, {
        onSuccess: () => setDeletingTag(null),
      });
    }
  };

  return (
    <SidebarGroup>
      <div className="flex items-center justify-between px-2 py-1">
        <SidebarGroupLabel
          onClick={() => setIsOpen(!isOpen)}
          className="flex cursor-pointer items-center gap-1 text-xs font-semibold text-muted-foreground p-0"
        >
          <span>Tags</span>
          <ChevronDown className="h-3 w-3" />
        </SidebarGroupLabel>
        <Button
          variant="ghost"
          size="icon"
          className="h-5 w-5 rounded-full"
          onClick={() => setIsCreateOpen(true)}
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>

      {isOpen && (
        <SidebarGroupContent>
          <SidebarMenu>
            {isLoading ? (
              <div className="space-y-1 p-2">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
              </div>
            ) : tags.length === 0 ? (
              <div className="px-2 py-1.5 text-xs text-muted-foreground">No tags created</div>
            ) : (
              tags.map((tag) => (
                <SidebarMenuItem key={tag.id}>
                  <SidebarMenuButton className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 truncate">
                      <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ backgroundColor: tag.color }} />
                      <span className="truncate">{tag.name}</span>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-5 w-5 p-0">
                          <MoreHorizontal className="h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-32">
                        <DropdownMenuItem onClick={() => setEditingTag(tag)}>
                          <Edit className="h-3.5 w-3.5 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => setDeletingTag(tag)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash className="h-3.5 w-3.5 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))
            )}
          </SidebarMenu>
        </SidebarGroupContent>
      )}

      <CreateTagDialog isOpen={isCreateOpen} onOpenChange={setIsCreateOpen} onCreateTag={handleCreate} />
      {editingTag && (
        <UpdateTagDialog
          isOpen={!!editingTag}
          onOpenChange={(open) => !open && setEditingTag(null)}
          onUpdateTag={handleUpdate}
          tag={editingTag}
        />
      )}
      {deletingTag && (
        <DeleteTagDialog
          isOpen={!!deletingTag}
          onOpenChange={(open) => !open && setDeletingTag(null)}
          onDeleteTag={handleDelete}
          tag={deletingTag}
        />
      )}
    </SidebarGroup>
  );
}
