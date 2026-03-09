"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { UserPlus } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MembersTable } from "../_components/members-table"
import { MOCK_MEMBERS, MOCK_ORGANIZATIONS } from "../_lib/mock-data"

export default function MembersPage() {
    const [selectedOrg, setSelectedOrg] = React.useState<string>("all")

    const filteredMembers = selectedOrg === "all"
        ? MOCK_MEMBERS
        : MOCK_MEMBERS.filter((m) => m.org_id === selectedOrg)

    return (
        <div className="flex flex-col h-full">
            <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4 flex-wrap">
                <h1 className="text-lg font-semibold">Members Management</h1>
                <div className="ml-auto flex items-center gap-2">
                    <Select value={selectedOrg} onValueChange={setSelectedOrg}>
                        <SelectTrigger className="w-[200px] h-9 rounded-none text-sm">
                            <SelectValue placeholder="Filter by organization" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Organizations</SelectItem>
                            {MOCK_ORGANIZATIONS.map((org) => (
                                <SelectItem key={org.id} value={org.id}>
                                    {org.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button size="sm" className="rounded-none">
                        <UserPlus className="h-4 w-4 mr-2" />
                        Invite Member
                    </Button>
                </div>
            </header>
            <div className="flex-1 p-4 min-w-0 overflow-auto">
                <MembersTable data={filteredMembers} />
            </div>
        </div>
    )
}
