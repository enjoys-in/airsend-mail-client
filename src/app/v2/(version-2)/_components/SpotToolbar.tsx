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
import { useParams } from "next/navigation"

export function SpotToolbar() {
  const params = useParams()
  const checkedItems = useMailStore((s) => s.checkedItems)
  const all_emails = useMailStore((s) => s.all_emails)
  const setCheckedItems = useMailStore((s) => s.setCheckedItems)
  const selected_mailbox = useMailStore((s) => s.selected_mailbox)
  const setAllEmails = useMailStore((s) => s.setAllEmails)
  const { listen } = useCustomEvent(CustomEventKey.MailEvents)
  const { emit } = useCustomEvent(CustomEventKey.SyncMailCounts)
  const handleImapEvents = useCallback(
    async (data: MailEventData) => {

      try {
        let response = await API.handleMailEvents(data, selected_mailbox || params.folder as string)
        if (response) {
          const res = response.data as ApiResponse<any>
          if (!res.success) {
            return toast.error(res.message)
          }
          if (data.action === "delete" || data.action === "move" || data.action === "archive") {

            // Use data.message_id (the actual IDs being acted on) instead of
            // checkedItems which can be stale/empty for single-item actions
            const idsToRemove = data.message_id || []
            const currentEmails = useMailStore.getState().all_emails
            const updatedEmails = currentEmails?.filter((item) => !idsToRemove.includes(item.message_id))

            emit(selected_mailbox || params.folder as string)
            setAllEmails(updatedEmails || [])
            await airsendDB.bulkDeleteItems("mails", idsToRemove as any)
            setCheckedItems([])

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
    [selected_mailbox, params.folder, emit, setAllEmails, setCheckedItems]
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
            <DropdownMenuItem className="text-xs">Report spam</DropdownMenuItem>
            <DropdownMenuItem className="text-xs">Report phishing</DropdownMenuItem>
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
            <DropdownMenuItem className="text-xs">Flag as important</DropdownMenuItem>
            <DropdownMenuItem className="text-xs">Flag for follow-up</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="ghost" size="sm" className="h-7 text-xs rounded-lg gap-1.5 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleImapEvents({ action: "delete", message_id: checkedItems })}>
          <Trash2 className="w-3.5 h-3.5" />
          Delete
        </Button>

        <Button variant="ghost" size="sm" className="h-7 text-xs rounded-lg gap-1.5">
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
            <DropdownMenuItem className="text-xs gap-2">
              <RefreshCw className="w-3.5 h-3.5" /> Mark as Unread
            </DropdownMenuItem>
            <DropdownMenuItem className="text-xs gap-2" disabled={checkedItems.length > 1}>
              <RefreshCw className="w-3.5 h-3.5" /> Mark All as Unread
            </DropdownMenuItem>
            <DropdownMenuItem className="text-xs gap-2">
              Move
            </DropdownMenuItem>
            <DropdownMenuItem className="text-xs gap-2" disabled={checkedItems.length > 1}>
              Move All
            </DropdownMenuItem>
            <DropdownMenuItem className="text-xs gap-2" disabled={checkedItems.length > 1}>
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
