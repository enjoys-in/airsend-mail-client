"use client";

import React from "react";
import Link from "next/link";
import { CheckSquare, ArrowRight, Plus, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { TaskItem } from "../../tasks/_lib/my-tasks-store";

interface WorkspaceTasksCardProps {
  tasks: TaskItem[];
  onCompleteTask: (taskId: string) => void;
}

export function WorkspaceTasksCard({ tasks, onCompleteTask }: WorkspaceTasksCardProps) {
  const pending = tasks.slice(0, 4);

  return (
    <Card className="border-border/40 shadow-sm flex flex-col">
      <CardHeader className="pb-3 flex-row items-center justify-between">
        <div className="space-y-0.5">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <CheckSquare className="size-4 text-amber-500" />
            Tasks & Planner
          </CardTitle>
          <CardDescription className="text-xs">Your assigned action items</CardDescription>
        </div>
        <Link href="/v2/tasks">
          <Button variant="ghost" size="sm" className="h-7 text-xs gap-1">
            Board <ArrowRight className="size-3" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="space-y-2.5 flex-1 flex flex-col justify-between">
        {pending.length === 0 ? (
          <div className="py-8 text-center text-xs text-muted-foreground">
            All caught up! No pending tasks assigned.
          </div>
        ) : (
          <div className="space-y-2">
            {pending.map((t) => (
              <div
                key={t.id}
                className="flex items-start gap-2.5 p-2.5 rounded-lg border border-border/40 bg-accent/10 hover:bg-accent/20 transition-colors"
              >
                <button
                  onClick={() => onCompleteTask(t.id)}
                  className="mt-0.5 text-muted-foreground hover:text-emerald-500 transition-colors"
                  title="Mark as done"
                >
                  <CheckCircle2 className="size-4" />
                </button>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground truncate">{t.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={`text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded ${
                        t.priority === "urgent"
                          ? "bg-red-500/10 text-red-500"
                          : t.priority === "high"
                          ? "bg-amber-500/10 text-amber-500"
                          : "bg-blue-500/10 text-blue-500"
                      }`}
                    >
                      {t.priority}
                    </span>
                    {t.dueDate && (
                      <span className="text-[10px] text-muted-foreground">
                        Due {new Date(t.dueDate).toLocaleDateString([], { month: "short", day: "numeric" })}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        <Link href="/v2/tasks" className="block pt-1">
          <Button variant="outline" size="sm" className="w-full text-xs h-8 gap-1.5 border-dashed">
            <Plus className="size-3.5" />
            Add New Task
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
