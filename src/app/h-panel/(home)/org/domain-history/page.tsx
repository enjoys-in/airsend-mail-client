"use client"

import * as React from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, History } from "lucide-react"
import { API } from "@/lib/api/handler"
import type { IDomainOrgHistory } from "../_lib/types"

export default function DomainHistoryPage() {
    const [history, setHistory] = React.useState<IDomainOrgHistory[]>([])
    const [loading, setLoading] = React.useState(true)
    const [search, setSearch] = React.useState("")

    React.useEffect(() => {
        API.getDomainHistory()
            .then((res) => setHistory(res.data?.result || res.data || []))
            .catch(() => {})
            .finally(() => setLoading(false))
    }, [])

    const filtered = React.useMemo(() => {
        if (!search) return history
        const q = search.toLowerCase()
        return history.filter(
            (h) =>
                (h.domain_name ?? "").toLowerCase().includes(q) ||
                (h.org_name ?? "").toLowerCase().includes(q) ||
                (h.changed_by ?? "").toLowerCase().includes(q)
        )
    }, [search, history])

    return (
        <div className="flex flex-col h-full">
            <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
                <h1 className="text-lg font-semibold">Domain–Org History</h1>
                <Badge variant="outline" className="ml-2 text-xs">
                    {filtered.length}
                </Badge>
            </header>
            <div className="flex-1 p-4 space-y-4 min-w-0 overflow-auto">
                <div className="relative max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search history..."
                        className="pl-8"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                {filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <History className="h-12 w-12 text-muted-foreground/50 mb-4" />
                        <h3 className="text-lg font-medium mb-1">No history records</h3>
                        <p className="text-sm text-muted-foreground">
                            Domain assignment changes will appear here.
                        </p>
                    </div>
                ) : (
                    <div className="rounded-md border overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Domain</TableHead>
                                    <TableHead>Organization</TableHead>
                                    <TableHead>Assigned At</TableHead>
                                    <TableHead>Revoked At</TableHead>
                                    <TableHead>Changed By</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filtered.map((h) => (
                                    <TableRow key={h.id}>
                                        <TableCell className="font-medium">
                                            {h.domain_name ?? "—"}
                                        </TableCell>
                                        <TableCell>{h.org_name ?? "—"}</TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {new Date(h.assigned_at).toLocaleString()}
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {h.revoked_at
                                                ? new Date(h.revoked_at).toLocaleString()
                                                : "—"}
                                        </TableCell>
                                        <TableCell className="text-sm">
                                            {h.changed_by ?? "—"}
                                        </TableCell>
                                        <TableCell>
                                            {h.revoked_at ? (
                                                <Badge variant="secondary">Revoked</Badge>
                                            ) : (
                                                <Badge className="bg-emerald-600 text-white">
                                                    Active
                                                </Badge>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </div>
        </div>
    )
}
