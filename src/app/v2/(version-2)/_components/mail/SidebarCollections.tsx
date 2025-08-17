"use client"

import { toast } from "@/components/ui/use-toast"
import { useMailStore } from "@/store/mails"
import { ChevronUp, Plus, Check, X, Folder, Tag } from "lucide-react"
import { useState } from "react"

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
}

const SidebarCollections: React.FC<SidebarCollectionsProps> = ({ text }) => {
  const { all_folders, all_labels } = useMailStore()
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [showAll, setShowAll] = useState<boolean>(false)
  const [isCreating, setIsCreating] = useState<boolean>(false)
  const [newItemName, setNewItemName] = useState<string>("")
  const { setAllFolders, setAllLabels } = useMailStore()

  const isFolder = text.toLowerCase().includes("folder")
  const [items, setItems] = useState<CollectionItem[]>([
    { id: "1", name: "Important", count: 32, color: "bg-purple-500" },
    { id: "2", name: "Shared", count: 42, color: "bg-cyan-500" },
    { id: "3", name: "Applications", count: 12, color: "bg-yellow-500" },
    { id: "4", name: "Work", count: 8, color: "bg-green-500" },
    { id: "5", name: "Personal", count: 15, color: "bg-red-500" },
    { id: "11", name: "Updates", count: 24, color: "bg-indigo-500" },
    { id: "12", name: "Promotions", count: 18, color: "bg-teal-500" },
  ])

  const handleCreateItem = (): void => {
    toast({
      title: "Feature coming soon",

    })
    return
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
      const newItem: CollectionItem = {
        id: Date.now().toString(),
        name: newItemName.trim(),
        count: 0,
        color: colors[Math.floor(Math.random() * colors.length)],
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
    <div className="space-y-1">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex flex-row gap-2 my-2 items-center text-blue-500 hover:text-blue-400 dark:text-blue-400 dark:hover:text-blue-300 transition-colors w-full text-left"
      >

        {isFolder ? <Folder size={16} /> : <Tag size={16} />}
        {text}
        <ChevronUp
          size={16}
          className={`ml-auto transform transition-transform duration-300 ${isOpen ? "rotate-0" : "rotate-180"}`}
        />
      </button>

      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? "max-h-64 opacity-100" : "max-h-0 opacity-0"
          }`}
      >
        <div className="space-y-1">
          <div className="max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent cursor-pointer">
            {visibleItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center py-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md px-1 transition-colors cursor-pointer"
              >
                <div className="w-6 h-6 flex items-center justify-center">
                  <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                </div>
                <span className="ml-2 text-sm flex-1 dark:text-gray-200">{item.name}</span>
                <span className="ml-auto text-gray-500 dark:text-gray-400 text-xs">{item.count}</span>
              </div>
            ))}
          </div>

          {isCreating && (
            <div className="flex items-center py-2 px-1 bg-gray-50 dark:bg-gray-800 rounded-md">
              <div className="w-6 h-6 flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-gray-400"></div>
              </div>
              <input
                type="text"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder={`New ${isFolder ? "folder" : "label"} name`}
                className="ml-2 text-sm flex-1 bg-transparent border-none outline-none dark:text-gray-200"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCreateItem()
                  if (e.key === "Escape") handleCancelCreate()
                }}
              />
              <div className="flex gap-1 ml-2">
                <button
                  onClick={handleCreateItem}
                  className="p-1 hover:bg-green-100 dark:hover:bg-green-900 rounded text-green-600 dark:text-green-400 transition-colors"
                >
                  <Check size={12} />
                </button>
                <button
                  onClick={handleCancelCreate}
                  className="p-1 hover:bg-red-100 dark:hover:bg-red-900 rounded text-red-600 dark:text-red-400 transition-colors"
                >
                  <X size={12} />
                </button>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between py-1">
            {!showAll && hiddenCount > 0 && (
              <button
                onClick={() => setShowAll(true)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-xs transition-colors"
              >
                Show {hiddenCount} more
              </button>
            )}

            {showAll && items.length > 3 && (
              <button
                onClick={() => setShowAll(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-xs transition-colors"
              >
                Show less
              </button>
            )}

            <button
              onClick={() => setIsCreating(true)}
              className="flex items-center gap-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-xs transition-colors ml-auto"
            >
              <Plus size={12} />
              Add {isFolder ? "folder" : "label"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SidebarCollections
