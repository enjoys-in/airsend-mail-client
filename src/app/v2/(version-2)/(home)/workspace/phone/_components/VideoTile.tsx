"use client";

import { useEffect, useRef } from "react";
import { MonitorUp } from "lucide-react";
import { cn } from "@/lib/utils";
import type { VideoEntry } from "../_lib/use-phone-call";

interface VideoTileProps {
  entry: VideoEntry;
  compact?: boolean;
}

export function VideoTile({ entry, compact = false }: VideoTileProps) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    entry.track.attach(element);
    return () => {
      entry.track.detach(element);
    };
  }, [entry.track]);

  return (
    <div
      className="relative aspect-video overflow-hidden rounded-lg bg-slate-900"
      data-testid="video-tile"
      data-local={entry.local}
      data-screen={entry.screen}
    >
      <video
        ref={ref}
        autoPlay
        playsInline
        muted
        className={cn("size-full", entry.screen ? "object-contain" : "object-cover", entry.local && !entry.screen && "-scale-x-100")}
      />
      <span
        className={cn(
          "absolute bottom-1 left-1 flex max-w-[90%] items-center gap-1 truncate rounded bg-black/60 px-1.5 text-white",
          compact ? "text-[10px]" : "text-xs",
        )}
      >
        {entry.screen && <MonitorUp className="size-3 shrink-0" />}
        <span className="truncate">{entry.local ? "You" : entry.name}</span>
      </span>
    </div>
  );
}

interface VideoGridProps {
  videos: VideoEntry[];
  compact?: boolean;
}

export function VideoGrid({ videos, compact = false }: VideoGridProps) {
  if (videos.length === 0) return null;
  const screen = videos.find((entry) => entry.screen);
  const others = screen ? videos.filter((entry) => entry.id !== screen.id) : videos;
  const columns = compact ? "grid-cols-2" : others.length <= 1 ? "grid-cols-1" : others.length <= 4 ? "grid-cols-2" : "grid-cols-3";

  return (
    <div className="space-y-2" data-testid="video-grid">
      {screen && <VideoTile entry={screen} compact={compact} />}
      {others.length > 0 && (
        <div className={cn("grid gap-2", screen ? "grid-cols-3" : columns)}>
          {others.map((entry) => (
            <VideoTile key={entry.id} entry={entry} compact={compact} />
          ))}
        </div>
      )}
    </div>
  );
}
