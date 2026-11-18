"use client"

import { memo, type ReactNode } from "react"
import { Info } from "lucide-react"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

interface SelectOption {
    value: string
    label: string
}

interface SettingSelectRowProps {
    label: string
    description?: string
    tooltip?: string
    value: string
    onValueChange: (value: string) => void
    options: SelectOption[]
    placeholder?: string
    triggerClassName?: string
    disabled?: boolean
    icon?: ReactNode
    badge?: ReactNode
    className?: string
}

/**
 * A single settings row with a label on the left and a Select dropdown on the right.
 * Responsive: flexes on desktop/tablet, wraps smoothly on narrow mobile screens.
 */
function SettingSelectRow({
    label,
    description,
    tooltip,
    value,
    onValueChange,
    options,
    placeholder,
    triggerClassName,
    disabled,
    icon,
    badge,
    className,
}: SettingSelectRowProps) {
    return (
        <div
            className={cn(
                "flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3 px-2 rounded-xl transition-colors duration-150 hover:bg-muted/40",
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
                        {label && (
                            <span className="text-sm sm:text-base font-medium text-foreground leading-snug">
                                {label}
                            </span>
                        )}
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
            <div className="shrink-0 self-end sm:self-center w-full sm:w-auto">
                <Select value={value} onValueChange={onValueChange} disabled={disabled}>
                    <SelectTrigger
                        className={cn(
                            "w-full sm:w-[190px] h-9 text-xs sm:text-sm bg-background/80 border-border/80 shadow-2xs font-normal",
                            triggerClassName
                        )}
                    >
                        <SelectValue placeholder={placeholder} />
                    </SelectTrigger>
                    <SelectContent>
                        {options.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value} className="text-xs sm:text-sm">
                                {opt.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
    )
}

export default memo(SettingSelectRow)
