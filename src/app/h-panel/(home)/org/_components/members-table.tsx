"use client"

import * as React from "react"
import {
    MoreHorizontal,
    UserMinus,
    Ban,
    Shield,
    Sliders,
    Search,
    Users,
    KeyRound,
    RefreshCw,
    Loader2,
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
import { EmptyState, Initials, Pill, RowsSkeleton } from "./kit"
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
    /** Initial load in progress (shows a skeleton instead of an empty state). */
    loading?: boolean
    /** When set, "Sync users" only covers this organization. */
    orgId?: string
}

const defaultRoles = [
    { value: "owner", label: "Owner" },
    { value: "admin", label: "Administrator" },
    { value: "member", label: "Member" },
    { value: "viewer", label: "Viewer" },
]

export function MembersTable({ data, onUpdated, orgId, loading }: MembersTableProps) {
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

    const [syncingId, setSyncingId] = React.useState<string | null>(null)
    const [syncingAll, setSyncingAll] = React.useState(false)

    // "Sync": seeds the Files / Tasks / Workspace roles a member is missing; roles that exist (overrides too) stay as they are.
    const syncOne = async (member: IMember) => {
        setSyncingId(member.id)
        try {
            const { data: res } = await API.syncMember(member.id)
            if (!res?.success) throw new Error(res?.message || "Failed to sync")
            toast({ title: "Synced", description: `${member.email}: ${res.message}` })
            onUpdated?.()
        } catch (error: any) {
            toast({ title: "Error", description: error.message || "Failed to sync member", variant: "destructive" })
        } finally {
            setSyncingId(null)
        }
    }

    const syncAll = async () => {
        setSyncingAll(true)
        try {
            const { data: res } = await API.syncMembers(orgId)
            if (!res?.success) throw new Error(res?.message || "Failed to sync users")
            toast({ title: "Users synced", description: res.message })
            onUpdated?.()
        } catch (error: any) {
            toast({ title: "Error", description: error.message || "Failed to sync users", variant: "destructive" })
        } finally {
            setSyncingAll(false)
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

    const statusPill = (status: string) => {
        switch (status) {
            case "active":
                return <Pill tone="green">Active</Pill>
            case "banned":
                return <Pill tone="red">Banned</Pill>
            case "pending":
                return <Pill tone="amber">Pending</Pill>
            case "inactive":
                return <Pill>Inactive</Pill>
            default:
                return <Pill>{status}</Pill>
        }
    }

    const isExternal = (member: IMember) =>
        member.account_origin === "external" || member.email.startsWith("ext.") || !!member.external_email

    return (
        <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative w-full sm:max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="text"
                        placeholder="Search by name, email, domain or role"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="h-9 pl-8 text-sm"
                    />
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    className="h-9 gap-2"
                    onClick={syncAll}
                    disabled={syncingAll}
                    title="Add the Files, Tasks and Workspace roles that are missing for members"
                >
                    {syncingAll ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                    Sync users
                </Button>
            </div>

            {/* Members Table */}
            <div className="overflow-hidden rounded-lg border border-border/70">
                {loading && members.length === 0 ? (
                    <RowsSkeleton rows={5} />
                ) : filteredMembers.length === 0 ? (
                    <EmptyState
                        icon={Users}
                        title={searchQuery.trim() ? "No members match your search" : "No members yet"}
                        description={
                            searchQuery.trim()
                                ? "Try a different name, email, domain or role."
                                : "Mailboxes on the domains of your organization show up here."
                        }
                    />
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/40 hover:bg-muted/40">
                                <TableHead className="h-10 text-xs text-muted-foreground">Member</TableHead>
                                <TableHead className="h-10 text-xs text-muted-foreground">Organization</TableHead>
                                <TableHead className="h-10 text-xs text-muted-foreground">Role</TableHead>
                                <TableHead className="h-10 text-xs text-muted-foreground">Service roles</TableHead>
                                <TableHead className="hidden h-10 text-xs text-muted-foreground xl:table-cell">Scopes</TableHead>
                                <TableHead className="h-10 text-xs text-muted-foreground">Status</TableHead>
                                <TableHead className="h-10 w-12" />
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredMembers.map((member) => (
                                <TableRow key={member.id} className="hover:bg-muted/30">
                                    <TableCell className="py-3">
                                        <div className="flex items-center gap-3">
                                            <Initials text={member.name || member.email} />
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="truncate text-sm">{member.name || member.email}</span>
                                                    {isExternal(member) && <Pill tone="violet">External</Pill>}
                                                </div>
                                                <div className="truncate text-xs text-muted-foreground">{member.email}</div>
                                                {member.external_email && (
                                                    <div className="truncate text-[11px] text-muted-foreground">
                                                        Original: {member.external_email}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-3">
                                        <div className="text-sm">{member.organization || "—"}</div>
                                        <div className="text-xs text-muted-foreground">{member.domain}</div>
                                    </TableCell>
                                    <TableCell className="py-3">
                                        <Select
                                            defaultValue={member.role?.toLowerCase() || "member"}
                                            onValueChange={(val) => updateMemberRole(member.id, val)}
                                        >
                                            <SelectTrigger className="h-8 w-[120px] border-transparent bg-transparent text-xs shadow-none hover:border-border focus:ring-0">
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
                                    <TableCell className="py-3">
                                        <ServiceRoleBadges roles={member.service_roles} />
                                    </TableCell>
                                    <TableCell className="hidden py-3 xl:table-cell">
                                        <div className="flex max-w-[220px] flex-wrap items-center gap-1">
                                            {member.scopes && member.scopes.length > 0 ? (
                                                <>
                                                    {member.scopes.slice(0, 3).map((s) => (
                                                        <Pill key={s}>{s}</Pill>
                                                    ))}
                                                    {member.scopes.length > 3 && (
                                                        <span
                                                            className="text-[11px] text-muted-foreground"
                                                            title={member.scopes.slice(3).join(", ")}
                                                        >
                                                            +{member.scopes.length - 3}
                                                        </span>
                                                    )}
                                                </>
                                            ) : (
                                                <span className="text-xs text-muted-foreground">Default</span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-3">{statusPill(member.status)}</TableCell>
                                    <TableCell className="py-3 text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                    <span className="sr-only">Member actions</span>
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                                                    Member actions
                                                </DropdownMenuLabel>
                                                <DropdownMenuItem onClick={() => openRoleEditor(member)}>
                                                    <KeyRound className="mr-2 h-4 w-4" />
                                                    Edit service roles
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => syncOne(member)} disabled={syncingId === member.id}>
                                                    {syncingId === member.id ? (
                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <RefreshCw className="mr-2 h-4 w-4" />
                                                    )}
                                                    Sync access
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => openScopeEditor(member)}>
                                                    <Sliders className="mr-2 h-4 w-4" />
                                                    Edit access scopes
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    onClick={() => {
                                                        setActionMember(member)
                                                        setActionType("ban")
                                                    }}
                                                    className="text-amber-600 focus:text-amber-600"
                                                >
                                                    <Ban className="mr-2 h-4 w-4" />
                                                    Ban account
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => {
                                                        setActionMember(member)
                                                        setActionType("kick")
                                                    }}
                                                    className="text-destructive focus:text-destructive"
                                                >
                                                    <UserMinus className="mr-2 h-4 w-4" />
                                                    Deactivate member
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </div>

            {/* Service Roles Dialog */}
            <Dialog
                open={!!editingRolesMember}
                onOpenChange={(open) => !open && !savingRoles && setEditingRolesMember(null)}
            >
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-base">
                            <KeyRound className="h-4 w-4 text-muted-foreground" />
                            Service Roles
                        </DialogTitle>
                        <DialogDescription>
                            Choose the role of{" "}
                            <span className="text-foreground">{editingRolesMember?.name || editingRolesMember?.email}</span> in each service of{" "}
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
                            <Sliders className="h-4 w-4 text-muted-foreground" />
                            Edit Permissions & Scopes
                        </DialogTitle>
                        <DialogDescription>
                            Configure feature access levels for{" "}
                            <span className="text-foreground">{editingScopesMember?.name || editingScopesMember?.email}</span>.
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
                                    <span className="text-foreground">{actionMember?.name || actionMember?.email}</span> from this
                                    organization? The mailbox will be marked inactive and unable to send
                                    or receive emails.
                                </>
                            ) : (
                                <>
                                    Are you sure you want to ban{" "}
                                    <span className="text-foreground">{actionMember?.name || actionMember?.email}</span>? They will be
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
