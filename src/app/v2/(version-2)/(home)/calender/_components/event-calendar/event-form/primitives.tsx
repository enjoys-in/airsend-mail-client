"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Soft "chip" look shared by date/time pills and compact selects. */
export const pillClass =
  "inline-flex h-9 w-auto items-center gap-1.5 rounded-lg border-0 bg-muted/70 px-3 py-0 text-sm font-medium text-foreground shadow-none transition-colors hover:bg-muted focus:ring-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 data-[state=open]:bg-muted";

/** Borderless input that sits inside a card row. */
export const bareInputClass =
  "h-9 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/70";

/** Rounded square holding the dialog's icon. */
export function IconTile({ children }: { children: ReactNode }) {
  return (
    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-border/60 bg-muted/50 text-foreground">
      {children}
    </span>
  );
}

/** Tinted rounded card; optional header with icon, title, meta text and an action. */
export function FormCard({
  title,
  meta,
  icon,
  action,
  children,
  className,
  bodyClassName,
}: {
  title?: ReactNode;
  meta?: ReactNode;
  icon?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <section className={cn("rounded-2xl border border-border/60 bg-muted/25", className)}>
      {(title || action) && (
        <header className="flex items-center gap-2.5 border-b border-border/60 px-4 py-3">
          {icon && <span className="text-muted-foreground">{icon}</span>}
          {title && <h3 className="text-sm font-medium">{title}</h3>}
          {meta && <span className="text-xs text-muted-foreground">{meta}</span>}
          {action && <div className="ml-auto">{action}</div>}
        </header>
      )}
      <div className={cn("p-1.5", bodyClassName)}>{children}</div>
    </section>
  );
}

/** One row of a form card: icon gutter on the left, field on the right. */
export function FieldRow({
  icon,
  children,
  className,
}: {
  icon: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-start gap-3 rounded-xl px-2.5 py-1", className)}>
      <span
        className="flex h-9 w-5 shrink-0 items-center justify-center text-muted-foreground"
        aria-hidden="true"
      >
        {icon}
      </span>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

export interface SegmentOption<T extends string> {
  value: T;
  label: string;
  icon?: ReactNode;
}

/** Small segmented control (e.g. Event | Series). */
export function Segmented<T extends string>({
  value,
  options,
  onChange,
  ariaLabel,
}: {
  value: T;
  options: SegmentOption<T>[];
  onChange: (value: T) => void;
  ariaLabel: string;
}) {
  return (
    <div role="radiogroup" aria-label={ariaLabel} className="inline-flex rounded-lg bg-muted/70 p-0.5">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o.value)}
            className={cn(
              "inline-flex h-8 items-center gap-1.5 rounded-md px-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
              active && "bg-background text-foreground shadow-sm",
            )}
          >
            {o.icon}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
