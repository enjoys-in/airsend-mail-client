"use client"

import { BarChart3, Megaphone, Settings2, Users, Workflow, Webhook, type LucideIcon } from "lucide-react"
import { EmptyState, PageHeader, PageShell, Panel } from "@/components/h-panel/kit"

const ICONS: Record<string, LucideIcon> = {
    campaigns: Megaphone,
    management: Settings2,
    contacts: Users,
    automations: Workflow,
    analytics: BarChart3,
    webhooks: Webhook,
}

/**
 * Placeholder for h-panel sections that are not built yet. The icon is chosen by name here, not passed in, so server pages
 * (which cannot pass component references to client components) can use it.
 */
export function ComingSoon({
    icon = "campaigns",
    title,
    description,
}: {
    icon?: keyof typeof ICONS | string
    title: string
    description: string
}) {
    return (
        <PageShell>
            <PageHeader title={title} description={description} />
            <Panel>
                <EmptyState
                    icon={ICONS[icon] ?? Megaphone}
                    title="Coming soon"
                    description="This section is being built. Nothing to configure here yet."
                />
            </Panel>
        </PageShell>
    )
}
