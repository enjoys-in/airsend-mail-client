"use client";

import React, { useEffect, useMemo, useRef } from "react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useChatStore } from "../_lib/chat-store";
import { AttachmentList } from "./FileCard";
import TimeSeparator, { getDateLabel } from "./TimeSeparator";
import type { ChatMessage } from "../_lib/chat-types";

// ---------------------------------------------------------------------------
// DMThread — the messages of one direct-message conversation, files included.
// Loads the conversation and keeps it fresh while it is open (the file cards
// download from the files service by file id, see FileCard).
// ---------------------------------------------------------------------------

const EMPTY: ChatMessage[] = [];
const POLL_MS = 8000;
const SAFETY_POLL_MS = 60_000;

export default function DMThread({ dmId, currentUserId }: { dmId: string; currentUserId: string }) {
  const messages = useChatStore((s) => s.dmMessages[dmId]) ?? EMPTY;
  const fetchDMMessages = useChatStore((s) => s.fetchDMMessages);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let last = Date.now();
    const refresh = () => {
      last = Date.now();
      void fetchDMMessages(dmId);
    };
    refresh();
    // New messages arrive over the WebSocket (dm.message.created); the poll only catches edits and deletes made
    // elsewhere, and is a delta request that returns nothing when nothing changed. Without a live socket it runs faster.
    const timer = setInterval(() => {
      if (document.visibilityState !== "visible") return;
      const live = useChatStore.getState()._ws?.readyState === WebSocket.OPEN;
      if (live && Date.now() - last < SAFETY_POLL_MS) return;
      refresh();
    }, POLL_MS);
    const onVisible = () => {
      if (document.visibilityState === "visible") refresh();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [dmId, fetchDMMessages]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length]);

  const visible = useMemo(() => messages.filter((m) => !m.isDeleted || m.attachments.length > 0), [messages]);

  let lastDay = "";
  return (
    <div className="space-y-1 pb-2">
      {visible.map((m, i) => {
        const day = new Date(m.createdAt).toDateString();
        const showDay = day !== lastDay;
        lastDay = day;
        const mine = m.authorId.toLowerCase() === currentUserId.toLowerCase();
        const prev = visible[i - 1];
        const grouped = !showDay && prev && prev.authorId === m.authorId && Date.parse(m.createdAt) - Date.parse(prev.createdAt) < 5 * 60_000;
        // A file message's text is just the file name (or an optional caption): keep it only when it adds something.
        const hideText = m.attachments.length > 0 && m.attachments.some((a) => a.name === m.content);
        return (
          <React.Fragment key={m.id}>
            {showDay && <TimeSeparator label={getDateLabel(new Date(m.createdAt))} />}
            <div className={cn("flex gap-2.5", grouped ? "pt-0" : "pt-2")}>
              <div className="w-8 shrink-0">
                {!grouped && (
                  <Avatar className="size-8">
                    <AvatarFallback className={cn("text-xs font-semibold", mine ? "bg-primary/15 text-primary" : "bg-accent")}>
                      {(m.authorName || m.authorId || "?").charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
              <div className="min-w-0 flex-1">
                {!grouped && (
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-semibold">{mine ? "You" : m.authorName || m.authorId}</span>
                    <span className="text-[11px] text-muted-foreground">
                      {new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                )}
                {m.isDeleted ? (
                  <p className="text-sm italic text-muted-foreground">This message has been deleted.</p>
                ) : (
                  !hideText && <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">{m.content}</p>
                )}
                <AttachmentList attachments={m.attachments} />
              </div>
            </div>
          </React.Fragment>
        );
      })}
      <div ref={endRef} />
    </div>
  );
}
