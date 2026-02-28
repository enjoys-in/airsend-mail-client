"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Circle,
  Clock,
  MinusCircle,
  Moon,
  Coffee,
  Loader2,
  Pencil,
  X,
  Check,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import type { PresenceStatus } from "../_lib/chat-types";

// ---------------------------------------------------------------------------
// StatusCard — compact h-10 card above message input showing user status
// Users can click to change status & set a custom status message.
// ---------------------------------------------------------------------------

const STATUS_OPTIONS: {
  value: PresenceStatus;
  label: string;
  icon: React.ReactNode;
  color: string;
  dotColor: string;
}[] = [
  {
    value: "online",
    label: "Available",
    icon: <Circle className="size-3.5 fill-emerald-500 text-emerald-500" />,
    color: "text-emerald-600 dark:text-emerald-400",
    dotColor: "bg-emerald-500",
  },
  {
    value: "busy",
    label: "Busy",
    icon: <MinusCircle className="size-3.5 text-rose-500" />,
    color: "text-rose-600 dark:text-rose-400",
    dotColor: "bg-rose-500",
  },
  {
    value: "dnd",
    label: "Do Not Disturb",
    icon: <MinusCircle className="size-3.5 text-red-500" />,
    color: "text-red-600 dark:text-red-400",
    dotColor: "bg-red-500",
  },
  {
    value: "away",
    label: "Away",
    icon: <Coffee className="size-3.5 text-orange-500" />,
    color: "text-orange-600 dark:text-orange-400",
    dotColor: "bg-orange-500",
  },
  {
    value: "idle",
    label: "Idle",
    icon: <Moon className="size-3.5 text-yellow-500" />,
    color: "text-yellow-600 dark:text-yellow-400",
    dotColor: "bg-yellow-500",
  },
  {
    value: "offline",
    label: "Appear Offline",
    icon: <Circle className="size-3.5 text-gray-400" />,
    color: "text-gray-500",
    dotColor: "bg-gray-400",
  },
];

interface StatusCardProps {
  currentStatus: PresenceStatus;
  customStatus?: string;
  displayName: string;
  onStatusChange: (status: PresenceStatus) => void;
  onCustomStatusChange?: (text: string) => void;
  className?: string;
}

export default function StatusCard({
  currentStatus,
  customStatus,
  displayName,
  onStatusChange,
  onCustomStatusChange,
  className,
}: StatusCardProps) {
  const [open, setOpen] = useState(false);
  const [editingCustom, setEditingCustom] = useState(false);
  const [customText, setCustomText] = useState(customStatus ?? "");

  const current = STATUS_OPTIONS.find((s) => s.value === currentStatus) ?? STATUS_OPTIONS[0];

  const handleSaveCustom = () => {
    onCustomStatusChange?.(customText.trim());
    setEditingCustom(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "flex h-10 w-full items-center gap-2.5 rounded-md border border-border/40 bg-accent/20 px-3 text-xs transition-colors hover:bg-accent/40",
            className,
          )}
        >
          <span className={cn("size-2.5 shrink-0 rounded-full", current.dotColor)} />
          <span className="flex-1 truncate text-left">
            <span className={cn("font-medium", current.color)}>
              {current.label}
            </span>
            {customStatus && (
              <span className="ml-1.5 text-muted-foreground">
                — {customStatus}
              </span>
            )}
          </span>
          <Pencil className="size-3 shrink-0 text-muted-foreground" />
        </button>
      </PopoverTrigger>

      <PopoverContent
        side="top"
        align="start"
        className="w-64 p-0"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        {/* Header */}
        <div className="px-3 py-2">
          <p className="text-xs font-semibold text-muted-foreground">
            Set status
          </p>
        </div>
        <Separator />

        {/* Status options */}
        <div className="py-1">
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => {
                onStatusChange(opt.value);
                setOpen(false);
              }}
              className={cn(
                "flex w-full items-center gap-2.5 px-3 py-1.5 text-sm transition-colors hover:bg-accent",
                currentStatus === opt.value && "bg-accent",
              )}
            >
              {opt.icon}
              <span className="flex-1 text-left">{opt.label}</span>
              {currentStatus === opt.value && (
                <Check className="size-3.5 text-primary" />
              )}
            </button>
          ))}
        </div>

        <Separator />

        {/* Custom status text */}
        <div className="p-2">
          {editingCustom ? (
            <div className="flex items-center gap-1.5">
              <Input
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSaveCustom();
                  if (e.key === "Escape") setEditingCustom(false);
                }}
                placeholder="What's your status?"
                className="h-7 text-xs"
                autoFocus
              />
              <Button
                size="icon"
                variant="ghost"
                className="size-7 shrink-0"
                onClick={handleSaveCustom}
              >
                <Check className="size-3.5" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="size-7 shrink-0"
                onClick={() => {
                  setEditingCustom(false);
                  setCustomText(customStatus ?? "");
                }}
              >
                <X className="size-3.5" />
              </Button>
            </div>
          ) : (
            <button
              onClick={() => setEditingCustom(true)}
              className="flex w-full items-center gap-2 rounded px-1 py-1 text-xs text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            >
              <Pencil className="size-3" />
              <span>
                {customStatus ? `"${customStatus}" — click to edit` : "Set a custom status"}
              </span>
            </button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
