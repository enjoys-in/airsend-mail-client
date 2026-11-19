"use client";

import React, { useState } from "react";
import { Inbox, CheckCheck, MessageSquare, Clock, UserCheck, Bell } from "lucide-react";
import { useTasks } from "../_lib/tasks-context";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NotificationItem {
  id: string;
  type: "assigned" | "comment" | "due_soon" | "status";
  title: string;
  taskId: string;
  time: string;
  isRead: boolean;
}

export function InboxView() {
  const { tasks, setSelectedTask } = useTasks();
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => [
    {
      id: "notif-1",
      type: "assigned",
      title: "You were assigned to Setup PostgreSQL tasks schema",
      taskId: tasks[0]?.id || "",
      time: "10m ago",
      isRead: false,
    },
    {
      id: "notif-2",
      type: "comment",
      title: "New comment on API Authentication and scoping",
      taskId: tasks[1]?.id || "",
      time: "1h ago",
      isRead: false,
    },
    {
      id: "notif-3",
      type: "due_soon",
      title: "Task due tomorrow: Workspace settings route alignment",
      taskId: tasks[2]?.id || "",
      time: "3h ago",
      isRead: true,
    },
  ]);

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const handleSelect = (notif: NotificationItem) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n))
    );
    const found = tasks.find((t) => t.id === notif.taskId);
    if (found) setSelectedTask(found);
  };

  const filtered = filter === "all" ? notifications : notifications.filter((n) => !n.isRead);
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="flex flex-1 flex-col h-full bg-background overflow-hidden p-4 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-5">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <Inbox className="size-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-foreground">Inbox</h1>
              {unreadCount > 0 && (
                <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">
                  {unreadCount} unread
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Updates, mentions, and notifications across your teams.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-lg border border-border/60 p-0.5 bg-muted/20">
            <button
              onClick={() => setFilter("all")}
              className={cn(
                "px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer",
                filter === "all" ? "bg-card text-foreground shadow-xs font-semibold" : "text-muted-foreground hover:text-foreground"
              )}
            >
              All
            </button>
            <button
              onClick={() => setFilter("unread")}
              className={cn(
                "px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer",
                filter === "unread" ? "bg-card text-foreground shadow-xs font-semibold" : "text-muted-foreground hover:text-foreground"
              )}
            >
              Unread
            </button>
          </div>

          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={markAllAsRead} className="h-8 text-xs gap-1.5">
              <CheckCheck className="size-3.5" />
              Mark all read
            </Button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center p-8 space-y-2">
            <Bell className="size-8 text-muted-foreground/50" />
            <p className="text-sm font-medium text-foreground">All caught up!</p>
            <p className="text-xs text-muted-foreground">No new notifications in this inbox.</p>
          </div>
        ) : (
          <div className="rounded-xl border border-border/60 bg-card divide-y divide-border/40 overflow-hidden">
            {filtered.map((item) => {
              const Icon =
                item.type === "assigned" ? UserCheck :
                item.type === "comment" ? MessageSquare : Clock;

              return (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  className={cn(
                    "flex w-full items-start gap-3.5 p-4 text-left transition-colors cursor-pointer hover:bg-muted/30",
                    !item.isRead && "bg-primary/5"
                  )}
                >
                  <div className={cn(
                    "size-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5",
                    item.type === "assigned" ? "bg-blue-500/10 text-blue-500" :
                    item.type === "comment" ? "bg-amber-500/10 text-amber-500" : "bg-purple-500/10 text-purple-500"
                  )}>
                    <Icon className="size-4" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className={cn("text-xs", !item.isRead ? "font-semibold text-foreground" : "font-medium text-muted-foreground")}>
                        {item.title}
                      </span>
                      <span className="text-[10px] text-muted-foreground whitespace-nowrap">{item.time}</span>
                    </div>
                  </div>

                  {!item.isRead && <span className="size-2 rounded-full bg-primary shrink-0 mt-2" />}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
export default InboxView;
