"use client"
import React from "react"
import { MailBoxListAPIResponse, MailLablesType } from "@/lib/types/MailBoxListResponse.interface"
import { useMailStore } from "@/store/mails"
import { ChevronUp, Plus, Check, X, Folder, Tag } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import { useState } from "react"

import { cn } from "@/lib/utils"
import Link from "next/link"

type TailwindBgColor =
  | "bg-purple-500"
  | "bg-cyan-500"
  | "bg-yellow-500"
  | "bg-green-500"
  | "bg-red-500"
  | "bg-gray-500"
  | "bg-orange-500"
  | "bg-blue-500"
  | "bg-pink-500"
  | "bg-slate-500"
  | "bg-indigo-500"
  | "bg-teal-500"

export interface CollectionItem {
  id: string
  name: string
  count: number
  color: TailwindBgColor
}

interface SidebarCollectionsProps {
  text: string
  list: MailBoxListAPIResponse[]
}

const SidebarCollections: React.FC<SidebarCollectionsProps> = ({ text, list }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [showAll, setShowAll] = useState<boolean>(false)
  const [isCreating, setIsCreating] = useState<boolean>(false)
  const [newItemName, setNewItemName] = useState<string>("")
  const setAllFolders = useMailStore((state) => state.setAllFolders)
  const setAllLabels = useMailStore((state) => state.setAllLabels)
  const setSelectedMailbox = useMailStore((state) => state.setSelectedMailbox)
  const selected_mailbox = useMailStore((state) => state.selected_mailbox)

  const isFolder = text.toLowerCase().includes("folder")
  const [items, setItems] = useState<Partial<MailBoxListAPIResponse>[]>(list)
  const pathname = usePathname();

  // Sync local items state when prop changes (e.g. after API fetch)
  React.useEffect(() => {
    setItems(list)
  }, [list])

  const router = useRouter()
  const handleCreateItem = (): void => {


    if (newItemName.trim()) {
      const colors: TailwindBgColor[] = [
        "bg-purple-500",
        "bg-cyan-500",
        "bg-yellow-500",
        "bg-green-500",
        "bg-red-500",
        "bg-blue-500",
        "bg-orange-500",
        "bg-pink-500",
      ]
      const newItem: Partial<MailBoxListAPIResponse> = {
        title: newItemName.trim(),
        total_count: 0,
        color: colors[Math.floor(Math.random() * colors.length)],
        type: isFolder ? MailLablesType.FOLDER : MailLablesType.LABEL,
      }
      const updated = [...items, newItem]
      setItems(updated)
      setNewItemName("")
      setIsCreating(false)

      if (isFolder) {
        setAllFolders(updated as any)
      } else {
        setAllLabels(updated as any)
      }
    }
  }

  const handleCancelCreate = (): void => {
    setNewItemName("")
    setIsCreating(false)
  }

  const visibleItems = showAll ? items.slice(0, 12) : items.slice(0, 3)
  const hiddenCount = Math.min(items.length - 3, 9)

  return (
    <div className="space-y-0.5 px-2">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 w-full h-7 px-1 text-xs font-medium uppercase tracking-wider text-muted-foreground/60 hover:text-muted-foreground transition-colors duration-150"
      >
        {isFolder ? <Folder size={13} /> : <Tag size={13} />}
        <span>{text}</span>
        <ChevronUp
          size={13}
          className={cn(
            "ml-auto transition-transform duration-200",
            isOpen ? "rotate-0" : "rotate-180"
          )}
        />
      </button>

      <div
        className={cn(
          "overflow-hidden transition-all duration-200 ease-out",
          isOpen ? "max-h-64 opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="flex flex-col gap-0.5">
          <div className="max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
            {(visibleItems as MailBoxListAPIResponse[])?.map((item) => {
              const isSelected = selected_mailbox === item?.path || pathname.includes(item?.path?.toLowerCase());
              return (
                <div
                  onClick={() => {
                    setSelectedMailbox(item?.path.toLowerCase());
                    router.push(`/v2/u/mail/${item?.path.toLowerCase()}`);
                  }}
                  key={item.id}
                  className={cn(
                    "group flex items-center justify-between h-8 px-2 rounded-lg cursor-pointer",
                    "transition-colors duration-150 ease-out",
                    isSelected
                      ? "bg-accent text-accent-foreground font-medium"
                      : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                  )}
                >
                  <Link prefetch href={`/v2/u/mail/${item.path.toLowerCase()}`} className="flex items-center gap-2 min-w-0 flex-1">
                    <div className={cn("w-2.5 h-2.5 rounded-full flex-shrink-0", `bg-${item.color}`)} />
                    <span className="text-[13px] truncate">{item.title}</span>
                  </Link>
                  {item.total_count > 0 && (
                    <span className={cn(
                      "text-[11px] tabular-nums",
                      item?.unread_count > item?.read_count ? "text-foreground font-semibold" : "text-muted-foreground/50"
                    )}>
                      {item.total_count}
                    </span>
                  )}
                </div>
              )
            })}
          </div>

          {isCreating && (
            <div className="flex items-center h-8 px-2 rounded-lg bg-muted/50">
              <div className="w-2.5 h-2.5 rounded-full bg-muted-foreground/30 flex-shrink-0" />
              <input
                type="text"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder={`New ${isFolder ? "folder" : "label"}`}
                className="ml-2 text-[13px] flex-1 bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground/40"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCreateItem()
                  if (e.key === "Escape") handleCancelCreate()
                }}
              />
              <div className="flex gap-0.5">
                <button onClick={handleCreateItem} className="p-1 rounded hover:bg-accent text-emerald-500 transition-colors duration-150">
                  <Check size={12} />
                </button>
                <button onClick={handleCancelCreate} className="p-1 rounded hover:bg-accent text-red-400 transition-colors duration-150">
                  <X size={12} />
                </button>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between px-1 py-1">
            {!showAll && hiddenCount > 0 && (
              <button onClick={() => setShowAll(true)} className="text-[11px] text-muted-foreground/50 hover:text-muted-foreground transition-colors duration-150">
                {hiddenCount} more
              </button>
            )}
            {showAll && items.length > 3 && (
              <button onClick={() => setShowAll(false)} className="text-[11px] text-muted-foreground/50 hover:text-muted-foreground transition-colors duration-150">
                Show less
              </button>
            )}
            <button
              onClick={() => setIsCreating(true)}
              className="flex items-center gap-1 text-[11px] text-muted-foreground/50 hover:text-muted-foreground transition-colors duration-150 ml-auto"
            >
              <Plus size={11} />
              Add
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SidebarCollections