"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, FileText } from "lucide-react"
import type { ILog, LogLevel } from "../_lib/types"
import { MOCK_LOGS } from "../_lib/mock-data"

const levelVariant: Record<LogLevel, "destructive" | "secondary" | "default" | "outline"> = {
    error: "destructive",
    warn: "secondary",
    info: "default",
    debug: "outline",
}

export default function LogsPage() {
    const [search, setSearch] = React.useState("")
    const [levelFilter, setLevelFilter] = React.useState<string>("all")
    const [sourceFilter, setSourceFilter] = React.useState<string>("all")

    const sources = React.useMemo(
        () => Array.from(new Set(MOCK_LOGS.map((l) => l.source))).sort(),
        []
    )

    const filtered = React.useMemo(() => {
        return MOCK_LOGS.filter((l) => {
            const matchSearch = !search || l.message.toLowerCase().includes(search.toLowerCase()) || l.actor.toLowerCase().includes(search.toLowerCase())
            const matchLevel = levelFilter === "all" || l.level === levelFilter
            const matchSource = sourceFilter === "all" || l.source === sourceFilter
            return matchSearch && matchLevel && matchSource
        })
    }, [search, levelFilter, sourceFilter])

    return (
        <div className="flex flex-col h-full">
            <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
                <h1 className="text-lg font-semibold">System Logs</h1>
                <Badge variant="outline" className="ml-2 text-xs">{filtered.length}</Badge>
            </header>
            <div className="flex-1 p-4 space-y-4 min-w-0 overflow-auto">
                {/* Filters */}
                <div className="flex flex-wrap gap-3 items-center">
                    <div className="relative flex-1 min-w-[200px] max-w-sm">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Search logs..." className="pl-8" value={search} onChange={(e) => setSearch(e.target.value)} />
                    </div>
                    <Select value={levelFilter} onValueChange={setLevelFilter}>
                        <SelectTrigger className="w-[130px]"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Levels</SelectItem>
                            <SelectItem value="error">Error</SelectItem>
                            <SelectItem value="warn">Warning</SelectItem>
                            <SelectItem value="info">Info</SelectItem>
                            <SelectItem value="debug">Debug</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={sourceFilter} onValueChange={setSourceFilter}>
                        <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Sources</SelectItem>
                            {sources.map((s) => (
                                <SelectItem key={s} value={s}>{s.toUpperCase()}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Log list */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base">Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {filtered.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <FileText className="h-10 w-10 text-muted-foreground/50 mb-3" />
                                <p className="text-sm text-muted-foreground">No log entries match your filters.</p>
                            </div>
                        ) : (
                            <ScrollArea className="h-[600px]">
                                <div className="space-y-3">
                                    {filtered.map((log) => (
                                        <div key={log.id} className="flex items-start gap-3 p-3 border rounded-lg">
                                            <Badge variant={levelVariant[log.level]} className="mt-0.5 text-[10px] uppercase min-w-[52px] justify-center">
                                                {log.level}
                                            </Badge>
                                            <div className="flex-1 space-y-1 min-w-0">
                                                <p className="text-sm font-medium leading-snug">{log.message}</p>
                                                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                                                    <span>{new Date(log.timestamp).toLocaleString()}</span>
                                                    <span>Source: {log.source.toUpperCase()}</span>
                                                    <span>Actor: {log.actor}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
