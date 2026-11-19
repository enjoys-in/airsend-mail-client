"use client"

import { Button } from "@/components/ui/button"
import { Pencil, Trash2 } from "lucide-react"
import { Pill, Section } from "@/components/h-panel/kit"
import type { EmailProvider, SavedProvidersType } from "./email-provider-form"

interface SavedProvidersProps {
    providers: SavedProvidersType
    providerOrder: string[]
    providerInfo: EmailProvider[]
    onEdit: (providerId: string) => void
    onDelete: (providerId: string) => void
}

export function SavedProviders({ providers, providerOrder, providerInfo, onEdit, onDelete }: SavedProvidersProps) {
    const getProviderName = (id: string) => providerInfo.find((p) => p.id === id)?.name || id

    const sortedEntries = Object.entries(providers).sort(
        ([a], [b]) => providerOrder.indexOf(a) - providerOrder.indexOf(b),
    )

    return (
        <Section title="Configured providers" description="Your saved SMTP provider configurations, ordered by send priority." flush>
            <div className="divide-y divide-border/70">
                {sortedEntries.map(([id, config], index) => (
                    <div key={id} className="flex items-center justify-between gap-3 px-5 py-3">
                        <div className="min-w-0 space-y-0.5">
                            <div className="flex flex-wrap items-center gap-2">
                                <Pill>#{index + 1}</Pill>
                                <span className="text-sm font-medium">{getProviderName(id)}</span>
                            </div>
                            <p className="truncate text-xs text-muted-foreground">
                                {config.fromEmail} &middot; {config.host}:{config.port} &middot; {config.secure ? "SSL" : "STARTTLS"}
                            </p>
                        </div>
                        <div className="flex shrink-0 gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={() => onEdit(id)} aria-label="Edit">
                                <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-red-600" onClick={() => onDelete(id)} aria-label="Delete">
                                <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </Section>
    )
}
