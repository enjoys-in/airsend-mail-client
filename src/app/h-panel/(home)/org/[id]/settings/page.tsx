"use client"

import * as React from "react"
import { useParams } from "next/navigation"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import { API } from "@/lib/api/handler"
import type { AccountSettings } from "@/lib/types/account-settings.interface"
import { SettingsForm } from "../../_components/settings/settings-form"
import { OrgPage, PageHeader, Section } from "../../_components/kit"

export default function ManageSettingsPage() {
    const params = useParams()
    const [selectedDomain, setSelectedDomain] = React.useState("")
    const [selectedAccount, setSelectedAccount] = React.useState("")
    const [domains, setDomains] = React.useState<any[]>([])
    const [accounts, setAccounts] = React.useState<any[]>([])
    const [loading, setLoading] = React.useState(false)
    const [settingsData, setSettingsData] = React.useState<Partial<AccountSettings> | null>(null)

    React.useEffect(() => {
        API.handleGetAllDomains().then(({ data }) => {
            if (data.success) setDomains(data.result || [])
        }).catch(() => {})
    }, [])

    React.useEffect(() => {
        if (!selectedDomain) { setAccounts([]); setSelectedAccount(""); return }
        setLoading(true)
        API.handleGetAllAccounts(selectedDomain).then(({ data }: any) => {
            if (data.success) setAccounts(data.result || [])
        }).catch(() => {}).finally(() => setLoading(false))
    }, [selectedDomain])

    React.useEffect(() => {
        if (!selectedAccount) { setSettingsData(null); return }
        setLoading(true)
        API.handleGetAccountSettings(selectedAccount).then(({ data }: any) => {
            if (data.success && data.result) {
                setSettingsData(data.result)
            }
        }).catch(() => {}).finally(() => setLoading(false))
    }, [selectedAccount])

    return (
        <OrgPage narrow>
            <PageHeader
                back={{ href: "/h-panel/org", label: "Organizations" }}
                title="Account settings"
                description={`Pick a domain and a mailbox to manage its settings (organization ${params.id}).`}
            />

            <div className="space-y-5">
                <Section title="Mailbox" description="Choose which account to configure.">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label>Domain</Label>
                            <Select value={selectedDomain} onValueChange={(v) => { setSelectedDomain(v); setSelectedAccount("") }}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select domain" />
                                </SelectTrigger>
                                <SelectContent>
                                    {domains.map((d: any) => (
                                        <SelectItem key={d.id || d.domain_name} value={d.domain_name}>{d.domain_name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Account</Label>
                            <Select value={selectedAccount} onValueChange={setSelectedAccount} disabled={!selectedDomain || loading}>
                                <SelectTrigger>
                                    <SelectValue placeholder={loading ? "Loading..." : "Select account"} />
                                </SelectTrigger>
                                <SelectContent>
                                    {accounts.map((a: any) => (
                                        <SelectItem key={a.email || a.id} value={a.email}>{a.email}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </Section>

                {loading && selectedAccount && (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                )}

                {selectedAccount && !loading && settingsData && (
                    <SettingsForm
                        key={selectedAccount}
                        account={selectedAccount}
                        initialData={settingsData}
                    />
                )}
            </div>
        </OrgPage>
    )
}
