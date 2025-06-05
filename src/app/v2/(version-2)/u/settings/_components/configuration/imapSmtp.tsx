"use client"

import { InfoIcon as InfoCircle } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { useForm } from "react-hook-form"
import React from "react"
import { airsendDB } from "@/db"
import { useAppSelector } from "@/store/hooks"
import { useSettingsStore } from "@/store/settings"

type IMAPSMTPForm = {
    imap_enabled: boolean
    smtp_enabled: boolean
    allow_tracking: boolean
    allow_aliases: boolean
}

const IMAPSMTP = () => {
    const currAccount = useAppSelector((state) => state.accounts.currAccount)
    const { settings, setSettings } = useSettingsStore()
    const { watch, setValue } = useForm<IMAPSMTPForm>({
        defaultValues: {
            imap_enabled: settings?.imap_config?.enable_imap,
            smtp_enabled: settings?.smtp_config?.enable_smtp,
            allow_tracking: settings?.smtp_config?.allow_email_tracking,
            allow_aliases: settings?.smtp_config?.enable_smtp_from_alias,
        },
    })
    const values = watch()
    const updateSettings = async () => {
        if (!currAccount?.email) return
        await airsendDB.updateMultipleNestedItems("settings", currAccount?.email, {
            "settings.imap_config.enable_imap": values.imap_enabled,
            "settings.smtp_config": {
                enable_smtp: values.smtp_enabled,
                allow_email_tracking: values.allow_tracking,
                enable_smtp_from_alias: values.allow_aliases
            },
        })
        setSettings({
            smtp_config: {
                allow_email_tracking: values.allow_tracking,
                enable_smtp_from_alias: values.allow_aliases,
                enable_smtp: values.smtp_enabled
            },
            imap_config: {
                enable_imap: values.imap_enabled
            }
        })
    }
    React.useEffect(() => {
        console.log(values)
        if (values) {

        }
        // updateSettings()
    }, [values])

    return (
        <div className="text-white p-8">
            <div className="max-w-2xl mx-auto space-y-12">

                {/* IMAP Section */}
                <div className="space-y-6">
                    <h1 className="text-3xl font-bold text-white">IMAP Configuration</h1>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span>Enable IMAP access</span>
                            <InfoCircle className="h-4 w-4 text-blue-400" />
                        </div>
                        <Switch
                            checked={values.imap_enabled}
                            onCheckedChange={(checked) => setValue("imap_enabled", checked)}
                            className="data-[state=checked]:bg-blue-500"
                        />
                    </div>
                </div>

                {/* SMTP Section */}
                <div className="space-y-6">
                    <h1 className="text-3xl font-bold text-white">SMTP Configuration</h1>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span>Enable SMTP access</span>
                            <InfoCircle className="h-4 w-4 text-blue-400" />
                        </div>
                        <Switch
                            checked={values.smtp_enabled}
                            onCheckedChange={(checked) => setValue("smtp_enabled", checked)}
                            className="data-[state=checked]:bg-blue-500"
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span>Allow email tracking</span>
                            <InfoCircle className="h-4 w-4 text-blue-400" />
                        </div>
                        <Switch
                            checked={values.allow_tracking}
                            onCheckedChange={(checked) => setValue("allow_tracking", checked)}
                            className="data-[state=checked]:bg-blue-500"
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span>Allow sending emails from Aliases</span>
                            <InfoCircle className="h-4 w-4 text-blue-400" />
                        </div>
                        <Switch
                            checked={values.allow_aliases}
                            onCheckedChange={(checked) => setValue("allow_aliases", checked)}
                            className="data-[state=checked]:bg-blue-500"
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default IMAPSMTP
