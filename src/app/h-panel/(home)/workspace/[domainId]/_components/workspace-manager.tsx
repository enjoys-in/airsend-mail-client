"use client"

import { useState } from "react"
import type { AvailableAccount, WorkspaceMember } from "@/lib/types/workspace.interface"
import { Pill, Section } from "@/components/h-panel/kit"
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
        <div className="space-y-5">
            <Section title="Add member" description={`Give an account on this domain access to ${workspaceName}. New members start with the default scopes; change them in the list below.`}>
                <AddMemberForm
                    domainId={domainId}
                    availableAccounts={availableAccounts}
                    existingEmails={members.map(m => m.email)}
                    onMemberAdded={handleMemberAdded}
                />
            </Section>

            <Section
                title="Members"
                description="Who can use this workspace and what each person can do in every module."
                actions={<Pill>{members.length}</Pill>}
                flush
            >
                <MembersTable members={members} onMembersChange={setMembers} />
            </Section>
        </div>
    )
}
