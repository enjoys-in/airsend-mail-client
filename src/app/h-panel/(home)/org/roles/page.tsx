"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Plus, Edit, Trash2, Shield, Users } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
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
import type { IRole } from "../_lib/types"
import { ALL_PERMISSIONS, PERMISSION_CATEGORIES } from "../_lib/types"
import { MOCK_ROLES } from "../_lib/mock-data"

export default function RolesPage() {
    const [roles, setRoles] = React.useState<IRole[]>(MOCK_ROLES)
    const [isDialogOpen, setIsDialogOpen] = React.useState(false)
    const [editingRole, setEditingRole] = React.useState<IRole | null>(null)
    const [deleteTarget, setDeleteTarget] = React.useState<IRole | null>(null)

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

    const openEditDialog = (role: IRole) => {
        setEditingRole(role)
        setRoleName(role.name)
        setRoleDescription(role.description)
        setSelectedPermissions([...role.permissions])
        setIsDialogOpen(true)
    }

    const togglePermission = (perm: string) => {
        setSelectedPermissions((prev) =>
            prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
        )
    }

    const toggleCategory = (perms: readonly string[]) => {
        const allSelected = perms.every((p) => selectedPermissions.includes(p))
        if (allSelected) {
            setSelectedPermissions((prev) => prev.filter((p) => !perms.includes(p)))
        } else {
            setSelectedPermissions((prev) => [...new Set([...prev, ...perms])])
        }
    }

    const handleSave = () => {
        if (!roleName.trim()) return
        if (editingRole) {
            setRoles((prev) =>
                prev.map((r) =>
                    r.id === editingRole.id
                        ? { ...r, name: roleName, description: roleDescription, permissions: selectedPermissions }
                        : r
                )
            )
        } else {
            const newRole: IRole = {
                id: `role_${Date.now()}`,
                name: roleName.trim(),
                description: roleDescription.trim(),
                permissions: selectedPermissions,
                is_default: false,
                is_system: false,
                user_count: 0,
                created_at: new Date().toISOString(),
            }
            setRoles((prev) => [...prev, newRole])
        }
        setIsDialogOpen(false)
    }

    const handleDelete = () => {
        if (!deleteTarget) return
        setRoles((prev) => prev.filter((r) => r.id !== deleteTarget.id))
        setDeleteTarget(null)
    }

    const permLabel = (p: string) => p.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())

    return (
        <div className="flex flex-col min-h-full">
            <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
                <h1 className="text-lg font-semibold">Roles & Permissions</h1>
                <div className="ml-auto">
                    <Button size="sm" className="rounded-none" onClick={openCreateDialog}>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Role
                    </Button>
                </div>
            </header>

            <div className="flex-1 p-4 space-y-4 min-w-0">
                {roles.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <Shield className="h-12 w-12 text-muted-foreground/50 mb-4" />
                        <h3 className="text-lg font-medium mb-1">No roles defined</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            Create your first role to manage permissions.
                        </p>
                    </div>
                ) : (
                    roles.map((role) => (
                        <Card key={role.id} className="rounded-none">
                            <CardHeader className="pb-3">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                    <div className="min-w-0">
                                        <CardTitle className="flex flex-wrap items-center gap-2 text-base">
                                            {role.name}
                                            {role.is_default && <Badge variant="secondary">Default</Badge>}
                                            {role.is_system && (
                                                <Badge variant="outline" className="text-[10px]">System</Badge>
                                            )}
                                        </CardTitle>
                                        <p className="text-sm text-muted-foreground mt-1">{role.description}</p>
                                    </div>
                                    <div className="flex items-center gap-3 shrink-0">
                                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                            <Users className="h-3.5 w-3.5" />
                                            {role.user_count}
                                        </span>
                                        <div className="flex gap-1">
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="h-8 w-8 rounded-none"
                                                onClick={() => openEditDialog(role)}
                                                disabled={role.name === "Super Admin"}
                                            >
                                                <Edit className="h-3.5 w-3.5" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="h-8 w-8 rounded-none"
                                                onClick={() => setDeleteTarget(role)}
                                                disabled={role.is_system}
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-0">
                                <div className="flex flex-wrap gap-1.5">
                                    {role.permissions.map((p) => (
                                        <Badge key={p} variant="secondary" className="text-[11px]">
                                            {permLabel(p)}
                                        </Badge>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            {/* ── Create / Edit Dialog ── */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{editingRole ? "Edit Role" : "Create Role"}</DialogTitle>
                        <DialogDescription>
                            {editingRole
                                ? "Update this role's name, description, and permissions."
                                : "Define a new role with specific permissions."}
                        </DialogDescription>
                    </DialogHeader>
                    <ScrollArea className="max-h-[60vh] -mx-6 px-6">
                        <div className="space-y-4 py-2">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Role Name</Label>
                                    <Input
                                        placeholder="e.g. Moderator"
                                        className="rounded-none"
                                        value={roleName}
                                        onChange={(e) => setRoleName(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Description</Label>
                                    <Input
                                        placeholder="What this role can do..."
                                        className="rounded-none"
                                        value={roleDescription}
                                        onChange={(e) => setRoleDescription(e.target.value)}
                                    />
                                </div>
                            </div>
                            <Separator />
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label>Permissions</Label>
                                    <span className="text-xs text-muted-foreground">
                                        {selectedPermissions.length} / {ALL_PERMISSIONS.length} selected
                                    </span>
                                </div>
                                <div className="space-y-4">
                                    {Object.entries(PERMISSION_CATEGORIES).map(([key, cat]) => {
                                        const allSelected = cat.permissions.every((p) => selectedPermissions.includes(p))
                                        const someSelected = cat.permissions.some((p) => selectedPermissions.includes(p))
                                        return (
                                            <div key={key} className="space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        type="button"
                                                        variant={allSelected ? "default" : someSelected ? "secondary" : "outline"}
                                                        size="sm"
                                                        className="rounded-none text-xs h-7 font-medium"
                                                        onClick={() => toggleCategory(cat.permissions)}
                                                    >
                                                        {cat.label}
                                                        {allSelected && " ✓"}
                                                    </Button>
                                                </div>
                                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 pl-2">
                                                    {cat.permissions.map((perm) => {
                                                        const active = selectedPermissions.includes(perm)
                                                        return (
                                                            <Button
                                                                key={perm}
                                                                type="button"
                                                                variant={active ? "default" : "outline"}
                                                                size="sm"
                                                                className="justify-start text-xs rounded-none h-8"
                                                                onClick={() => togglePermission(perm)}
                                                            >
                                                                {permLabel(perm)}
                                                            </Button>
                                                        )
                                                    })}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>
                    </ScrollArea>
                    <DialogFooter>
                        <Button variant="outline" className="rounded-none" onClick={() => setIsDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button className="rounded-none" onClick={handleSave} disabled={!roleName.trim()}>
                            {editingRole ? "Update Role" : "Create Role"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ── Delete Confirmation ── */}
            <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Role</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the role <strong>{deleteTarget?.name}</strong>. Users
                            assigned this role will lose their permissions. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="rounded-none">Cancel</AlertDialogCancel>
                        <AlertDialogAction className="bg-destructive hover:bg-destructive/90 rounded-none" onClick={handleDelete}>
                            Delete Role
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
