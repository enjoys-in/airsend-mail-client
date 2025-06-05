"use client"
import { MoreHorizontal, Edit, Settings, Shield, Users, ArrowUpDown } from "lucide-react"
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

interface Organization {
  id: string
  name: string
  createdBy: string
  totalDomains: number
  status: string
  role: string
}

interface OrganizationsTableProps {
  data: Organization[]
}

export function OrganizationsTable({ data }: OrganizationsTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">
              <Button variant="ghost" className="h-auto p-0 font-medium">
                ORG ID
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>
              <Button variant="ghost" className="h-auto p-0 font-medium">
                Organization Name
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>Created By</TableHead>
            <TableHead>Total Domains</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Role</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((org) => (
            <TableRow key={org.id}>
              <TableCell className="font-medium">
                <Link href={`org/${org.id}/edit`} className="text-blue-600 hover:underline">
                  {org.id}
                </Link>
              </TableCell>
              <TableCell>
                <Link href={`org/${org.id}/edit`} className="font-medium text-blue-600 hover:underline">
                  {org.name}
                </Link>
              </TableCell>
              <TableCell>{org.createdBy}</TableCell>
              <TableCell>{org.totalDomains}</TableCell>
              <TableCell>
                <Badge variant={org.status === "Active" ? "default" : "destructive"}>{org.status}</Badge>
              </TableCell>
              <TableCell>
                <Badge variant="outline">{org.role}</Badge>
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
                      <Link href={`/organizations/${org.id}/edit`}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Organization
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/organizations/${org.id}/members`}>
                        <Users className="mr-2 h-4 w-4" />
                        View Members
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Move to Normal</DropdownMenuItem>
                    <DropdownMenuItem>Add More</DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`org/${org.id}/roles`}>
                        <Shield className="mr-2 h-4 w-4" />
                        Edit Roles
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Users className="mr-2 h-4 w-4" />
                      Edit Permissions
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`org/${org.id}/settings`}>
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
