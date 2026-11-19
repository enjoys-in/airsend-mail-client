"use client"

import Link from "next/link"
import { Boxes, ChevronRight } from "lucide-react"
import { EmptyState, Panel, Pill, type Tone } from "@/components/h-panel/kit"

interface DomainItem {
    id: string
    domain_name: string
    status: string
}

const statusTone = (status: string): Tone => {
    switch (status.toUpperCase()) {
        case "VERIFIED":
            return "green"
        case "PENDING":
            return "amber"
        case "REJECTED":
            return "red"
        default:
            return "neutral"
    }
}

/** One card per domain; each opens that domain's workspace. */
export function DomainList({ domains }: { domains: DomainItem[] }) {
    if (domains.length === 0) {
        return (
            <Panel>
                <EmptyState icon={Boxes} title="No domains found" description="Add a domain first, then enable its workspace to manage members here." />
            </Panel>
        )
    }

    return (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {domains.map((domain) => (
                <Link key={domain.id} href={`/h-panel/workspace/${domain.id}`} className="group">
                    <Panel className="flex items-center gap-3 p-4 transition-colors group-hover:border-foreground/20 group-hover:bg-muted/30">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                            <Boxes className="h-4 w-4" />
                        </span>
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium">{domain.domain_name}</p>
                            <div className="mt-1">
                                <Pill tone={statusTone(domain.status)} className="capitalize">
                                    {domain.status.toLowerCase()}
                                </Pill>
                            </div>
                        </div>
                        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/60 transition-transform group-hover:translate-x-0.5" />
                    </Panel>
                </Link>
            ))}
        </div>
    )
}
