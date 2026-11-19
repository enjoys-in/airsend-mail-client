"use client";

import React, { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { CreateTagDialog } from "../dialogs/create-tag-dialog";
import { Button } from "../ui/button";
import type { File, Tag } from "../../_lib/files-types";
import { Badge } from "../ui/badge";
import { useTags } from "../../_hooks/useTags";
import { Plus, X } from "lucide-react";
import { toast } from "sonner";

interface FileTagsProps {
  file: File;
  availableTags: Tag[];
  refetch: () => void;
}

export function FileTags({ file, availableTags, refetch }: FileTagsProps) {
  const { addTagsToFile, removeTagsFromFile, createTag } = useTags(file.parentId);
  const [isCreateTagOpen, setIsCreateTagOpen] = useState(false);

  const handleAddTag = (tagId: string) => {
    addTagsToFile({ fileId: file.id, tagIds: [tagId], onSuccess: refetch });
  };

  const handleRemoveTag = (tagId: string) => {
    removeTagsFromFile({ fileId: file.id, tagIds: [tagId], onSuccess: refetch });
  };

  const handleCreateTag = async (data: { name: string; color: string; parentId?: string | null }) => {
    createTag(data as any, {
      onSuccess: (newTag: any) => {
        setIsCreateTagOpen(false);
        if (newTag?.id) handleAddTag(newTag.id);
      },
    });
  };

  const fileTags = file.tags || [];
  const assignedTagIds = new Set(fileTags.map((t) => t.id));
  const unassignedTags = availableTags.filter((t) => !assignedTagIds.has(t.id));

  return (
    <div className="flex flex-wrap items-center gap-1">
      {fileTags.map((tag) => (
        <Badge
          key={tag.id}
          variant="secondary"
          className="text-xs flex items-center gap-1 px-1.5 py-0.5"
          style={{ backgroundColor: `${tag.color}20`, color: tag.color, borderColor: tag.color }}
        >
          {tag.name}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleRemoveTag(tag.id);
            }}
            className="hover:opacity-75 focus:outline-none"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}

      <DropdownMenu>
        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="icon" className="h-5 w-5 rounded-full p-0">
            <Plus className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          {unassignedTags.map((tag) => (
            <DropdownMenuItem key={tag.id} onClick={() => handleAddTag(tag.id)}>
              <span className="h-2 w-2 rounded-full mr-2" style={{ backgroundColor: tag.color }} />
              {tag.name}
            </DropdownMenuItem>
          ))}
          <DropdownMenuItem onClick={() => setIsCreateTagOpen(true)}>
            <Plus className="h-3 w-3 mr-2" />
            Create new tag
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <CreateTagDialog
        isOpen={isCreateTagOpen}
        onOpenChange={setIsCreateTagOpen}
        onCreateTag={handleCreateTag}
      />
    </div>
  );
}
