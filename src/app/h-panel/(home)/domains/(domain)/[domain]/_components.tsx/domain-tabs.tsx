import Link from "next/link"
import { cn } from "@/lib/utils"

/** Quiet tab bar shared by the per-domain pages (overview with the DNS records, and the logs). */
export function DomainTabs({ domainId, active }: { domainId: string; active: "overview" | "logs" }) {
    const tabs = [
        { key: "overview", title: "Overview", href: `/h-panel/domains/${domainId}` },
        { key: "logs", title: "Logs", href: `/h-panel/domains/${domainId}/logs` },
    ] as const

    return (
        <nav aria-label="Domain sections" className="mb-6 flex gap-1 border-b border-border/70">
            {tabs.map((tab) => (
                <Link
                    key={tab.key}
                    href={tab.href}
                    aria-current={active === tab.key ? "page" : undefined}
                    className={cn(
                        "-mb-px whitespace-nowrap border-b-2 px-3 py-2 text-sm transition-colors",
                        active === tab.key
                            ? "border-foreground font-medium text-foreground"
                            : "border-transparent text-muted-foreground hover:text-foreground"
                    )}
                >
                    {tab.title}
                </Link>
            ))}
        </nav>
    )
}
