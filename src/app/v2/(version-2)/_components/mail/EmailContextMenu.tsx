import type React from "react"
import {
  ChevronRight,
  Archive,
  Trash2,
  Clock,
  CheckSquare,
  MoveRight,
  Tag,
  BellOff,
  Search,
  ExternalLink,
} from "lucide-react"

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"

export function EmailContextMenu({ children }: { children: React.ReactNode }) {
  return (
    <ContextMenu>
      <ContextMenuTrigger>{children}</ContextMenuTrigger>
      <ContextMenuContent className="w-64">
        <ContextMenuSub>
          <ContextMenuSubTrigger className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MoveRight className="h-4 w-4" />
              <span>Move to tab</span>
            </div>
            <ChevronRight className="h-4 w-4" />
          </ContextMenuSubTrigger>
          <ContextMenuSubContent className="w-48">
            <ContextMenuItem>
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 flex items-center justify-center">
                  <span className="block h-2 w-2 rounded-full bg-blue-500"></span>
                </div>
                <span>Primary</span>
              </div>
            </ContextMenuItem>
            <ContextMenuItem>
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 flex items-center justify-center">
                  <span className="block h-2 w-2 rounded-full bg-green-500"></span>
                </div>
                <span>Promotions</span>
              </div>
            </ContextMenuItem>
            <ContextMenuItem>
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 flex items-center justify-center">
                  <span className="block h-2 w-2 rounded-full bg-yellow-500"></span>
                </div>
                <span>Updates</span>
              </div>
            </ContextMenuItem>
            <ContextMenuItem>
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 flex items-center justify-center">
                  <span className="block h-2 w-2 rounded-full bg-purple-500"></span>
                </div>
                <span>Forums</span>
              </div>
            </ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>

        <ContextMenuItem>
          <div className="flex items-center gap-2">
            <MoveRight className="h-4 w-4 rotate-180" />
            <span>Reply</span>
          </div>
        </ContextMenuItem>

        <ContextMenuItem>
          <div className="flex items-center gap-2">
            <MoveRight className="h-4 w-4 rotate-180" />
            <span>Reply all</span>
          </div>
        </ContextMenuItem>

        <ContextMenuItem>
          <div className="flex items-center gap-2">
            <MoveRight className="h-4 w-4" />
            <span>Forward</span>
          </div>
        </ContextMenuItem>

        <ContextMenuItem>
          <div className="flex items-center gap-2">
            <MoveRight className="h-4 w-4" />
            <span>Forward as attachment</span>
          </div>
        </ContextMenuItem>

        <ContextMenuSeparator />

        <ContextMenuItem>
          <div className="flex items-center gap-2">
            <Archive className="h-4 w-4" />
            <span>Archive</span>
          </div>
        </ContextMenuItem>

        <ContextMenuItem>
          <div className="flex items-center gap-2">
            <Trash2 className="h-4 w-4" />
            <span>Delete</span>
          </div>
        </ContextMenuItem>

        <ContextMenuItem>
          <div className="flex items-center gap-2">
            <span className="h-4 w-4 flex items-center justify-center font-bold text-xs">!</span>
            <span>Mark as unread</span>
          </div>
        </ContextMenuItem>

        <ContextMenuItem>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>Snooze</span>
          </div>
        </ContextMenuItem>

        <ContextMenuItem>
          <div className="flex items-center gap-2">
            <CheckSquare className="h-4 w-4" />
            <span>Add to Tasks</span>
          </div>
        </ContextMenuItem>

        <ContextMenuSub>
          <ContextMenuSubTrigger className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MoveRight className="h-4 w-4" />
              <span>Move to</span>
            </div>
            <ChevronRight className="h-4 w-4" />
          </ContextMenuSubTrigger>
          <ContextMenuSubContent className="w-48">
            <ContextMenuItem>Inbox</ContextMenuItem>
            <ContextMenuItem>Sent</ContextMenuItem>
            <ContextMenuItem>Drafts</ContextMenuItem>
            <ContextMenuItem>Spam</ContextMenuItem>
            <ContextMenuItem>Trash</ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>

        <ContextMenuSub>
          <ContextMenuSubTrigger className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              <span>Label as</span>
            </div>
            <ChevronRight className="h-4 w-4" />
          </ContextMenuSubTrigger>
          <ContextMenuSubContent className="w-48">
            <ContextMenuItem>Important</ContextMenuItem>
            <ContextMenuItem>Work</ContextMenuItem>
            <ContextMenuItem>Personal</ContextMenuItem>
            <ContextMenuItem>To-do</ContextMenuItem>
            <ContextMenuItem>Create new</ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>

        <ContextMenuItem>
          <div className="flex items-center gap-2">
            <BellOff className="h-4 w-4" />
            <span>Mute</span>
          </div>
        </ContextMenuItem>

        <ContextMenuItem>
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            <span>Find emails from Swarup Bhise</span>
          </div>
        </ContextMenuItem>

        <ContextMenuItem>
          <div className="flex items-center gap-2">
            <ExternalLink className="h-4 w-4" />
            <span>Open in new window</span>
          </div>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}
