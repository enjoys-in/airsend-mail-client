"use client"

import * as React from "react"
import { Plus, Pencil, Trash2, Shield, Users } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
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
import { EmptyState, OrgPage, PageHeader, Panel, Pill } from "./kit"

export interface RoleFormValues {
    name: string
    description: string
    permissions: string[]
}

interface RolesViewProps {
    roles: IRole[]
    loading: boolean
    title: string
    description: string
    back?: { href: string; label: string }
    /** Creates (`editing` is null) or updates a role. The dialog closes when this settles. */
    onSave: (editing: IRole | null, values: RoleFormValues) => Promise<void> | void
    /** Deletes a role. The confirmation closes when this settles. */
    onDelete: (role: IRole) => Promise<void> | void
    /** Extra sentence in the delete confirmation. */
    deleteNote?: string
}

const permLabel = (p: string) => p.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
const PREVIEW_PERMISSIONS = 6

/** Roles list + create/edit dialog + delete confirmation. Shared by /org/roles and /org/[id]/roles. */
export function RolesView({ roles, loading, title, description, back, onSave, onDelete, deleteNote }: RolesViewProps) {
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
        setSelectedPermissions((prev) => (prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]))
    }

    const toggleCategory = (perms: readonly string[]) => {
        const allSelected = perms.every((p) => selectedPermissions.includes(p))
        if (allSelected) {
            setSelectedPermissions((prev) => prev.filter((p) => !perms.includes(p)))
        } else {
            setSelectedPermissions((prev) => [...new Set([...prev, ...perms])])
        }
    }

    const handleSave = async () => {
        if (!roleName.trim()) return
        await onSave(editingRole, { name: roleName, description: roleDescription, permissions: selectedPermissions })
        setIsDialogOpen(false)
    }

    const handleDelete = async () => {
        if (!deleteTarget) return
        await onDelete(deleteTarget)
        setDeleteTarget(null)
    }

    return (
        <OrgPage>
            <PageHeader
                back={back}
                title={title}
                description={description}
                actions={
                    <Button size="sm" className="h-9 gap-2" onClick={openCreateDialog}>
                        <Plus className="h-4 w-4" />
                        Create role
                    </Button>
                }
            />

            {loading && roles.length === 0 ? (
                <div className="grid gap-3 lg:grid-cols-2">
                    {[0, 1, 2, 3].map((i) => (
                        <Panel key={i} className="space-y-3 p-5">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-48" />
                            <div className="flex gap-1.5">
                                <Skeleton className="h-5 w-16 rounded-full" />
                                <Skeleton className="h-5 w-20 rounded-full" />
                                <Skeleton className="h-5 w-14 rounded-full" />
                            </div>
                        </Panel>
                    ))}
                </div>
            ) : roles.length === 0 ? (
                <Panel>
                    <EmptyState
                        icon={Shield}
                        title="No roles yet"
                        description="Create a role to group permissions you can give to members."
                        action={
                            <Button size="sm" className="gap-2" onClick={openCreateDialog}>
                                <Plus className="h-4 w-4" />
                                Create role
                            </Button>
                        }
                    />
                </Panel>
            ) : (
                <div className="grid gap-3 lg:grid-cols-2">
                    {roles.map((role) => {
                        const shown = role.permissions.slice(0, PREVIEW_PERMISSIONS)
                        const rest = role.permissions.length - shown.length
                        return (
                            <Panel key={role.id} className="flex flex-col gap-3 p-5">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <h3 className="text-sm font-medium">{role.name}</h3>
                                            {role.is_default && <Pill tone="blue">Default</Pill>}
                                            {role.is_system && <Pill>System</Pill>}
                                        </div>
                                        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                                            {role.description || "No description"}
                                        </p>
                                    </div>
                                    <div className="flex shrink-0 items-center gap-0.5">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-muted-foreground"
                                            onClick={() => openEditDialog(role)}
                                            disabled={role.name === "Super Admin"}
                                            title="Edit role"
                                        >
                                            <Pencil className="h-3.5 w-3.5" />
                                            <span className="sr-only">Edit {role.name}</span>
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                            onClick={() => setDeleteTarget(role)}
                                            disabled={role.is_system}
                                            title="Delete role"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                            <span className="sr-only">Delete {role.name}</span>
                                        </Button>
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-1.5">
                                    {shown.map((p) => (
                                        <Pill key={p}>{permLabel(p)}</Pill>
                                    ))}
                                    {rest > 0 && (
                                        <span className="text-[11px] text-muted-foreground" title={role.permissions.slice(PREVIEW_PERMISSIONS).map(permLabel).join(", ")}>
                                            +{rest} more
                                        </span>
                                    )}
                                    {role.permissions.length === 0 && <span className="text-xs text-muted-foreground">No permissions</span>}
                                </div>

                                <div className="mt-auto flex items-center gap-4 border-t border-border/70 pt-3 text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1.5">
                                        <Users className="h-3.5 w-3.5" />
                                        {role.user_count} {role.user_count === 1 ? "member" : "members"}
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <Shield className="h-3.5 w-3.5" />
                                        {role.permissions.length} {role.permissions.length === 1 ? "permission" : "permissions"}
                                    </span>
                                </div>
                            </Panel>
                        )
                    })}
                </div>
            )}

            {/* ── Create / Edit Dialog ── */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-base">{editingRole ? "Edit role" : "Create role"}</DialogTitle>
                        <DialogDescription>
                            {editingRole
                                ? "Update the name, description and permissions of this role."
                                : "Name the role and pick what it can do."}
                        </DialogDescription>
                    </DialogHeader>
                    <ScrollArea className="-mx-6 max-h-[60vh] px-6">
                        <div className="space-y-5 py-1">
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className="space-y-1.5">
                                    <Label htmlFor="role-name" className="text-sm">Name</Label>
                                    <Input
                                        id="role-name"
                                        placeholder="e.g. Moderator"
                                        className="h-9"
                                        value={roleName}
                                        onChange={(e) => setRoleName(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="role-description" className="text-sm">Description</Label>
                                    <Input
                                        id="role-description"
                                        placeholder="What this role is for"
                                        className="h-9"
                                        value={roleDescription}
                                        onChange={(e) => setRoleDescription(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <Label className="text-sm">Permissions</Label>
                                    <span className="text-xs text-muted-foreground">
                                        {selectedPermissions.length} of {ALL_PERMISSIONS.length} selected
                                    </span>
                                </div>
                                <div className="space-y-3">
                                    {Object.entries(PERMISSION_CATEGORIES).map(([key, cat]) => {
                                        const allSelected = cat.permissions.every((p) => selectedPermissions.includes(p))
                                        const someSelected = cat.permissions.some((p) => selectedPermissions.includes(p))
                                        return (
                                            <div key={key} className="rounded-lg border border-border/70">
                                                <label className="flex cursor-pointer items-center gap-2.5 border-b border-border/70 bg-muted/30 px-3 py-2">
                                                    <Checkbox
                                                        checked={allSelected ? true : someSelected ? "indeterminate" : false}
                                                        onCheckedChange={() => toggleCategory(cat.permissions)}
                                                    />
                                                    <span className="text-sm font-medium">{cat.label}</span>
                                                </label>
                                                <div className="grid grid-cols-1 gap-x-4 gap-y-2 p-3 sm:grid-cols-2 lg:grid-cols-3">
                                                    {cat.permissions.map((perm) => (
                                                        <label key={perm} className="flex cursor-pointer items-center gap-2 text-sm">
                                                            <Checkbox
                                                                checked={selectedPermissions.includes(perm)}
                                                                onCheckedChange={() => togglePermission(perm)}
                                                            />
                                                            <span className="text-muted-foreground">{permLabel(perm)}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>
                    </ScrollArea>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSave} disabled={!roleName.trim()}>
                            {editingRole ? "Update role" : "Create role"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ── Delete Confirmation ── */}
            <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete role?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This permanently deletes the role <span className="text-foreground">{deleteTarget?.name}</span>.{" "}
                            {deleteNote} This cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={handleDelete}>
                            Delete role
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </OrgPage>
    )
}
