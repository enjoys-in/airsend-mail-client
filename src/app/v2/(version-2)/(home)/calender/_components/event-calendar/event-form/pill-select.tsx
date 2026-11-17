"use client";

import type { ReactNode } from "react";
import { RiArrowDownSLine } from "@remixicon/react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { pillClass } from "./primitives";

export interface PillOption {
  value: string;
  label: string;
  /** colour dot shown before the label (e.g. a calendar's colour) */
  color?: string;
}

/** A Select styled as a soft pill, with an optional leading icon and a chevron. */
export function PillSelect({
  value,
  onChange,
  options,
  placeholder,
  icon,
  ariaLabel,
  id,
  chevron = true,
  className,
  contentClassName,
}: {
  value: string;
  onChange: (value: string) => void;
  options: PillOption[];
  placeholder?: string;
  icon?: ReactNode;
  ariaLabel?: string;
  id?: string;
  chevron?: boolean;
  className?: string;
  contentClassName?: string;
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger id={id} aria-label={ariaLabel} className={cn(pillClass, className)}>
        {icon && <span className="shrink-0 text-muted-foreground">{icon}</span>}
        <SelectValue placeholder={placeholder} />
        {chevron && <RiArrowDownSLine size={16} className="-mr-1 shrink-0 text-muted-foreground" />}
      </SelectTrigger>
      <SelectContent className={contentClassName}>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            <span className="flex items-center gap-2">
              {o.color && (
                <span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: o.color }} />
              )}
              {o.label}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

/** Label on the left, pill select on the right (used in the "type" panel). */
export function LabeledPillSelect({
  label,
  id,
  ...select
}: { label: string; id: string } & Parameters<typeof PillSelect>[0]) {
  return (
    <div className="flex items-center justify-between gap-3">
      <label htmlFor={id} className="text-sm text-muted-foreground">
        {label}
      </label>
      <PillSelect id={id} className="max-w-[170px]" {...select} />
    </div>
  );
}
