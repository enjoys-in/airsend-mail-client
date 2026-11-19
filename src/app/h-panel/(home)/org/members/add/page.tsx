"use client"

import * as React from "react"
import { Send, UserPlus, Loader2 } from "lucide-react"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { API } from "@/lib/api/handler"
import { DOMAIN_STATUS } from "@/lib/types/mail.interface"
import type { IOrganization, IRole } from "../../_lib/types"
import { InviteExternalMemberForm } from "../../_components/invite-external-member-form"
import { CreateInternalMemberForm } from "../../_components/create-internal-member-form"
import { OrgPage, PageHeader } from "../../_components/kit"

export default function AddMemberPage() {
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
        <OrgPage narrow>
            <PageHeader
                back={{ href: "/h-panel/org/members", label: "Members" }}
                title="Add a member"
                description="Invite someone who already has an Outlook or Gmail account, or create a mailbox for them on one of your domains."
            />

            <Tabs value={mode} onValueChange={(v) => setMode(v as "invite" | "internal")} className="mb-5">
                <TabsList className="grid h-9 w-full grid-cols-2 bg-muted/60 p-0.5 sm:w-[360px]">
                    <TabsTrigger value="invite" className="h-8 gap-1.5 text-xs">
                        <Send className="h-3.5 w-3.5" />
                        Invite external
                    </TabsTrigger>
                    <TabsTrigger value="internal" className="h-8 gap-1.5 text-xs">
                        <UserPlus className="h-3.5 w-3.5" />
                        Create mailbox
                    </TabsTrigger>
                </TabsList>
            </Tabs>

            {loading ? (
                <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-border/70 bg-card p-12 text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span className="text-xs">Loading organizations and domains</span>
                </div>
            ) : mode === "invite" ? (
                <InviteExternalMemberForm organizations={organizations} domains={domains} roles={roles} />
            ) : (
                <CreateInternalMemberForm domains={domains} roles={roles} />
            )}
        </OrgPage>
    )
}
