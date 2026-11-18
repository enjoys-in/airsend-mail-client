"use client";

import React from "react";
import { Tag, Check, Plus } from "lucide-react";
import { type TaskLabel } from "../_lib/tasks-types";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface TaskLabelsPopoverProps {
  availableLabels: TaskLabel[];
  selectedLabels: TaskLabel[];
  onToggleLabel: (labelId: string) => void;
}

export function TaskLabelsPopover({
  availableLabels,
  selectedLabels,
  onToggleLabel,
}: TaskLabelsPopoverProps) {
  const selectedIds = new Set(selectedLabels.map((l) => l.id));

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5">
          <Tag className="size-3 text-muted-foreground" />
          <span>Labels</span>
          {selectedLabels.length > 0 && (
            <span className="rounded-full bg-primary/10 text-primary px-1.5 py-0.2 text-[10px] font-semibold">
              {selectedLabels.length}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-56 p-2 text-xs">
        <div className="font-semibold text-muted-foreground mb-2 px-1">Task Labels</div>
        <div className="flex flex-col gap-1 max-h-48 overflow-y-auto">
          {availableLabels.map((lbl) => {
            const isSelected = selectedIds.has(lbl.id);
            return (
              <button
                key={lbl.id}
                onClick={() => onToggleLabel(lbl.id)}
                className="flex items-center justify-between rounded px-2 py-1.5 hover:bg-muted/50 text-left transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="size-2 rounded-full"
                    style={{ backgroundColor: lbl.color }}
                  />
                  <span>{lbl.name}</span>
                </div>
                {isSelected && <Check className="size-3 text-primary" />}
              </button>
            );
          })}
          {availableLabels.length === 0 && (
            <p className="text-muted-foreground text-center py-2">No labels in workspace</p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
