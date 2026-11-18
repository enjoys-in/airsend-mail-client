"use client"

import { memo, useMemo, type ReactNode } from "react"
import { Info, ChevronDown } from "lucide-react"
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

export interface SelectOption {
    value: string
    label: string
}

interface SettingSelectRowProps {
    label?: string
    description?: string
    tooltip?: string
    value?: string | number | null
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
 * Guaranteed to display meaningful text even when values are undefined, null, or case-mismatched.
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
    // Find matching option with case-insensitive fallback
    const matchedOption = useMemo(() => {
        if (value === undefined || value === null || value === "" || value === "undefined" || value === "null") {
            return undefined
        }
        const strVal = String(value).trim()
        return (
            options.find((opt) => opt.value === strVal) ||
            options.find((opt) => opt.value.toLowerCase() === strVal.toLowerCase()) ||
            options.find((opt) => opt.label.toLowerCase() === strVal.toLowerCase())
        )
    }, [value, options])

    // Safe value passed to Radix UI Select (must be in options or undefined)
    const safeValue = matchedOption ? matchedOption.value : undefined

    // Meaningful fallback placeholder text so select boxes are never empty
    const meaningfulPlaceholder = useMemo(() => {
        if (placeholder) return placeholder
        if (options.length > 0) {
            return options[0].label
        }
        return label ? `Select ${label}` : "Choose option"
    }, [placeholder, options, label])

    const hasHeader = Boolean(label || description || icon || tooltip || badge)

    return (
        <div
            className={cn(
                "flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3 px-2 rounded-xl transition-colors duration-150 hover:bg-muted/40",
                !hasHeader && "py-0 px-0 hover:bg-transparent justify-end",
                disabled && "opacity-60 pointer-events-none",
                className
            )}
        >
            {hasHeader && (
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
            )}
            <div className={cn("shrink-0 w-full sm:w-auto", hasHeader && "self-end sm:self-center")}>
                <Select value={safeValue} onValueChange={onValueChange} disabled={disabled}>
                    <SelectTrigger
                        className={cn(
                            "w-full sm:w-[190px] h-9 text-xs sm:text-sm bg-background/80 border-border/80 shadow-2xs font-normal text-foreground flex items-center justify-between gap-1.5",
                            !safeValue && "text-muted-foreground",
                            triggerClassName
                        )}
                    >
                        <SelectValue placeholder={meaningfulPlaceholder}>
                            {matchedOption ? matchedOption.label : undefined}
                        </SelectValue>
                        <ChevronDown className="h-3.5 w-3.5 opacity-50 shrink-0 ml-1.5" />
                    </SelectTrigger>
                    <SelectContent>
                        {options.map((opt) => (
                            <SelectItem
                                key={opt.value}
                                value={opt.value}
                                textValue={opt.label}
                                className="text-xs sm:text-sm cursor-pointer"
                            >
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
