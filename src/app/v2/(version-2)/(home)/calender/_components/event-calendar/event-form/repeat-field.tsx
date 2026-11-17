"use client";

import { Input } from "@/components/ui/input";
import { PillSelect, type PillOption } from "./pill-select";

export const REPEAT_PRESETS: PillOption[] = [
  { value: "none", label: "Does not repeat" },
  { value: "FREQ=DAILY", label: "Every day" },
  { value: "FREQ=WEEKLY", label: "Every week" },
  { value: "FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR", label: "Weekdays" },
  { value: "FREQ=MONTHLY", label: "Every month" },
  { value: "FREQ=YEARLY", label: "Every year" },
];

const isPreset = (rule: string) => REPEAT_PRESETS.some((p) => p.value === rule);

/** Repeat preset pill; a custom RRULE (from another app) stays editable as text. */
export function RepeatField({
  rule,
  onChange,
}: {
  rule: string;
  onChange: (rule: string) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <PillSelect
        value={rule || "none"}
        onChange={(v) => onChange(v === "none" ? "" : v)}
        options={REPEAT_PRESETS}
        placeholder="Does not repeat"
        ariaLabel="Repeat"
      />
      {rule && !isPreset(rule) && (
        <Input
          value={rule}
          onChange={(e) => onChange(e.target.value)}
          placeholder="FREQ=WEEKLY;BYDAY=MO"
          aria-label="Custom repeat rule"
          className="h-9 min-w-[12rem] flex-1 rounded-lg font-mono text-xs"
        />
      )}
    </div>
  );
}
