"use client"
import * as React from "react"
import { MoreHorizontal, UserMinus, Ban, Shield, ArrowUpDown } from "lucide-react"

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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface Member {
  id: string
  name: string
  email: string
  role: string
  organization: string
  domain: string
  status: string
  joinedDate: string
  lastActive: string
}

interface MembersTableProps {
  data: Member[]
}

const availableRoles = [
  { value: "owner", label: "Owner" },
  { value: "admin", label: "Administrator" },
  { value: "member", label: "Member" },
  { value: "viewer", label: "Viewer" },
]

export function MembersTable({ data }: MembersTableProps) {
  const [members, setMembers] = React.useState(data)
  const [actionMember, setActionMember] = React.useState<Member | null>(null)
  const [actionType, setActionType] = React.useState<"kick" | "ban" | null>(null)

  const updateMemberRole = (memberId: string, newRole: string) => {
    setMembers((prev) => prev.map((member) => (member.id === memberId ? { ...member, role: newRole } : member)))
  }

  const handleAction = (member: Member, action: "kick" | "ban") => {
    setActionMember(member)
    setActionType(action)
  }

  const confirmAction = () => {
    if (!actionMember || !actionType) return

    if (actionType === "kick") {
      setMembers((prev) => prev.filter((member) => member.id !== actionMember.id))
    } else if (actionType === "ban") {
      setMembers((prev) =>
        prev.map((member) => (member.id === actionMember.id ? { ...member, status: "Banned" } : member)),
      )
    }

    setActionMember(null)
    setActionType(null)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Active":
        return <Badge variant="default">Active</Badge>
      case "Banned":
        return <Badge variant="destructive">Banned</Badge>
      case "Inactive":
        return <Badge variant="secondary">Inactive</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "Owner":
        return <Badge className="bg-purple-100 text-purple-800">Owner</Badge>
      case "Administrator":
        return <Badge className="bg-blue-100 text-blue-800">Administrator</Badge>
      case "Member":
        return <Badge variant="outline">Member</Badge>
      case "Viewer":
        return <Badge variant="secondary">Viewer</Badge>
      default:
        return <Badge variant="outline">{role}</Badge>
    }
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Button variant="ghost" className="h-auto p-0 font-medium">
                  Name
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Organization</TableHead>
              <TableHead>Domain</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Joined Date</TableHead>
              <TableHead>Last Active</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((member) => (
              <TableRow key={member.id}>
                <TableCell className="font-medium">{member.name}</TableCell>
                <TableCell>{member.email}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getRoleBadge(member.role)}
                    {member.role !== "Owner" && (
                      <Select
                        value={member.role.toLowerCase()}
                        onValueChange={(value) => updateMemberRole(member.id, value)}
                      >
                        <SelectTrigger className="w-[120px] h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {availableRoles
                            .filter((role) => role.value !== "owner")
                            .map((role) => (
                              <SelectItem key={role.value} value={role.value}>
                                {role.label}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </TableCell>
                <TableCell>{member.organization}</TableCell>
                <TableCell>{member.domain}</TableCell>
                <TableCell>{getStatusBadge(member.status)}</TableCell>
                <TableCell>{member.joinedDate}</TableCell>
                <TableCell>{member.lastActive}</TableCell>
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
                      <DropdownMenuItem>
                        <Shield className="mr-2 h-4 w-4" />
                        View Permissions
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {member.role !== "Owner" && (
                        <>
                          <DropdownMenuItem className="text-orange-600" onClick={() => handleAction(member, "kick")}>
                            <UserMinus className="mr-2 h-4 w-4" />
                            Kick Member
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handleAction(member, "ban")}
                            disabled={member.status === "Banned"}
                          >
                            <Ban className="mr-2 h-4 w-4" />
                            Ban Member
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!actionMember} onOpenChange={() => setActionMember(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{actionType === "kick" ? "Kick Member" : "Ban Member"}</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to {actionType} {actionMember?.name} ({actionMember?.email})?
              {actionType === "kick" && " This will remove them from the organization."}
              {actionType === "ban" && " This will ban them from accessing the organization."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmAction}
              className={actionType === "ban" ? "bg-red-600 hover:bg-red-700" : "bg-orange-600 hover:bg-orange-700"}
            >
              {actionType === "kick" ? "Kick Member" : "Ban Member"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
