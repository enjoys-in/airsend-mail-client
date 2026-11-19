"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

/** URL segment -> label. Anything not listed is title-cased; ids (numbers / uuids) become "Details". */
const LABELS: Record<string, string> = {
    "h-panel": "Home",
    org: "Organizations",
    "domain-history": "History",
    "danger-zone": "Danger zone",
    "emails-events": "Email events",
    "manage-ip": "IP management",
    api: "API",
    webhook: "Webhooks",
    add: "Invite member",
}

const isId = (segment: string) => /^\d+$/.test(segment) || /^[0-9a-f]{8}-[0-9a-f]{4}-/i.test(segment)

const titleCase = (segment: string) =>
    decodeURIComponent(segment)
        .replace(/[-_]+/g, " ")
        .replace(/^./, (c) => c.toUpperCase())

/** "Home / Organizations / Members" for the current h-panel URL. The last crumb is the page; the earlier ones link back. */
export function HPanelBreadcrumbs() {
    const pathname = usePathname() ?? ""
    const segments = pathname.split("/").filter(Boolean).slice(1) // drop "h-panel"

    const crumbs = segments.map((segment, index) => ({
        href: "/h-panel/" + segments.slice(0, index + 1).join("/"),
        label: isId(segment) ? "Details" : (LABELS[segment] ?? titleCase(segment)),
    }))

    if (crumbs.length === 0) {
        return (
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbPage>Home</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>
        )
    }

    return (
        <Breadcrumb className="min-w-0">
            <BreadcrumbList className="flex-nowrap gap-1.5 sm:gap-2">
                {crumbs.map((crumb, index) => {
                    const last = index === crumbs.length - 1
                    return (
                        <React.Fragment key={crumb.href}>
                            {index > 0 && <BreadcrumbSeparator />}
                            <BreadcrumbItem className={last ? "min-w-0" : "hidden sm:inline-flex"}>
                                {last ? (
                                    <BreadcrumbPage className="truncate font-medium">{crumb.label}</BreadcrumbPage>
                                ) : (
                                    <BreadcrumbLink asChild>
                                        <Link href={crumb.href}>{crumb.label}</Link>
                                    </BreadcrumbLink>
                                )}
                            </BreadcrumbItem>
                        </React.Fragment>
                    )
                })}
            </BreadcrumbList>
        </Breadcrumb>
    )
}
