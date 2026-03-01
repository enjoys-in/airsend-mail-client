"use client"

import { memo } from "react"

interface SettingsPageHeaderProps {
    title: string
    description?: string
}

/**
 * Consistent page header for every settings tab.
 * Renders a title and optional description text.
 */
function SettingsPageHeader({ title, description }: SettingsPageHeaderProps) {
    return (
        <div className="space-y-2">
            <h1 className="text-2xl md:text-3xl font-bold">{title}</h1>
            {description && (
                <p className="text-sm text-muted-foreground">{description}</p>
            )}
        </div>
    )
}

export default memo(SettingsPageHeader)
