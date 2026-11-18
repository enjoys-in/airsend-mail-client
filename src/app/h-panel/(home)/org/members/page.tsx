"use client"

import * as React from "react"
import Link from "next/link"
import {
    UserPlus,
    Users,
    Mail,
    Building2,
    ShieldCheck,
    RefreshCw,
    UserCheck,
    Send,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MembersTable } from "../_components/members-table"
import { InvitationsTable } from "../_components/invitations-table"
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

    return (
        <div className="flex flex-col h-full bg-background">
            {/* ── Top Header ── */}
            <header className="flex h-14 shrink-0 items-center gap-3 border-b px-6 flex-wrap justify-between bg-card">
                <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    <h1 className="text-base font-semibold">Members & Team Access</h1>
                </div>

                <div className="flex items-center gap-2">
                    {/* Organization Filter */}
                    <Select value={selectedOrg} onValueChange={setSelectedOrg}>
                        <SelectTrigger className="w-[190px] h-9 text-xs">
                            <SelectValue placeholder="All Organizations" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Organizations</SelectItem>
                            {organizations.map((org) => (
                                <SelectItem key={org.id} value={org.id}>
                                    {org.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* Refresh Button */}
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

                    {/* Invite Member Action */}
                    <Button size="sm" className="h-9 gap-1.5 shadow-sm" asChild>
                        <Link href="/h-panel/org/members/add">
                            <UserPlus className="h-4 w-4" />
                            Invite Member
                        </Link>
                    </Button>
                </div>
            </header>

            {/* ── Main Body ── */}
            <div className="flex-1 p-6 space-y-6 overflow-auto">
                {/* ── Metric Cards ── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="shadow-none border">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                    Total Members
                                </p>
                                <h3 className="text-2xl font-bold mt-1">{filteredMembers.length}</h3>
                            </div>
                            <div className="p-2.5 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
                                <Users className="w-5 h-5" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-none border">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                    External Users
                                </p>
                                <h3 className="text-2xl font-bold mt-1 text-purple-600 dark:text-purple-400">
                                    {externalCount}
                                </h3>
                            </div>
                            <div className="p-2.5 rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400">
                                <Building2 className="w-5 h-5" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-none border">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                    Pending Invites
                                </p>
                                <h3 className="text-2xl font-bold mt-1 text-amber-600 dark:text-amber-400">
                                    {pendingInvitesCount}
                                </h3>
                            </div>
                            <div className="p-2.5 rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400">
                                <Send className="w-5 h-5" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-none border">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                    Organizations
                                </p>
                                <h3 className="text-2xl font-bold mt-1">{organizations.length}</h3>
                            </div>
                            <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
                                <ShieldCheck className="w-5 h-5" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* ── Tabs for Active Members vs Pending Invitations ── */}
                <Tabs defaultValue="members" className="w-full space-y-4">
                    <TabsList className="bg-muted/60 p-1">
                        <TabsTrigger value="members" className="gap-2 text-xs">
                            <UserCheck className="w-4 h-4" />
                            Active Members
                            <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-[10px]">
                                {filteredMembers.length}
                            </Badge>
                        </TabsTrigger>
                        <TabsTrigger value="invitations" className="gap-2 text-xs">
                            <Mail className="w-4 h-4" />
                            Invitations
                            {pendingInvitesCount > 0 && (
                                <Badge className="ml-1 px-1.5 py-0 text-[10px] bg-amber-500 text-white">
                                    {pendingInvitesCount}
                                </Badge>
                            )}
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="members" className="m-0 focus-visible:outline-none">
                        <MembersTable data={filteredMembers} onUpdated={fetchData} />
                    </TabsContent>

                    <TabsContent value="invitations" className="m-0 focus-visible:outline-none">
                        <InvitationsTable data={filteredInvitations} onUpdated={fetchData} />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}
