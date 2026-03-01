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

interface SelectOption {
    value: string
    label: string
}

interface SettingSelectRowProps {
    label: string
    tooltip?: string
    value: string
    onValueChange: (value: string) => void
    options: SelectOption[]
    placeholder?: string
    triggerClassName?: string
    disabled?: boolean
}

/**
 * A single settings row with a label on the left and a Select dropdown on the right.
 */
function SettingSelectRow({
    label,
    tooltip,
    value,
    onValueChange,
    options,
    placeholder,
    triggerClassName = "w-[180px]",
    disabled,
}: SettingSelectRowProps) {
    return (
        <div className="flex items-center justify-between gap-4 py-1">
            <div className="flex items-center gap-2 min-w-0">
                <span className="text-sm">{label}</span>
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
            </div>
            <Select value={value} onValueChange={onValueChange} disabled={disabled}>
                <SelectTrigger className={triggerClassName}>
                    <SelectValue placeholder={placeholder} />
                </SelectTrigger>
                <SelectContent>
                    {options.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    )
}

export default memo(SettingSelectRow)
