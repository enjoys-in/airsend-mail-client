"use client";

import React, { useState, useEffect } from "react";
import { Play, Square, Clock } from "lucide-react";
import { type TaskTimeEntry } from "../_lib/tasks-types";
import { Button } from "@/components/ui/button";

interface TaskTimeTrackingProps {
  taskId: string;
}

export function TaskTimeTracking({ taskId }: TaskTimeTrackingProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [entries, setEntries] = useState<TaskTimeEntry[]>([]);

  useEffect(() => {
    let timer: any;
    if (isRunning) {
      timer = setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isRunning]);

  const handleToggleTimer = () => {
    if (isRunning) {
      if (seconds > 0) {
        setEntries((prev) => [
          {
            id: `entry-${Date.now()}`,
            taskId,
            userId: "curr-user",
            duration: seconds,
            startedAt: new Date().toISOString(),
          },
          ...prev,
        ]);
        setSeconds(0);
      }
      setIsRunning(false);
    } else {
      setIsRunning(true);
    }
  };

  const formatDuration = (totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    if (hrs > 0) return `${hrs}h ${mins}m`;
    if (mins > 0) return `${mins}m ${secs}s`;
    return `${secs}s`;
  };

  const formatTimerDisplay = (sec: number) => {
    const hrs = Math.floor(sec / 3600).toString().padStart(2, "0");
    const mins = Math.floor((sec % 3600) / 60).toString().padStart(2, "0");
    const secs = (sec % 60).toString().padStart(2, "0");
    return `${hrs}:${mins}:${secs}`;
  };

  const totalLogged = entries.reduce((acc, curr) => acc + curr.duration, 0);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        <div className="flex items-center gap-2">
          <Clock className="size-3.5" />
          <span>Time Tracking</span>
        </div>
        {totalLogged > 0 && (
          <span className="font-mono text-foreground font-medium">
            Total: {formatDuration(totalLogged)}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between rounded-xl border border-border/40 bg-card p-3 shadow-xs">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            size="icon"
            onClick={handleToggleTimer}
            variant={isRunning ? "destructive" : "default"}
            className="size-8 rounded-full shadow-xs"
          >
            {isRunning ? <Square className="size-3.5" /> : <Play className="size-3.5 fill-current" />}
          </Button>
          <span className="font-mono text-base font-bold tracking-wider text-foreground">
            {formatTimerDisplay(seconds)}
          </span>
        </div>

        <span className="text-xs text-muted-foreground">
          {isRunning ? "Tracking in progress..." : "Click play to start tracking"}
        </span>
      </div>

      {entries.length > 0 && (
        <div className="flex flex-col divide-y divide-border/20 rounded-xl border border-border/40 bg-card overflow-hidden max-h-32 overflow-y-auto">
          {entries.map((entry) => (
            <div key={entry.id} className="flex items-center justify-between px-3 py-1.5 text-xs">
              <span className="text-muted-foreground">
                {new Date(entry.startedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
              </span>
              <span className="font-mono font-medium text-foreground">
                {formatDuration(entry.duration)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
