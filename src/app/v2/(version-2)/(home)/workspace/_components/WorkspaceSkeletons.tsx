import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export function WorkspaceHomeSkeleton() {
  return (
    <div className="flex flex-1 flex-col overflow-y-auto p-6 space-y-6">
      {/* Top Banner Skeleton */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 rounded-xl border border-border/40 bg-accent/20 p-6">
        <div className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-28 rounded-md" />
          <Skeleton className="h-9 w-32 rounded-md" />
        </div>
      </div>

      {/* Quick Actions Skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-2 p-3 rounded-lg border border-border/40 bg-card">
            <Skeleton className="size-9 rounded-lg" />
            <Skeleton className="h-3.5 w-16" />
          </div>
        ))}
      </div>

      {/* Dashboard Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-3 rounded-xl border border-border/40 bg-card p-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="size-5 rounded" />
            </div>
            <div className="space-y-2.5 pt-2">
              <Skeleton className="h-16 w-full rounded-lg" />
              <Skeleton className="h-16 w-full rounded-lg" />
              <Skeleton className="h-16 w-full rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ActivityFeedSkeleton() {
  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-border/40 px-6">
        <div className="flex items-center gap-3">
          <Skeleton className="size-8 rounded-lg" />
          <Skeleton className="h-5 w-36" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-24 rounded-md" />
          <Skeleton className="h-8 w-8 rounded-md" />
        </div>
      </div>
      <div className="p-6 space-y-3 max-w-4xl">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="flex items-start gap-4 rounded-xl border border-border/40 p-4 bg-card">
            <Skeleton className="size-10 rounded-full shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-3 w-16" />
              </div>
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-3 w-28" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function MeetingsHubSkeleton() {
  return (
    <div className="flex flex-1 flex-col overflow-hidden p-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <Skeleton className="h-6 w-44" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-28 rounded-md" />
          <Skeleton className="h-9 w-36 rounded-md" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-4 rounded-xl border border-border/40 p-5 bg-card">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-20 rounded-full" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-12 w-full" />
            <div className="flex items-center justify-between pt-2 border-t border-border/40">
              <div className="flex -space-x-2">
                <Skeleton className="size-7 rounded-full" />
                <Skeleton className="size-7 rounded-full" />
                <Skeleton className="size-7 rounded-full" />
              </div>
              <Skeleton className="h-8 w-20 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function CallsHubSkeleton() {
  return (
    <div className="flex flex-1 flex-col overflow-hidden p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-56" />
        </div>
        <Skeleton className="h-9 w-32 rounded-md" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-3 rounded-xl border border-border/40 p-4 bg-card">
          <Skeleton className="h-5 w-28" />
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between p-2">
                <div className="flex items-center gap-2.5">
                  <Skeleton className="size-8 rounded-full" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="size-7 rounded-md" />
              </div>
            ))}
          </div>
        </div>
        <div className="lg:col-span-2 space-y-3 rounded-xl border border-border/40 p-4 bg-card">
          <Skeleton className="h-5 w-32" />
          <div className="space-y-2.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-border/20">
                <div className="flex items-center gap-3">
                  <Skeleton className="size-9 rounded-full" />
                  <div className="space-y-1.5">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
                <Skeleton className="h-7 w-16 rounded-md" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function VideoCallRoomSkeleton() {
  return (
    <div className="flex flex-1 flex-col h-full bg-slate-950 text-white p-4 justify-between">
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-44 bg-slate-800" />
        <Skeleton className="h-6 w-24 rounded-full bg-slate-800" />
      </div>
      <div className="grid grid-cols-2 gap-4 my-auto max-w-4xl mx-auto w-full aspect-video">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center justify-center rounded-2xl bg-slate-900 border border-slate-800">
            <Skeleton className="size-16 rounded-full bg-slate-800" />
          </div>
        ))}
      </div>
      <div className="flex items-center justify-center gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="size-11 rounded-full bg-slate-800" />
        ))}
      </div>
    </div>
  );
}

export function TasksBoardSkeleton() {
  return (
    <div className="flex flex-1 flex-col overflow-hidden p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Skeleton className="h-6 w-36" />
          <Skeleton className="h-4 w-52" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-24 rounded-md" />
          <Skeleton className="h-9 w-28 rounded-md" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 flex-1">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-3 rounded-xl border border-border/40 p-3 bg-muted/20">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="size-5 rounded" />
            </div>
            <div className="space-y-2.5">
              <Skeleton className="h-28 w-full rounded-lg" />
              <Skeleton className="h-28 w-full rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function FilesHubSkeleton() {
  return (
    <div className="flex flex-1 flex-col overflow-hidden p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Skeleton className="h-6 w-36" />
          <Skeleton className="h-4 w-60" />
        </div>
        <Skeleton className="h-9 w-32 rounded-md" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-2 p-3 rounded-lg border border-border/40 bg-card">
            <Skeleton className="size-6 rounded" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-3 w-14" />
          </div>
        ))}
      </div>
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-border/40 bg-card">
            <div className="flex items-center gap-3">
              <Skeleton className="size-8 rounded" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-44" />
                <Skeleton className="h-3 w-28" />
              </div>
            </div>
            <Skeleton className="h-7 w-20 rounded-md" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function ChannelChatSkeleton() {
  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex h-12 shrink-0 items-center justify-between border-b border-border/40 px-4">
        <div className="flex items-center gap-2">
          <Skeleton className="size-4 rounded" />
          <Skeleton className="h-4 w-28" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-7 w-16 rounded-md" />
          <Skeleton className="h-7 w-16 rounded-md" />
        </div>
      </div>
      <div className="flex-1 p-4 space-y-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-start gap-3">
            <Skeleton className="size-8 rounded-full shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="flex items-center gap-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-12" />
              </div>
              <Skeleton className={`h-4 ${i % 3 === 0 ? "w-4/5" : i % 2 === 0 ? "w-3/5" : "w-1/2"}`} />
            </div>
          </div>
        ))}
      </div>
      <div className="p-3 border-t border-border/40">
        <Skeleton className="h-12 w-full rounded-lg" />
      </div>
    </div>
  );
}
