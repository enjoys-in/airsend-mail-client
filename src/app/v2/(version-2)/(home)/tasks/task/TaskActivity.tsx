"use client";

import React, { useState } from "react";
import { MessageSquare, Send } from "lucide-react";
import { type TaskActivityItem } from "../_lib/tasks-types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface TaskActivityProps {
  taskId: string;
}

export function TaskActivity({ taskId }: TaskActivityProps) {
  const [commentText, setCommentText] = useState("");
  const [activities, setActivities] = useState<TaskActivityItem[]>([
    {
      id: "act-1",
      taskId,
      userId: "u-1",
      userName: "System",
      type: "created",
      content: "Task created and assigned to project",
      createdAt: new Date().toISOString(),
    },
  ]);

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    const newActivity: TaskActivityItem = {
      id: `act-${Date.now()}`,
      taskId,
      userId: "curr-user",
      userName: "You",
      type: "comment",
      content: commentText.trim(),
      createdAt: new Date().toISOString(),
    };

    setActivities((prev) => [...prev, newActivity]);
    setCommentText("");
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        <MessageSquare className="size-3.5" />
        <span>Activity & Comments</span>
      </div>

      <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
        {activities.map((act) => (
          <div key={act.id} className="flex flex-col gap-1 rounded-lg border border-border/40 bg-card p-2.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-foreground">{act.userName}</span>
              <span className="text-[10px] text-muted-foreground">
                {new Date(act.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
            <p className="text-muted-foreground">{act.content}</p>
          </div>
        ))}
      </div>

      <form onSubmit={handlePostComment} className="flex items-center gap-2">
        <Input
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder="Write a comment..."
          className="h-8 text-xs flex-1"
        />
        <Button type="submit" size="sm" className="h-8 px-2.5 gap-1 text-xs">
          <Send className="size-3" />
          Send
        </Button>
      </form>
    </div>
  );
}
