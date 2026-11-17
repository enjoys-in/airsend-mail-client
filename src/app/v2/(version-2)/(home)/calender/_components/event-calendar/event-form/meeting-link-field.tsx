"use client";

import { Input } from "@/components/ui/input";
import { JoinMeetingButton } from "@/components/common/join-meeting-button";
import { normalizeLink, toMeetingLink } from "@/lib/calendar/meeting-link";
import { bareInputClass } from "./primitives";

/** Paste any meeting URL (Meet, Teams, Zoom, …); a Join button appears once it's valid. */
export function MeetingLinkField({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const link = value.trim() ? toMeetingLink(normalizeLink(value)) : null;
  const invalid = !!value.trim() && !link;

  return (
    <div className="flex items-center gap-2">
      <div className="min-w-0 flex-1">
        <Input
          id="meeting-link"
          type="url"
          inputMode="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Add a meeting link (Google Meet, Teams, Zoom…)"
          aria-label="Meeting link"
          aria-invalid={invalid || undefined}
          className={bareInputClass}
        />
        {link && link.provider !== "other" && (
          <p className="-mt-1 pb-1 text-[11px] text-muted-foreground">{link.label}</p>
        )}
        {invalid && (
          <p className="-mt-1 pb-1 text-[11px] text-destructive">This doesn&apos;t look like a link</p>
        )}
      </div>
      {link && <JoinMeetingButton link={link} size="sm" />}
    </div>
  );
}
