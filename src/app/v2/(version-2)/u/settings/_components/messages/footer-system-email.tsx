"use client"

import { memo } from "react"
import { Check, MailCheck, Bot } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { SettingsSection, SettingToggleRow } from "../shared"
import type { EmailSettings } from "@/lib/types/get-user-settings-response"

interface FooterSystemEmailProps {
    local: EmailSettings | undefined
    footerText: string
    systemReply: string
    onFooterTextChange: (text: string) => void
    onSystemReplyChange: (text: string) => void
    onChange: <K extends keyof EmailSettings>(key: K, value: EmailSettings[K]) => void
}

/**
 * Email footer and automated system mailbox responses.
 */
function FooterSystemEmail({
    local,
    footerText,
    systemReply,
    onFooterTextChange,
    onSystemReplyChange,
    onChange,
}: FooterSystemEmailProps) {
    const isFooterEnabled = local?.email_footer?.footer_enabled ?? false
    const isSystemEmail = local?.system_email?.is_system_email ?? false

    return (
        <SettingsSection
            title="Custom Footer & Automated System Replies"
            description="Append standard company disclaimers or setup auto-responses for service mailboxes"
            icon={<MailCheck className="size-4" />}
        >
            {/* Email Footer */}
            <div className="space-y-3 py-2">
                <SettingToggleRow
                    label="Append outgoing email footer"
                    description="Automatically attach a signature or disclaimer banner to every sent email"
                    tooltip="Append a custom footer to all outgoing emails"
                    checked={isFooterEnabled}
                    onCheckedChange={(checked) =>
                        onChange("email_footer", {
                            ...local?.email_footer,
                            footer_enabled: checked,
                        } as any)
                    }
                    className="py-1 px-0 hover:bg-transparent"
                />
                {isFooterEnabled && (
                    <div className="flex items-center gap-2 pt-1 pl-2 animate-in fade-in duration-150">
                        <div className="relative flex-1">
                            <Input
                                className="h-9 pr-10 text-xs sm:text-sm bg-background/80 border-border/80 rounded-xl"
                                value={footerText}
                                placeholder="Enter footer text (e.g. Sent with ❤️ by Airsend)"
                                onChange={(e) => onFooterTextChange(e.target.value)}
                            />
                        </div>
                        <Button
                            type="button"
                            size="sm"
                            variant="secondary"
                            onClick={() => {
                                if (!footerText.trim()) {
                                    return toast.error("Footer text cannot be empty")
                                }
                                onChange("email_footer", {
                                    ...local?.email_footer,
                                    footer_text: footerText,
                                } as any)
                                toast.success("Footer text updated")
                            }}
                            className="h-9 px-3 rounded-xl gap-1 shrink-0"
                        >
                            <Check className="size-3.5" />
                            <span>Apply</span>
                        </Button>
                    </div>
                )}
            </div>

            {/* System Email */}
            <div className="space-y-3 py-3 border-t border-border/40">
                <SettingToggleRow
                    label="Configure as automated service/system mailbox"
                    description="Marks this address as a no-reply system box and answers senders automatically"
                    tooltip="Mark this mailbox as a system email with an auto-reply message"
                    checked={isSystemEmail}
                    icon={<Bot className="size-4 text-primary" />}
                    onCheckedChange={(checked) =>
                        onChange("system_email", {
                            ...local?.system_email,
                            is_system_email: checked,
                        } as any)
                    }
                    className="py-1 px-0 hover:bg-transparent"
                />
                {isSystemEmail && (
                    <div className="flex items-center gap-2 pt-1 pl-2 animate-in fade-in duration-150">
                        <div className="relative flex-1">
                            <Input
                                className="h-9 pr-10 text-xs sm:text-sm bg-background/80 border-border/80 rounded-xl"
                                value={systemReply}
                                placeholder="Auto-reply message (e.g. This is an unattended mailbox)"
                                onChange={(e) => onSystemReplyChange(e.target.value)}
                            />
                        </div>
                        <Button
                            type="button"
                            size="sm"
                            variant="secondary"
                            onClick={() => {
                                if (!systemReply.trim()) {
                                    return toast.error("System reply text cannot be empty")
                                }
                                onChange("system_email", {
                                    ...local?.system_email,
                                    system_email_reply: systemReply,
                                } as any)
                                toast.success("System reply message updated")
                            }}
                            className="h-9 px-3 rounded-xl gap-1 shrink-0"
                        >
                            <Check className="size-3.5" />
                            <span>Apply</span>
                        </Button>
                    </div>
                )}
            </div>
        </SettingsSection>
    )
}

export default memo(FooterSystemEmail)
