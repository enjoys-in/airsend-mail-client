"use client"
import { MoreHorizontal, Edit, Settings, Shield, Users, ArrowUpDown, Globe } from "lucide-react"
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import type { IOrganization } from "../_lib/types"

interface OrganizationsTableProps {
    data: IOrganization[]
}

export function OrganizationsTable({ data }: OrganizationsTableProps) {
    if (!data || data.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <Globe className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-medium mb-1">No organizations yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                    Create your first organization to start managing domains and accounts.
                </p>
                <Button asChild size="sm">
                    <Link href="/h-panel/org/create">Create Organization</Link>
                </Button>
            </div>
        )
    }

    return (
        <div className="rounded-md border overflow-x-auto">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[80px]">ID</TableHead>
                        <TableHead>Organization Name</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Domains</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.map((org) => (
                        <TableRow key={org.id}>
                            <TableCell className="font-mono text-xs">{org.id}</TableCell>
                            <TableCell>
                                <Link href={`/h-panel/org/${org.id}/edit`} className="font-medium text-blue-600 hover:underline dark:text-blue-400">
                                    {org.name}
                                </Link>
                            </TableCell>
                            <TableCell className="text-muted-foreground">{org.title || "—"}</TableCell>
                            <TableCell>
                                <Badge variant="secondary">{org.domains?.length || 0}</Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground text-sm">
                                {org.created_at ? new Date(org.created_at).toLocaleDateString() : "—"}
                            </TableCell>
                            <TableCell className="text-right">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                            <span className="sr-only">Open menu</span>
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                        <DropdownMenuItem asChild>
                                            <Link href={`/h-panel/org/${org.id}/edit`}>
                                                <Edit className="mr-2 h-4 w-4" />
                                                Edit Organization
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link href={`/h-panel/org/${org.id}/members`}>
                                                <Users className="mr-2 h-4 w-4" />
                                                View Members
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem asChild>
                                            <Link href={`/h-panel/org/${org.id}/roles`}>
                                                <Shield className="mr-2 h-4 w-4" />
                                                Roles & Permissions
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link href={`/h-panel/org/${org.id}/settings`}>
                                                <Settings className="mr-2 h-4 w-4" />
                                                Manage Settings
                                            </Link>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}
