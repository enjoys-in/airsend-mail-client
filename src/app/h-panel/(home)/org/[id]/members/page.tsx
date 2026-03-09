"use client"

import * as React from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { UserPlus, ArrowLeft } from "lucide-react"
import Link from "next/link"

import { MembersTable } from "../../_components/members-table"
import { API } from "@/lib/api/handler"
import type { IMember } from "../../_lib/types"

export default function OrganizationMembersPage() {
    const params = useParams()
    const orgId = params.id as string
    const [orgMembers, setOrgMembers] = React.useState<IMember[]>([])
    const [loading, setLoading] = React.useState(true)

    React.useEffect(() => {
        API.getOrgMembers(orgId)
            .then((res) => setOrgMembers(res.data?.result || res.data || []))
            .catch(() => {})
            .finally(() => setLoading(false))
    }, [orgId])

    return (
        <div className="flex flex-col h-full">
            <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
                <Button variant="ghost" size="sm" asChild>
                    <Link href="/h-panel/org">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                    </Link>
                </Button>
                <h1 className="text-lg font-semibold">Members — Org {orgId}</h1>
                <div className="ml-auto">
                    <Button size="sm" asChild>
                        <Link href="/h-panel/org/members/add">
                            <UserPlus className="h-4 w-4 mr-2" />
                            Add Member
                        </Link>
                    </Button>
                </div>
            </header>
            <div className="flex-1 p-4 min-w-0 overflow-auto">
                <MembersTable data={orgMembers} />
            </div>
        </div>
    )
}
