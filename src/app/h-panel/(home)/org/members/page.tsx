"use client"

import * as React from "react"
import Link from "next/link"
import { UserPlus, Users, Mail, Building2, ShieldCheck, RefreshCw, Send } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MembersTable } from "../_components/members-table"
import { InvitationsTable } from "../_components/invitations-table"
import { OrgPage, PageHeader, Section, Stat, StatGrid } from "../_components/kit"
import { API } from "@/lib/api/handler"
import type { IMember, IOrganization, IInvitation } from "../_lib/types"

export default function MembersPage() {
    const [selectedOrg, setSelectedOrg] = React.useState<string>("all")
    const [members, setMembers] = React.useState<IMember[]>([])
    const [invitations, setInvitations] = React.useState<IInvitation[]>([])
    const [organizations, setOrganizations] = React.useState<IOrganization[]>([])
    const [loading, setLoading] = React.useState(true)

    const fetchData = React.useCallback(async () => {
        setLoading(true)
        try {
            const [mRes, iRes, oRes] = await Promise.all([
                API.getMembers().catch(() => ({ data: { result: [] } })),
                API.getInvitations().catch(() => ({ data: { result: [] } })),
                API.getOrganizations().catch(() => ({ data: { result: [] } })),
            ])

            setMembers(mRes.data?.result || mRes.data || [])
            setInvitations(iRes.data?.result || iRes.data || [])
            setOrganizations(oRes.data?.result || oRes.data || [])
        } finally {
            setLoading(false)
        }
    }, [])

    React.useEffect(() => {
        fetchData()
    }, [fetchData])

    const filteredMembers = React.useMemo(() => {
        if (selectedOrg === "all") return members
        return members.filter((m) => m.org_id === selectedOrg)
    }, [members, selectedOrg])

    const filteredInvitations = React.useMemo(() => {
        if (selectedOrg === "all") return invitations
        return invitations.filter((i) => i.org_id === selectedOrg)
    }, [invitations, selectedOrg])

    const externalCount = React.useMemo(
        () =>
            filteredMembers.filter(
                (m) =>
                    m.account_origin === "external" ||
                    m.email.startsWith("ext.") ||
                    !!m.external_email
            ).length,
        [filteredMembers]
    )

    const pendingInvitesCount = React.useMemo(
        () => filteredInvitations.filter((i) => i.status === "pending").length,
        [filteredInvitations]
    )

    const adminCount = React.useMemo(
        () => filteredMembers.filter((m) => ["owner", "admin"].includes(String(m.role ?? "").toLowerCase())).length,
        [filteredMembers]
    )

    return (
        <OrgPage>
            <PageHeader
                title="Members"
                description="Everyone with a mailbox on your organizations' domains. Set their role, what they can use, and what they can manage in Files, Tasks and Workspace."
                actions={
                    <>
                        <Select value={selectedOrg} onValueChange={setSelectedOrg}>
                            <SelectTrigger className="h-9 w-[190px] text-sm">
                                <SelectValue placeholder="All organizations" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All organizations</SelectItem>
                                {organizations.map((org) => (
                                    <SelectItem key={org.id} value={org.id}>
                                        {org.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-9 w-9"
                            onClick={fetchData}
                            disabled={loading}
                            title="Refresh"
                        >
                            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                        </Button>
                        <Button size="sm" className="h-9 gap-2" asChild>
                            <Link href="/h-panel/org/members/add">
                                <UserPlus className="h-4 w-4" />
                                Invite member
                            </Link>
                        </Button>
                    </>
                }
            />

            <div className="space-y-6">
                <StatGrid>
                    <Stat label="Members" value={filteredMembers.length} icon={Users} loading={loading} />
                    <Stat label="Admins and owners" value={adminCount} icon={ShieldCheck} loading={loading} />
                    <Stat label="External" value={externalCount} icon={Building2} loading={loading} />
                    <Stat label="Pending invites" value={pendingInvitesCount} icon={Send} loading={loading} />
                </StatGrid>

                <Tabs defaultValue="members" className="w-full">
                    <Section>
                        <TabsList className="mb-4 h-8 bg-muted/60 p-0.5">
                            <TabsTrigger value="members" className="h-7 gap-1.5 px-3 text-xs">
                                <Users className="h-3.5 w-3.5" />
                                Members
                                <span className="text-muted-foreground">{filteredMembers.length}</span>
                            </TabsTrigger>
                            <TabsTrigger value="invitations" className="h-7 gap-1.5 px-3 text-xs">
                                <Mail className="h-3.5 w-3.5" />
                                Invitations
                                {pendingInvitesCount > 0 && (
                                    <span className="rounded-full bg-amber-500/15 px-1.5 text-[10px] text-amber-700 dark:text-amber-400">
                                        {pendingInvitesCount}
                                    </span>
                                )}
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="members" className="m-0 focus-visible:outline-none">
                            <MembersTable data={filteredMembers} onUpdated={fetchData} loading={loading} />
                        </TabsContent>

                        <TabsContent value="invitations" className="m-0 focus-visible:outline-none">
                            <InvitationsTable data={filteredInvitations} onUpdated={fetchData} />
                        </TabsContent>
                    </Section>
                </Tabs>
            </div>
        </OrgPage>
    )
}
