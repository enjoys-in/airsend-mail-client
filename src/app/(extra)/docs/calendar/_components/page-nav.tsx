"use client"

import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

interface Section {
  id: string
  label: string
}

/** Scroll-spy: the active section is the topmost one inside the band below the sticky headers. */
function useActiveSection(sections: Section[]) {
  const [active, setActive] = useState(sections[0]?.id ?? "")

  useEffect(() => {
    const els = sections.map((s) => document.getElementById(s.id)).filter((e): e is HTMLElement => !!e)
    if (!els.length || typeof IntersectionObserver === "undefined") return

    const visible = new Map<string, number>()
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) visible.set(e.target.id, e.boundingClientRect.top)
          else visible.delete(e.target.id)
        }
        if (visible.size) setActive([...visible.entries()].sort((a, b) => a[1] - b[1])[0][0])
      },
      { rootMargin: "-120px 0px -60% 0px", threshold: 0 }
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [sections])

  return active
}

/**
 * Right-hand "On this page" rail (xl and up). Sticky, so it follows the reader.
 * The docs layout widens itself for pages containing `[data-docs-wide]` to make room for it.
 */
export function PageRail({ sections }: { sections: Section[] }) {
  const active = useActiveSection(sections)

  return (
    <nav aria-label="On this page" className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto pb-6">
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500 dark:text-neutral-400">
        On this page
      </p>
      <ul className="space-y-0.5 border-l border-neutral-200 dark:border-white/10">
        {sections.map((s) => {
          const on = active === s.id
          return (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                aria-current={on ? "true" : undefined}
                className={cn(
                  "-ml-px block border-l-2 py-1 pl-3 text-[13px] leading-5 transition-colors",
                  on
                    ? "border-pink-500 font-medium text-pink-700 dark:text-pink-300"
                    : "border-transparent text-neutral-600 dark:text-neutral-400 hover:border-neutral-400 dark:hover:border-white/30 hover:text-neutral-900 dark:hover:text-neutral-100"
                )}
              >
                {s.label}
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

/** Sticky horizontal bar for screens too narrow for the rail (below xl). */
export function PageNav({ sections }: { sections: Section[] }) {
  const active = useActiveSection(sections)
  const barRef = useRef<HTMLDivElement>(null)

  // Keep the active pill visible inside the horizontally-scrolling bar.
  useEffect(() => {
    const bar = barRef.current
    const el = bar?.querySelector<HTMLElement>(`[data-id="${active}"]`)
    if (!bar || !el) return
    bar.scrollTo({ left: el.offsetLeft - bar.clientWidth / 2 + el.clientWidth / 2, behavior: "smooth" })
  }, [active])

  return (
    <nav
      aria-label="On this page"
      className="sticky top-16 z-20 -mx-4 border-b border-neutral-200/70 dark:border-white/10 bg-neutral-50/85 dark:bg-[#18181B]/85 px-4 backdrop-blur-md md:-mx-8 md:px-8 xl:hidden"
    >
      <div ref={barRef} className="flex gap-1 overflow-x-auto py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {sections.map((s) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            data-id={s.id}
            aria-current={active === s.id ? "true" : undefined}
            className={cn(
              "shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors",
              active === s.id
                ? "bg-pink-500/10 text-pink-700 dark:text-pink-300"
                : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200/60 dark:hover:bg-white/5 hover:text-neutral-900 dark:hover:text-neutral-100"
            )}
          >
            {s.label}
          </a>
        ))}
      </div>
    </nav>
  )
}
