"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Pencil, Trash2 } from "lucide-react"
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
        <Card className="rounded-none">
            <CardHeader className="pb-3">
                <CardTitle className="text-base">Configured Providers</CardTitle>
                <CardDescription>Your saved SMTP provider configurations, ordered by send priority</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {sortedEntries.map(([id, config], index) => (
                        <div key={id} className="flex items-center justify-between p-3 border">
                            <div className="space-y-0.5 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <Badge variant="outline" className="text-xs rounded-none">#{index + 1}</Badge>
                                    <span className="font-medium text-sm">{getProviderName(id)}</span>
                                </div>
                                <p className="text-xs text-muted-foreground truncate">
                                    {config.fromEmail} &middot; {config.host}:{config.port} &middot; {config.secure ? "SSL" : "STARTTLS"}
                                </p>
                            </div>
                            <div className="flex gap-1 shrink-0">
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(id)}>
                                    <Pencil className="h-3.5 w-3.5" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => onDelete(id)}>
                                    <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
