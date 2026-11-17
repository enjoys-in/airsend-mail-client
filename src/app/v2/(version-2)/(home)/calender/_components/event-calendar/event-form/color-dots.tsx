"use client";

import { cn } from "@/lib/utils";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { EventColor } from "../types";

export const EVENT_COLOR_OPTIONS: { value: EventColor; label: string; swatch: string }[] = [
  { value: "blue", label: "Blue", swatch: "bg-blue-400 border-blue-400 data-[state=checked]:bg-blue-400" },
  { value: "violet", label: "Violet", swatch: "bg-violet-400 border-violet-400 data-[state=checked]:bg-violet-400" },
  { value: "rose", label: "Rose", swatch: "bg-rose-400 border-rose-400 data-[state=checked]:bg-rose-400" },
  { value: "emerald", label: "Emerald", swatch: "bg-emerald-400 border-emerald-400 data-[state=checked]:bg-emerald-400" },
  { value: "orange", label: "Orange", swatch: "bg-orange-400 border-orange-400 data-[state=checked]:bg-orange-400" },
];

/** Row of colour swatches (radio group). */
export function ColorDots({
  value,
  onChange,
}: {
  value: EventColor;
  onChange: (value: EventColor) => void;
}) {
  return (
    <RadioGroup
      className="flex gap-2"
      value={value}
      onValueChange={(v) => onChange(v as EventColor)}
      aria-label="Colour"
    >
      {EVENT_COLOR_OPTIONS.map((o) => (
        <RadioGroupItem
          key={o.value}
          value={o.value}
          aria-label={o.label}
          className={cn(
            "size-6 shadow-none ring-offset-2 ring-offset-background data-[state=checked]:ring-2 data-[state=checked]:ring-foreground/30",
            o.swatch,
          )}
        />
      ))}
    </RadioGroup>
  );
}
