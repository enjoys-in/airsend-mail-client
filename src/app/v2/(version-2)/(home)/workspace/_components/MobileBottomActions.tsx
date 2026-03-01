"use client";

import React from "react";
import { cn } from "@/lib/utils";
import {
  Hash,
  Menu,
  X,
  MessageSquare,
  Activity,
  CheckSquare,
  Users,
  Search,
  Pin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useChatStore } from "../_lib/chat-store";
import ThreadPanel from "./ThreadPanel";
import SidePanel from "./SidePanel";

// ---------------------------------------------------------------------------
// MobileBottomActions — bottom toolbar for mobile with sheet panels
// ---------------------------------------------------------------------------

export function MobileBottomActions() {
  const {
    sidePanelView,
    activeThreadMessageId,
    setSidePanelView,
    getUnreadNotificationCount,
    getPendingTaskCount,
  } = useChatStore();

  const unreadCount = getUnreadNotificationCount();
  const taskCount = getPendingTaskCount();

  return (
    <div className="flex h-12 shrink-0 items-center justify-around border-t border-border/40 bg-background md:hidden">
      {/* Thread */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="size-9">
            <MessageSquare className="size-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-[80vh] p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>Thread</SheetTitle>
          </SheetHeader>
          {activeThreadMessageId ? (
            <ThreadPanel />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
              No thread selected
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Activity */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="relative size-9">
            <Activity className="size-4" />
            {unreadCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-[80vh] p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>Activity</SheetTitle>
          </SheetHeader>
          <div className="h-full">
            <SidePanelMobileWrapper view="activity" />
          </div>
        </SheetContent>
      </Sheet>

      {/* Tasks */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="relative size-9">
            <CheckSquare className="size-4" />
            {taskCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-orange-500 text-[10px] font-bold text-white">
                {taskCount > 9 ? "9+" : taskCount}
              </span>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-[80vh] p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>Tasks</SheetTitle>
          </SheetHeader>
          <div className="h-full">
            <SidePanelMobileWrapper view="tasks" />
          </div>
        </SheetContent>
      </Sheet>

      {/* Members */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="size-9">
            <Users className="size-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-[80vh] p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>Members</SheetTitle>
          </SheetHeader>
          <div className="h-full">
            <SidePanelMobileWrapper view="members" />
          </div>
        </SheetContent>
      </Sheet>

      {/* Search */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="size-9">
            <Search className="size-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-[80vh] p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>Search</SheetTitle>
          </SheetHeader>
          <div className="h-full">
            <SidePanelMobileWrapper view="search" />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Wrapper to render SidePanel content in mobile sheet
// ---------------------------------------------------------------------------

function SidePanelMobileWrapper({
  view,
}: {
  view: "activity" | "tasks" | "members" | "pinned" | "search";
}) {
  // Temporarily set the sidePanelView for rendering
  const { setSidePanelView } = useChatStore();

  // Set the view when mounted
  React.useEffect(() => {
    setSidePanelView(view);
    return () => setSidePanelView(null);
  }, [view, setSidePanelView]);

  return <SidePanel />;
}
