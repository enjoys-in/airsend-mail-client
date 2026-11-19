"use client"

import { Building2, CheckCircle2, Globe, Mail } from "lucide-react"
import { Stat, StatGrid } from "./kit"

/** The Overview page's summary row (a client component so the icons can be passed to the kit). */
export function OverviewStats({
    organizations,
    domains,
    verified,
    mailboxes,
}: {
    organizations: number
    domains: number
    verified: number
    /** null when the API did not return per-domain mailbox counts. */
    mailboxes: number | null
}) {
    return (
        <StatGrid>
            <Stat label="Organizations" value={organizations} icon={Building2} />
            <Stat label="Domains linked" value={domains} icon={Globe} />
            <Stat label="Verified domains" value={verified} hint={domains ? `of ${domains}` : undefined} icon={CheckCircle2} />
            <Stat label="Mailboxes" value={mailboxes ?? "—"} icon={Mail} />
        </StatGrid>
    )
}
