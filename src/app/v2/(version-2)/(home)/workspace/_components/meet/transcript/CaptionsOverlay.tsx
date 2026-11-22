"use client";

import React, { useEffect, useMemo, useState } from "react";
import { AlertCircle, ClosedCaption, MicOff, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { MeetTranscript } from "../../../_lib/meet/transcription/use-meet-transcript";
import type { TranscriptLine } from "../../../_lib/meet/types";
import TranscriptLanguageSelect from "./TranscriptLanguageSelect";

/** Captions of a sentence stay on screen this long after it was said. */
const VISIBLE_MS = 9000;
const MAX_VISIBLE_LINES = 3;

/**
 * The live captions bar: the last few spoken lines with speaker names (words still being recognised in lighter text),
 * or why there are no captions (unsupported browser, blocked microphone, muted). Pure presentation: the transcript comes
 * from `useMeetTranscript`. Position it from the outside (it is just a panel).
 */
export default function CaptionsOverlay({
  transcript,
  onClose,
  className,
}: {
  transcript: MeetTranscript;
  onClose: () => void;
  className?: string;
}) {
  const { lines, supported, unsupportedReason, error, muted, paused, listening, lang, setLang, start, share } = transcript;

  // Re-evaluate which lines are still recent once a second (only while there is something to expire).
  const [now, setNow] = useState(() => Date.now());
  const hasLines = lines.length > 0;
  useEffect(() => {
    if (!hasLines) return;
    setNow(Date.now());
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [hasLines, lines]);

  const visible = useMemo<TranscriptLine[]>(
    () => lines.filter((line) => !line.isFinal || now - line.at < VISIBLE_MS).slice(-MAX_VISIBLE_LINES),
    [lines, now],
  );

  let notice: { tone: "info" | "warn"; text: string; action?: React.ReactNode } | null = null;
  if (!supported) {
    notice = { tone: "warn", text: unsupportedReason ?? "Live captions are not available in this browser." };
  } else if (error) {
    notice = {
      tone: "warn",
      text: error,
      action: (
        <Button size="sm" variant="outline" onClick={start} className="h-6 border-slate-600 bg-transparent px-2 text-[11px] text-slate-200 hover:bg-slate-800">
          Try again
        </Button>
      ),
    };
  } else if (paused) {
    notice = {
      tone: "info",
      text: "Your captions are paused.",
      action: (
        <Button size="sm" variant="outline" onClick={start} className="h-6 border-slate-600 bg-transparent px-2 text-[11px] text-slate-200 hover:bg-slate-800">
          Resume
        </Button>
      ),
    };
  } else if (muted && visible.length === 0) {
    notice = { tone: "info", text: "You're muted, so your own speech isn't captioned. Others' captions still appear." };
  }

  return (
    <div
      role="region"
      aria-label="Live captions"
      aria-live="polite"
      className={cn(
        "rounded-2xl border border-slate-800/80 bg-slate-950/85 px-4 py-3 shadow-2xl backdrop-blur-md",
        className,
      )}
    >
      <div className="mb-2 flex items-center gap-2">
        <div className="flex size-6 shrink-0 items-center justify-center rounded-md bg-blue-600/20 text-blue-400">
          <ClosedCaption className="size-3.5" />
        </div>
        <span className="flex items-center gap-1.5 text-[11px] font-medium text-slate-300">
          Live captions
          <span
            className={cn("size-1.5 rounded-full", listening ? "animate-pulse bg-emerald-400" : "bg-slate-600")}
            title={listening ? "Listening" : "Not listening"}
          />
        </span>
        <div className="ml-auto flex items-center gap-1.5">
          <TranscriptLanguageSelect lang={lang} onChange={setLang} />
          <Button
            size="icon"
            variant="ghost"
            onClick={onClose}
            className="size-6 shrink-0 text-slate-400 hover:text-white"
            title="Turn off captions"
          >
            <X className="size-3.5" />
          </Button>
        </div>
      </div>

      {notice && (
        <div
          className={cn(
            "mb-1 flex items-start gap-2 rounded-lg px-2.5 py-2 text-xs",
            notice.tone === "warn" ? "bg-amber-500/10 text-amber-200" : "bg-slate-800/60 text-slate-300",
          )}
        >
          {notice.tone === "warn" ? <AlertCircle className="mt-0.5 size-3.5 shrink-0" /> : <MicOff className="mt-0.5 size-3.5 shrink-0" />}
          <span className="flex-1 leading-relaxed">{notice.text}</span>
          {notice.action}
        </div>
      )}

      {visible.length > 0 ? (
        <div className="space-y-1.5">
          {visible.map((line) => (
            <p key={line.id} className="text-xs leading-relaxed">
              <span className="mr-1.5 font-semibold text-blue-400">{line.isSelf ? "You" : line.speaker}</span>
              <span className={line.isFinal ? "text-slate-100" : "text-slate-400"}>{line.text}</span>
            </p>
          ))}
        </div>
      ) : (
        !notice && (
          <p className="text-xs text-slate-400">
            {listening ? "Listening… captions appear here as people speak." : "Starting captions…"}
          </p>
        )
      )}

      <p className="mt-2 text-[10px] leading-snug text-slate-500">
        Your speech is converted to text by your browser&apos;s speech service (Chrome and Edge send the audio to Google or
        Microsoft).
        {share === "sharing" && " Your captions are shared with the others in the call."}
        {share === "unavailable" && " Sharing captions with others isn't available on this server yet; you only see your own."}
      </p>
    </div>
  );
}
