"use client"
import { useEffect } from "react"
import { appSocket } from "@/lib/sockets/socket"
import { useImapStatusStore } from "@/store/imap-status"
import { eventBus } from "@/lib/event-bus"
import { CustomEventKey } from "@/hooks/use-custom-event"
import { BridgeEvent } from "@/lib/event-bridge"

interface SyncEvent {
  eventId: string
  type: string
  payload: any
  timestamp: number
  source: string
}

/**
 * Subscribes to IMAP session status events.
 * - `session.status` (initial state on connect) — listened directly on socket (not a SyncEvent)
 * - `session.imap.connected` / `session.imap.disconnected` — consumed via eventBus
 *   (the event-bridge already handles socket → decode → dispatch to eventBus)
 *
 * Writes to a Zustand store — does NOT cause parent re-renders.
 * Mount this once near the socket provider.
 */
export function useImapStatus() {
  const setInitialStatus = useImapStatusStore((s) => s.setInitialStatus)
  const setConnected = useImapStatusStore((s) => s.setConnected)
  const setDisconnected = useImapStatusStore((s) => s.setDisconnected)

  useEffect(() => {
    // ── 1. Initial state (not a SyncEvent — plain JSON from Redis hash) ──
    const onSessionStatus = (data: {
      imapConnected: boolean
      imapConnectedAt?: string
      imapDisconnectedAt?: string
      webConnected?: boolean
      webConnectedAt?: string
      webDisconnectedAt?: string
    }) => {
      setInitialStatus(data)
    }

    appSocket.on("session.status", onSessionStatus)

    // ── 2. Real-time updates via eventBus (event-bridge decodes msgpack) ──
    const onMailEvent = (event: SyncEvent) => {
      if (event.type === BridgeEvent.IMAP_CONNECTED) {
        setConnected(event.payload?.timestamp ?? new Date().toISOString())
      } else if (event.type === BridgeEvent.IMAP_DISCONNECTED) {
        setDisconnected(event.payload?.timestamp ?? new Date().toISOString())
      }
    }

    eventBus.on(CustomEventKey.MailEvents, onMailEvent)

    return () => {
      appSocket.off("session.status", onSessionStatus)
      eventBus.off(CustomEventKey.MailEvents, onMailEvent)
    }
  }, [setInitialStatus, setConnected, setDisconnected])
}
