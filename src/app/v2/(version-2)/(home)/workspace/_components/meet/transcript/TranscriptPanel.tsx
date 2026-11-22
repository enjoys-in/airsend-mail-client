"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { AlertCircle, ArrowDown, Download, FileText, Pause, Play, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { MeetTranscript } from "../../../_lib/meet/transcription/use-meet-transcript";
import type { TranscriptLine } from "../../../_lib/meet/types";
import TranscriptLanguageSelect from "./TranscriptLanguageSelect";

const SPEAKER_COLORS = [
  "text-blue-400",
  "text-emerald-400",
  "text-amber-400",
  "text-fuchsia-400",
  "text-cyan-400",
  "text-rose-400",
  "text-lime-400",
  "text-violet-400",
];

function colorFor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return SPEAKER_COLORS[hash % SPEAKER_COLORS.length];
}

const clock = (ms: number) => new Date(ms).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });

/** Plain-text export: one `[HH:MM:SS] Speaker: text` line per final line. */
export function transcriptToText(lines: TranscriptLine[], title?: string): string {
  const header = title ? `${title}\nTranscript saved ${new Date().toLocaleString()}\n\n` : "";
  return header + lines.filter((l) => l.isFinal).map((l) => `[${clock(l.at)}] ${l.speaker}: ${l.text}`).join("\n") + "\n";
}

