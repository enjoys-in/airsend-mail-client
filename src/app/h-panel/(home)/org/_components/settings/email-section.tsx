"use client"

import { useFormContext } from "react-hook-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Calendar } from "lucide-react"
import { SettingRow, FormSwitchField } from "./setting-row"
import { FormInputField } from "./form-input-field"
import type { AccountSettings } from "@/lib/types/account-settings.interface"

export function EmailSection() {
    const { watch, setValue } = useFormContext<AccountSettings>()
    const emailFooter = watch("email_settings.email_footer")
    const systemEmail = watch("email_settings.system_email")
    const vacationSender = watch("vacationSender")

    return (
        <div className="space-y-4">
            {/* Email Settings */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base">Email Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <FormSwitchField name="email_settings.autoShowImages" label="Auto Show Images" description="Automatically show images in emails" />
                    <FormSwitchField name="email_settings.keepMessages" label="Keep Messages" description="Keep messages after reading" />
                    <FormSwitchField name="email_settings.excludeSpam" label="Exclude Spam" description="Exclude spam from inbox view" />
                    <FormSwitchField name="email_settings.confirmLinks" label="Confirm Links" description="Ask before opening external links" />
                    <FormSwitchField name="email_settings.conversationGrouping" label="Conversation Grouping" description="Group related emails into conversations" />
                    <FormSwitchField name="email_settings.autoDeleteUnwanted" label="Auto Delete Unwanted" description="Automatically delete unwanted emails" />
                    <FormSwitchField name="email_settings.secure_email_enabled" label="Secure Email" description="Enable end-to-end encryption" />

                    <Separator />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormInputField name="email_settings.monthly_limit" label="Monthly Limit" type="number" transformValue={(v) => parseInt(v) || 0} />
                        <FormInputField name="email_settings.thresold_limit" label="Threshold Limit" type="number" transformValue={(v) => parseInt(v) || 0} />
                    </div>

                    <Separator />

                    <SettingRow label="Email Footer" description="Add a footer to all outgoing emails"
                        checked={emailFooter.footer_enabled}
                        onChange={(v) => setValue("email_settings.email_footer",
                            v ? { footer_enabled: true, footer_text: "" } : { footer_enabled: false, footer_text: null },
                            { shouldDirty: true }
                        )} />
                    {emailFooter.footer_enabled && (
                        <div className="ml-4">
                            <Textarea placeholder="Enter footer text..."
                                value={emailFooter.footer_text || ""}
                                onChange={(e) => setValue("email_settings.email_footer", { footer_enabled: true, footer_text: e.target.value }, { shouldDirty: true })} />
                        </div>
                    )}

                    <Separator />

                    <SettingRow label="System Email" description="Mark this as a system email account"
                        checked={systemEmail.is_system_email}
                        onChange={(v) => setValue("email_settings.system_email",
                            v ? { is_system_email: true, system_email_reply: "" } : { is_system_email: false, system_email_reply: null },
                            { shouldDirty: true }
                        )} />
                    {systemEmail.is_system_email && (
                        <div className="ml-4 space-y-2">
                            <Label>System Email Reply Address</Label>
                            <Input placeholder="noreply@domain.com"
                                value={systemEmail.system_email_reply || ""}
                                onChange={(e) => setValue("email_settings.system_email", { is_system_email: true, system_email_reply: e.target.value }, { shouldDirty: true })} />
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Auto Reply */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base">Auto Reply</CardTitle>
                </CardHeader>
                <CardContent>
                    <FormSwitchField name="auto_reply.enabled" label="Enable Auto Reply" description="Automatically reply to incoming emails" />
                </CardContent>
            </Card>

            {/* Vacation / Auto Reply */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                        <Calendar className="h-4 w-4" /> Vacation / Auto-Reply
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <FormSwitchField name="vacationSender.enabled" label="Enable Vacation Sender" description="Automatically reply when you are away" />
                    {vacationSender.enabled && (
                        <div className="space-y-3 ml-4">
                            <div className="space-y-2">
                                <Label>Auto-Reply Message</Label>
                                <Textarea placeholder="I am currently out of office..."
                                    value={vacationSender.message || ""}
                                    onChange={(e) => setValue("vacationSender.message", e.target.value, { shouldDirty: true })} />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <FormInputField name="vacationSender.startDate" label="Start Date" type="date" />
                                <FormInputField name="vacationSender.endDate" label="End Date" type="date" />
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
