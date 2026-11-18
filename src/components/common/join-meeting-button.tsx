"use client";

import { Video } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MeetingLink, MeetingProviderId } from "@/lib/calendar/meeting-link";

const PROVIDER_STYLE: Record<MeetingProviderId, string> = {
  airsend: "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700",
  meet: "bg-emerald-600 hover:bg-emerald-700",
  teams: "bg-indigo-600 hover:bg-indigo-700",
  zoom: "bg-blue-600 hover:bg-blue-700",
  webex: "bg-teal-600 hover:bg-teal-700",
  jitsi: "bg-sky-600 hover:bg-sky-700",
  skype: "bg-sky-500 hover:bg-sky-600",
  goto: "bg-orange-600 hover:bg-orange-700",
  whereby: "bg-violet-600 hover:bg-violet-700",
  chime: "bg-cyan-700 hover:bg-cyan-800",
  bluejeans: "bg-blue-700 hover:bg-blue-800",
  other: "bg-primary hover:bg-primary/90",
};

function getAirsendToken(): string {
  if (typeof document === "undefined") return "";
  const match = document.cookie.match(/(?:^|;\s*)access_token=([^;]+)/);
  if (match && match[1]) return decodeURIComponent(match[1]);
  try {
    return window.localStorage.getItem("access_token") ?? "";
  } catch {
    return "";
  }
}

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
    link.provider === "airsend"
      ? "Join AirSend Meet"
      : link.provider === "other"
      ? "Join meeting"
      : `Join ${link.provider === "teams" ? "Teams" : link.label}`;

  let targetHref = link.url;
  if (link.provider === "airsend") {
    try {
      const token = getAirsendToken();
      if (token) {
        const u = new URL(link.url);
        if (!u.searchParams.has("token") && !u.searchParams.has("access_token")) {
          u.searchParams.set("token", token);
          targetHref = u.toString();
        }
      }
    } catch {
      // Non-fatal
    }
  }

  return (
    <a
      href={targetHref}
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
