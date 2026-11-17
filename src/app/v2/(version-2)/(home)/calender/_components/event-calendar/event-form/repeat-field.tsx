"use client";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { PillSelect, type PillOption } from "./pill-select";

const CUSTOM = "custom";

export const REPEAT_PRESETS: PillOption[] = [
  { value: "none", label: "Does not repeat" },
  { value: "FREQ=DAILY", label: "Every day" },
  { value: "FREQ=WEEKLY", label: "Every week" },
  { value: "FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR", label: "Weekdays" },
  { value: CUSTOM, label: "Custom days" },
  { value: "FREQ=MONTHLY", label: "Every month" },
  { value: "FREQ=YEARLY", label: "Every year" },
];

/** Sunday first, same as the calendar grid */
const WEEKDAYS = [
  { code: "SU", short: "S", label: "Sunday" },
  { code: "MO", short: "M", label: "Monday" },
  { code: "TU", short: "T", label: "Tuesday" },
  { code: "WE", short: "W", label: "Wednesday" },
  { code: "TH", short: "T", label: "Thursday" },
  { code: "FR", short: "F", label: "Friday" },
  { code: "SA", short: "S", label: "Saturday" },
] as const;

const isPreset = (rule: string) =>
  REPEAT_PRESETS.some((p) => p.value !== CUSTOM && p.value === rule);

const parseRule = (rule: string): Record<string, string> =>
  Object.fromEntries(
    rule
      .split(";")
      .filter(Boolean)
      .map((kv) => {
        const i = kv.indexOf("=");
        return [kv.slice(0, i).toUpperCase(), kv.slice(i + 1)];
      }),
  );

const buildRule = (parts: Record<string, string>) =>
  Object.entries(parts)
    .map(([k, v]) => `${k}=${v}`)
    .join(";");

const isWeekly = (rule: string) => parseRule(rule).FREQ === "WEEKLY";

/** FREQ=WEEKLY;BYDAY=... with nothing else — the day chips fully describe it */
const isSimpleWeekly = (rule: string) => {
  const keys = Object.keys(parseRule(rule));
  return keys.length === 2 && keys.includes("FREQ") && keys.includes("BYDAY") && isWeekly(rule);
};

/**
 * Repeat preset pill. For weekly rules the weekday chips let the user pick any
 * combination of days; a rule this UI can't describe (from another app) stays
 * editable as text.
 */
export function RepeatField({
  rule,
  onChange,
  startDate,
}: {
  rule: string;
  onChange: (rule: string) => void;
  /** event start — the day a plain "Every week" repeats on */
  startDate?: Date;
}) {
  const startCode = WEEKDAYS[(startDate ?? new Date()).getDay()].code;
  const weekly = !!rule && isWeekly(rule);

  const selectedDays = (): string[] => {
    const by = parseRule(rule).BYDAY;
    return by ? by.split(",").map((d) => d.trim().toUpperCase()) : [startCode];
  };

  const toggleDay = (code: string) => {
    const current = selectedDays();
    const next = current.includes(code) ? current.filter((d) => d !== code) : [...current, code];
    if (next.length === 0) return; // at least one day
    const sorted = WEEKDAYS.map((d) => d.code).filter((d) => next.includes(d));
    const parts = parseRule(rule);
    // a single day equal to the start day is just "every week"
    if (sorted.length === 1 && sorted[0] === startCode) delete parts.BYDAY;
    else parts.BYDAY = sorted.join(",");
    onChange(buildRule(parts));
  };

  const handleSelect = (v: string) => {
    if (v === "none") onChange("");
    else if (v === CUSTOM) onChange(`FREQ=WEEKLY;BYDAY=${startCode}`);
    else onChange(v);
  };

  const selectValue = !rule
    ? "none"
    : isPreset(rule)
      ? rule
      : isSimpleWeekly(rule)
        ? CUSTOM
        : rule;

  const selected = weekly ? selectedDays() : [];

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <PillSelect
          value={selectValue}
          onChange={handleSelect}
          options={REPEAT_PRESETS}
          placeholder="Does not repeat"
          ariaLabel="Repeat"
        />
        {rule && !isPreset(rule) && !isSimpleWeekly(rule) && (
          <Input
            value={rule}
            onChange={(e) => onChange(e.target.value)}
            placeholder="FREQ=WEEKLY;BYDAY=MO"
            aria-label="Custom repeat rule"
            className="h-9 min-w-[12rem] flex-1 rounded-lg font-mono text-xs"
          />
        )}
      </div>

      {weekly && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Repeat on</span>
          <div role="group" aria-label="Repeat on days" className="flex items-center gap-1">
            {WEEKDAYS.map((d) => {
              const active = selected.includes(d.code);
              return (
                <button
                  key={d.code}
                  type="button"
                  aria-pressed={active}
                  aria-label={d.label}
                  title={d.label}
                  onClick={() => toggleDay(d.code)}
                  className={cn(
                    "flex size-8 items-center justify-center rounded-full border text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
                    active
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border/60 bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  {d.short}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
