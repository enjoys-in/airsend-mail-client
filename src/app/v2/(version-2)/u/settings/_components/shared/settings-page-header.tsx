"use client"

import { memo, type ReactNode } from "react"

interface SettingsPageHeaderProps {
    title: string
    description?: string
    icon?: ReactNode
    badge?: ReactNode
    action?: ReactNode
}

/**
 * Consistent, polished page header for settings tabs.
 * Supports title, description, optional leading icon, badge, and right-aligned actions.
 */
function SettingsPageHeader({ title, description, icon, badge, action }: SettingsPageHeaderProps) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-border/60">
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
    )
}

export default memo(SettingsPageHeader)
