"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

/**
 * Org section shell: one quiet tab bar under the h-panel header (the h-panel already has its own sidebar, so no second one).
 * Pages render inside `OrgPage` from ./_components/kit. Creating an organization and inviting members are actions on the
 * pages they belong to, not tabs.
 */
const TABS = [
    { title: "Overview", url: "/h-panel/org", match: (p: string) => p === "/h-panel/org" || p === "/h-panel/org/create" || /^\/h-panel\/org\/\d+/.test(p) },
    { title: "Members", url: "/h-panel/org/members", match: (p: string) => p.startsWith("/h-panel/org/members") },
    { title: "Roles", url: "/h-panel/org/roles", match: (p: string) => p.startsWith("/h-panel/org/roles") },
    { title: "Domains", url: "/h-panel/org/domains", match: (p: string) => p.startsWith("/h-panel/org/domains") },
    { title: "History", url: "/h-panel/org/domain-history", match: (p: string) => p.startsWith("/h-panel/org/domain-history") },
    { title: "Logs", url: "/h-panel/org/logs", match: (p: string) => p.startsWith("/h-panel/org/logs") },
    { title: "Danger zone", url: "/h-panel/org/danger-zone", match: (p: string) => p.startsWith("/h-panel/org/danger-zone") },
]

export default function OrgLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname() ?? ""

    return (
        <div className="flex min-h-full w-full flex-col bg-background">
            <div className="border-b border-border/70 bg-card/40">
                <div className="flex w-full px-4">
                    <nav aria-label="Organization sections" className="-mb-px flex gap-1 overflow-x-auto">
                        {TABS.map((tab) => {
                            const active = tab.match(pathname)
                            return (
                                <Link
                                    key={tab.url}
                                    href={tab.url}
                                    aria-current={active ? "page" : undefined}
                                    className={cn(
                                        "whitespace-nowrap border-b-2 px-3 py-2.5 text-sm transition-colors",
                                        active ? "border-foreground font-medium text-foreground" : "border-transparent text-muted-foreground hover:text-foreground",
                                        tab.title === "Danger zone" && !active && "hover:text-red-600"
                                    )}
                                >
                                    {tab.title}
                                </Link>
                            )
                        })}
                    </nav>
                </div>
            </div>
            <main className="min-w-0 flex-1">{children}</main>
        </div>
    )
}
