"use client"

import { useState, useCallback } from "react"
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
import { Trash2 } from "lucide-react"
import type { Scope, WorkspaceMember } from "@/lib/types/workspace.interface"
import { ScopeEditor } from "./scope-editor"

interface MembersTableProps {
    members: WorkspaceMember[]
    onMembersChange: (members: WorkspaceMember[]) => void
}

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
            <div className="flex items-center justify-center h-[200px] text-muted-foreground border rounded-md">
                No members yet. Add accounts from the dropdown above.
            </div>
        )
    }

    return (
        <div className="border rounded-md overflow-auto max-h-[400px]">
            <Table>
                <TableHeader className="sticky top-0 bg-background z-10">
                    <TableRow>
                        <TableHead>Email</TableHead>
                        <TableHead>Scopes</TableHead>
                        <TableHead className="w-[60px]">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {members.map((member) => (
                        <TableRow key={member.id}>
                            <TableCell className="font-medium">{member.email}</TableCell>
                            <TableCell>
                                <ScopeEditor
                                    memberId={member.id}
                                    scopes={member.scopes}
                                    onScopesUpdated={handleScopesUpdated}
                                />
                            </TableCell>
                            <TableCell>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                            <Trash2 className="h-4 w-4" color="red" />
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
                                            <AlertDialogCancel className="rounded-none">Cancel</AlertDialogCancel>
                                            <AlertDialogAction
                                                onClick={() => handleRemove(member.id)}
                                                className="bg-red-500 text-primary-foreground hover:bg-red-600 rounded-none"
                                            >
                                                Remove
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}
