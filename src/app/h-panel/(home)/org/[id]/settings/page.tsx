"use client"

import * as React from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import { API } from "@/lib/api/handler"
import type { AccountSettings } from "@/lib/types/account-settings.interface"
import { SettingsForm } from "../../_components/settings/settings-form"

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
        <div className="flex flex-col h-full">
            <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
                <Button variant="ghost" size="sm" asChild>
                    <Link href="/h-panel/org">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                    </Link>
                </Button>
                <h1 className="text-lg font-semibold">Account Settings — Org {params.id}</h1>
            </header>

            <ScrollArea className="flex-1">
                <div className="p-4 space-y-4 max-w-5xl">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base">Domain & Account Selection</CardTitle>
                            <CardDescription>Select a domain and account to manage its settings</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        </CardContent>
                    </Card>

                    {loading && selectedAccount && (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
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
            </ScrollArea>
        </div>
    )
}
