"use client";

import React from "react";
import { Link as LinkIcon, Share2, Users } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { WorkspaceFile } from "../../_lib/chat-types";
import { ShareLinksPanel } from "./ShareLinksPanel";
import { SharePeoplePanel } from "./SharePeoplePanel";

interface FileShareDialogProps {
  /** A file stored in the files service (`fileId` set); null closes the dialog. */
  file: WorkspaceFile | null;
  onClose: () => void;
}

export function FileShareDialog({ file, onClose }: FileShareDialogProps) {
  const fileId = file?.fileId;
  return (
    <Dialog open={!!fileId} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 pr-6">
            <Share2 className="size-5 text-indigo-500" />
            <span className="truncate">Share {file?.name}</span>
          </DialogTitle>
          <DialogDescription>
            Create a public download link, or share it with people in your organization.
          </DialogDescription>
        </DialogHeader>

        {fileId && (
          <Tabs defaultValue="link" className="w-full">
            <TabsList className="mb-3 grid h-8 w-full grid-cols-2 bg-muted/60 p-0.5">
              <TabsTrigger value="link" className="h-7 gap-1.5 text-xs">
                <LinkIcon className="size-3.5" />
                Link
              </TabsTrigger>
              <TabsTrigger value="people" className="h-7 gap-1.5 text-xs">
                <Users className="size-3.5" />
                People
              </TabsTrigger>
            </TabsList>
            <TabsContent value="link">
              <ShareLinksPanel fileId={fileId} />
            </TabsContent>
            <TabsContent value="people">
              <SharePeoplePanel fileId={fileId} />
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}
