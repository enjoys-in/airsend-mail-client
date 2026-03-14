"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { API } from "@/lib/api/handler"
import { Loader2, UserPlus } from "lucide-react"
import type { AvailableAccount, Scope, WorkspaceMember } from "@/lib/types/workspace.interface"
import { DEFAULT_SCOPES } from "@/lib/types/workspace.interface"

interface AddMemberFormProps {
    domainId: string
    availableAccounts: AvailableAccount[]
    existingEmails: string[]
    onMemberAdded: (members: WorkspaceMember[]) => void
}

export function AddMemberForm({ domainId, availableAccounts, existingEmails, onMemberAdded }: AddMemberFormProps) {
    const { toast } = useToast()
    const [selectedEmail, setSelectedEmail] = useState("")
    const [loading, setLoading] = useState(false)

    const addableAccounts = availableAccounts.filter(a => !existingEmails.includes(a.email))

    const handleAdd = async () => {
        if (!selectedEmail) return
        setLoading(true)
        try {
            const { data } = await API.addWorkspaceMembers({
                domain_id: domainId,
                members: [{ email: selectedEmail, scopes: DEFAULT_SCOPES as string[] }],
            })
            if (!data.success) throw new Error(data.message)
            toast({ title: data.message })
            onMemberAdded(data.result)
            setSelectedEmail("")
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" })
        } finally {
            setLoading(false)
        }
    }

    if (addableAccounts.length === 0) {
        return <p className="text-sm text-muted-foreground">All accounts are already workspace members.</p>
    }

    return (
        <div className="flex items-center gap-3">
            <Select value={selectedEmail} onValueChange={setSelectedEmail}>
                <SelectTrigger className="w-[280px]">
                    <SelectValue placeholder="Select account to add" />
                </SelectTrigger>
                <SelectContent>
                    {addableAccounts.map((account) => (
                        <SelectItem key={account.id} value={account.email}>
                            {account.name} ({account.email})
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <Button onClick={handleAdd} disabled={!selectedEmail || loading} size="sm" className="rounded-none">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4 mr-1" />}
                Add
            </Button>
        </div>
    )
}
