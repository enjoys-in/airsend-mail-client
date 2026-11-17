"use client"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Archive, Check, ChevronDown, Flag, MoreHorizontal, RefreshCw, Shield, Trash2 } from "lucide-react"
import { useMailStore } from "@/store/mails"
import { useCallback, useEffect } from "react"
import { toast } from "sonner"
import { API } from "@/lib/api/handler"
import { ApiResponse } from "@/lib/types"
import { CustomEventKey, useCustomEvent } from "@/hooks/use-custom-event"
import { MailEventData } from "@/lib/types/update-mail-events.interface"
import { airsendDB } from "@/db"
import { applyMailActionResult, MailEventResult } from "@/db/mailbox-sync"
import { useParams } from "next/navigation"

/** Actions that take mail out of the folder on screen (the server applies them to whole threads). */
const REMOVING_ACTIONS = new Set<string>(["delete", "delete_all", "move", "move_all", "archive", "spam"])

export function SpotToolbar() {
  const params = useParams()
  const checkedItems = useMailStore((s) => s.checkedItems)
  const all_emails = useMailStore((s) => s.all_emails)
  const setCheckedItems = useMailStore((s) => s.setCheckedItems)
  const selected_mailbox = useMailStore((s) => s.selected_mailbox)
  const setAllEmails = useMailStore((s) => s.setAllEmails)
  const { listen } = useCustomEvent(CustomEventKey.MailEvents)
  const handleImapEvents = useCallback(
    async (data: MailEventData) => {
      // The EventBridge re-broadcasts server SyncEvents ({ type, eventId, payload })
      // on this same window event. Those are NOT user actions — sending them back
      // to the API caused a request echo loop for every incoming socket event.
      if (!data || typeof (data as any).action !== "string") return

      try {
        const currentFolder = selected_mailbox || params.folder as string
        let response = await API.handleMailEvents(data, currentFolder)
        if (response) {
          const res = response.data as ApiResponse<MailEventResult | null>
          if (!res.success) {
            return toast.error(res.message)
          }
          // The response carries every message touched (whole threads for moves/deletes) and the
          // counts of each folder involved, so nothing is fetched again here.
          const removesMail = REMOVING_ACTIONS.has(data.action)
          const affected = await applyMailActionResult({
            result: res.result,
            fallbackIds: data.message_id || [],
            currentFolder,
            removesMail,
          })
          if (removesMail) {
            const gone = new Set(affected)
            const currentEmails = useMailStore.getState().all_emails
            setAllEmails(currentEmails?.filter((item) => !gone.has(item.message_id)) || [])
            setCheckedItems([])
          }
          // Flag-style actions (hover star/flag, toolbar read/unread): reflect the
          // change locally — previously the API was called but the row never updated.
          const flagUpdate: Record<string, Record<string, boolean>> = {
            star: { is_starred: true },
            unstar: { is_starred: false },
            importance: { is_important: true },
            unimportance: { is_important: false },
            mark_as_read: { is_read: true },
            read: { is_read: true },
            mark_as_unread: { is_read: false },
            unread: { is_read: false },
          }
          const changes = flagUpdate[data.action]
          if (changes && data.message_id?.length) {
            const ids = new Set(data.message_id)
            const currentEmails = useMailStore.getState().all_emails
            if (currentEmails) {
              setAllEmails(currentEmails.map((m) => (ids.has(m.message_id) ? { ...m, ...changes } : m)))
            }
            await Promise.all(
              data.message_id.map((id) => airsendDB.updateItem("mails", id, changes as any).catch(() => { }))
            )
          }
          if (data.action === "move_all" || data.action === "delete_all") {
            setCheckedItems([])
          }
          toast.success(res.message)

        }
      } catch (error: any) {
        return toast.error(error.message)
      }
    },
    [selected_mailbox, params.folder, setAllEmails, setCheckedItems]
  )
  const handleSelectAll = useCallback(() => {
    const message_id = all_emails?.map((item) => item.message_id)
    if (message_id && message_id?.length > 0) {
      setCheckedItems(message_id)
    }
  },
    [all_emails, setCheckedItems]
  )
  const handleUnselecteAll = useCallback(() => {
    setCheckedItems([])
  }, [setCheckedItems])
  useEffect(() => {
    const unsubscribe = listen(handleImapEvents)
    return () => { unsubscribe() }
  }, [listen, handleImapEvents])

  // Hide on message detail page (preview) — only show on mail list
  if (params.message_id) return null

  return checkedItems.length > 0 ? (
    <div className="flex z-40 sticky top-12 items-center justify-between w-full bg-background/95 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 border-b border-border/40 text-foreground px-3 h-10 animate-in slide-in-from-top-1 duration-300 ease-out shadow-sm">
      <div className="flex items-center gap-0.5">
        <Button variant="ghost" size="sm" className="h-7 text-xs rounded-lg gap-1.5" onClick={checkedItems.length === all_emails?.length ? handleUnselecteAll : handleSelectAll}>
          <Check className="w-3.5 h-3.5" />
          {checkedItems.length === all_emails?.length ? "Unselect" : "Select All"}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-7 text-xs rounded-lg gap-1.5">
              <Shield className="w-3.5 h-3.5" />
              Report
              <ChevronDown className="w-3 h-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="rounded-lg">
            <DropdownMenuItem className="text-xs" onClick={() => handleImapEvents({ action: "spam", message_id: checkedItems })}>Report spam</DropdownMenuItem>
            <DropdownMenuItem className="text-xs" onClick={() => handleImapEvents({ action: "spam", message_id: checkedItems })}>Report phishing</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-7 text-xs rounded-lg gap-1.5">
              <Flag className="w-3.5 h-3.5" />
              Flag
              <ChevronDown className="w-3 h-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="rounded-lg">
            <DropdownMenuItem className="text-xs" onClick={() => handleImapEvents({ action: "importance", message_id: checkedItems })}>Flag as important</DropdownMenuItem>
            <DropdownMenuItem className="text-xs" onClick={() => handleImapEvents({ action: "flag", message_id: checkedItems })}>Flag for follow-up</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="ghost" size="sm" className="h-7 text-xs rounded-lg gap-1.5 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleImapEvents({ action: "delete", message_id: checkedItems })}>
          <Trash2 className="w-3.5 h-3.5" />
          Delete
        </Button>

        <Button variant="ghost" size="sm" className="h-7 text-xs rounded-lg gap-1.5" onClick={() => handleImapEvents({ action: "archive", message_id: checkedItems })}>
          <Archive className="w-3.5 h-3.5" />
          Archive
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-7 text-xs rounded-lg gap-1.5">
              <MoreHorizontal className="w-3.5 h-3.5" />
              More
              <ChevronDown className="w-3 h-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-44 rounded-lg">
            <DropdownMenuItem className="text-xs gap-2" onClick={() => handleImapEvents({ action: "mark_as_unread", message_id: checkedItems })}>
              <RefreshCw className="w-3.5 h-3.5" /> Mark as Unread
            </DropdownMenuItem>
            <DropdownMenuItem className="text-xs gap-2" onClick={() => handleImapEvents({ action: "mark_all_as_unread", message_id: checkedItems })}>
              <RefreshCw className="w-3.5 h-3.5" /> Mark All as Unread
            </DropdownMenuItem>
            <DropdownMenuItem className="text-xs gap-2" onClick={() => handleImapEvents({ action: "move", message_id: checkedItems })}>
              Move
            </DropdownMenuItem>
            <DropdownMenuItem className="text-xs gap-2" onClick={() => handleImapEvents({ action: "move_all", message_id: checkedItems })}>
              Move All
            </DropdownMenuItem>
            <DropdownMenuItem className="text-xs gap-2 text-destructive" onClick={() => handleImapEvents({ action: "delete_all", message_id: checkedItems })}>
              Delete All
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <span className="text-[11px] text-muted-foreground tabular-nums font-medium">
        {checkedItems.length} selected
      </span>
    </div>
  ) : null
}
