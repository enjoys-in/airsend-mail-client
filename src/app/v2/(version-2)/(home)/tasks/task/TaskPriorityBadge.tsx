"use client";

import React from "react";
import { AlertCircle, ArrowUp, ArrowRight, ArrowDown, Minus } from "lucide-react";
import { type TaskPriority } from "../_lib/tasks-types";
import { cn } from "@/lib/utils";

interface PriorityProps {
  priority: TaskPriority;
  showLabel?: boolean;
  className?: string;
}

export function TaskPriorityBadge({ priority, showLabel = true, className }: PriorityProps) {
  const config = {
    urgent: {
      label: "Urgent",
      icon: AlertCircle,
      color: "text-red-600 bg-red-500/10 border-red-500/20",
    },
    high: {
      label: "High",
      icon: ArrowUp,
      color: "text-orange-500 bg-orange-500/10 border-orange-500/20",
    },
    medium: {
      label: "Medium",
      icon: ArrowRight,
      color: "text-amber-500 bg-amber-500/10 border-amber-500/20",
    },
    low: {
      label: "Low",
      icon: ArrowDown,
      color: "text-blue-500 bg-blue-500/10 border-blue-500/20",
    },
    none: {
      label: "None",
      icon: Minus,
      color: "text-muted-foreground bg-muted/40 border-border/40",
    },
  }[priority] || {
    label: "None",
    icon: Minus,
    color: "text-muted-foreground bg-muted/40 border-border/40",
  };

  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-medium border transition-colors",
        config.color,
        className
      )}
    >
      <Icon className="size-3.5" />
      {showLabel && <span>{config.label}</span>}
    </span>
  );
}
