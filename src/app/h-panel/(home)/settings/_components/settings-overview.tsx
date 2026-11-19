"use client"

import * as React from "react"
import Link from "next/link"
import { ArrowUpRight, Bell, LayoutTemplate, Monitor, Palette, Router, Server, User, type LucideIcon } from "lucide-react"
import { useAppSelector } from "@/store/hooks"
import { Initials, PageHeader, Panel, Pill, Section } from "@/components/h-panel/kit"

interface Card {
    title: string
    description: string
    href: string
    icon: LucideIcon
}

function SectionCard({ card }: { card: Card }) {
    return (
        <Link
            href={card.href}
            className="group flex items-start gap-3 rounded-xl border border-border/70 bg-card p-4 transition-colors hover:bg-muted/50"
        >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                <card.icon className="h-4 w-4" />
            </span>
            <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium">{card.title}</span>
                <span className="mt-0.5 block text-xs text-muted-foreground">{card.description}</span>
            </span>
            <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground/60 transition-colors group-hover:text-foreground" />
        </Link>
    )
}

export function SettingsOverview() {
    const admin = useAppSelector((state) => state.admin.user)
    const base = admin?.name ? `/h-panel/settings/${encodeURIComponent(admin.name)}` : ""

    const profile: Card[] = base
        ? [
              { title: "Account", description: "Your public profile, display email and links.", href: `${base}/account`, icon: User },
              { title: "Appearance", description: "Light or dark theme for the dashboard.", href: `${base}/appearance`, icon: Palette },
              { title: "Display", description: "Choose what shows in the sidebar.", href: `${base}/display`, icon: Monitor },
              { title: "Notifications", description: "How and when you are notified.", href: `${base}/notifications`, icon: Bell },
          ]
        : []
    const email: Card[] = [
        { title: "Templates", description: "Build an email layout and copy its HTML.", href: "/h-panel/settings/templates", icon: LayoutTemplate },
        { title: "Relay", description: "SMTP relay servers for outbound routing.", href: "/h-panel/settings/smtp/relay", icon: Router },
        { title: "SMTP providers", description: "Provider credentials and send priority.", href: "/h-panel/settings/smtp/providers", icon: Server },
    ]

    return (
        <div className="space-y-6">
            <PageHeader title="Settings" description="Manage your account and your email preferences." />

            <Panel className="flex items-center gap-4 p-5">
                <Initials text={admin?.name || admin?.email || "?"} className="h-11 w-11 text-sm" />
                <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{admin?.name || "Administrator"}</p>
                    <p className="truncate text-xs text-muted-foreground">{admin?.email || ""}</p>
                </div>
                {admin?.role && <Pill tone="blue">{String(admin.role).toLowerCase()}</Pill>}
            </Panel>

            {profile.length > 0 && (
                <Section title="Profile" description="Personal preferences for this account." flush>
                    <div className="grid gap-3 p-5 sm:grid-cols-2">
                        {profile.map((card) => (
                            <SectionCard key={card.href} card={card} />
                        ))}
                    </div>
                </Section>
            )}

            <Section title="Email" description="Templates, relay and delivery providers." flush>
                <div className="grid gap-3 p-5 sm:grid-cols-2 xl:grid-cols-3">
                    {email.map((card) => (
                        <SectionCard key={card.href} card={card} />
                    ))}
                </div>
            </Section>
        </div>
    )
}
