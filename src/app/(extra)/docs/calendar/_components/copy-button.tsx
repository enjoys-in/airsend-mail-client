"use client"

import { useEffect, useRef, useState } from "react"
import { Check, Copy } from "lucide-react"
import { cn } from "@/lib/utils"

interface CopyButtonProps {
  text: string
  /** "dark" sits on a code panel, "light" on a normal surface. */
  variant?: "dark" | "light"
  /** Show the "Copy" text next to the icon. */
  withLabel?: boolean
  className?: string
}

export function CopyButton({ text, variant = "dark", withLabel = true, className }: CopyButtonProps) {
  const [copied, setCopied] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current) }, [])

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      if (timer.current) clearTimeout(timer.current)
      timer.current = setTimeout(() => setCopied(false), 1600)
    } catch {
      /* clipboard unavailable (insecure context / denied) — nothing to do */
    }
  }

  return (
    <button
      type="button"
      onClick={onCopy}
      aria-label={copied ? "Copied" : "Copy to clipboard"}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-medium transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-500/60",
        variant === "dark"
          ? "border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white"
          : "border-neutral-200 dark:border-white/10 bg-white dark:bg-white/5 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-white/10",
        className
      )}
    >
      {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
      {withLabel && <span aria-live="polite">{copied ? "Copied" : "Copy"}</span>}
    </button>
  )
}
