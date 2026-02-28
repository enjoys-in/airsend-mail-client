"use client"
import React, { lazy } from 'react'
import { useSettingsStore } from '@/store/settings'
import { Settings } from 'lucide-react'
import { CustomEventKey, useCustomEvent } from '@/hooks/use-custom-event'
import { airsendDB } from '@/db'
import { syncUserSettings } from '@/lib/api/sync-user-settings'
import { useAppSelector } from '@/store/hooks'

// Module-level lazy map – created once, never re-created on re-render
const componentMap: Record<string, React.LazyExoticComponent<React.ComponentType<{ email: string }>>> = {
    "account-and-password": lazy(() => import("./profileSettings")),
    "signatures": lazy(() => import("./signatures/display-signature")),
    "notifications": lazy(() => import("./notificationsSettings")),
    "appearance": lazy(() => import("./mailAppearance")),
    "calendar": lazy(() => import("./calendarSettings")),
    "identity-and-addresses": lazy(() => import("./identitySection")),
    "import-via-easy-switch": lazy(() => import("./importViaEasySwitch")),
    "messages-and-composing": lazy(() => import("./emailSettings")),
    "email-forwarding": lazy(() => import("./emailForwarding")),
    "folders-and-labels": lazy(() => import("./folderLabels")),
    "encryption-and-keys": lazy(() => import("./encryptionSettings")),
    "email-privacy": lazy(() => import("./configuration/emailPrivacy")),
    "imap-smtp": lazy(() => import("./configuration/imapSmtp")),
    "filters": lazy(() => import("./filters/emailFilter")),
    "email-config": lazy(() => import("./configuration/emailConfig")),
}

export const DisplayTabComponent = () => {
    const activeItem = useSettingsStore((s) => s.activeItem)
    const setSettings = useSettingsStore((s) => s.setSettings)
    const settings = useSettingsStore((s) => s.settings)
    const keys = useSettingsStore((s) => s.keys)
    const currAccount = useAppSelector((state) => state.accounts.currAccount)

    const { listen } = useCustomEvent(CustomEventKey.SyncSettings)

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
        const result = await syncUserSettings(currAccount?.domain_name)
        if (result) {
            setSettings(result)
        }
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
            {TabComponent ? <TabComponent email={currAccount?.email ?? ""} /> : <FallbackSkelton activeItem={keys[activeItem]} />}
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