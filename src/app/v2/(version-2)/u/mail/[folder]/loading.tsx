'use client';

import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex items-center justify-center h-full py-24 bg-background">
      <div className="flex flex-col items-center gap-3">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-primary/10 animate-pulse" />
          <Loader2 className="h-8 w-8 animate-spin text-primary relative" />
        </div>
        <p className="text-xs text-muted-foreground/60 font-medium tracking-wide">
          Loading
        </p>
      </div>
    </div>
  );
}