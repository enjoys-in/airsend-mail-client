"use client"

import { memo, useState } from "react"
import { Check } from "lucide-react"
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
 * Email footer and system email toggles with inline text inputs.
 */
function FooterSystemEmail({
    local,
    footerText,
    systemReply,
    onFooterTextChange,
    onSystemReplyChange,
    onChange,
}: FooterSystemEmailProps) {
    return (
        <SettingsSection title="Footer & System Email">
            {/* Email Footer toggle */}
            <SettingToggleRow
                label="Email Footer"
                tooltip="Append a custom footer to all outgoing emails"
                checked={local?.email_footer?.footer_enabled ?? false}
                onCheckedChange={(checked) =>
                    onChange("email_footer", {
                        ...local?.email_footer,
                        footer_enabled: checked,
                    } as any)
                }
            />
            {local?.email_footer?.footer_enabled && (
                <div className="relative w-full">
                    <Input
                        className="w-full pr-10"
                        value={footerText}
                        placeholder="Enter footer text…"
                        onChange={(e) => onFooterTextChange(e.target.value)}
                    />
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                            if (!footerText.trim()) {
                                return toast.error("Footer text cannot be empty")
                            }
                            onChange("email_footer", {
                                ...local?.email_footer,
                                footer_text: footerText,
                            } as any)
                        }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground rounded-md"
                    >
                        <Check className="w-4 h-4" />
                    </Button>
                </div>
            )}

            {/* System Email toggle */}
            <SettingToggleRow
                label="Is System Email"
                tooltip="Mark this mailbox as a system email with an auto-reply message"
                checked={local?.system_email?.is_system_email ?? false}
                onCheckedChange={(checked) =>
                    onChange("system_email", {
                        ...local?.system_email,
                        is_system_email: checked,
                    } as any)
                }
            />
            {local?.system_email?.is_system_email && (
                <div className="relative w-full">
                    <Input
                        className="w-full pr-10"
                        value={systemReply}
                        placeholder="System reply message…"
                        onChange={(e) => onSystemReplyChange(e.target.value)}
                    />
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                            if (!systemReply.trim()) {
                                return toast.error("System reply text cannot be empty")
                            }
                            onChange("system_email", {
                                ...local?.system_email,
                                system_email_reply: systemReply,
                            } as any)
                        }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground rounded-md"
                    >
                        <Check className="w-4 h-4" />
                    </Button>
                </div>
            )}
        </SettingsSection>
    )
}

export default memo(FooterSystemEmail)
