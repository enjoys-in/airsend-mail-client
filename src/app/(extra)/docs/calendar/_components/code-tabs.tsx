"use client"

import { useState } from "react"
import { Globe } from "lucide-react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { CALDEV_PUBLIC_URL } from "../_data/config"
import { CopyButton } from "./copy-button"
import { highlight, type Lang } from "./highlight"

/** Token replaced by the CalDev URL inside every sample. */
const BASE_TOKEN = "{{BASE_URL}}"

export interface CodeSample {
  label: string
  code: string
  /** Highlighting mode. Defaults to "js". */
  lang?: Lang
}

/**
 * One sample → a titled panel. Several → tabs (fetch / curl / response …).
 * `{{BASE_URL}}` in the code is replaced with the CalDev URL. The copy button copies the visible tab.
 */
export function CodeTabs({ samples }: { samples: CodeSample[] }) {
  const resolved = samples.map((s) => ({ ...s, code: s.code.split(BASE_TOKEN).join(CALDEV_PUBLIC_URL) }))
  const [active, setActive] = useState(resolved[0].label)
  const current = resolved.find((s) => s.label === active) ?? resolved[0]

  return (
    <figure className="overflow-hidden rounded-xl border border-white/10 bg-zinc-950 shadow-lg shadow-black/10">
      <div className="flex items-center justify-between gap-3 border-b border-white/10 bg-white/[0.03] px-3 py-2">
        {resolved.length > 1 ? (
          <Tabs value={current.label} onValueChange={setActive}>
            <TabsList className="h-auto gap-1 bg-transparent p-0">
              {resolved.map((s) => (
                <TabsTrigger
                  key={s.label}
                  value={s.label}
                  className="rounded-md px-2.5 py-1 text-xs text-zinc-400 hover:text-zinc-200 data-[state=active]:bg-white/10 data-[state=active]:text-white data-[state=active]:shadow-none"
                >
                  {s.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        ) : (
          <span className="px-1 text-xs font-medium text-zinc-400">{current.label}</span>
        )}
        <CopyButton text={current.code} />
      </div>

      <pre
        tabIndex={0}
        aria-label={`${current.label} code sample`}
        className="max-h-[32rem] overflow-auto whitespace-pre p-4 text-[13px] leading-6 text-zinc-100 [tab-size:2] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-pink-500/50"
      >
        <code className={cn("block [font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace]", `language-${current.lang ?? "js"}`)}>
          {highlight(current.code, current.lang ?? "js")}
        </code>
      </pre>
    </figure>
  )
}

/** The service URL as a copyable pill. */
export function BaseUrl({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "inline-flex max-w-full items-center gap-2 rounded-lg border border-neutral-200 dark:border-white/10 bg-white dark:bg-zinc-950/60 py-1.5 pl-3 pr-1.5",
        className
      )}
    >
      <Globe className="h-4 w-4 shrink-0 text-pink-500" aria-hidden />
      <code className="truncate [font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace] text-sm text-neutral-800 dark:text-neutral-100">{CALDEV_PUBLIC_URL}</code>
      <CopyButton text={CALDEV_PUBLIC_URL} variant="light" withLabel={false} />
    </div>
  )
}
