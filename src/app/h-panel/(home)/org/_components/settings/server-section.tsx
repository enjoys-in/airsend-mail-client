"use client"

import { useState } from "react"
import { useFormContext } from "react-hook-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Plus, X } from "lucide-react"
import { FormSwitchField } from "./setting-row"
import type { AccountSettings } from "@/lib/types/account-settings.interface"

export function ServerSection() {
    const { watch, setValue } = useFormContext<AccountSettings>()
    const blockedSent = watch("blocked_sent_domain")
    const blockedRecipient = watch("blocked_recepient_domain")

    const [newBlockedSent, setNewBlockedSent] = useState("")
    const [newBlockedRecipient, setNewBlockedRecipient] = useState("")

    const addBlocked = (type: "sent" | "recipient") => {
        const val = type === "sent" ? newBlockedSent.trim() : newBlockedRecipient.trim()
        if (!val) return
        if (type === "sent") {
            if (!blockedSent.includes(val)) {
                setValue("blocked_sent_domain", [...blockedSent, val], { shouldDirty: true })
            }
            setNewBlockedSent("")
        } else {
            if (!blockedRecipient.includes(val)) {
                setValue("blocked_recepient_domain", [...blockedRecipient, val], { shouldDirty: true })
            }
            setNewBlockedRecipient("")
        }
    }

    const removeBlocked = (type: "sent" | "recipient", domain: string) => {
        if (type === "sent") {
            setValue("blocked_sent_domain", blockedSent.filter(d => d !== domain), { shouldDirty: true })
        } else {
            setValue("blocked_recepient_domain", blockedRecipient.filter(d => d !== domain), { shouldDirty: true })
        }
    }

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base">SMTP Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <FormSwitchField name="smtp_config.enable_smtp" label="Enable SMTP" description="Allow sending emails via SMTP" />
                    <FormSwitchField name="smtp_config.enable_smtp_from_alias" label="SMTP from Alias" description="Allow sending emails from aliases" />
                    <FormSwitchField name="smtp_config.allow_email_tracking" label="Email Tracking" description="Allow email open/click tracking" />
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base">IMAP Configuration</CardTitle>
                </CardHeader>
                <CardContent>
                    <FormSwitchField name="imap_config.enable_imap" label="Enable IMAP" description="Allow receiving emails via IMAP" />
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base">Blocked Domains</CardTitle>
                    <CardDescription>Block specific domains from sending or receiving</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Blocked Sender Domains</Label>
                        <div className="flex gap-2">
                            <Input placeholder="example.com" value={newBlockedSent}
                                onChange={(e) => setNewBlockedSent(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addBlocked("sent"))} />
                            <Button size="sm" type="button" variant="outline" onClick={() => addBlocked("sent")}>
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                            {blockedSent.map((d) => (
                                <Badge key={d} variant="secondary" className="gap-1">
                                    {d}
                                    <X className="h-3 w-3 cursor-pointer" onClick={() => removeBlocked("sent", d)} />
                                </Badge>
                            ))}
                        </div>
                    </div>
                    <Separator />
                    <div className="space-y-2">
                        <Label>Blocked Recipient Domains</Label>
                        <div className="flex gap-2">
                            <Input placeholder="example.com" value={newBlockedRecipient}
                                onChange={(e) => setNewBlockedRecipient(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addBlocked("recipient"))} />
                            <Button size="sm" type="button" variant="outline" onClick={() => addBlocked("recipient")}>
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                            {blockedRecipient.map((d) => (
                                <Badge key={d} variant="secondary" className="gap-1">
                                    {d}
                                    <X className="h-3 w-3 cursor-pointer" onClick={() => removeBlocked("recipient", d)} />
                                </Badge>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
