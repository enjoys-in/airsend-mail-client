import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function WorkflowsLoading() {
  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-background">
      {/* Header Skeleton */}
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-border/40 px-4 md:px-6">
        <div className="flex items-center gap-3">
          <Skeleton className="size-9 rounded-xl" />
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-3 w-56" />
          </div>
        </div>
        <Skeleton className="h-8 w-28 rounded-lg" />
      </div>

      {/* Body Skeleton */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        <div className="flex gap-4 border-b border-border/40 pb-2">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-8 w-28" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-border/40 p-5 space-y-4 bg-card">
              <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-28 rounded-full" />
                <Skeleton className="h-5 w-10 rounded-full" />
              </div>
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-full" />
              </div>
              <div className="flex items-center gap-2 pt-2">
                <Skeleton className="h-6 w-20 rounded" />
                <Skeleton className="h-6 w-24 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
