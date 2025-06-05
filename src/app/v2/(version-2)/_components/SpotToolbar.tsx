"use client"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Archive, Check, ChevronDown, Flag, MoreHorizontal, RefreshCw, Shield, Trash2 } from "lucide-react"
import { Label } from "@/components/ui/label"
import { useMailStore } from "@/store/mails"
import { useCallback } from "react"
import { toast } from "sonner"
import { API } from "@/lib/api/handler"
import { ApiResponse } from "@/lib/types"
import { FaToolbox } from "react-icons/fa"
import { CustomEventKey, useCustomEvent } from "@/hooks/use-custom-event"

export function SpotToolbar() {
  const { checkedItems, all_emails, setCheckedItems, selected_mailbox } = useMailStore()
  
  const handleImapEvents = useCallback(
    async (event: string) => {
      try {
        let response
        switch (event) {
          case "delete":
            // response = await API.deleteMail(selected_mailbox!, checkedItems)
            break
          case "delete_all":
            // response = await API.deleteMail(selected_mailbox!, checkedItems, true)
            break
          case "mark_as_read":
            // response = await API.markAsReadOrUnread(selected_mailbox!, checkedItems, "mark_as_read")
            break
          case "mark_as_unread":
            // response = await API.markAsReadOrUnread(selected_mailbox!, checkedItems, "mark_as_unread")
            break
          case "mark_all_as_read":
            // response = await API.markAsReadOrUnread(selected_mailbox!, checkedItems, "mark_all_as_read")
            break
          case "mark_all_as_unread":
            // response = await API.markAsReadOrUnread(selected_mailbox!, checkedItems, "mark_all_as_unread")
            break
          case "block":
            break
          case "report":
            break
          case "move":
            // response = await API.moveEmailToAnotherMailbox(selected_mailbox!, checkedItems, "mark_all_as_unread")
            break
          case "copy":
            // response = await API.copymailToAnotherMailbox(selected_mailbox!, checkedItems, "mark_all_as_unread")
            break
          case "move_all":
            // response = await API.moveEmailToAnotherMailbox(selected_mailbox!, checkedItems, "destination_folder", true)
            break
          case "copy_all":
            // response = await API.copymailToAnotherMailbox(selected_mailbox!, checkedItems, "destination_folder", true)
            break
          default:
            toast.error("Invalid action.")
            break
        }
        if (response) {
          // const data = response.data as ApiResponse<any>
          // if (!data.success) {
          //   return toast.error(data.message)
          // }
          // if (event === "delete" || event === "move" || event === "archive") {

          //   const udpatedEmails = all_emails?.emails.filter((item) => !checkedItems.includes(item.uid))
          //   // setCheckedItems(udpatedEmails)

          // }
          // if (event === "move_all" || event === "delete_all") {
          //   setCheckedItems([])
          // }
          // toast.success(data.message)

        }
      } catch (error: any) {
        return toast.error(error.message)
      }
    },
    []
  )
  const handleSelectAll = useCallback(() => {
    const message_id = all_emails?.map((item) => item.message_id)
    if (message_id && message_id?.length > 0) {
      setCheckedItems(message_id)
    }
  },
    []
  )
  const handleUnselecteAll = useCallback(() => {
    setCheckedItems([])
  },[])
  return checkedItems.length > 0 ? (
    <div className="flex z-10 fixed items-center justify-between w-full bg:[#333333] dark:bg-[#333333] border-b text-white px-4 ">
      <div className="flex items-center space-x-1">
        {/* <Label className="flex items-center gap-2 text-sm">
          <span>Unreads</span>
          <Switch className="shadow-none" />
        </Label> */}
        <Button variant="ghost" size="sm" className="text-white hover:bg-neutral-600 rounded-none" onClick={checkedItems.length === all_emails?.length ? handleUnselecteAll : handleSelectAll}>
          <Check className="w-5 h-5 mr-2" />
          {checkedItems.length === all_emails?.length ? "Unselect All" : "Select All"}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="text-white  rounded-none">
              <Shield className="w-5 h-5 mr-2" />
              Report
              <ChevronDown className="w-4 h-4 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Report spam</DropdownMenuItem>
            <DropdownMenuItem>Report phishing</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="text-white  rounded-none">
              <Flag className="w-5 h-5 mr-2" />
              Flag
              <ChevronDown className="w-4 h-4 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Flag as important</DropdownMenuItem>
            <DropdownMenuItem>Flag for follow-up</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>      
        <Button variant="ghost" size="sm" className="text-white hover:bg-neutral-600 rounded-none">
          <svg
            className="w-5 h-5 mr-2"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
          </svg>
          Block
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="text-white hover:bg-neutral-600 rounded-none">
              <FaToolbox className="w-5 h-5 mr-2" />
              Actions
              <ChevronDown className="w-4 h-4 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-48">
            <DropdownMenuItem className="p-0">
              <Button variant="ghost" size="sm" className="text-white   rounded-none">
                <svg
                  className="w-5 h-5 mr-2"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21.2 8.4c.5.38.8.97.8 1.6v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2h9.2" />
                  <path d="M18 2a2 2 0 0 1 2 2v4" />
                  <path d="M2 8v1" />
                  <path d="M6 15h12" />
                </svg>
                Mark as Unread
              </Button>
            </DropdownMenuItem>
            <DropdownMenuItem className="p-0" disabled={checkedItems.length > 1}>
              <Button variant="ghost" size="sm" className="text-white   rounded-none">
                <svg
                  className="w-5 h-5 mr-2"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21.2 8.4c.5.38.8.97.8 1.6v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2h9.2" />
                  <path d="M18 2a2 2 0 0 1 2 2v4" />
                  <path d="M2 8v1" />
                  <path d="M6 15h12" />
                </svg>
                Mark All as Unread
              </Button>
            </DropdownMenuItem>
            <DropdownMenuItem  className="p-0">
              <Button variant="ghost" size="sm" className="text-white ounded-none">
                <svg
                  className="w-5 h-5 mr-2"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                </svg>
                Move
              </Button>
            </DropdownMenuItem>
            <DropdownMenuItem className="p-0" disabled={checkedItems.length > 1}>
              <Button variant="ghost" size="sm" className="text-white   rounded-none">
              <svg
                  className="w-5 h-5 mr-2"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                </svg>
                Move All 
              </Button>
            </DropdownMenuItem>
            <DropdownMenuItem className="p-0" disabled={checkedItems.length > 1}>
              <Button variant="ghost" size="sm" className="text-white   rounded-none">
              <svg
                  className="w-5 h-5 mr-2"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                </svg>
                Copy All 
              </Button>
            </DropdownMenuItem>
            <DropdownMenuItem  className="p-0">
              <Button variant="ghost" size="sm" className="text-white  rounded-none" onClick={() => handleImapEvents("delete")}>
                <Trash2 className="w-5 h-5 mr-2" />
                Delete
              </Button>
            </DropdownMenuItem>
            <DropdownMenuItem className="p-0" disabled={checkedItems.length > 1}>
              <Button variant="ghost" size="sm" className="text-white   rounded-none">
              <svg
                  className="w-5 h-5 mr-2"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                </svg>
                Delete All 
              </Button>
            </DropdownMenuItem>
            <DropdownMenuItem  className="p-0">
              <Button variant="ghost" size="sm" className="text-white  rounded-none">
                <Archive className="w-5 h-5 mr-2" />
                Archive
              </Button>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  ) : null
}