function downloadText(filename: string, text: string) {
  const url = URL.createObjectURL(new Blob([text], { type: "text/plain;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * The full transcript pane (like Teams' Transcript): time, speaker and text for everyone, auto-scrolling with a
 * "jump to latest" button when you scroll up, language, start/pause, clear and download. Pure presentation: the transcript
 * comes from `useMeetTranscript` (share the instance with <CaptionsOverlay> so there is one recogniser).
 */
export default function TranscriptPanel({
  transcript,
  title,
  onClose,
  className,
}: {
  transcript: MeetTranscript;
  /** Used in the downloaded file header. */
  title?: string;
  onClose?: () => void;
  className?: string;
}) {
  const { lines, finalLines, supported, unsupportedReason, error, muted, paused, listening, lang, setLang, start, stop, clear, share } =
    transcript;

  const scroller = useRef<HTMLDivElement>(null);
  const stick = useRef(true);
  const [behind, setBehind] = useState(false);

  const jumpToLatest = useCallback(() => {
    const el = scroller.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
    stick.current = true;
    setBehind(false);
  }, []);

  const onScroll = () => {
    const el = scroller.current;
    if (!el) return;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 48;
    stick.current = nearBottom;
    if (nearBottom) setBehind(false);
  };

  const tail = lines.length > 0 ? lines[lines.length - 1] : null;
  const tailKey = tail ? `${lines.length}:${tail.text.length}` : "0";
  useEffect(() => {
    if (stick.current) jumpToLatest();
    else if (tail) setBehind(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tailKey]);

  const handleDownload = () => {
    // digits only (2026-11-22T10:15 -> 202611221015). A regex class with a colon in brackets would be read by Tailwind's scanner as a utility.
    const stamp = new Date().toISOString().slice(0, 16).replace(/\D/g, "");
    downloadText(`transcript-${stamp}.txt`, transcriptToText(finalLines, title));
  };

  return (
    <section aria-label="Transcript" className={cn("flex h-full min-h-0 flex-col bg-slate-950 text-slate-100", className)}>
      <header className="flex shrink-0 items-center gap-2 border-b border-slate-800/80 px-3 py-2.5">
        <FileText className="size-4 text-blue-400" />
        <h3 className="text-sm font-semibold">Transcript</h3>
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium",
            listening ? "bg-emerald-500/15 text-emerald-300" : "bg-slate-800 text-slate-400",
          )}
        >
          <span className={cn("size-1.5 rounded-full", listening ? "animate-pulse bg-emerald-400" : "bg-slate-500")} />
          {listening ? "Listening" : paused ? "Paused" : muted ? "Muted" : "Idle"}
        </span>
        {onClose && (
          <Button size="icon" variant="ghost" onClick={onClose} className="ml-auto size-7 text-slate-400 hover:text-white" title="Close transcript">
            <X className="size-4" />
          </Button>
        )}
      </header>

      <div className="flex shrink-0 flex-wrap items-center gap-1.5 border-b border-slate-800/60 px-3 py-2">
        <TranscriptLanguageSelect lang={lang} onChange={setLang} />
        <Button
          size="sm"
          variant="outline"
          onClick={paused ? start : stop}
          disabled={!supported}
          className="h-7 gap-1 border-slate-700 bg-slate-900/70 px-2 text-[11px] text-slate-200 hover:bg-slate-800"
        >
          {paused ? <Play className="size-3" /> : <Pause className="size-3" />}
          {paused ? "Resume" : "Pause"}
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={handleDownload}
          disabled={finalLines.length === 0}
          className="h-7 gap-1 border-slate-700 bg-slate-900/70 px-2 text-[11px] text-slate-200 hover:bg-slate-800"
        >
          <Download className="size-3" />
          Download
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={clear}
          disabled={lines.length === 0}
          className="h-7 gap-1 px-2 text-[11px] text-slate-400 hover:bg-slate-800 hover:text-white"
        >
          <Trash2 className="size-3" />
          Clear
        </Button>
      </div>

      {(!supported || error) && (
        <div className="mx-3 mt-3 flex items-start gap-2 rounded-lg bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
          <AlertCircle className="mt-0.5 size-3.5 shrink-0" />
          <span className="flex-1 leading-relaxed">{!supported ? unsupportedReason : error}</span>
          {supported && error && (
            <Button size="sm" variant="outline" onClick={start} className="h-6 border-slate-600 bg-transparent px-2 text-[11px] text-slate-200 hover:bg-slate-800">
              Try again
            </Button>
          )}
        </div>
      )}

      <div className="relative min-h-0 flex-1">
        <div ref={scroller} onScroll={onScroll} className="h-full space-y-3 overflow-y-auto px-3 py-3">
          {lines.length === 0 ? (
            <p className="px-2 py-10 text-center text-xs text-slate-400">
              {supported
                ? muted
                  ? "You're muted. Unmute to have your speech transcribed; others' lines appear here."
                  : "Nothing has been said yet. The transcript fills in live as people speak."
                : "Transcription isn't available in this browser."}
            </p>
          ) : (
            lines.map((line) => (
              <div key={line.id} className="text-xs leading-relaxed">
                <div className="flex items-baseline gap-2">
                  <span className={cn("font-semibold", colorFor(line.speakerId || line.speaker))}>{line.isSelf ? "You" : line.speaker}</span>
                  <time className="font-mono text-[10px] text-slate-500" dateTime={new Date(line.at).toISOString()}>
                    {clock(line.at)}
                  </time>
                </div>
                <p className={cn("mt-0.5 break-words", line.isFinal ? "text-slate-200" : "italic text-slate-400")}>{line.text}</p>
              </div>
            ))
          )}
        </div>
        {behind && (
          <Button
            size="sm"
            onClick={jumpToLatest}
            className="absolute bottom-3 left-1/2 h-7 -translate-x-1/2 gap-1 rounded-full bg-blue-600 px-3 text-[11px] text-white shadow-lg hover:bg-blue-700"
          >
            <ArrowDown className="size-3" />
            Jump to latest
          </Button>
        )}
      </div>

      <footer className="shrink-0 border-t border-slate-800/60 px-3 py-2 text-[10px] leading-snug text-slate-500">
        Speech is converted to text by your browser&apos;s speech service (Chrome and Edge send audio to Google or Microsoft). The
        transcript stays on this device and is not saved on the server.
        {share === "sharing" && " Your lines are shared live with the others in the call."}
        {share === "unavailable" && " Sharing with others isn't available on this server yet."}
      </footer>
    </section>
  );
}
