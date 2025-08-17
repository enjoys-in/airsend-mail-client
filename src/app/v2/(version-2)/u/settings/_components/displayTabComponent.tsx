"use client"
import React, { lazy } from 'react'
import { useSettingsStore } from '@/store/settings'
import { Settings } from 'lucide-react'
import { CustomEventKey, useCustomEvent } from '@/hooks/use-custom-event'
import { API } from '@/lib/api/handler'
import { airsendDB } from '@/db'
import { AxiosResponse } from 'axios'
import { GetUserSettingsResponse } from '@/lib/types/get-user-settings-response'
import { useAppSelector } from '@/store/hooks'


export const DisplayTabComponent = () => {
    const { activeItem, setSettings, settings ,keys} = useSettingsStore()
    const currAccount = useAppSelector((state) => state.accounts.currAccount)

    const { listen } = useCustomEvent(CustomEventKey.SyncSettings)

    const componentMap: Record<string, any> = {
        "account-and-password": lazy(() => import("./profileSettings")),
        "signatures": lazy(() => import("./signatures/display-signature")),
        // "Language and time": lazy(() => import("./mailLanguageAndTime")),
        "notifications": lazy(() => import("./notificationsSettings")),
        // "Security and privacy": lazy(() => import("./mailSecurityAndPrivacy")),
        // "Recovery": lazy(() => import("./mailRecovery")),
        "appearance": lazy(() => import("./mailAppearance")),
        "identity-and-addresses": lazy(() => import("./identitySection")),
        "import-via-easy-switch": lazy(() => import("./importViaEasySwitch")),
        "messages-and-composing": lazy(() => import("./emailSettings")),
        "email-forwarding": lazy(() => import("./emailForwarding")),
        "folders-and-labels": lazy(() => import("./folderLabels")),
        "encryption-and-keys": lazy(() => import("./encryptionSettings")),
        "email-privacy": lazy(() => import("./configuration/emailPrivacy")),

        "filters": lazy(() => import("./filters/emailFilter")),
        "email-config": lazy(() => import("./configuration/emailConfig")),
    }
    const TabComponent = componentMap[activeItem]
    const updateSettingsToStore = React.useCallback(
        async () => {
            if (!currAccount?.email) return
            const { success, value } = await airsendDB.getNestedItem("settings", currAccount?.email as string, "settings")
            if (success && value) {
                setSettings(value)
            }
        },
        [currAccount?.email],
    )

    const fetchUser = async () => {
        const { data } = await API.handleGetMailUserSetting() as AxiosResponse<GetUserSettingsResponse>
        if (!data.success) return
        const { id, email_id, ...rest } = data.result.settings
        const settingsObj = Object.assign({
            usage: +data.result.usage,
            mailbox_size: +data.result.mailbox_size,
            quota_in_percent: Number(+data.result.usage / +data?.result?.mailbox_size * 100).toFixed(4),
        }, rest)

        const hasSettings = await airsendDB.has("settings", data.result.email)

        if (hasSettings) {
            await airsendDB.updateNestedItem("settings", data.result.email, "settings", settingsObj as any)
            return
        }
        await airsendDB.addNestedItem("settings", data.result.email, { "settings": settingsObj as any })
        setSettings(settingsObj)
    }
    React.useEffect(() => {
        if (!settings) {
            updateSettingsToStore()
        }
    }, [currAccount?.email, settings])

    React.useEffect(() => {
        const unsubscribe = listen(fetchUser)
        return unsubscribe
    }, [listen])
    return (
        <React.Suspense fallback={<FallbackSkelton activeItem={keys[activeItem]} />}>
            {TabComponent ? <TabComponent email={currAccount?.email} /> : <FallbackSkelton activeItem={keys[activeItem]} />}
        </React.Suspense>
    )
}

const FallbackSkelton = ({ activeItem }: { activeItem: string }) => {
    return (
        <div className={`bg-transparent rounded-lg shadow-sm`}>
            <div className="p-6 flex flex-col items-center justify-center">
                <div className="relative">
                    <Settings size={64} className="text-gray-200" />
                </div>
                <div className="mt-4 space-y-2">
                    Loading {activeItem}...
                </div>
            </div>
        </div>
    )
}