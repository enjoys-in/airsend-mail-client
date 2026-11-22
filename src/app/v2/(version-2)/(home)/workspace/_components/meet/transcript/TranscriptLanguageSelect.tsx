"use client";

import React from "react";
import { Languages } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { sttLanguageOptions } from "../../../_lib/meet/transcription/languages";

/** Spoken-language picker for live captions / transcript (compact, dark-theme friendly). */
export default function TranscriptLanguageSelect({
  lang,
  onChange,
  className,
}: {
  lang: string;
  onChange: (lang: string) => void;
  className?: string;
}) {
  return (
    <Select value={lang} onValueChange={onChange}>
      <SelectTrigger
        aria-label="Spoken language"
        title="The language you speak in this meeting"
        className={cn(
          "h-7 w-auto min-w-0 gap-1.5 border-slate-700 bg-slate-900/70 px-2 text-[11px] text-slate-200 focus:ring-blue-500",
          className,
        )}
      >
        <Languages className="size-3 shrink-0 text-slate-400" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="max-h-64">
        {sttLanguageOptions(lang).map((option) => (
          <SelectItem key={option.code} value={option.code} className="text-xs">
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
