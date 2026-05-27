"use client"
import React from "react"
import { useImapStatusStore } from "@/store/imap-status"
import { useImapStatus } from "@/hooks/use-imap-status"
import { cn } from "@/lib/utils"

/**
 * Self-contained IMAP connection status indicator.
 * Subscribes to socket events internally — no props needed.
 * Isolated: parent never re-renders due to status changes.
 */
export function ImapStatusIndicator() {
  // Activate the socket listener (writes to zustand, not local state)
  useImapStatus()

  const imapConnected = useImapStatusStore((s) => s.imapConnected)
  const since = useImapStatusStore((s) => s.since)

  const label = imapConnected ? "IMAP Connected" : "IMAP Disconnected"
  const timeLabel = since ? new Date(since).toLocaleTimeString() : ""

  return (
    <div className="flex items-center gap-1.5 text-xs select-none" title={`${label}${timeLabel ? ` since ${timeLabel}` : ""}`}>
      <span
        className={cn(
          "inline-block h-2 w-2 rounded-full",
          imapConnected ? "bg-emerald-500" : "bg-red-500"
        )}
      />
      <span className={cn("text-muted-foreground", imapConnected ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400")}>
        {label}
      </span>
    </div>
  )
}
