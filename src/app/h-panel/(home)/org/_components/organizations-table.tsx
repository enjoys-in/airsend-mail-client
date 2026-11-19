"use client"

import { MoreHorizontal, Pencil, Settings, Shield, Users, UserPlus, Building2, Plus, ArrowUpRight } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { IOrganization } from "../_lib/types"
import { EmptyState, Panel, Pill } from "./kit"

function slugify(name: string): string {
    return (name || "org")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 32) || "org"
}

interface OrganizationsTableProps {
    data: IOrganization[]
}

/** The organizations as a responsive card grid (the name is kept for the existing imports). */
export function OrganizationsTable({ data }: OrganizationsTableProps) {
    if (!data || data.length === 0) {
        return (
            <Panel>
                <EmptyState
                    icon={Building2}
                    title="No organizations yet"
                    description="Create an organization to link email domains, invite members and set roles for Files, Tasks and Workspace."
                    action={
                        <Button asChild size="sm">
                            <Link href="/h-panel/org/create">
                                <Plus className="mr-1.5 h-4 w-4" />
                                Create organization
                            </Link>
                        </Button>
                    }
                />
            </Panel>
        )
    }

    return (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {data.map((org) => {
                const slug = slugify(org.name)
                const domains = org.domains || []

                return (
                    <Panel key={org.id} className="group flex flex-col transition-colors hover:border-foreground/20">
                        <div className="flex items-start justify-between gap-3 p-5 pb-4">
                            <div className="flex min-w-0 items-center gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border/70 bg-muted">
                                    {org.logo_url ? (
                                        <img src={org.logo_url} alt={org.name} className="h-full w-full object-contain p-0.5" />
                                    ) : (
                                        <span className="text-sm font-medium text-muted-foreground">{org.name.charAt(0).toUpperCase()}</span>
                                    )}
                                </div>
                                <div className="min-w-0">
                                    <Link href={`/h-panel/org/${org.id}/edit`} className="block truncate text-sm font-medium hover:underline">
                                        {org.name}
                                    </Link>
                                    <p className="truncate text-xs text-muted-foreground">{org.title || "No description"}</p>
                                </div>
                            </div>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="-mr-2 -mt-1 h-8 w-8 text-muted-foreground">
                                        <span className="sr-only">Open menu</span>
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem asChild>
                                        <Link href={`/h-panel/org/${org.id}/edit`}>
                                            <Pencil className="mr-2 h-4 w-4" />
                                            Edit details
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link href={`/h-panel/org/${org.id}/members`}>
                                            <Users className="mr-2 h-4 w-4" />
                                            View members
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link href="/h-panel/org/members/add">
                                            <UserPlus className="mr-2 h-4 w-4" />
                                            Invite member
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem asChild>
                                        <Link href={`/h-panel/org/${org.id}/roles`}>
                                            <Shield className="mr-2 h-4 w-4" />
                                            Roles &amp; scopes
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link href={`/h-panel/org/${org.id}/settings`}>
                                            <Settings className="mr-2 h-4 w-4" />
                                            Account settings
                                        </Link>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        <div className="flex-1 space-y-3 px-5 pb-4">
                            <div className="flex flex-wrap items-center gap-1.5">
                                {domains.length > 0 ? <Pill tone="green">Active</Pill> : <Pill tone="amber">No domains</Pill>}
                                <Pill className="font-mono">{slug}</Pill>
                            </div>

                            {domains.length === 0 ? (
                                <p className="text-xs text-muted-foreground">No domains attached yet.</p>
                            ) : (
                                <div className="flex flex-wrap gap-1.5">
                                    {domains.slice(0, 3).map((d) => (
                                        <span key={d.id || d.domain_name} className="rounded-md bg-muted px-2 py-0.5 font-mono text-[11px] text-muted-foreground">
                                            @{d.domain_name}
                                        </span>
                                    ))}
                                    {domains.length > 3 && (
                                        <span className="rounded-md px-1.5 py-0.5 text-[11px] text-muted-foreground">+{domains.length - 3} more</span>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="flex items-center justify-between gap-3 border-t border-border/70 px-5 py-3 text-xs text-muted-foreground">
                            <span className="truncate">
                                {domains.length} {domains.length === 1 ? "domain" : "domains"}
                                {org.created_at ? ` · Created ${new Date(org.created_at).toLocaleDateString()}` : ""}
                            </span>
                            <Link
                                href={`/h-panel/org/${org.id}/members`}
                                className="inline-flex shrink-0 items-center gap-1 text-foreground/80 transition-colors hover:text-foreground"
                            >
                                Members
                                <ArrowUpRight className="h-3.5 w-3.5" />
                            </Link>
                        </div>
                    </Panel>
                )
            })}
        </div>
    )
}
