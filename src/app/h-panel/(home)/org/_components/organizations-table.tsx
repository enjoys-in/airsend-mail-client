"use client"

import {
    MoreHorizontal,
    Edit,
    Settings,
    Shield,
    Users,
    Globe,
    UserPlus,
    Building2,
    Calendar,
} from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import type { IOrganization } from "../_lib/types"

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

export function OrganizationsTable({ data }: OrganizationsTableProps) {
    if (!data || data.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed rounded-lg bg-card">
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-3">
                    <Building2 className="w-6 h-6" />
                </div>
                <h3 className="text-base font-semibold mb-1">No organizations configured</h3>
                <p className="text-sm text-muted-foreground max-w-sm mb-4">
                    Create an organization to link email domains, invite external team members, and configure workspace features.
                </p>
                <Button asChild size="sm">
                    <Link href="/h-panel/org/create">Create First Organization</Link>
                </Button>
            </div>
        )
    }

    return (
        <div className="rounded-lg border bg-card overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Organization</TableHead>
                        <TableHead>Namespace / Slug</TableHead>
                        <TableHead>Domains Linked</TableHead>
                        <TableHead>Report Email</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.map((org) => {
                        const slug = slugify(org.name)
                        const domains = org.domains || []

                        return (
                            <TableRow key={org.id}>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center overflow-hidden border shrink-0">
                                            {org.logo_url ? (
                                                <img
                                                    src={org.logo_url}
                                                    alt={org.name}
                                                    className="w-full h-full object-contain p-0.5"
                                                />
                                            ) : (
                                                <span className="font-bold text-xs text-primary">
                                                    {org.name.charAt(0).toUpperCase()}
                                                </span>
                                            )}
                                        </div>
                                        <div>
                                            <Link
                                                href={`/h-panel/org/${org.id}/edit`}
                                                className="font-semibold text-sm hover:underline text-foreground"
                                            >
                                                {org.name}
                                            </Link>
                                            <div className="text-xs text-muted-foreground">
                                                {org.title || "No description"}
                                            </div>
                                        </div>
                                    </div>
                                </TableCell>

                                <TableCell>
                                    <Badge variant="secondary" className="font-mono text-xs font-medium">
                                        {slug}
                                    </Badge>
                                </TableCell>

                                <TableCell>
                                    {domains.length === 0 ? (
                                        <span className="text-xs text-muted-foreground italic">None attached</span>
                                    ) : (
                                        <div className="flex flex-wrap gap-1 max-w-[220px]">
                                            {domains.slice(0, 2).map((d) => (
                                                <span
                                                    key={d.id || d.domain_name}
                                                    className="px-2 py-0.5 rounded text-[11px] bg-muted font-mono font-medium"
                                                >
                                                    @{d.domain_name}
                                                </span>
                                            ))}
                                            {domains.length > 2 && (
                                                <Badge variant="outline" className="text-[10px] py-0 px-1.5">
                                                    +{domains.length - 2} more
                                                </Badge>
                                            )}
                                        </div>
                                    )}
                                </TableCell>

                                <TableCell>
                                    <span className="text-xs text-muted-foreground font-mono">
                                        {org.report_email || "—"}
                                    </span>
                                </TableCell>

                                <TableCell className="text-muted-foreground text-xs whitespace-nowrap">
                                    {org.created_at ? new Date(org.created_at).toLocaleDateString() : "—"}
                                </TableCell>

                                <TableCell className="text-right">
                                    <div className="flex items-center justify-end gap-1">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 text-xs gap-1 text-muted-foreground hover:text-foreground hidden sm:flex"
                                            asChild
                                        >
                                            <Link href="/h-panel/org/members/add">
                                                <UserPlus className="w-3.5 h-3.5" /> Invite
                                            </Link>
                                        </Button>

                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <span className="sr-only">Open menu</span>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Organization</DropdownMenuLabel>
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/h-panel/org/${org.id}/edit`}>
                                                        <Edit className="mr-2 h-4 w-4" />
                                                        Edit Details
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/h-panel/org/${org.id}/members`}>
                                                        <Users className="mr-2 h-4 w-4" />
                                                        View Members
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem asChild>
                                                    <Link href="/h-panel/org/members/add">
                                                        <UserPlus className="mr-2 h-4 w-4" />
                                                        Invite Member
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/h-panel/org/${org.id}/roles`}>
                                                        <Shield className="mr-2 h-4 w-4" />
                                                        Roles & Scopes
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/h-panel/org/${org.id}/settings`}>
                                                        <Settings className="mr-2 h-4 w-4" />
                                                        Org Settings
                                                    </Link>
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )
                    })}
                </TableBody>
            </Table>
        </div>
    )
}
