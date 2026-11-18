"use client";

import React from "react";
import { ChevronRight, PanelLeft, Check } from "lucide-react";
import { useTasks } from "../_lib/tasks-context";
import { Button } from "@/components/ui/button";

interface SettingsHeaderProps {
  sectionTitle: string;
  pageTitle: string;
}

export function SettingsHeader({ sectionTitle, pageTitle }: SettingsHeaderProps) {
  const { closeSettings } = useTasks();

  return (
    <header className="flex h-11 shrink-0 items-center justify-between border-b border-border/70 bg-card/60 px-4 backdrop-blur">
      <div className="flex items-center gap-2 text-xs">
        <Button
          variant="ghost"
          size="icon"
          onClick={closeSettings}
          className="size-7 rounded text-muted-foreground hover:text-foreground"
          title="Back to Tasks"
        >
          <PanelLeft className="size-4" />
        </Button>
        <div className="h-3.5 w-px bg-border/60" />
        <div className="flex items-center gap-1.5 font-medium">
          <span className="text-muted-foreground">Airsend Mail</span>
          <ChevronRight className="size-3 text-muted-foreground/60" />
          <span className="text-muted-foreground">{sectionTitle}</span>
          <ChevronRight className="size-3 text-muted-foreground/60" />
          <span className="text-foreground font-semibold">{pageTitle}</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 text-[11px] text-muted-foreground bg-muted/40 px-2 py-0.5 rounded-full">
          <Check className="size-3 text-emerald-500" />
          <span>Saved</span>
        </div>
      </div>
    </header>
  );
}
export default SettingsHeader;
