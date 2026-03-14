"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { AvailableAccount, WorkspaceMember } from "@/lib/types/workspace.interface"
import { AddMemberForm } from "./add-member-form"
import { MembersTable } from "./members-table"

interface WorkspaceManagerProps {
    domainId: string
    workspaceName: string
    initialMembers: WorkspaceMember[]
    availableAccounts: AvailableAccount[]
}

export function WorkspaceManager({ domainId, workspaceName, initialMembers, availableAccounts }: WorkspaceManagerProps) {
    const [members, setMembers] = useState<WorkspaceMember[]>(initialMembers)

    const handleMemberAdded = (newMembers: WorkspaceMember[]) => {
        setMembers(prev => {
            const ids = new Set(prev.map(m => m.id))
            return [...prev, ...newMembers.filter(m => !ids.has(m.id))]
        })
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Add Member</CardTitle>
                </CardHeader>
                <CardContent>
                    <AddMemberForm
                        domainId={domainId}
                        availableAccounts={availableAccounts}
                        existingEmails={members.map(m => m.email)}
                        onMemberAdded={handleMemberAdded}
                    />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Members ({members.length})</CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    <MembersTable members={members} onMembersChange={setMembers} />
                </CardContent>
            </Card>
        </div>
    )
}
