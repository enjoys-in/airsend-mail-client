"use client"

import { memo, type ReactNode } from "react"
import { cn } from "@/lib/utils"

interface SettingsPageHeaderProps {
    title: string
    description?: string
    icon?: ReactNode
    badge?: ReactNode
    action?: ReactNode
    className?: string
}

/**
 * Consistent, polished page header for settings tabs.
 * Supports title, description, optional leading icon, badge, and right-aligned actions.
 * Sticks to the top below HeaderV2 when the user scrolls settings content.
 */
function SettingsPageHeader({
    title,
    description,
    icon,
    badge,
    action,
    className,
}: SettingsPageHeaderProps) {
    return (
        <div
            className={cn(
                "sticky top-0 md:top-12 md:group-has-[[data-collapsible=icon]]/sidebar-wrapper:top-11 z-30",
                "bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80",
                "pt-3 pb-4 sm:pt-4 sm:pb-5 border-b border-border/60",
                "-mx-1 px-1 sm:-mx-2 sm:px-2",
                "transition-[top] duration-150 ease-linear",
                className
            )}
        >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center gap-2.5 flex-wrap">
                        {icon && (
                            <div className="flex items-center justify-center size-9 rounded-xl bg-primary/10 text-primary shrink-0">
                                {icon}
                            </div>
                        )}
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                            {title}
                        </h1>
                        {badge && <div className="shrink-0">{badge}</div>}
                    </div>
                    {description && (
                        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                            {description}
                        </p>
                    )}
                </div>
                {action && (
                    <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
                        {action}
                    </div>
                )}
            </div>
        </div>
    )
}

export default memo(SettingsPageHeader)
