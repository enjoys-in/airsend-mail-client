"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Building2, Globe, History, Search } from "lucide-react"
import { API } from "@/lib/api/handler"
import type { IDomainOrgHistory } from "../_lib/types"
import { EmptyState, OrgPage, PageHeader, Pill, RowsSkeleton, Section } from "../_components/kit"

const when = (value: string | null | undefined) =>
    value ? new Date(value).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }) : "—"

export default function DomainHistoryPage() {
    const [history, setHistory] = React.useState<IDomainOrgHistory[]>([])
    const [loading, setLoading] = React.useState(true)
    const [search, setSearch] = React.useState("")
    const [stateFilter, setStateFilter] = React.useState<string>("all")

    React.useEffect(() => {
        API.getDomainHistory()
            .then((res) => setHistory(res.data?.result || res.data || []))
            .catch(() => {})
            .finally(() => setLoading(false))
    }, [])

    const filtered = React.useMemo(() => {
        const q = search.toLowerCase()
        return history.filter((h) => {
            const matchSearch =
                !q ||
                (h.domain_name ?? "").toLowerCase().includes(q) ||
                (h.org_name ?? "").toLowerCase().includes(q) ||
                (h.changed_by ?? "").toLowerCase().includes(q)
            const matchState = stateFilter === "all" || (stateFilter === "active" ? !h.revoked_at : !!h.revoked_at)
            return matchSearch && matchState
        })
    }, [search, stateFilter, history])

    return (
        <OrgPage>
            <PageHeader
                title="Domain history"
                description="Every time a domain was assigned to an organization, and when that assignment ended."
            />

            <Section flush>
                <div className="flex flex-wrap items-center gap-2 border-b border-border/70 px-4 py-3">
                    <div className="relative min-w-[200px] max-w-sm flex-1">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search domain, organization or person"
                            className="h-9 pl-8"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <Select value={stateFilter} onValueChange={setStateFilter}>
                        <SelectTrigger className="h-9 w-[150px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All changes</SelectItem>
                            <SelectItem value="active">Current</SelectItem>
                            <SelectItem value="revoked">Ended</SelectItem>
                        </SelectContent>
                    </Select>
                    <span className="ml-auto text-xs text-muted-foreground">
                        {filtered.length} record{filtered.length !== 1 ? "s" : ""}
                    </span>
                </div>

                {loading ? (
                    <RowsSkeleton rows={4} />
                ) : filtered.length === 0 ? (
                    <EmptyState
                        icon={History}
                        title="No history records"
                        description={search || stateFilter !== "all" ? "Nothing matches your filters." : "Domain assignment changes will appear here."}
                    />
                ) : (
                    <ol className="divide-y divide-border/70">
                        {filtered.map((h) => {
                            const current = !h.revoked_at
                            return (
                                <li key={h.id} className="flex gap-3 px-5 py-4">
                                    {/* timeline marker */}
                                    <div className="flex flex-col items-center pt-1">
                                        <span
                                            className={
                                                current
                                                    ? "h-2.5 w-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-500/15"
                                                    : "h-2.5 w-2.5 rounded-full bg-muted-foreground/40 ring-4 ring-muted"
                                            }
                                        />
                                    </div>
                                    <div className="min-w-0 flex-1 space-y-1.5">
                                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
                                            <span className="inline-flex items-center gap-1.5 text-sm font-medium">
                                                <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                                                {h.domain_name ?? "Unknown domain"}
                                            </span>
                                            <span className="text-muted-foreground">→</span>
                                            <Pill tone="blue">
                                                <Building2 className="h-3 w-3" />
                                                {h.org_name ?? "Unknown organization"}
                                            </Pill>
                                            <Pill tone={current ? "green" : "neutral"}>{current ? "Current" : "Ended"}</Pill>
                                        </div>
                                        <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-muted-foreground">
                                            <span>Assigned {when(h.assigned_at)}</span>
                                            {h.revoked_at && <span>Ended {when(h.revoked_at)}</span>}
                                            {h.changed_by && <span>By {h.changed_by}</span>}
                                        </div>
                                    </div>
                                </li>
                            )
                        })}
                    </ol>
                )}
            </Section>
        </OrgPage>
    )
}
