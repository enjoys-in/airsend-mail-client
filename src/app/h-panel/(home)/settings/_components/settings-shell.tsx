"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Bell, LayoutGrid, LayoutTemplate, Monitor, Palette, Router, Server, User, type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAppSelector } from "@/store/hooks"
import { PageShell } from "@/components/h-panel/kit"

/**
 * Settings shell: a quiet sub-nav on the left (a horizontally scrolling tab bar on small screens) and the page on the
 * right. The h-panel header above already carries the breadcrumb, so pages only draw their own PageHeader.
 */

interface NavItem {
    title: string
    href: string
    icon: LucideIcon
}

/** The username lives in the URL for profile pages; elsewhere it comes from the signed-in admin. */
function useUsername(pathname: string) {
    const admin = useAppSelector((state) => state.admin.user)
    const parts = pathname.split("/").filter(Boolean) // h-panel, settings, <username>, <section>
    const fromUrl = parts[1] === "settings" && parts[2] && !["templates", "smtp"].includes(parts[2]) ? decodeURIComponent(parts[2]) : ""
    return fromUrl || admin?.name || ""
}

function useGroups(pathname: string): { label: string; items: NavItem[] }[] {
    const username = useUsername(pathname)
    const base = username ? `/h-panel/settings/${encodeURIComponent(username)}` : ""
    const groups: { label: string; items: NavItem[] }[] = [
        { label: "General", items: [{ title: "Overview", href: "/h-panel/settings", icon: LayoutGrid }] },
    ]
    if (base) {
        groups.push({
            label: "Profile",
            items: [
                { title: "Account", href: `${base}/account`, icon: User },
                { title: "Appearance", href: `${base}/appearance`, icon: Palette },
                { title: "Display", href: `${base}/display`, icon: Monitor },
                { title: "Notifications", href: `${base}/notifications`, icon: Bell },
            ],
        })
    }
    groups.push({
        label: "Email",
        items: [
            { title: "Templates", href: "/h-panel/settings/templates", icon: LayoutTemplate },
            { title: "Relay", href: "/h-panel/settings/smtp/relay", icon: Router },
            { title: "SMTP providers", href: "/h-panel/settings/smtp/providers", icon: Server },
        ],
    })
    return groups
}

function isActive(pathname: string, item: NavItem) {
    if (item.href === "/h-panel/settings") return pathname === item.href
    return pathname === item.href || pathname.startsWith(item.href + "/")
}

export function SettingsShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname() ?? ""
    const groups = useGroups(pathname)
    const flat = groups.flatMap((g) => g.items)

    return (
        <PageShell>
            <div className="grid items-start gap-6 lg:grid-cols-[210px_minmax(0,1fr)]">
                {/* small screens: scrolling tab bar */}
                <nav aria-label="Settings sections" className="-mx-4 flex gap-1 overflow-x-auto border-b border-border/70 px-4 pb-2 lg:hidden">
                    {flat.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            aria-current={isActive(pathname, item) ? "page" : undefined}
                            className={cn(
                                "whitespace-nowrap rounded-md px-3 py-1.5 text-sm transition-colors",
                                isActive(pathname, item) ? "bg-muted font-medium text-foreground" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            {item.title}
                        </Link>
                    ))}
                </nav>

                {/* large screens: sticky side nav */}
                <nav aria-label="Settings sections" className="sticky top-20 hidden space-y-5 lg:block">
                    {groups.map((group) => (
                        <div key={group.label} className="space-y-1">
                            <p className="px-3 text-xs text-muted-foreground">{group.label}</p>
                            {group.items.map((item) => {
                                const active = isActive(pathname, item)
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        aria-current={active ? "page" : undefined}
                                        className={cn(
                                            "flex items-center gap-2.5 rounded-md px-3 py-1.5 text-sm transition-colors",
                                            active ? "bg-muted font-medium text-foreground" : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                                        )}
                                    >
                                        <item.icon className="h-4 w-4 shrink-0" />
                                        {item.title}
                                    </Link>
                                )
                            })}
                        </div>
                    ))}
                </nav>

                <div className="min-w-0">{children}</div>
            </div>
        </PageShell>
    )
}

/**
 * One setting: label and helper text on the left, the control on the right. Stack several inside a `Section` (they are
 * separated by a hairline). Use `stack` when the control is wide (inputs, text areas) and should sit under the label.
 */
export function SettingsRow({
    label,
    description,
    children,
    htmlFor,
    stack,
    className,
}: {
    label: React.ReactNode
    description?: React.ReactNode
    children: React.ReactNode
    htmlFor?: string
    stack?: boolean
    className?: string
}) {
    return (
        <div className={cn("flex gap-4 py-4 first:pt-0 last:pb-0", stack ? "flex-col" : "flex-col sm:flex-row sm:items-center sm:justify-between", className)}>
            <div className="min-w-0 space-y-0.5">
                <label htmlFor={htmlFor} className="text-sm font-medium">
                    {label}
                </label>
                {description && <p className="text-xs text-muted-foreground">{description}</p>}
            </div>
            <div className={cn("shrink-0", stack && "w-full")}>{children}</div>
        </div>
    )
}

/** Divider-separated list of `SettingsRow`s. */
export function SettingsRows({ children }: { children: React.ReactNode }) {
    return <div className="divide-y divide-border/70">{children}</div>
}

/** Plain form footer: right-aligned actions under a hairline. */
export function FormFooter({ children, className }: { children: React.ReactNode; className?: string }) {
    return <div className={cn("flex items-center justify-end gap-2 border-t border-border/70 pt-4", className)}>{children}</div>
}
