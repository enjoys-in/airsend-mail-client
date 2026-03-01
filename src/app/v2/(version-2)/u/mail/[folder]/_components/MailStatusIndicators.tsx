"use client"
import React from "react"
import {
    Star,
    Pin,
    Reply,
    Forward,
    AlertTriangle,
    Shield,
    ChevronUp,
} from "lucide-react"
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { GetAllMailsPayload } from "@/lib/types/mail.interface"

interface IndicatorProps {
    icon: React.ElementType
    tooltip: string
    color: string
    active: boolean
}

const StatusDot = React.memo(({ icon: Icon, tooltip, color, active }: IndicatorProps) => {
    if (!active) return null
    return (
        <Tooltip delayDuration={200}>
            <TooltipTrigger asChild>
                <span className={cn("inline-flex items-center justify-center flex-shrink-0", color)}>
                    <Icon className="w-3.5 h-3.5" strokeWidth={2} />
                </span>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-[11px] py-1 px-2">
                {tooltip}
            </TooltipContent>
        </Tooltip>
    )
})
StatusDot.displayName = "StatusDot"

/** Priority badge — only shown for non-normal priorities */
const PriorityBadge = React.memo(({ priority }: { priority: string | undefined }) => {
    if (!priority || priority === "normal") return null

    const config: Record<string, { label: string; color: string }> = {
        high: { label: "High", color: "text-orange-500" },
        urgent: { label: "Urgent", color: "text-red-500" },
        low: { label: "Low", color: "text-muted-foreground/60" },
    }
    const c = config[priority]
    if (!c) return null

    return (
        <Tooltip delayDuration={200}>
            <TooltipTrigger asChild>
                <span className={cn("inline-flex items-center gap-0.5 flex-shrink-0 text-[10px] font-medium", c.color)}>
                    <ChevronUp className={cn("w-3 h-3", priority === "low" && "rotate-180")} strokeWidth={2.5} />
                </span>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-[11px] py-1 px-2">
                {c.label} priority
            </TooltipContent>
        </Tooltip>
    )
})
PriorityBadge.displayName = "PriorityBadge"

/** Tracker warning */
const TrackerBadge = React.memo(({ count }: { count: number }) => {
    if (!count || count <= 0) return null
    return (
        <Tooltip delayDuration={200}>
            <TooltipTrigger asChild>
                <span className="inline-flex items-center gap-0.5 flex-shrink-0 text-amber-500">
                    <Shield className="w-3.5 h-3.5" strokeWidth={2} />
                </span>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-[11px] py-1 px-2">
                {count} tracker{count > 1 ? "s" : ""} blocked
            </TooltipContent>
        </Tooltip>
    )
})
TrackerBadge.displayName = "TrackerBadge"

/**
 * Renders a compact row of status indicators for a mail item.
 * Only visible icons render — no empty space when flags are off.
 */
export const MailStatusIndicators = React.memo(({ item }: { item: GetAllMailsPayload }) => {
    const hasAny =
        item.is_starred ||
        item.is_pinned ||
        item.is_important ||
        item.is_replied ||
        item.is_forwarded ||
        (item.priority && item.priority !== "normal") ||
        (item.trackers_detected ?? item.trackersDetected ?? 0) > 0

    if (!hasAny) return null

    return (
        <div className="flex items-center gap-1 flex-shrink-0">
            <StatusDot icon={Star} tooltip="Starred" color="text-yellow-500" active={!!item.is_starred} />
            <StatusDot icon={Pin} tooltip="Pinned" color="text-blue-500" active={!!item.is_pinned} />
            <StatusDot icon={AlertTriangle} tooltip="Important" color="text-orange-500" active={!!item.is_important} />
            <StatusDot icon={Reply} tooltip="Replied" color="text-emerald-500" active={!!item.is_replied} />
            <StatusDot icon={Forward} tooltip="Forwarded" color="text-violet-500" active={!!item.is_forwarded} />
            <PriorityBadge priority={item.priority} />
            <TrackerBadge count={item.trackers_detected ?? item.trackersDetected ?? 0} />
        </div>
    )
})
MailStatusIndicators.displayName = "MailStatusIndicators"
