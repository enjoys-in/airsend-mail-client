"use client";

import React from "react";
import { Lock, ShieldOff, Loader2, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { TeamMember } from "../../../../_lib/chat-types";

// ── Page header ──

export function SettingsHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 pb-5 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
        {description && <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}

// ── Card section ──

export function SettingsCard({
  title,
  description,
  children,
  className,
  danger,
}: {
  title?: string;
  description?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  danger?: boolean;
}) {
  return (
    <section
      className={cn(
        "rounded-xl border bg-card",
        danger ? "border-destructive/30" : "border-border/60",
        className,
      )}
    >
      {(title || description) && (
        <div className="border-b border-border/40 px-4 py-3">
          {title && <h2 className={cn("text-sm font-semibold", danger && "text-destructive")}>{title}</h2>}
          {description && <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>}
        </div>
      )}
      <div className="p-4">{children}</div>
    </section>
  );
}

// ── States ──

export function NoPermission({ what }: { what: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border/60 px-6 py-12 text-center">
      <ShieldOff className="size-8 text-muted-foreground/60" />
      <p className="text-sm font-medium">You can&apos;t {what}</p>
      <p className="max-w-sm text-xs text-muted-foreground">
        Ask a team admin for a role with the right permission.
      </p>
    </div>
  );
}

export function Notice({
  children,
  tone = "info",
}: {
  children: React.ReactNode;
  tone?: "info" | "warning";
}) {
  return (
    <div
      className={cn(
        "flex items-start gap-2 rounded-lg border px-3 py-2.5 text-xs",
        tone === "warning"
          ? "border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-300"
          : "border-primary/20 bg-primary/5 text-muted-foreground",
      )}
    >
      <Info className="mt-0.5 size-3.5 shrink-0" />
      <div>{children}</div>
    </div>
  );
}

export function LoadingBlock() {
  return (
    <div className="flex items-center justify-center py-16">
      <Loader2 className="size-5 animate-spin text-muted-foreground" />
    </div>
  );
}

export function LockedHint({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
      <Lock className="size-3" />
      {children}
    </span>
  );
}

// ── Roles & members ──

export const DEFAULT_ROLE_COLOR = "#99aab5";

export function RoleDot({ color, className }: { color?: string; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn("inline-block size-2.5 shrink-0 rounded-full", className)}
      style={{ backgroundColor: color || DEFAULT_ROLE_COLOR }}
    />
  );
}

export function RolePill({ name, color }: { name: string; color?: string }) {
  return (
    <span className="inline-flex max-w-[11rem] items-center gap-1.5 rounded-full border border-border/60 bg-muted/40 px-2 py-0.5 text-[11px] font-medium">
      <RoleDot color={color} className="size-2" />
      <span className="truncate">{name}</span>
    </span>
  );
}

export function MemberAvatar({ member, size = "md" }: { member: Pick<TeamMember, "displayName" | "email" | "avatar">; size?: "sm" | "md" }) {
  const letter = (member.displayName || member.email || "?").charAt(0).toUpperCase();
  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 font-medium text-primary",
        size === "sm" ? "size-6 text-[10px]" : "size-8 text-sm",
      )}
    >
      {member.avatar ? <img src={member.avatar} alt="" className="size-full object-cover" /> : letter}
    </span>
  );
}

// ── Sticky "unsaved changes" bar (Discord-style) ──

export function SaveBar({
  visible,
  saving,
  onReset,
  onSave,
  message = "You have unsaved changes",
}: {
  visible: boolean;
  saving?: boolean;
  onReset: () => void;
  onSave: () => void;
  message?: string;
}) {
  if (!visible) return null;
  return (
    <div className="sticky bottom-3 z-20 mt-6 flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-popover/95 px-4 py-2.5 shadow-lg backdrop-blur animate-in fade-in slide-in-from-bottom-2">
      <span className="text-sm">{message}</span>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={onReset} disabled={saving}>
          Reset
        </Button>
        <Button size="sm" onClick={onSave} disabled={saving}>
          {saving && <Loader2 className="mr-1.5 size-3.5 animate-spin" />}
          Save Changes
        </Button>
      </div>
    </div>
  );
}

/** Display name for a role row, member or system key. */
export function roleLabel(name: string) {
  return name.charAt(0).toUpperCase() + name.slice(1);
}
