"use client"

import { memo, useEffect, useState } from "react"
import { useSettingsPersist } from "@/hooks/use-settings-persist"
import {
    SettingsPageHeader,
    SettingsSection,
    SettingToggleRow,
    SaveSettingsBar,
} from "../shared"
import { Server, Shield, Send, Radio } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface ImapSmtpLocal {
    imap_enabled: boolean
    smtp_enabled: boolean
    allow_tracking: boolean
    allow_aliases: boolean
}

const DEFAULTS: ImapSmtpLocal = {
    imap_enabled: false,
    smtp_enabled: false,
    allow_tracking: false,
    allow_aliases: false,
}

function IMAPSMTP({ email }: { email: string }) {
    const { settings, saveMultiple, isSaving } = useSettingsPersist(email)
    const [local, setLocal] = useState<ImapSmtpLocal>(DEFAULTS)
    const [dirty, setDirty] = useState(false)

    // Sync from store
    useEffect(() => {
        if (settings?.imap_config || settings?.smtp_config) {
            setLocal({
                imap_enabled: settings.imap_config?.enable_imap ?? false,
                smtp_enabled: settings.smtp_config?.enable_smtp ?? false,
                allow_tracking: settings.smtp_config?.allow_email_tracking ?? false,
                allow_aliases: settings.smtp_config?.enable_smtp_from_alias ?? false,
            })
        }
    }, [settings?.imap_config, settings?.smtp_config])

    const update = <K extends keyof ImapSmtpLocal>(key: K, value: ImapSmtpLocal[K]) => {
        setLocal((prev) => ({ ...prev, [key]: value }))
        setDirty(true)
    }

    const handleSave = async () => {
        await saveMultiple(
            {
                "settings.imap_config.enable_imap": local.imap_enabled,
                "settings.smtp_config": {
                    enable_smtp: local.smtp_enabled,
                    allow_email_tracking: local.allow_tracking,
                    enable_smtp_from_alias: local.allow_aliases,
                },
            },
            {
                imap_config: { enable_imap: local.imap_enabled },
                smtp_config: {
                    enable_smtp: local.smtp_enabled,
                    allow_email_tracking: local.allow_tracking,
                    enable_smtp_from_alias: local.allow_aliases,
                },
            },
        )
        setDirty(false)
    }

    return (
        <div className="w-full space-y-8 animate-in fade-in duration-150">
            <SettingsPageHeader
                title="IMAP/SMTP"
                description="Manage external mail client protocols, credentials, read-tracking, and alias sending permissions."
                icon={<Server className="size-5" />}
                badge={<Badge variant="outline" className="text-xs font-normal">Protocols</Badge>}
            />

            <div className="space-y-6">
                {/* IMAP Section */}
                <SettingsSection
                    title="IMAP (Incoming Mail Access)"
                    description="Allow third-party desktop and mobile clients (Apple Mail, Thunderbird, Outlook) to sync emails via IMAP"
                    icon={<Radio className="size-4" />}
                >
                    <SettingToggleRow
                        label="Enable IMAP access"
                        description="Permit authenticated clients to download and sync your inbox via standard port 993 (SSL/TLS)"
                        tooltip="Allow email clients to connect via IMAP"
                        checked={local.imap_enabled}
                        onCheckedChange={(v) => update("imap_enabled", v)}
                    />
                </SettingsSection>

                {/* SMTP Section */}
                <SettingsSection
                    title="SMTP (Outgoing Mail Delivery)"
                    description="Allow external devices and mail servers to dispatch emails through Airsend SMTP relays"
                    icon={<Send className="size-4" />}
                >
                    <SettingToggleRow
                        label="Enable SMTP submission"
                        description="Allows outgoing message dispatch via port 465 (SSL) or port 587 (STARTTLS)"
                        tooltip="Allow sending emails via external SMTP clients"
                        checked={local.smtp_enabled}
                        onCheckedChange={(v) => update("smtp_enabled", v)}
                    />
                    <SettingToggleRow
                        label="Allow email read-tracking"
                        description="Inject invisible tracking pixels and delivery receipts into outgoing messages"
                        tooltip="Enable read receipts and tracking pixels in outgoing mails"
                        checked={local.allow_tracking}
                        onCheckedChange={(v) => update("allow_tracking", v)}
                    />
                    <SettingToggleRow
                        label="Allow sending from configured aliases"
                        description="Permit authenticated SMTP sessions to authenticate using any authorized account alias"
                        tooltip="Send emails using any of your configured aliases"
                        checked={local.allow_aliases}
                        onCheckedChange={(v) => update("allow_aliases", v)}
                    />
                </SettingsSection>
            </div>

            <SaveSettingsBar onSave={handleSave} show={dirty} isSaving={isSaving} />
        </div>
    )
}

export default memo(IMAPSMTP)
