"use client"

import { memo, type ReactNode } from "react"
import { Switch } from "@/components/ui/switch"
import { Info } from "lucide-react"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"

interface SettingToggleRowProps {
    label: string
    description?: string
    tooltip?: string
    checked: boolean
    onCheckedChange: (checked: boolean) => void
    disabled?: boolean
    badge?: ReactNode
}

/**
 * A single settings row with a label on the left and a Switch on the right.
 * Optionally shows an info tooltip and/or a badge (e.g. "AI").
 */
function SettingToggleRow({
    label,
    description,
    tooltip,
    checked,
    onCheckedChange,
    disabled,
    badge,
}: SettingToggleRowProps) {
    return (
        <div className="flex items-center justify-between gap-4 py-1">
            <div className="flex items-center gap-2 min-w-0">
                <div className="min-w-0">
                    <span className="text-sm">{label}</span>
                    {description && (
                        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
                    )}
                </div>
                {tooltip && (
                    <TooltipProvider delayDuration={200}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Info className="h-4 w-4 shrink-0 text-blue-400 cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent side="top" className="max-w-xs">
                                <p>{tooltip}</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                )}
                {badge}
            </div>
            <Switch
                checked={checked}
                onCheckedChange={onCheckedChange}
                disabled={disabled}
                className="shrink-0 data-[state=checked]:bg-blue-500"
            />
        </div>
    )
}

export default memo(SettingToggleRow)
