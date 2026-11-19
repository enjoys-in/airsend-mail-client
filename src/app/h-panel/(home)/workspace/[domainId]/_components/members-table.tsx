"use client"

import { useCallback } from "react"
import { Button } from "@/components/ui/button"
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
    AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/components/ui/use-toast"
import { API } from "@/lib/api/handler"
import { Trash2, Users } from "lucide-react"
import type { Scope, WorkspaceMember } from "@/lib/types/workspace.interface"
import { EmptyState, Initials, Pill, type Tone } from "@/components/h-panel/kit"
import { ScopeEditor } from "./scope-editor"

interface MembersTableProps {
    members: WorkspaceMember[]
    onMembersChange: (members: WorkspaceMember[]) => void
}

const PERMISSION_LABEL: Record<string, string> = { ro: "read", w: "write", rw: "read & write" }
const PERMISSION_TONE: Record<string, Tone> = { ro: "neutral", w: "amber", rw: "blue" }

export function MembersTable({ members, onMembersChange }: MembersTableProps) {
    const { toast } = useToast()

    const handleRemove = useCallback(async (memberId: number) => {
        try {
            const { data } = await API.removeWorkspaceMember(memberId)
            if (!data.success) throw new Error(data.message)
            toast({ title: data.message })
            onMembersChange(members.filter(m => m.id !== memberId))
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" })
        }
    }, [members, onMembersChange, toast])

    const handleScopesUpdated = useCallback((memberId: number, newScopes: Scope[]) => {
        onMembersChange(
            members.map(m => m.id === memberId ? { ...m, scopes: newScopes } : m)
        )
    }, [members, onMembersChange])

    if (members.length === 0) {
        return (
            <EmptyState
                icon={Users}
                title="No members yet"
                description="Add an account with the form above to give it access to this workspace."
            />
        )
    }

    return (
        <div className="max-h-[520px] overflow-auto">
            <Table>
                <TableHeader className="sticky top-0 z-10 bg-card">
                    <TableRow className="hover:bg-transparent">
                        <TableHead>Member</TableHead>
                        <TableHead>Access</TableHead>
                        <TableHead className="w-[1%] text-right" />
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {members.map((member) => (
                        <TableRow key={member.id}>
                            <TableCell>
                                <div className="flex items-center gap-3">
                                    <Initials text={member.email} />
                                    <span className="text-sm">{member.email}</span>
                                </div>
                            </TableCell>
                            <TableCell>
                                {member.scopes.length === 0 ? (
                                    <span className="text-xs text-muted-foreground">No access</span>
                                ) : (
                                    <div className="flex flex-wrap gap-1">
                                        {member.scopes.map((scope) => {
                                            const [feature, permission] = scope.split(":")
                                            return (
                                                <Pill key={scope} tone={PERMISSION_TONE[permission] ?? "neutral"} className="capitalize">
                                                    {feature} · {PERMISSION_LABEL[permission] ?? permission}
                                                </Pill>
                                            )
                                        })}
                                    </div>
                                )}
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center justify-end gap-1">
                                    <ScopeEditor
                                        memberId={member.id}
                                        scopes={member.scopes}
                                        onScopesUpdated={handleScopesUpdated}
                                    />
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-red-600" aria-label={`Remove ${member.email}`}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Remove member?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    This will remove {member.email} from the workspace. Their cached profile will be invalidated immediately.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction
                                                    onClick={() => handleRemove(member.id)}
                                                    className="bg-red-600 text-white hover:bg-red-700"
                                                >
                                                    Remove
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}
