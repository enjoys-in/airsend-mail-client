"use client"

import * as React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, X } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

const roles = [
  {
    id: "1",
    name: "SUPER Admin",
    description: "Full system access - can only be assigned to owner",
    permissions: ["all"],
    isDefault: true,
    userCount: 1,
  },
  {
    id: "2",
    name: "Administrator",
    description: "Full organization management access",
    permissions: ["read", "write", "admin", "manage_users", "manage_settings"],
    isDefault: false,
    userCount: 3,
  },
  {
    id: "3",
    name: "Member",
    description: "Standard user access",
    permissions: ["read", "write"],
    isDefault: false,
    userCount: 15,
  },
]

const availablePermissions = [
  "read",
  "write",
  "admin",
  "delete",
  "manage_users",
  "manage_settings",
  "manage_billing",
  "view_logs",
]

export default function RolesPage() {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [editingRole, setEditingRole] = React.useState<any>(null)
  const [roleName, setRoleName] = React.useState("")
  const [roleDescription, setRoleDescription] = React.useState("")
  const [selectedPermissions, setSelectedPermissions] = React.useState<string[]>([])

  const openCreateDialog = () => {
    setEditingRole(null)
    setRoleName("")
    setRoleDescription("")
    setSelectedPermissions([])
    setIsDialogOpen(true)
  }

  const openEditDialog = (role: any) => {
    setEditingRole(role)
    setRoleName(role.name)
    setRoleDescription(role.description)
    setSelectedPermissions(role.permissions)
    setIsDialogOpen(true)
  }

  const togglePermission = (permission: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permission) ? prev.filter((p) => p !== permission) : [...prev, permission],
    )
  }

  const handleSave = () => {
    console.log({
      name: roleName,
      description: roleDescription,
      permissions: selectedPermissions,
    })
    setIsDialogOpen(false)
  }

  return (
    <div>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
      
        <h1 className="text-lg font-semibold">Roles & Permissions</h1>
        <div className="ml-auto">
          <Button onClick={openCreateDialog}>
            <Plus className="h-4 w-4 mr-2" />
            Create Role
          </Button>
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="grid gap-4">
          {roles.map((role) => (
            <Card key={role.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {role.name}
                      {role.isDefault && <Badge variant="secondary">Default</Badge>}
                      {role.name === "SUPER Admin" && <Badge variant="destructive">Owner Only</Badge>}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">{role.description}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(role)}
                      disabled={role.name === "SUPER Admin"}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" disabled={role.isDefault || role.name === "SUPER Admin"}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Permissions</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {role.permissions.includes("all") ? (
                        <Badge>All Permissions</Badge>
                      ) : (
                        role.permissions.map((permission) => (
                          <Badge key={permission} variant="outline">
                            {permission}
                          </Badge>
                        ))
                      )}
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {role.userCount} user{role.userCount !== 1 ? "s" : ""} assigned
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingRole ? "Edit Role" : "Create New Role"}</DialogTitle>
              <DialogDescription>
                {editingRole
                  ? "Modify the role details and permissions."
                  : "Create a new role with specific permissions."}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="role-name">Role Name</Label>
                <Input
                  id="role-name"
                  value={roleName}
                  onChange={(e) => setRoleName(e.target.value)}
                  placeholder="Enter role name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role-description">Description</Label>
                <Input
                  id="role-description"
                  value={roleDescription}
                  onChange={(e) => setRoleDescription(e.target.value)}
                  placeholder="Enter role description"
                />
              </div>
              <div className="space-y-2">
                <Label>Permissions</Label>
                <div className="flex flex-wrap gap-2">
                  {availablePermissions.map((permission) => (
                    <Badge
                      key={permission}
                      variant={selectedPermissions.includes(permission) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => togglePermission(permission)}
                    >
                      {permission}
                      {selectedPermissions.includes(permission) && <X className="ml-1 h-3 w-3" />}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>{editingRole ? "Update Role" : "Create Role"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
