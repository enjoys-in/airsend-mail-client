"use client";

import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { useSelecting, useSelection } from "../_lib/selection-store";

// ---------------------------------------------------------------------------
// SelectableMessage — in select mode, a checkbox in front of the message and
// a click anywhere on it toggles the selection (the message's own buttons are
// inert meanwhile). Outside select mode it renders the message untouched.
// ---------------------------------------------------------------------------

interface SelectableMessageProps {
  conversationId: string;
  messageId: string;
  children: React.ReactNode;
}

export default function SelectableMessage({ conversationId, messageId, children }: SelectableMessageProps) {
  const selecting = useSelecting(conversationId);
  const checked = useSelection((s) => s.selectedIds.includes(messageId));
  const toggle = useSelection((s) => s.toggle);

  if (!selecting) return <>{children}</>;

  return (
    <div
      role="checkbox"
      aria-checked={checked}
      tabIndex={0}
      onClick={() => toggle(messageId)}
      onKeyDown={(e) => {
        if (e.key === " " || e.key === "Enter") {
          e.preventDefault();
          toggle(messageId);
        }
      }}
      className={cn(
        "flex cursor-pointer items-start gap-2 rounded-md px-1 transition-colors",
        checked ? "bg-primary/10" : "hover:bg-accent/30",
      )}
    >
      <Checkbox checked={checked} className="mt-2.5 shrink-0" tabIndex={-1} aria-hidden />
      <div className="pointer-events-none min-w-0 flex-1">{children}</div>
    </div>
  );
}
