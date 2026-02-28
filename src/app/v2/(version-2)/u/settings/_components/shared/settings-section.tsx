"use client"

import { memo, type ReactNode } from "react"

interface SettingsSectionProps {
    title: string
    description?: string
    children: ReactNode
}

/**
 * A titled section within a settings page.
 * Groups related settings under a heading.
 */
function SettingsSection({ title, description, children }: SettingsSectionProps) {
    return (
        <section className="space-y-4">
            <div className="space-y-1">
                <h2 className="text-xl font-semibold">{title}</h2>
                {description && (
                    <p className="text-sm text-muted-foreground">{description}</p>
                )}
            </div>
            <div className="space-y-3">
                {children}
            </div>
        </section>
    )
}

export default memo(SettingsSection)
