"use client";

import React from "react";
import { Filter, Check } from "lucide-react";
import { useTasks } from "../_lib/tasks-context";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function TasksFilterMenu() {
  const { priorityFilter, setPriorityFilter, statusFilter, setStatusFilter } = useTasks();

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5">
            <Filter className="size-3 text-muted-foreground" />
            <span>Status: {statusFilter === "all" ? "All" : statusFilter}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-36 text-xs">
          {(["all", "backlog", "todo", "in-progress", "done"] as const).map((s) => (
            <DropdownMenuItem key={s} onClick={() => setStatusFilter(s)}>
              <span className="capitalize">{s}</span>
              {statusFilter === s && <Check className="size-3 text-primary ml-auto" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5">
            <span>Priority: {priorityFilter === "all" ? "All" : priorityFilter}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-36 text-xs">
          {(["all", "urgent", "high", "medium", "low", "none"] as const).map((p) => (
            <DropdownMenuItem key={p} onClick={() => setPriorityFilter(p)}>
              <span className="capitalize">{p}</span>
              {priorityFilter === p && <Check className="size-3 text-primary ml-auto" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
