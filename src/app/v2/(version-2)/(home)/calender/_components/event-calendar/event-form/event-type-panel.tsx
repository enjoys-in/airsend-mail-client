"use client";

import { RiShapesLine } from "@remixicon/react";
import type { EventColor } from "../types";
import { ColorDots } from "./color-dots";
import { LabeledPillSelect, type PillOption } from "./pill-select";
import { FormCard } from "./primitives";

export type EventStatus = "CONFIRMED" | "TENTATIVE" | "CANCELLED";

const STATUS_OPTIONS: PillOption[] = [
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "TENTATIVE", label: "Tentative" },
  { value: "CANCELLED", label: "Cancelled" },
];

/** "What kind of event": calendar, status and colour. */
export function EventTypePanel({
  calendarOptions,
  calendarId,
  onCalendarChange,
  status,
  onStatusChange,
  color,
  onColorChange,
  idPrefix,
}: {
  calendarOptions: PillOption[];
  calendarId: string;
  onCalendarChange: (id: string) => void;
  status: EventStatus;
  onStatusChange: (status: EventStatus) => void;
  color: EventColor;
  onColorChange: (color: EventColor) => void;
  /** keeps ids unique when the panel is rendered twice (mobile + desktop) */
  idPrefix: string;
}) {
  return (
    <FormCard icon={<RiShapesLine size={16} />} title="Event type" bodyClassName="space-y-3 p-4">
      {calendarOptions.length > 0 && (
        <LabeledPillSelect
          id={`${idPrefix}-calendar`}
          label="Calendar"
          value={calendarId}
          onChange={onCalendarChange}
          options={calendarOptions}
          placeholder="Select calendar"
        />
      )}
      <LabeledPillSelect
        id={`${idPrefix}-status`}
        label="Status"
        value={status}
        onChange={(v) => onStatusChange(v as EventStatus)}
        options={STATUS_OPTIONS}
      />
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm text-muted-foreground">Colour</span>
        <ColorDots value={color} onChange={onColorChange} />
      </div>
    </FormCard>
  );
}
