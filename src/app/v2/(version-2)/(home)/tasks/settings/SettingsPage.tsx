"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface SettingsPageProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

export function SettingsPage({
  title,
  description,
  actions,
  children,
  className,
}: SettingsPageProps) {
  return (
    <div className={cn("mx-auto w-full max-w-3xl space-y-8 px-4 py-6 sm:px-8 sm:py-8", className)}>
      <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between sm:gap-6 border-b border-border/40 pb-4">
        <div className="min-w-0 space-y-1">
          <h1 className="text-lg font-semibold tracking-tight text-foreground">{title}</h1>
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
        {actions && <div className="shrink-0">{actions}</div>}
      </header>
      <div className="min-h-0">{children}</div>
    </div>
  );
}
export default SettingsPage;
