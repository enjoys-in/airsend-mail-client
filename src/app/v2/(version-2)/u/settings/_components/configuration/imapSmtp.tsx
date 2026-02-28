"use client"

import { memo, useEffect, useState } from "react"
import { useSettingsPersist } from "@/hooks/use-settings-persist"
import {
    SettingsPageHeader,
    SettingsSection,
    SettingToggleRow,
    SaveSettingsBar,
} from "../shared"

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
        <div className="p-4 md:p-8">
            <div className="max-w-2xl mx-auto space-y-10">

                {/* IMAP Section */}
                <SettingsSection title="IMAP Configuration">
                    <SettingToggleRow
                        label="Enable IMAP access"
                        tooltip="Allow email clients to connect via IMAP"
                        checked={local.imap_enabled}
                        onCheckedChange={(v) => update("imap_enabled", v)}
                    />
                </SettingsSection>

                {/* SMTP Section */}
                <SettingsSection title="SMTP Configuration">
                    <SettingToggleRow
                        label="Enable SMTP access"
                        tooltip="Allow sending emails via external SMTP clients"
                        checked={local.smtp_enabled}
                        onCheckedChange={(v) => update("smtp_enabled", v)}
                    />
                    <SettingToggleRow
                        label="Allow email tracking"
                        tooltip="Enable read receipts and tracking pixels in outgoing mails"
                        checked={local.allow_tracking}
                        onCheckedChange={(v) => update("allow_tracking", v)}
                    />
                    <SettingToggleRow
                        label="Allow sending from aliases"
                        tooltip="Send emails using any of your configured aliases"
                        checked={local.allow_aliases}
                        onCheckedChange={(v) => update("allow_aliases", v)}
                    />
                </SettingsSection>

                <SaveSettingsBar onSave={handleSave} show={dirty} isSaving={isSaving} />
            </div>
        </div>
    )
}

export default memo(IMAPSMTP)
