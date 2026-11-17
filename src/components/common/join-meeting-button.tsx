"use client";

import { Video } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MeetingLink, MeetingProviderId } from "@/lib/calendar/meeting-link";

const PROVIDER_STYLE: Record<MeetingProviderId, string> = {
  meet: "bg-emerald-600 hover:bg-emerald-700",
  teams: "bg-indigo-600 hover:bg-indigo-700",
  zoom: "bg-blue-600 hover:bg-blue-700",
  webex: "bg-teal-600 hover:bg-teal-700",
  jitsi: "bg-sky-600 hover:bg-sky-700",
  other: "bg-primary hover:bg-primary/90",
};

/** "Join Google Meet" / "Join Teams" / "Join meeting" — opens the link in a new tab. */
export function JoinMeetingButton({
  link,
  size = "default",
  className,
}: {
  link: MeetingLink;
  size?: "sm" | "default";
  className?: string;
}) {
  const text =
    link.provider === "other"
      ? "Join meeting"
      : `Join ${link.provider === "teams" ? "Teams" : link.label}`;
  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      title={link.url}
      onClick={(e) => e.stopPropagation()}
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-lg font-medium text-white shadow-sm transition-colors",
        size === "sm" ? "h-7 px-2.5 text-xs" : "h-9 px-3 text-sm",
        link.provider === "other" && "text-primary-foreground",
        PROVIDER_STYLE[link.provider],
        className,
      )}
    >
      <Video className={size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4"} />
      {text}
    </a>
  );
}
