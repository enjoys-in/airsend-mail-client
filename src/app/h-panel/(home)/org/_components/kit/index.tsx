"use client"

import * as React from "react"
import Link from "next/link"
import { ArrowLeft, type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"

/**
 * The org section's small design kit. Every org page is built from these so the section looks like one product:
 * a 1200px content column, one header pattern, one card style (hairline border, soft radius, no shadow), calm type
 * (regular body text, 500 for emphasis), muted secondary text and colour only where it carries meaning.
 */

/** Page content column. */
export function OrgPage({ children, className, narrow }: { children: React.ReactNode; className?: string; narrow?: boolean }) {
    return <div className={cn("mx-auto w-full px-4 py-6 sm:px-6 lg:py-8", narrow ? "max-w-3xl" : "max-w-[1200px]", className)}>{children}</div>
}

/** Title, one-line description and the page actions. `back` renders a quiet "back" link above the title. */
export function PageHeader({
    title,
    description,
    actions,
    back,
    className,
}: {
    title: React.ReactNode
    description?: React.ReactNode
    actions?: React.ReactNode
    back?: { href: string; label: string }
    className?: string
}) {
    return (
        <div className={cn("mb-6 space-y-3", className)}>
            {back && (
                <Link href={back.href} className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground">
                    <ArrowLeft className="h-3.5 w-3.5" />
                    {back.label}
                </Link>
            )}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 space-y-1">
                    <h1 className="text-xl font-medium tracking-tight sm:text-2xl">{title}</h1>
                    {description && <p className="max-w-2xl text-sm text-muted-foreground">{description}</p>}
                </div>
                {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
            </div>
        </div>
    )
}

/** A bordered surface. Use instead of ad-hoc `rounded border bg-card shadow` combinations. */
export function Panel({ children, className }: { children: React.ReactNode; className?: string }) {
    return <div className={cn("rounded-xl border border-border/70 bg-card text-card-foreground", className)}>{children}</div>
}

/** A titled group of content inside a page (`Panel` with a header row). */
export function Section({
    title,
    description,
    actions,
    children,
    className,
    flush,
}: {
    title?: React.ReactNode
    description?: React.ReactNode
    actions?: React.ReactNode
    children: React.ReactNode
    className?: string
    /** No padding around the body (tables, lists). */
    flush?: boolean
}) {
    return (
        <Panel className={className}>
            {(title || actions) && (
                <div className="flex items-start justify-between gap-3 border-b border-border/70 px-5 py-4">
                    <div className="min-w-0">
                        {title && <h2 className="text-sm font-medium">{title}</h2>}
                        {description && <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>}
                    </div>
                    {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
                </div>
            )}
            <div className={flush ? "" : "p-5"}>{children}</div>
        </Panel>
    )
}

/** A row of summary numbers. */
export function StatGrid({ children, className }: { children: React.ReactNode; className?: string }) {
    return <div className={cn("grid grid-cols-2 gap-3 lg:grid-cols-4", className)}>{children}</div>
}

export function Stat({
    label,
    value,
    hint,
    icon: Icon,
    loading,
}: {
    label: string
    value: React.ReactNode
    hint?: React.ReactNode
    icon?: LucideIcon
    loading?: boolean
}) {
    return (
        <Panel className="px-4 py-3.5">
            <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-muted-foreground">{label}</span>
                {Icon && <Icon className="h-4 w-4 text-muted-foreground/70" />}
            </div>
            {loading ? (
                <Skeleton className="mt-2 h-7 w-16" />
            ) : (
                <div className="mt-1 text-2xl font-medium tabular-nums tracking-tight">{value}</div>
            )}
            {hint && <div className="mt-0.5 text-xs text-muted-foreground">{hint}</div>}
        </Panel>
    )
}

/** Nothing here yet. */
export function EmptyState({
    icon: Icon,
    title,
    description,
    action,
    className,
}: {
    icon?: LucideIcon
    title: string
    description?: string
    action?: React.ReactNode
    className?: string
}) {
    return (
        <div className={cn("flex flex-col items-center justify-center px-6 py-14 text-center", className)}>
            {Icon && (
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
                    <Icon className="h-5 w-5" />
                </div>
            )}
            <p className="text-sm font-medium">{title}</p>
            {description && <p className="mt-1 max-w-sm text-xs text-muted-foreground">{description}</p>}
            {action && <div className="mt-4">{action}</div>}
        </div>
    )
}

/** Small status / role chip. `tone` carries meaning; `neutral` is the default. */
const TONES = {
    neutral: "bg-muted text-muted-foreground",
    green: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
    amber: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
    red: "bg-red-500/10 text-red-700 dark:text-red-400",
    blue: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
    violet: "bg-violet-500/10 text-violet-700 dark:text-violet-400",
} as const
export type Tone = keyof typeof TONES

export function Pill({ children, tone = "neutral", className }: { children: React.ReactNode; tone?: Tone; className?: string }) {
    return (
        <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium leading-4", TONES[tone], className)}>
            {children}
        </span>
    )
}

const AVATAR_TONES = [
    "bg-blue-500/10 text-blue-700 dark:text-blue-300",
    "bg-violet-500/10 text-violet-700 dark:text-violet-300",
    "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    "bg-amber-500/10 text-amber-700 dark:text-amber-300",
    "bg-rose-500/10 text-rose-700 dark:text-rose-300",
    "bg-cyan-500/10 text-cyan-700 dark:text-cyan-300",
]

/** Initials avatar, deterministic tint from the text. */
export function Initials({ text, className }: { text: string; className?: string }) {
    const label = (text || "?").trim()
    const parts = label.split(/[\s@._-]+/).filter(Boolean)
    const initials = ((parts[0]?.[0] ?? "?") + (parts.length > 1 ? parts[1]?.[0] ?? "" : "")).toUpperCase()
    let hash = 0
    for (let i = 0; i < label.length; i++) hash = (hash * 31 + label.charCodeAt(i)) >>> 0
    return (
        <span className={cn("inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-medium", AVATAR_TONES[hash % AVATAR_TONES.length], className)}>
            {initials}
        </span>
    )
}

/** Loading placeholder for a table or list body. */
export function RowsSkeleton({ rows = 5 }: { rows?: number }) {
    return (
        <div className="divide-y divide-border/70">
            {Array.from({ length: rows }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-5 py-3.5">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="flex-1 space-y-1.5">
                        <Skeleton className="h-3.5 w-40" />
                        <Skeleton className="h-3 w-56" />
                    </div>
                    <Skeleton className="h-5 w-16 rounded-full" />
                </div>
            ))}
        </div>
    )
}
