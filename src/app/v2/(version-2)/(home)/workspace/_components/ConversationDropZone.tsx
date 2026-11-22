"use client";

import React, { createContext, useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { UploadCloud, Ban } from "lucide-react";

// ---------------------------------------------------------------------------
// ConversationDropZone: drop files anywhere over a channel / DM (message list and input), not only on the input box.
//
// MessageInput owns the upload (it knows the permissions and uses the typed text as the caption), so it registers its
// uploader here (see `ConversationUploader`) and the drop is handed to it: one code path for the paperclip, the input box
// and the whole pane.
// ---------------------------------------------------------------------------

export interface ConversationUploader {
  /** May the current user attach files in this conversation (send_messages + send_media, or a DM)? */
  canUpload: boolean;
  upload: (files: File[]) => void | Promise<void>;
}

/** MessageInput writes its current uploader into this ref; the drop zone reads it. */
export const ConversationDropContext = createContext<React.MutableRefObject<ConversationUploader | null> | null>(null);

// Only react to files, not to dragged text or links.
const hasFiles = (e: { dataTransfer: DataTransfer | null }) =>
  Array.from(e.dataTransfer?.types ?? []).includes("Files");

export default function ConversationDropZone({ children, className }: { children: React.ReactNode; className?: string }) {
  const uploader = useRef<ConversationUploader | null>(null);
  const depth = useRef(0); // dragenter/dragleave also fire for every child element
  const [dragging, setDragging] = useState(false);
  const [allowed, setAllowed] = useState(true);

  const reset = useCallback(() => {
    depth.current = 0;
    setDragging(false);
  }, []);

  // A file dropped outside the pane (sidebar, header) would make the browser open it and leave the app. Swallow those.
  useEffect(() => {
    const block = (e: DragEvent) => {
      if (hasFiles(e as unknown as { dataTransfer: DataTransfer | null })) e.preventDefault();
    };
    window.addEventListener("dragover", block);
    window.addEventListener("drop", block);
    return () => {
      window.removeEventListener("dragover", block);
      window.removeEventListener("drop", block);
    };
  }, []);

  const onDragEnter = (e: React.DragEvent) => {
    if (!hasFiles(e)) return;
    e.preventDefault();
    depth.current += 1;
    setAllowed(uploader.current?.canUpload ?? false);
    setDragging(true);
  };

  const onDragOver = (e: React.DragEvent) => {
    if (!hasFiles(e)) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = uploader.current?.canUpload ? "copy" : "none";
  };

  const onDragLeave = (e: React.DragEvent) => {
    if (!hasFiles(e)) return;
    depth.current = Math.max(0, depth.current - 1);
    if (depth.current === 0) setDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    if (!hasFiles(e)) return;
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    reset();
    const target = uploader.current;
    if (files.length > 0 && target?.canUpload) void target.upload(files);
  };

  return (
    <ConversationDropContext.Provider value={uploader}>
      <div
        className={cn("relative flex flex-1 flex-col overflow-hidden", className)}
        onDragEnter={onDragEnter}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        {children}

        {dragging && (
          <div
            // pointer-events-none: the drag keeps flowing through to the pane underneath, so enter/leave counting stays correct
            className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center bg-background/80 p-4 backdrop-blur-[1px]"
            role="status"
            aria-live="polite"
          >
            <div
              className={cn(
                "flex w-full max-w-md flex-col items-center gap-2 rounded-xl border-2 border-dashed px-6 py-10 text-center",
                allowed ? "border-primary/50 bg-primary/5 text-primary" : "border-destructive/40 bg-destructive/5 text-destructive",
              )}
            >
              {allowed ? <UploadCloud className="size-8" /> : <Ban className="size-8" />}
              <p className="text-sm font-medium">{allowed ? "Drop files to upload" : "You can't upload files here"}</p>
              {allowed ? (
                <p className="text-xs text-muted-foreground">Anything you've typed is sent with them as the caption.</p>
              ) : (
                <p className="text-xs text-muted-foreground">You don't have permission to send files in this conversation.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </ConversationDropContext.Provider>
  );
}
