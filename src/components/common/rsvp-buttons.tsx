"use client";

import { Check, HelpCircle, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type RsvpReply = "ACCEPTED" | "TENTATIVE" | "DECLINED";

const REPLIES: { value: RsvpReply; label: string; icon: React.ReactNode; active: string }[] = [
  {
    value: "ACCEPTED",
    label: "Yes",
    icon: <Check className="h-3.5 w-3.5" />,
    active: "border-emerald-600 bg-emerald-600 text-white hover:bg-emerald-600 hover:text-white",
  },
  {
    value: "TENTATIVE",
    label: "Maybe",
    icon: <HelpCircle className="h-3.5 w-3.5" />,
    active: "border-amber-500 bg-amber-500 text-white hover:bg-amber-500 hover:text-white",
  },
  {
    value: "DECLINED",
    label: "No",
    icon: <X className="h-3.5 w-3.5" />,
    active: "border-red-600 bg-red-600 text-white hover:bg-red-600 hover:text-white",
  },
];

/** "Going?  [Yes] [Maybe] [No]" — the current answer is filled in. */
export function RsvpButtons({
  value,
  pending,
  onReply,
  label = "Going?",
  className,
}: {
  /** current answer of the user, if any */
  value?: string | null;
  /** answer being sent right now (shows a spinner and disables the row) */
  pending?: RsvpReply | null;
  onReply: (reply: RsvpReply) => void;
  label?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-1.5", className)} role="group" aria-label="Your reply">
      {label && <span className="mr-1 text-xs text-muted-foreground">{label}</span>}
      {REPLIES.map((r) => (
        <Button
          key={r.value}
          type="button"
          variant="outline"
          size="sm"
          disabled={!!pending}
          aria-pressed={value === r.value}
          onClick={() => onReply(r.value)}
          className={cn("h-7 gap-1 rounded-lg px-2.5 text-xs", value === r.value && r.active)}
        >
          {pending === r.value ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : r.icon}
          {r.label}
        </Button>
      ))}
    </div>
  );
}
