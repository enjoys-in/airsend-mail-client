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
import { cn } from "@/lib/utils"

interface SettingToggleRowProps {
    label: string
    description?: string
    tooltip?: string
    checked: boolean
    onCheckedChange: (checked: boolean) => void
    disabled?: boolean
    badge?: ReactNode
    icon?: ReactNode
    className?: string
}

/**
 * A single settings row with an interactive label on the left and a Switch on the right.
 * Accessible, mobile-friendly, and gracefully wraps on compact viewports.
 */
function SettingToggleRow({
    label,
    description,
    tooltip,
    checked,
    onCheckedChange,
    disabled,
    badge,
    icon,
    className,
}: SettingToggleRowProps) {
    return (
        <div
            className={cn(
                "flex items-center justify-between gap-4 py-3 px-2 rounded-xl transition-colors duration-150 hover:bg-muted/40",
                disabled && "opacity-60 pointer-events-none",
                className
            )}
        >
            <div className="flex items-start gap-3 min-w-0 flex-1">
                {icon && (
                    <div className="mt-0.5 text-muted-foreground shrink-0 size-4">
                        {icon}
                    </div>
                )}
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm sm:text-base font-medium text-foreground leading-snug">
                            {label}
                        </span>
                        {badge && <div className="shrink-0">{badge}</div>}
                        {tooltip && (
                            <TooltipProvider delayDuration={200}>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <button
                                            type="button"
                                            className="text-muted-foreground hover:text-foreground inline-flex items-center p-0.5 rounded-full transition-colors"
                                            aria-label="More information"
                                        >
                                            <Info className="h-3.5 w-3.5 shrink-0 text-blue-500/80 cursor-help" />
                                        </button>
                                    </TooltipTrigger>
                                    <TooltipContent side="top" className="max-w-xs text-xs">
                                        <p>{tooltip}</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        )}
                    </div>
                    {description && (
                        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 leading-relaxed">
                            {description}
                        </p>
                    )}
                </div>
            </div>
            <div className="shrink-0 pl-2">
                <Switch
                    checked={checked}
                    onCheckedChange={onCheckedChange}
                    disabled={disabled}
                    className="data-[state=checked]:bg-primary transition-all duration-200"
                />
            </div>
        </div>
    )
}

export default memo(SettingToggleRow)
