"use client"

import { memo, type ReactNode } from "react"
import { cn } from "@/lib/utils"

interface SettingsSectionProps {
    title: string
    description?: string
    icon?: ReactNode
    badge?: ReactNode
    action?: ReactNode
    className?: string
    cardClassName?: string
    children: ReactNode
}

/**
 * A titled, card-contained section within a settings page.
 * Groups related settings under a clean header with responsive padding.
 */
function SettingsSection({
    title,
    description,
    icon,
    badge,
    action,
    className,
    cardClassName,
    children,
}: SettingsSectionProps) {
    return (
        <section className={cn("space-y-3", className)}>
            <div className="rounded-2xl border border-border/70 bg-card/70 backdrop-blur-xs p-4 sm:p-6 shadow-xs hover:border-border transition-all duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-4 mb-3 border-b border-border/50">
                    <div className="space-y-0.5 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            {icon && (
                                <span className="text-muted-foreground shrink-0">
                                    {icon}
                                </span>
                            )}
                            <h2 className="text-lg sm:text-xl font-semibold tracking-tight text-foreground">
                                {title}
                            </h2>
                            {badge && <div className="shrink-0">{badge}</div>}
                        </div>
                        {description && (
                            <p className="text-xs sm:text-sm text-muted-foreground">
                                {description}
                            </p>
                        )}
                    </div>
                    {action && (
                        <div className="shrink-0 self-start sm:self-center">
                            {action}
                        </div>
                    )}
                </div>
                <div className={cn("space-y-2 divide-y divide-border/30", cardClassName)}>
                    {children}
                </div>
            </div>
        </section>
    )
}

export default memo(SettingsSection)
