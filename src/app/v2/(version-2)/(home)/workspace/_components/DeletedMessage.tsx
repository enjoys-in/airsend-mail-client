"use client";

import React from "react";
import { Ban, Undo2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useChatStore } from "../_lib/chat-store";
import { useUndoable } from "../_lib/trash";
import type { ChatMessage } from "../_lib/chat-types";

/** A deleted message: "You deleted this message · Undo" for the deleter, "deleted by <name>" for everyone else. */
export default function DeletedMessage({ message, className }: { message: ChatMessage; className?: string }) {
  const me = useChatStore((s) => s.currentUserId || "").toLowerCase();
  const undoable = useUndoable(message.id);
  const by = message.deletedBy;
  const mine = !!by && by.email.toLowerCase() === me;
  const label = mine
    ? "You deleted this message"
    : by
      ? `This message was deleted by ${by.name}`
      : "This message was deleted";

  const undo = async () => {
    const ok = await useChatStore.getState().undoDelete(message.id);
    if (!ok) toast.error("Could not restore the message.");
  };

  return (
    <p className={cn("flex items-center gap-1.5 text-sm italic text-muted-foreground", className)}>
      <Ban className="size-3.5 shrink-0" />
      <span>{label}</span>
      {mine && undoable && (
        <button
          type="button"
          onClick={undo}
          className="ml-1 inline-flex items-center gap-1 font-medium not-italic text-primary hover:underline"
        >
          <Undo2 className="size-3.5" />
          Undo
        </button>
      )}
    </p>
  );
}
