"use client"

import * as React from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { UserPlus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { MembersTable } from "../../_components/members-table"
import { OrgPage, PageHeader, Section } from "../../_components/kit"
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

    const orgName = orgMembers[0]?.organization

    return (
        <OrgPage>
            <PageHeader
                back={{ href: "/h-panel/org", label: "Organizations" }}
                title={orgName ? `${orgName} members` : "Organization members"}
                description="Mailboxes on the domains of this organization."
                actions={
                    <Button size="sm" className="h-9 gap-2" asChild>
                        <Link href="/h-panel/org/members/add">
                            <UserPlus className="h-4 w-4" />
                            Add member
                        </Link>
                    </Button>
                }
            />
            <Section>
                <MembersTable data={orgMembers} orgId={orgId} loading={loading} />
            </Section>
        </OrgPage>
    )
}
