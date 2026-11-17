import type { ReactNode } from "react"
import { AlertTriangle, Info, Lightbulb, ShieldAlert } from "lucide-react"
import { cn } from "@/lib/utils"

/* ------------------------------------------------------------------ text */

export function Code({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <code
      className={cn(
        "rounded-md border border-neutral-200/80 dark:border-white/10 bg-neutral-100 dark:bg-white/5 px-1.5 py-0.5 text-[0.85em] [font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace] text-neutral-800 dark:text-neutral-200",
        className
      )}
    >
      {children}
    </code>
  )
}

export function Prose({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cn("text-[15px] leading-7 text-neutral-600 dark:text-neutral-400", className)}>{children}</p>
  )
}

/* --------------------------------------------------------------- layout */

/** Top-level docs section: eyebrow + h2 with a hover anchor. */
export function DocSection({
  id,
  title,
  eyebrow,
  badge,
  children,
}: {
  id: string
  title: string
  eyebrow?: string
  badge?: ReactNode
  children: ReactNode
}) {
  return (
    <section id={id} className="group/section scroll-mt-32 space-y-5">
      <header className="space-y-1.5">
        {eyebrow && (
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-pink-600 dark:text-pink-400">{eyebrow}</p>
        )}
        <div className="flex flex-wrap items-center gap-2.5">
          <h2 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">{title}</h2>
          {badge}
          <a
            href={`#${id}`}
            aria-label={`Link to ${title}`}
            className="text-neutral-400 opacity-0 transition-opacity hover:text-pink-500 focus-visible:opacity-100 group-hover/section:opacity-100"
          >
            #
          </a>
        </div>
      </header>
      {children}
    </section>
  )
}

export function SubHeading({ children }: { children: ReactNode }) {
  return <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">{children}</h3>
}

/** Big divider that splits "using it" from "building on it". */
export function PartHeader({ label, title, children }: { label: string; title: string; children?: ReactNode }) {
  return (
    <div className="relative pt-4">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-neutral-300 dark:via-white/15 to-transparent" />
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500 dark:text-neutral-400">{label}</p>
      <h2 className="mt-1 text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">{title}</h2>
      {children && <div className="mt-2 max-w-2xl">{children}</div>}
    </div>
  )
}

/** Numbered step with a connecting rail — used in the quick start. */
export function Step({
  n,
  title,
  last,
  children,
}: {
  n: number
  title: string
  last?: boolean
  children: ReactNode
}) {
  return (
    <li className="relative flex gap-4 sm:gap-5">
      <div className="flex flex-col items-center">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-pink-500/30 bg-pink-500/10 text-sm font-semibold text-pink-600 dark:text-pink-300">
          {n}
        </span>
        {!last && <span className="mt-2 w-px flex-1 bg-neutral-200 dark:bg-white/10" />}
      </div>
      <div className={cn("min-w-0 flex-1 space-y-3", !last && "pb-8")}>
        <h3 className="pt-1 text-base font-semibold text-neutral-900 dark:text-neutral-100">{title}</h3>
        {children}
      </div>
    </li>
  )
}

/* ------------------------------------------------------------- surfaces */

export function Panel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "rounded-xl border border-neutral-200/80 dark:border-white/10 bg-white/70 dark:bg-white/[0.03] p-5 shadow-sm backdrop-blur-sm",
        className
      )}
    >
      {children}
    </div>
  )
}

const CALLOUT = {
  info: { icon: Info, box: "border-blue-500/25 bg-blue-500/[0.06]", icon_c: "text-blue-500" },
  tip: { icon: Lightbulb, box: "border-emerald-500/25 bg-emerald-500/[0.06]", icon_c: "text-emerald-500" },
  warn: { icon: AlertTriangle, box: "border-amber-500/30 bg-amber-500/[0.07]", icon_c: "text-amber-500" },
  danger: { icon: ShieldAlert, box: "border-red-500/30 bg-red-500/[0.06]", icon_c: "text-red-500" },
} as const

export function Callout({
  type = "info",
  title,
  children,
}: {
  type?: keyof typeof CALLOUT
  title: string
  children: ReactNode
}) {
  const { icon: Icon, box, icon_c } = CALLOUT[type]
  return (
    <div role="note" className={cn("flex gap-3 rounded-xl border p-4", box)}>
      <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", icon_c)} aria-hidden />
      <div className="min-w-0 space-y-1 text-sm leading-6 text-neutral-600 dark:text-neutral-400">
        <p className="font-semibold text-neutral-900 dark:text-neutral-100">{title}</p>
        <div>{children}</div>
      </div>
    </div>
  )
}

/* ---------------------------------------------------------------- bits */

const METHOD = {
  GET: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
  POST: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
  PUT: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
  DELETE: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
  ANY: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20",
} as const

export function MethodPill({ method }: { method: keyof typeof METHOD }) {
  return (
    <span
      className={cn(
        "inline-flex w-16 shrink-0 items-center justify-center rounded-md border px-2 py-0.5 [font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace] text-[11px] font-semibold tracking-wide",
        METHOD[method]
      )}
    >
      {method}
    </span>
  )
}

export type Row = [ReactNode, ReactNode]

/** Typed tuple helper so `.map(...)` call sites don't widen to `(Element | string)[]`. */
export const row = (term: ReactNode, desc: ReactNode): Row => [term, desc]

export function KeyValueRows({ rows }: { rows: Row[] }) {
  return (
    <dl className="divide-y divide-neutral-200/80 dark:divide-white/10 overflow-hidden rounded-xl border border-neutral-200/80 dark:border-white/10 bg-white/70 dark:bg-white/[0.03]">
      {rows.map(([k, v], i) => (
        <div key={i} className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-baseline sm:gap-6">
          <dt className="shrink-0 sm:w-56">{k}</dt>
          <dd className="min-w-0 text-sm leading-6 text-neutral-600 dark:text-neutral-400">{v}</dd>
        </div>
      ))}
    </dl>
  )
}
