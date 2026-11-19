"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, FileText } from "lucide-react"
import type { ILog, LogLevel } from "../_lib/types"
import { API } from "@/lib/api/handler"
import { EmptyState, OrgPage, PageHeader, Pill, RowsSkeleton, Section, type Tone } from "../_components/kit"

const LEVEL_TONE: Record<LogLevel, Tone> = {
    error: "red",
    warn: "amber",
    info: "blue",
    debug: "neutral",
}

const LEVEL_LABEL: Record<LogLevel, string> = {
    error: "Error",
    warn: "Warning",
    info: "Info",
    debug: "Debug",
}

export default function LogsPage() {
    const [logs, setLogs] = React.useState<ILog[]>([])
    const [loading, setLoading] = React.useState(true)
    const [search, setSearch] = React.useState("")
    const [levelFilter, setLevelFilter] = React.useState<string>("all")
    const [sourceFilter, setSourceFilter] = React.useState<string>("all")

    React.useEffect(() => {
        API.getLogs()
            .then((res) => setLogs(res.data?.result || res.data || []))
            .catch(() => {})
            .finally(() => setLoading(false))
    }, [])

    const sources = React.useMemo(
        () => Array.from(new Set(logs.map((l) => l.source))).sort(),
        [logs]
    )

    const filtered = React.useMemo(() => {
        return logs.filter((l) => {
            const matchSearch = !search || l.message.toLowerCase().includes(search.toLowerCase()) || l.actor.toLowerCase().includes(search.toLowerCase())
            const matchLevel = levelFilter === "all" || l.level === levelFilter
            const matchSource = sourceFilter === "all" || l.source === sourceFilter
            return matchSearch && matchLevel && matchSource
        })
    }, [logs, search, levelFilter, sourceFilter])

    return (
        <OrgPage>
            <PageHeader title="Logs" description="Recent activity across your organizations: who did what, and when." />

            <Section flush>
                {/* Filters */}
                <div className="flex flex-wrap items-center gap-2 border-b border-border/70 px-4 py-3">
                    <div className="relative min-w-[200px] max-w-sm flex-1">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Search message or person" className="h-9 pl-8" value={search} onChange={(e) => setSearch(e.target.value)} />
                    </div>
                    <Select value={levelFilter} onValueChange={setLevelFilter}>
                        <SelectTrigger className="h-9 w-[140px]"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All levels</SelectItem>
                            <SelectItem value="error">Error</SelectItem>
                            <SelectItem value="warn">Warning</SelectItem>
                            <SelectItem value="info">Info</SelectItem>
                            <SelectItem value="debug">Debug</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={sourceFilter} onValueChange={setSourceFilter}>
                        <SelectTrigger className="h-9 w-[150px]"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All sources</SelectItem>
                            {sources.map((s) => (
                                <SelectItem key={s} value={s}>{s.toUpperCase()}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <span className="ml-auto text-xs text-muted-foreground">
                        {filtered.length} entr{filtered.length === 1 ? "y" : "ies"}
                    </span>
                </div>

                {loading ? (
                    <RowsSkeleton rows={6} />
                ) : filtered.length === 0 ? (
                    <EmptyState icon={FileText} title="No log entries" description="Nothing matches your filters." />
                ) : (
                    <div className="max-h-[640px] overflow-auto">
                        <Table>
                            <TableHeader className="sticky top-0 z-10 bg-card">
                                <TableRow className="hover:bg-transparent">
                                    <TableHead className="w-[170px] pl-5">Time</TableHead>
                                    <TableHead className="w-[100px]">Level</TableHead>
                                    <TableHead>Message</TableHead>
                                    <TableHead className="hidden w-[90px] md:table-cell">Source</TableHead>
                                    <TableHead className="hidden pr-5 lg:table-cell">Actor</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filtered.map((log) => (
                                    <TableRow key={log.id}>
                                        <TableCell className="whitespace-nowrap pl-5 align-top text-xs text-muted-foreground">
                                            {new Date(log.timestamp).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "medium" })}
                                        </TableCell>
                                        <TableCell className="align-top">
                                            <Pill tone={LEVEL_TONE[log.level] ?? "neutral"}>{LEVEL_LABEL[log.level] ?? log.level}</Pill>
                                        </TableCell>
                                        <TableCell className="align-top">
                                            <p className="break-words font-mono text-xs leading-relaxed">{log.message}</p>
                                            <p className="mt-1 text-xs text-muted-foreground md:hidden">
                                                {log.source.toUpperCase()} · {log.actor}
                                            </p>
                                        </TableCell>
                                        <TableCell className="hidden align-top text-xs text-muted-foreground md:table-cell">{log.source.toUpperCase()}</TableCell>
                                        <TableCell className="hidden break-all pr-5 align-top text-xs text-muted-foreground lg:table-cell">{log.actor}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </Section>
        </OrgPage>
    )
}
