"use client"

import * as React from "react"
import {
    MoreHorizontal,
    UserMinus,
    Ban,
    Shield,
    Sliders,
    Search,
    Globe,
    ExternalLink,
    Check,
    KeyRound,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
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
import { useToast } from "@/components/ui/use-toast"
import { API } from "@/lib/api/handler"
import {
    SCOPE_FEATURES,
    type Scope,
    type ScopeFeature,
    type ScopePermission,
} from "@/lib/types/workspace.interface"
import { buildScope } from "@/lib/workspace-utils"
import type { IMember } from "../_lib/types"
import { ScopeSelectorGrid, type PermissionLevel } from "./scope-selector-grid"
import {
    ServiceRoleBadges,
    ServiceRolePicker,
    changedServices,
    choicesFromMember,
    choicesToChanges,
    type ServiceRoleChoice,
    type ServiceRoleChoices,
} from "./service-role-picker"
import type { OrgService } from "../_lib/types"

interface MembersTableProps {
    data: IMember[]
    onUpdated?: () => void
}

const defaultRoles = [
    { value: "owner", label: "Owner" },
    { value: "admin", label: "Administrator" },
    { value: "member", label: "Member" },
    { value: "viewer", label: "Viewer" },
]

export function MembersTable({ data, onUpdated }: MembersTableProps) {
    const { toast } = useToast()
    const [members, setMembers] = React.useState<IMember[]>(data)
    const [searchQuery, setSearchQuery] = React.useState("")
    const [actionMember, setActionMember] = React.useState<IMember | null>(null)
    const [actionType, setActionType] = React.useState<"kick" | "ban" | null>(null)

    // Scope Editor Modal State
    const [editingScopesMember, setEditingScopesMember] = React.useState<IMember | null>(null)
    const [tempScopes, setTempScopes] = React.useState<string[]>([])
    const [savingScopes, setSavingScopes] = React.useState(false)

    // Per-service role editor (Files / Tasks / Workspace)
    const [editingRolesMember, setEditingRolesMember] = React.useState<IMember | null>(null)
    const [initialChoices, setInitialChoices] = React.useState<ServiceRoleChoices | null>(null)
    const [tempChoices, setTempChoices] = React.useState<ServiceRoleChoices | null>(null)
    const [savingRoles, setSavingRoles] = React.useState(false)

    React.useEffect(() => {
        setMembers(data)
    }, [data])

    const filteredMembers = React.useMemo(() => {
        if (!searchQuery.trim()) return members
        const q = searchQuery.toLowerCase()
        return members.filter(
            (m) =>
                m.name?.toLowerCase().includes(q) ||
                m.email?.toLowerCase().includes(q) ||
                m.external_email?.toLowerCase().includes(q) ||
                m.domain?.toLowerCase().includes(q) ||
                m.role?.toLowerCase().includes(q)
        )
    }, [members, searchQuery])

    const updateMemberRole = async (memberId: string, newRole: string) => {
        const roleLabel = defaultRoles.find((r) => r.value === newRole)?.label ?? newRole
        try {
            const { data: res } = await API.updateMember(memberId, { role: newRole })
            if (res?.success) {
                setMembers((prev) =>
                    prev.map((m) => (m.id === memberId ? { ...m, role: roleLabel } : m))
                )
                toast({ title: "Role updated", description: `Member role set to ${roleLabel}` })
                onUpdated?.()
            }
        } catch (error: any) {
            toast({ title: "Error", description: error.message || "Failed to update role", variant: "destructive" })
        }
    }

    const openRoleEditor = (member: IMember) => {
        const choices = choicesFromMember(member.role, member.service_roles)
        setEditingRolesMember(member)
        setInitialChoices(choices)
        setTempChoices(choices)
    }

    const saveServiceRoles = async () => {
        if (!editingRolesMember || !initialChoices || !tempChoices) return
        const changed = changedServices(initialChoices, tempChoices)
        if (changed.length === 0) {
            setEditingRolesMember(null)
            return
        }
        setSavingRoles(true)
        try {
            const { data: res } = await API.updateMemberServiceRoles(
                editingRolesMember.id,
                choicesToChanges(tempChoices, changed) as Record<string, "admin" | "member" | null>
            )
            if (!res?.success) throw new Error(res?.message || "Failed to update service roles")
            toast({ title: "Service roles updated", description: "Files, Tasks and Workspace roles saved." })
            setEditingRolesMember(null)
            onUpdated?.()
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Failed to save service roles",
                variant: "destructive",
            })
        } finally {
            setSavingRoles(false)
        }
    }

    const openScopeEditor = (member: IMember) => {
        setEditingScopesMember(member)
        setTempScopes(member.scopes || [])
    }

    const scopeMap = React.useMemo(() => {
        const map: Record<ScopeFeature, PermissionLevel> = {
            mail: "none",
            calendar: "none",
            tasks: "none",
            workspace: "none",
            files: "none",
            contacts: "none",
        }
        SCOPE_FEATURES.forEach((feat) => {
            const found = tempScopes.find((s) => s.startsWith(feat + ":"))
            if (found) {
                map[feat] = found.split(":")[1] as PermissionLevel
            }
        })
        return map
    }, [tempScopes])

    const handleScopeChange = (feature: ScopeFeature, permission: PermissionLevel) => {
        setTempScopes((prev) => {
            const filtered = prev.filter((s) => !s.startsWith(feature + ":"))
            if (permission === "none") return filtered
            return [...filtered, buildScope(feature, permission as ScopePermission)]
        })
    }

    const saveScopes = async () => {
        if (!editingScopesMember) return
        setSavingScopes(true)
        try {
            const { data: res } = await API.updateMember(editingScopesMember.id, {
                scopes: tempScopes,
            })
            if (res?.success) {
                setMembers((prev) =>
                    prev.map((m) =>
                        m.id === editingScopesMember.id ? { ...m, scopes: tempScopes } : m
                    )
                )
                toast({ title: "Permissions updated", description: "Member feature scopes updated." })
                setEditingScopesMember(null)
                onUpdated?.()
            } else {
                throw new Error(res?.message || "Failed to update scopes")
            }
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Failed to save scopes",
                variant: "destructive",
            })
        } finally {
            setSavingScopes(false)
        }
    }

    const confirmAction = async () => {
        if (!actionMember || !actionType) return
        const member = actionMember
        try {
            const req =
                actionType === "kick"
                    ? API.removeMember(member.id)
                    : API.updateMember(member.id, { status: "banned" })
            const { data: res } = await req

            if (res?.success && actionType === "kick") {
                setMembers((prev) => prev.filter((m) => m.id !== member.id))
                toast({ title: "Member deactivated", description: "The mailbox has been removed from organization." })
                onUpdated?.()
            } else if (res?.success) {
                setMembers((prev) =>
                    prev.map((m) => (m.id === member.id ? { ...m, status: "banned" } : m))
                )
                toast({ title: "Member banned", description: "The member has been banned from sending emails." })
                onUpdated?.()
            }
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" })
        } finally {
            setActionMember(null)
            setActionType(null)
        }
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "active":
                return <Badge variant="default" className="bg-emerald-600 hover:bg-emerald-700 text-white">Active</Badge>
            case "banned":
                return <Badge variant="destructive">Banned</Badge>
            case "inactive":
                return <Badge variant="secondary">Inactive</Badge>
            default:
                return <Badge variant="outline">{status}</Badge>
        }
    }

    const getOriginBadge = (member: IMember) => {
        const isExternal =
            member.account_origin === "external" ||
            member.email.startsWith("ext.") ||
            !!member.external_email

        if (isExternal) {
            return (
                <Badge variant="outline" className="text-[10px] bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300">
                    External
                </Badge>
            )
        }
        return (
            <Badge variant="outline" className="text-[10px] bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300">
                Internal
            </Badge>
        )
    }

    return (
        <div className="space-y-4">
            {/* Search Bar */}
            <div className="flex items-center gap-2 max-w-sm">
                <div className="relative w-full">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="text"
                        placeholder="Search members by name, email, or role..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-8 text-sm"
                    />
                </div>
            </div>

            {/* Members Table */}
            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>User / Mailbox</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Organization & Domain</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Service Roles</TableHead>
                            <TableHead>Feature Scopes</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredMembers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">
                                    No organization members found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredMembers.map((member) => (
                                <TableRow key={member.id}>
                                    <TableCell>
                                        <div className="font-medium text-sm text-foreground">
                                            {member.name || member.email}
                                        </div>
                                        <div className="text-xs font-mono text-muted-foreground">
                                            {member.email}
                                        </div>
                                        {member.external_email && (
                                            <div className="text-[11px] text-purple-600 dark:text-purple-400 mt-0.5 flex items-center gap-1">
                                                <span>Original:</span> {member.external_email}
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell>{getOriginBadge(member)}</TableCell>
                                    <TableCell>
                                        <div className="text-sm font-medium">{member.organization || "—"}</div>
                                        <div className="text-xs text-muted-foreground">{member.domain}</div>
                                    </TableCell>
                                    <TableCell>
                                        <Select
                                            defaultValue={member.role?.toLowerCase() || "member"}
                                            onValueChange={(val) => updateMemberRole(member.id, val)}
                                        >
                                            <SelectTrigger className="w-[125px] h-8 text-xs">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {defaultRoles.map((r) => (
                                                    <SelectItem key={r.value} value={r.value} className="text-xs">
                                                        {r.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </TableCell>
                                    <TableCell>
                                        <ServiceRoleBadges roles={member.service_roles} />
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-wrap items-center gap-1 max-w-[220px]">
                                            {(member.scopes && member.scopes.length > 0) ? (
                                                member.scopes.map((s) => {
                                                    const [feat, perm] = s.split(":")
                                                    return (
                                                        <span
                                                            key={s}
                                                            className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
                                                        >
                                                            {feat}:{perm}
                                                        </span>
                                                    )
                                                })
                                            ) : (
                                                <span className="text-xs text-muted-foreground">Default scopes</span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>{getStatusBadge(member.status)}</TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Member Actions</DropdownMenuLabel>
                                                <DropdownMenuItem onClick={() => openRoleEditor(member)}>
                                                    <KeyRound className="h-4 w-4 mr-2" />
                                                    Edit Service Roles
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => openScopeEditor(member)}>
                                                    <Sliders className="h-4 w-4 mr-2" />
                                                    Edit Access Scopes
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    onClick={() => {
                                                        setActionMember(member)
                                                        setActionType("ban")
                                                    }}
                                                    className="text-amber-600 focus:text-amber-600"
                                                >
                                                    <Ban className="h-4 w-4 mr-2" />
                                                    Ban Account
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => {
                                                        setActionMember(member)
                                                        setActionType("kick")
                                                    }}
                                                    className="text-destructive focus:text-destructive"
                                                >
                                                    <UserMinus className="h-4 w-4 mr-2" />
                                                    Deactivate Member
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Service Roles Dialog */}
            <Dialog
                open={!!editingRolesMember}
                onOpenChange={(open) => !open && !savingRoles && setEditingRolesMember(null)}
            >
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <KeyRound className="w-5 h-5 text-primary" />
                            Service Roles
                        </DialogTitle>
                        <DialogDescription>
                            Choose the role of{" "}
                            <strong>{editingRolesMember?.name || editingRolesMember?.email}</strong> in each service of{" "}
                            {editingRolesMember?.organization || "the organization"}.
                        </DialogDescription>
                    </DialogHeader>

                    {tempChoices && (
                        <div className="py-2">
                            <ServiceRolePicker
                                value={tempChoices}
                                orgRole={editingRolesMember?.role}
                                disabled={savingRoles}
                                locked={(["files", "tasks", "workspace"] as OrgService[]).filter(
                                    (s) => editingRolesMember?.service_roles?.[s] === "owner"
                                )}
                                onChange={(service: OrgService, choice: ServiceRoleChoice) =>
                                    setTempChoices((prev) => (prev ? { ...prev, [service]: choice } : prev))
                                }
                            />
                        </div>
                    )}

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setEditingRolesMember(null)}
                            disabled={savingRoles}
                        >
                            Cancel
                        </Button>
                        <Button onClick={saveServiceRoles} disabled={savingRoles}>
                            {savingRoles ? "Saving..." : "Save Roles"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Scope Editor Dialog */}
            <Dialog
                open={!!editingScopesMember}
                onOpenChange={(open) => !open && setEditingScopesMember(null)}
            >
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Sliders className="w-5 h-5 text-primary" />
                            Edit Permissions & Scopes
                        </DialogTitle>
                        <DialogDescription>
                            Configure feature access levels for{" "}
                            <strong>{editingScopesMember?.name || editingScopesMember?.email}</strong>.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-2">
                        <ScopeSelectorGrid
                            scopes={scopeMap}
                            onChange={handleScopeChange}
                            disabled={savingScopes}
                        />
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setEditingScopesMember(null)}
                            disabled={savingScopes}
                        >
                            Cancel
                        </Button>
                        <Button onClick={saveScopes} disabled={savingScopes}>
                            {savingScopes ? "Saving..." : "Save Scopes"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Kick / Ban Action Alert Dialog */}
            <AlertDialog
                open={!!actionMember}
                onOpenChange={(open) => !open && setActionMember(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {actionType === "kick" ? "Deactivate Member?" : "Ban Member?"}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {actionType === "kick" ? (
                                <>
                                    Are you sure you want to remove{" "}
                                    <strong>{actionMember?.name || actionMember?.email}</strong> from this
                                    organization? The mailbox will be marked inactive and unable to send
                                    or receive emails.
                                </>
                            ) : (
                                <>
                                    Are you sure you want to ban{" "}
                                    <strong>{actionMember?.name || actionMember?.email}</strong>? They will be
                                    immediately blocked from sending emails.
                                </>
                            )}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmAction}
                            className={
                                actionType === "kick"
                                    ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    : "bg-amber-600 text-white hover:bg-amber-700"
                            }
                        >
                            {actionType === "kick" ? "Deactivate" : "Ban"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
