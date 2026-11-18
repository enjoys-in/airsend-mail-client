"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { JoinMeetingButton } from "@/components/common/join-meeting-button";
import { normalizeLink, toMeetingLink } from "@/lib/calendar/meeting-link";
import { createAirSendMeeting } from "@/lib/calendar/generate-meeting";
import { bareInputClass } from "./primitives";
import { Sparkles, Loader2, Copy, Check, X } from "lucide-react";
import { toast } from "sonner";

/**
 * Paste any meeting URL (AirSend Meet, Google Meet, Teams, Zoom, …)
 * or click "Generate AirSend Link" to instantly create a new AirSend Meet room.
 */
export function MeetingLinkField({
  value,
  onChange,
  eventTitle,
}: {
  value: string;
  onChange: (value: string) => void;
  eventTitle?: string;
}) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const link = value.trim() ? toMeetingLink(normalizeLink(value)) : null;
  const invalid = !!value.trim() && !link;

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const result = await createAirSendMeeting(eventTitle);
      onChange(result.url);
      toast.success("AirSend Meet link generated!");
    } catch {
      toast.error("Could not generate meeting link");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success("Meeting link copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const handleClear = () => {
    onChange("");
  };

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <div className="flex items-center gap-2">
        <div className="min-w-0 flex-1 relative">
          <Input
            id="meeting-link"
            type="url"
            inputMode="url"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Add or generate a meeting link (AirSend Meet, Google Meet, Teams…)"
            aria-label="Meeting link"
            aria-invalid={invalid || undefined}
            className={bareInputClass}
          />
          {link && link.provider !== "other" && (
            <p className="-mt-1 pb-0.5 text-[11px] text-muted-foreground flex items-center gap-1">
              <span className="size-1.5 rounded-full bg-emerald-500 inline-block" />
              {link.label}
            </p>
          )}
          {invalid && (
            <p className="-mt-1 pb-0.5 text-[11px] text-destructive">This doesn&apos;t look like a link</p>
          )}
        </div>

        {/* Action Buttons */}
        {link ? (
          <div className="flex items-center gap-1.5 shrink-0">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={handleCopy}
              className="size-7 rounded-lg text-muted-foreground hover:text-foreground"
              title="Copy meeting link"
            >
              {copied ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
            </Button>
            <JoinMeetingButton link={link} size="sm" />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleClear}
              className="size-7 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              title="Remove meeting link"
            >
              <X className="size-3.5" />
            </Button>
          </div>
        ) : (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleGenerate}
            disabled={isGenerating}
            className="h-8 shrink-0 gap-1.5 px-3 text-xs font-semibold border-primary/30 text-primary hover:bg-primary/10 transition-colors shadow-2xs"
          >
            {isGenerating ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Sparkles className="size-3.5 text-primary" />
            )}
            <span>Generate AirSend Link</span>
          </Button>
        )}
      </div>
    </div>
  );
}
