"use client"

import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Pencil, Trash2, Server } from "lucide-react"
import { EmptyState, Pill, Section } from "@/components/h-panel/kit"
import type { RelayConfig } from "../page"

interface RelayTableProps {
    relays: RelayConfig[]
    onEdit: (relay: RelayConfig) => void
    onDelete: (id: string) => void
    onToggle: (id: string) => void
}

export default function RelayTable({ relays, onEdit, onDelete, onToggle }: RelayTableProps) {
    if (relays.length === 0) {
        return (
            <Section>
                <EmptyState
                    icon={Server}
                    title="No relay servers yet"
                    description="Add a relay below to start routing emails through Airsend."
                />
            </Section>
        )
    }

    return (
        <Section title="Configured relays" description="Manage your SMTP relay servers." flush>
            {/* Desktop table */}
            <div className="hidden md:block">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="pl-5">Name</TableHead>
                            <TableHead>Host</TableHead>
                            <TableHead>Port</TableHead>
                            <TableHead>Auth</TableHead>
                            <TableHead>Domains</TableHead>
                            <TableHead>Rate</TableHead>
                            <TableHead>Enabled</TableHead>
                            <TableHead className="pr-5 text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {relays.map((relay) => (
                            <TableRow key={relay.id}>
                                <TableCell className="pl-5 font-medium">{relay.name}</TableCell>
                                <TableCell className="font-mono text-xs text-muted-foreground">{relay.host}</TableCell>
                                <TableCell>{relay.port}</TableCell>
                                <TableCell>
                                    <Pill>{relay.auth_method}</Pill>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-wrap gap-1">
                                        {relay.allowed_domains.slice(0, 2).map((d) => (
                                            <Pill key={d}>{d}</Pill>
                                        ))}
                                        {relay.allowed_domains.length > 2 && <Pill>+{relay.allowed_domains.length - 2}</Pill>}
                                        {relay.allowed_domains.length === 0 && <span className="text-xs text-muted-foreground">All</span>}
                                    </div>
                                </TableCell>
                                <TableCell className="text-xs text-muted-foreground">{relay.rate_limit}/hr</TableCell>
                                <TableCell>
                                    <Switch checked={relay.enabled} onCheckedChange={() => onToggle(relay.id)} />
                                </TableCell>
                                <TableCell className="pr-5 text-right">
                                    <div className="flex justify-end gap-1">
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={() => onEdit(relay)} aria-label="Edit">
                                            <Pencil className="h-3.5 w-3.5" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-red-600" onClick={() => onDelete(relay.id)} aria-label="Delete">
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Mobile list */}
            <div className="divide-y divide-border/70 md:hidden">
                {relays.map((relay) => (
                    <div key={relay.id} className="space-y-2 px-5 py-4">
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">{relay.name}</span>
                                <Pill tone={relay.enabled ? "green" : "neutral"}>{relay.enabled ? "Active" : "Disabled"}</Pill>
                            </div>
                            <Switch checked={relay.enabled} onCheckedChange={() => onToggle(relay.id)} />
                        </div>
                        <p className="font-mono text-xs text-muted-foreground">{relay.host}:{relay.port}</p>
                        <div className="flex flex-wrap gap-1">
                            {relay.allowed_domains.map((d) => (
                                <Pill key={d}>{d}</Pill>
                            ))}
                        </div>
                        <div className="flex justify-end gap-2 pt-1">
                            <Button variant="outline" size="sm" className="h-8 gap-1.5" onClick={() => onEdit(relay)}>
                                <Pencil className="h-3 w-3" /> Edit
                            </Button>
                            <Button variant="outline" size="sm" className="h-8 gap-1.5 text-red-600 hover:text-red-600" onClick={() => onDelete(relay.id)}>
                                <Trash2 className="h-3 w-3" /> Delete
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </Section>
    )
}
