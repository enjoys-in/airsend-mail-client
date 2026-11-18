"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
    ArrowLeft,
    Send,
    UserPlus,
    ChevronRight,
    Loader2,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { API } from "@/lib/api/handler"
import { DOMAIN_STATUS } from "@/lib/types/mail.interface"
import type { IOrganization, IRole } from "../../_lib/types"
import { InviteExternalMemberForm } from "../../_components/invite-external-member-form"
import { CreateInternalMemberForm } from "../../_components/create-internal-member-form"

export default function AddMemberPage() {
    const router = useRouter()

    const [mode, setMode] = React.useState<"invite" | "internal">("invite")
    const [organizations, setOrganizations] = React.useState<IOrganization[]>([])
    const [domains, setDomains] = React.useState<any[]>([])
    const [roles, setRoles] = React.useState<IRole[]>([])
    const [loading, setLoading] = React.useState(true)

    React.useEffect(() => {
        Promise.all([
            API.getOrganizations().catch(() => ({ data: { result: [] } })),
            API.handleGetAllDomains().catch(() => ({ data: { result: [] } })),
            API.getRoles().catch(() => ({ data: { result: [] } })),
        ])
            .then(([oRes, dRes, rRes]) => {
                const orgList: IOrganization[] = oRes.data?.result || oRes.data || []
                const domainList = (dRes.data?.result || dRes.data || []).filter(
                    (d: any) => d.status === DOMAIN_STATUS.VERIFIED
                )
                const roleList: IRole[] = rRes.data?.result || rRes.data || []

                setOrganizations(orgList)
                setDomains(domainList)
                setRoles(roleList)
            })
            .finally(() => setLoading(false))
    }, [])

    return (
        <div className="flex flex-col h-full bg-background">
            {/* Top Navigation Bar */}
            <header className="flex h-14 shrink-0 items-center justify-between border-b px-6 bg-card">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href="/h-panel/org/members">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Members
                        </Link>
                    </Button>
                    <div className="h-4 w-px bg-border" />
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Link href="/h-panel/org" className="hover:text-foreground">
                            Organizations
                        </Link>
                        <ChevronRight className="h-3.5 w-3.5" />
                        <Link href="/h-panel/org/members" className="hover:text-foreground">
                            Members
                        </Link>
                        <ChevronRight className="h-3.5 w-3.5" />
                        <span className="text-foreground font-medium">Add Member</span>
                    </div>
                </div>
            </header>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-auto p-6">
                <div className="container max-w-4xl mx-auto space-y-6">
                    {/* Header Banner */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">Add Team Member</h1>
                            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                                Invite external collaborators from Outlook or Gmail, or provision native enterprise mailboxes.
                            </p>
                        </div>

                        {/* Mode Switcher */}
                        <Tabs
                            value={mode}
                            onValueChange={(v) => setMode(v as "invite" | "internal")}
                            className="w-full sm:w-auto"
                        >
                            <TabsList className="grid grid-cols-2 p-1 bg-muted/70">
                                <TabsTrigger value="invite" className="gap-1.5 text-xs">
                                    <Send className="w-3.5 h-3.5" />
                                    Invite External
                                </TabsTrigger>
                                <TabsTrigger value="internal" className="gap-1.5 text-xs">
                                    <UserPlus className="w-3.5 h-3.5" />
                                    Direct Mailbox
                                </TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>

                    {loading ? (
                        <div className="p-12 text-center text-muted-foreground flex flex-col items-center justify-center gap-2">
                            <Loader2 className="w-6 h-6 animate-spin text-primary" />
                            <span className="text-xs">Loading organizations and domains...</span>
                        </div>
                    ) : (
                        <div>
                            {mode === "invite" ? (
                                <InviteExternalMemberForm
                                    organizations={organizations}
                                    domains={domains}
                                    roles={roles}
                                />
                            ) : (
                                <CreateInternalMemberForm
                                    domains={domains}
                                    roles={roles}
                                />
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
