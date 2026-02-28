"use client"

import { Button } from "@/components/ui/button"
import { UserPlus } from "lucide-react"
import { MembersTable } from "../_components/members-table"
import { MOCK_MEMBERS } from "../_lib/mock-data"

export default function MembersPage() {
    return (
        <div className="flex flex-col h-full">
            <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
                <h1 className="text-lg font-semibold">Members Management</h1>
                <div className="ml-auto">
                    <Button size="sm">
                        <UserPlus className="h-4 w-4 mr-2" />
                        Invite Member
                    </Button>
                </div>
            </header>
            <div className="flex-1 p-4 min-w-0 overflow-auto">
                <MembersTable data={MOCK_MEMBERS} />
            </div>
        </div>
    )
}
