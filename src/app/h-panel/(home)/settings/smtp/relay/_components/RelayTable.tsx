"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Pencil, Trash2, Server } from "lucide-react"
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
            <Card className="rounded-none">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                    <Server className="h-10 w-10 text-muted-foreground mb-3" />
                    <p className="text-sm text-muted-foreground">No relay servers configured yet.</p>
                    <p className="text-xs text-muted-foreground mt-1">Add a relay below to start routing emails through Airsend.</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="rounded-none">
            <CardHeader className="pb-3">
                <CardTitle className="text-base">Configured Relays</CardTitle>
                <CardDescription>Manage your SMTP relay servers. Drag to reorder priority.</CardDescription>
            </CardHeader>
            <CardContent>
                {/* Desktop table */}
                <div className="hidden md:block">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Host</TableHead>
                                <TableHead>Port</TableHead>
                                <TableHead>Auth</TableHead>
                                <TableHead>Domains</TableHead>
                                <TableHead>Rate</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {relays.map((relay) => (
                                <TableRow key={relay.id}>
                                    <TableCell className="font-medium">{relay.name}</TableCell>
                                    <TableCell className="text-muted-foreground text-xs font-mono">{relay.host}</TableCell>
                                    <TableCell>{relay.port}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="text-xs rounded-none">{relay.auth_method}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-wrap gap-1">
                                            {relay.allowed_domains.slice(0, 2).map((d) => (
                                                <Badge key={d} variant="secondary" className="text-xs rounded-none">{d}</Badge>
                                            ))}
                                            {relay.allowed_domains.length > 2 && (
                                                <Badge variant="secondary" className="text-xs rounded-none">+{relay.allowed_domains.length - 2}</Badge>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-xs text-muted-foreground">{relay.rate_limit}/hr</TableCell>
                                    <TableCell>
                                        <Switch checked={relay.enabled} onCheckedChange={() => onToggle(relay.id)} />
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex gap-1 justify-end">
                                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(relay)}>
                                                <Pencil className="h-3.5 w-3.5" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => onDelete(relay.id)}>
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                {/* Mobile cards */}
                <div className="md:hidden space-y-3">
                    {relays.map((relay) => (
                        <div key={relay.id} className="border p-3 space-y-2">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="font-medium text-sm">{relay.name}</span>
                                    <Badge variant={relay.enabled ? "default" : "secondary"} className="text-xs rounded-none">
                                        {relay.enabled ? "Active" : "Disabled"}
                                    </Badge>
                                </div>
                                <Switch checked={relay.enabled} onCheckedChange={() => onToggle(relay.id)} />
                            </div>
                            <p className="text-xs text-muted-foreground font-mono">{relay.host}:{relay.port}</p>
                            <div className="flex flex-wrap gap-1">
                                {relay.allowed_domains.map((d) => (
                                    <Badge key={d} variant="outline" className="text-xs rounded-none">{d}</Badge>
                                ))}
                            </div>
                            <div className="flex gap-1 justify-end pt-1">
                                <Button variant="outline" size="sm" className="h-7 rounded-none" onClick={() => onEdit(relay)}>
                                    <Pencil className="h-3 w-3 mr-1" /> Edit
                                </Button>
                                <Button variant="outline" size="sm" className="h-7 rounded-none text-destructive hover:text-destructive" onClick={() => onDelete(relay.id)}>
                                    <Trash2 className="h-3 w-3 mr-1" /> Delete
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}